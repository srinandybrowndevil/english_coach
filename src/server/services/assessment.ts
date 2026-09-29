import { and, asc, count, desc, eq } from 'drizzle-orm';
import { getAI } from '@/lib/ai';
import { recordAIEvent } from '@/lib/ai/usage';
import {
  ASSESSMENT_GRADER_SYSTEM, CEFR_DOMAIN_JUDGEMENT_SYSTEM, EVALUATOR_PROMPT_VERSION,
  PRONUNCIATION_NOTES_SYSTEM,
} from '@/lib/ai/prompts/evaluators';
import type { Db } from '@/lib/db/client';
import {
  assessmentResponses, assessments, cefrEstimates, learningSessions, sessionTurns,
} from '@/lib/db/schema';
import {
  ASSESSMENT_SECTION_ORDER, selectItems, type AssessmentItem,
} from '@/content/assessment';
import {
  AssessmentItemGradeSchema, CefrDomainJudgementSchema, PronunciationNotesSchema,
  type AssessmentItemGrade,
} from '@/lib/evaluation/schemas';
import { estimateCefr, type CefrEstimate } from '@/lib/scoring/cefr';
import { EvaluationService } from './evaluation';
import { ensurePromptVersion } from './prompt-version';
import { CurriculumService } from './curriculum';

const OBJECTIVE_TYPES = new Set(['mcq', 'cloze', 'listening_mcq', 'dictation']);
const OPEN_TYPES = new Set(['short', 'writing']);
const SPEAKING_TYPES = new Set(['speaking', 'conversation', 'roleplay', 'pronunciation']);

type Domain = 'speaking' | 'listening' | 'reading' | 'writing' | 'grammar' | 'vocabulary';
const SECTION_DOMAIN: Record<string, Domain> = {
  Grammar: 'grammar', Vocabulary: 'vocabulary', Reading: 'reading', Listening: 'listening',
  Writing: 'writing', Pronunciation: 'speaking', Speaking: 'speaking', Conversation: 'speaking',
  Storytelling: 'speaking', Business: 'speaking', Negotiation: 'speaking', Spontaneous: 'speaking',
};

export class AssessmentService {
  constructor(private db: Db) {}

  private items(kind: 'initial' | 'monthly', monthIndex: number): AssessmentItem[] {
    return selectItems(kind, monthIndex);
  }

  async startOrResume(userId: string, kind: 'initial' | 'monthly') {
    const existing = await this.db.query.assessments.findFirst({
      where: and(eq(assessments.learnerId, userId), eq(assessments.kind, kind), eq(assessments.status, 'in_progress')),
    });
    if (existing) return existing;

    const monthlyRows = await this.db
      .select({ value: count() })
      .from(assessments)
      .where(and(eq(assessments.learnerId, userId), eq(assessments.kind, 'monthly'), eq(assessments.status, 'completed')));
    const monthlyCount = monthlyRows[0]?.value ?? 0;
    const monthIndex = kind === 'monthly' ? monthlyCount : 0;
    const [a] = await this.db
      .insert(assessments)
      .values({ learnerId: userId, kind, monthIndex })
      .returning();
    return a!;
  }

  async get(assessmentId: string) {
    return this.db.query.assessments.findFirst({ where: eq(assessments.id, assessmentId) });
  }

  async list(userId: string) {
    return this.db.query.assessments.findMany({
      where: eq(assessments.learnerId, userId), orderBy: desc(assessments.startedAt),
    });
  }

  /** progress: which item is next. Items run in section order, then bank order. */
  async currentStep(assessmentId: string) {
    const a = await this.get(assessmentId);
    if (!a) throw new Error('assessment not found');
    const items = this.items(a.kind as 'initial' | 'monthly', a.monthIndex);
    const done = await this.db.query.assessmentResponses.findMany({
      where: eq(assessmentResponses.assessmentId, assessmentId),
    });
    const answered = new Set(done.map((r) => r.itemSlug));
    const next = items.find((i) => !answered.has(i.slug));
    return {
      assessment: a,
      total: items.length,
      answered: answered.size,
      next,
      done: !next,
      sectionIndex: next ? ASSESSMENT_SECTION_ORDER.indexOf(next.section as (typeof ASSESSMENT_SECTION_ORDER)[number]) : ASSESSMENT_SECTION_ORDER.length,
    };
  }

  async submit(assessmentId: string, itemSlug: string, response: Record<string, unknown>) {
    const a = await this.get(assessmentId);
    if (!a) throw new Error('assessment not found');
    const item = this.items(a.kind as 'initial' | 'monthly', a.monthIndex).find((i) => i.slug === itemSlug);
    if (!item) throw new Error(`item ${itemSlug} not in this assessment`);

    // speaking-family: the client uploads audio → /api/sessions/:id/turn? this service
    // receives { sessionId?, turnId?, text } for spoken items. For spoken items with a
    // transcript we persist a turn inside an assessment session so evaluation can run.
    let turnId = (response.turnId as string | undefined) ?? null;
    if (SPEAKING_TYPES.has(item.type) && !turnId && typeof response.text === 'string' && response.text.trim()) {
      const [sess] = await this.db.insert(learningSessions).values({
        learnerId: a.learnerId, sessionType: 'assessment', sessionGoal: `assessment:${item.section}`,
      }).returning();
      const [t] = await this.db.insert(sessionTurns).values({
        sessionId: sess!.id, role: 'learner', content: response.text as string,
      }).returning();
      turnId = t!.id;
    }

    // upsert the response first — never block submission on grading (§75)
    const [resp] = await this.db
      .insert(assessmentResponses)
      .values({
        assessmentId, itemSlug, section: item.section,
        response: { ...response, turnId },
      })
      .onConflictDoUpdate({
        target: [assessmentResponses.assessmentId, assessmentResponses.itemSlug],
        set: { response: { ...response, turnId } },
      })
      .returning();

    let grade: (AssessmentItemGrade & { pronunciationNotes?: string[] }) | null = null;
    if (OBJECTIVE_TYPES.has(item.type)) {
      const given = ((response.selected as string) ?? (response.text as string) ?? '').trim().toLowerCase();
      const correct = item.answer ? given === item.answer.trim().toLowerCase() : false;
      grade = {
        score: correct ? 100 : 0, correct,
        feedback: correct ? 'Correct.' : `Expected: ${item.answer}`,
        evidence: `selected "${given || '—'}"`,
      } satisfies AssessmentItemGrade;
    } else {
      const ev = await this.gradeWithLLM(item, response);
      grade = ev;
    }

    // spoken evidence → run the full speech evaluation + mistake capture
    if (SPEAKING_TYPES.has(item.type) && turnId) {
      try {
        await new EvaluationService(this.db).evaluateTurn(turnId, {
          taskPrompt: item.prompt, register: 'neutral',
        });
      } catch { /* evaluation_status='failed' marks it retryable */ }
    }

    if (item.type === 'pronunciation') {
      const transcript = (response.text as string) ?? '';
      try {
        await getAI().pronunciation.analyse({ transcript, target: item.prompt.replace(/^Say: /, '').replace(/"/g, '') });
        const pvId = await ensurePromptVersion(this.db, 'evaluators', EVALUATOR_PROMPT_VERSION, PRONUNCIATION_NOTES_SYSTEM);
        const res = await getAI().llm.structured({
          name: 'pronunciation-notes', schema: PronunciationNotesSchema,
          system: PRONUNCIATION_NOTES_SYSTEM, tier: 'balanced',
          messages: [{ role: 'user', content: `Target: ${item.prompt}\nTranscript: ${transcript}` }],
        });
        recordAIEvent({
          kind: 'pronunciation-notes', promptVersionId: pvId, evaluatorVersion: 'pronunciation.v1',
          provider: 'llm', model: res.model, ms: 0,
          inputEvidence: { transcript }, confidence: 'low',
        });
        grade = { ...(grade ?? { score: 50, correct: false, feedback: '', evidence: '' }), pronunciationNotes: res.data.notes };
      } catch { /* pronunciation analysis optional — never blocks */ }
    }

    await this.db.update(assessmentResponses)
      .set({ grade, gradedAt: new Date() })
      .where(eq(assessmentResponses.id, resp!.id));

    const step = await this.currentStep(assessmentId);
    await this.db.update(assessments)
      .set({ currentSectionIndex: step.sectionIndex })
      .where(eq(assessments.id, assessmentId));

    return { response: resp, graded: true, next: step.next, done: step.done };
  }

  private async gradeWithLLM(item: AssessmentItem, response: Record<string, unknown>) {
    const pvId = await ensurePromptVersion(this.db, 'evaluators', EVALUATOR_PROMPT_VERSION, ASSESSMENT_GRADER_SYSTEM);
    const res = await getAI().llm.structured({
      name: 'assessment-grade', schema: AssessmentItemGradeSchema,
      system: ASSESSMENT_GRADER_SYSTEM, tier: 'balanced',
      messages: [{
        role: 'user',
        content: `Item type: ${item.type}\nPrompt: ${item.prompt}\n${item.rubric ? `Rubric: ${item.rubric}\n` : ''}${item.answer ? `Reference answer: ${item.answer}\n` : ''}Learner response: ${(response.text as string) ?? JSON.stringify(response)}`,
      }],
    });
    recordAIEvent({
      kind: 'assessment-grade', promptVersionId: pvId, evaluatorVersion: `assessment.${item.type}`,
      provider: 'llm', model: res.model, ms: 0,
      inputEvidence: { itemSlug: item.slug }, confidence: 'medium',
    });
    return res.data;
  }

  async finish(assessmentId: string) {
    const a = await this.get(assessmentId);
    if (!a) throw new Error('assessment not found');
    const items = this.items(a.kind as 'initial' | 'monthly', a.monthIndex);
    const rows = await this.db.query.assessmentResponses.findMany({
      where: eq(assessmentResponses.assessmentId, assessmentId), orderBy: asc(assessmentResponses.createdAt),
    });

    const byDomain: Partial<Record<Domain, { score: number; evidenceCount: number; strengths: string[]; weaknesses: string[] }>> = {};
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const item of items) {
      const r = rows.find((x) => x.itemSlug === item.slug);
      if (!r?.grade) continue;
      const g = r.grade as AssessmentItemGrade & { pronunciationNotes?: string[] };
      const domain = SECTION_DOMAIN[item.section] ?? 'speaking';
      const d = byDomain[domain] ??= { score: 0, evidenceCount: 0, strengths: [], weaknesses: [] };
      d.score += g.score ?? 0;
      d.evidenceCount += 1;
      if ((g.score ?? 0) >= 70) strengths.push(`${item.section}: ${g.evidence?.slice(0, 80) ?? 'strong response'}`);
      if ((g.score ?? 0) < 50) weaknesses.push(`${item.section}: ${g.feedback?.slice(0, 80) ?? 'needs work'}`);
    }

    // LLM domain judgement per domain with evidence (only where there is evidence)
    const judgementInputs = Object.entries(byDomain).filter(([, v]) => (v?.evidenceCount ?? 0) > 0);
    const judgements: Record<string, { score: number; evidenceCount: number }> = {};
    for (const [domain] of judgementInputs) {
      const evidence = rows
        .filter((r) => SECTION_DOMAIN[items.find((i) => i.slug === r.itemSlug)?.section ?? ''] === domain)
        .map((r) => ({ item: r.itemSlug, grade: r.grade }));
      const pvId = await ensurePromptVersion(this.db, 'evaluators', EVALUATOR_PROMPT_VERSION, CEFR_DOMAIN_JUDGEMENT_SYSTEM);
      const res2 = await getAI().llm.structured({
        name: 'cefr-domain-judgement', schema: CefrDomainJudgementSchema,
        system: CEFR_DOMAIN_JUDGEMENT_SYSTEM, tier: 'balanced',
        messages: [{ role: 'user', content: `domain: ${domain}\nevidence: ${JSON.stringify(evidence).slice(0, 4000)}` }],
      });
      recordAIEvent({
        kind: 'cefr-domain-judgement', promptVersionId: pvId, evaluatorVersion: 'cefr.v1',
        provider: 'llm', model: res2.model, ms: 0,
        inputEvidence: { domain, itemCount: evidence.length }, confidence: 'medium',
      });
      judgements[domain] = { score: res2.data.score, evidenceCount: byDomain[domain as Domain]!.evidenceCount };
    }

    const estimate: CefrEstimate = estimateCefr(judgements as Parameters<typeof estimateCefr>[0]);

    // pronunciation focus: merge notes captured on pronunciation items
    const pronunciationFocus = rows
      .filter((r) => items.find((i) => i.slug === r.itemSlug)?.type === 'pronunciation')
      .flatMap((r) => ((r.grade as { pronunciationNotes?: string[] })?.pronunciationNotes ?? []));

    // fluency profile: mean fluency components across evaluated speaking turns
    const turnIds = rows.map((r) => (r.response as { turnId?: string })?.turnId).filter(Boolean) as string[];
    const turnEvals = turnIds.length
      ? (await this.db.query.sessionTurns.findMany()).filter((t) => turnIds.includes(t.id))
      : [];
    const totals = turnEvals
      .map((t) => ((t.evaluation as { scores?: { fluency?: { total?: number } } } | null)?.scores?.fluency?.total))
      .filter((x): x is number => typeof x === 'number');
    const fluencyProfile = totals.length
      ? { count: totals.length, meanFluency: Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) }
      : null;

    const result = {
      overall: estimate,
      domainScores: byDomain,
      strengths: strengths.slice(0, 6),
      weaknesses: weaknesses.slice(0, 6),
      recurringPatterns: [] as string[], // filled from mistake_patterns below
      pronunciationFocus: [...new Set(pronunciationFocus)].slice(0, 8),
      fluencyProfile,
      vocabularyProfile: { domainScore: byDomain.vocabulary?.score ?? null, evidenceCount: byDomain.vocabulary?.evidenceCount ?? 0 },
      businessProfile: { domainScore: byDomain.speaking?.score ?? null, note: 'business + negotiation items graded under speaking' },
      recommendedCurriculum: [] as string[],
    };

    const [est] = await this.db.insert(cefrEstimates).values({
      learnerId: a.learnerId,
      level: estimate.level,
      confidence: estimate.confidence,
      breakdown: estimate.breakdown,
      gate: estimate.gate ?? null,
      source: a.kind === 'initial' ? 'initial_assessment' : 'monthly_assessment',
    }).returning();

    await this.db.update(assessments)
      .set({ status: 'completed', completedAt: new Date(), result })
      .where(eq(assessments.id, assessmentId));

    // update the learner profile + curriculum from graded evidence
    const graded = items.map((item) => ({
      item,
      grade: (rows.find((r) => r.itemSlug === item.slug)?.grade ?? null) as AssessmentItemGrade | null,
    })).filter((x) => x.grade);
    const curriculum = new CurriculumService(this.db);
    const plan = await curriculum.initialiseFromAssessment(a.learnerId, graded, estimate.level ?? null);
    result.recommendedCurriculum = plan.orderedSkillSlugs.slice(0, 8);

    await this.db.update(assessments).set({ result }).where(eq(assessments.id, assessmentId));
    return { estimate, result, cefrId: est!.id };
  }
}
