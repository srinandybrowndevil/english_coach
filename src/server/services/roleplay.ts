import { and, asc, eq } from 'drizzle-orm';
import type { Db } from '@/lib/db/client';
import {
  learningSessions, roleplaySessions, roleplayScenarios, roleplayTurns,
} from '@/lib/db/schema';
import { getAI } from '@/lib/ai';
import {
  NEGOTIATION_EVALUATOR_SYSTEM, ROLEPLAY_PERSONA_SYSTEM, EVALUATOR_PROMPT_VERSION,
  DEBATE_EVALUATOR_SYSTEM, SPEECH_EVALUATOR_SYSTEM,
} from '@/lib/ai/prompts/evaluators';
import {
  RoleplayTurnSchema, NegotiationEvaluationSchema, DebateEvaluationSchema,
  SpeechEvaluationSchema,
} from '@/lib/evaluation/schemas';
import { computeNegotiationScore } from '@/lib/scoring/negotiation';
import { recordAIEvent } from '@/lib/ai/usage';
import { ensurePromptVersion } from '@/server/services/prompt-version';
import { MistakeService } from '@/server/services/mistake';
import type { GrammarError } from '@/lib/evaluation/schemas';

type ScenarioRow = typeof roleplayScenarios.$inferSelect;

export function scenarioConfig(s: ScenarioRow, goal?: { persona?: string; difficulty?: string }): {
  hiddenGoals: string[]; objectives: string[]; aiRole: string; learnerRole: string;
  personaBrief: string; difficultyBrief: string; register: string; module: string;
} {
  const c = (s.config ?? {}) as Record<string, unknown>;
  const persona = (s.persona ?? {}) as Record<string, unknown>;
  return {
    hiddenGoals: ((c.hiddenScript ? [String(c.hiddenScript)] : []) as string[]).concat(
      (() => {
        const personas = ((s.persona ?? {}) as Record<string, unknown>).personas as { slug: string; goals?: string[] }[] | undefined;
        const p = personas?.find((x) => x.slug === goal?.persona);
        return p?.goals ?? [];
      })(),
    ),
    objectives: (c.objectives as string[] | undefined) ?? (persona.objectives as string[] | undefined) ?? [],
    aiRole: (persona.aiRole as string) ?? 'counterpart',
    learnerRole: (persona.learnerRole as string) ?? 'you',
    personaBrief: ((() => {
      const personas = (persona.personas as { slug: string; archetype: string; tactics?: string[]; goals?: string[] }[] | undefined);
      const p = goal?.persona && personas?.find((x) => x.slug === goal.persona);
      return p ? `${p.archetype}. Tactics: ${(p.tactics ?? []).join(', ')}` : null;
    })()) ?? (c.personaBrief as string) ?? (persona.archetype as string) ?? s.description ?? '',
    difficultyBrief: (() => {
      const diffs = (c.difficulties as { level: string; description: string }[] | undefined);
      return (goal?.difficulty && diffs?.find((d) => d.level === goal.difficulty)?.description)
        ?? (c.difficultyBrief as string) ?? 'Realistic — pushes back once or twice.';
    })(),
    register: (c.register as string) ?? 'professional',
    module: (c.module as string) ?? s.domain,
  };
}

export class RoleplayService {
  constructor(private db: Db) {}

  async start(userId: string, opts: {
    scenarioSlug: string; difficulty?: string; mode?: string; personaSlug?: string;
  }) {
    let scenario = await this.db.query.roleplayScenarios.findFirst({
      where: eq(roleplayScenarios.slug, opts.scenarioSlug),
    });
    if (!scenario && opts.scenarioSlug.startsWith('debate:')) {
      // ad-hoc debate scenario — topic + side supplied via opts.mode ("for|against|<topic>")
      const [t] = await this.db.insert(roleplayScenarios).values({
        slug: opts.scenarioSlug, domain: 'debate',
        title: `Debate: ${opts.mode ?? opts.scenarioSlug.slice(7)}`,
        description: `AI argues the opposing side`,
        persona: { aiRole: `debate opponent arguing the opposite side`, learnerRole: 'debater' },
        config: {
          personaBrief: 'Assertive but professional opponent. Press for evidence, expose unstated assumptions, offer concession traps.',
          objectives: ['Challenge weak claims', 'Demand evidence', 'Concede only when beaten'],
        },
        opener: 'State your opening position — I\'ll take the opposite side.',
      }).returning();
      scenario = t!;
    }
    if (!scenario) throw new Error(`scenario ${opts.scenarioSlug} not found`);
    const [sess] = await this.db.insert(learningSessions).values({
      learnerId: userId, sessionType: `roleplay:${scenario.domain}`,
      sessionGoal: JSON.stringify({ slug: opts.scenarioSlug, persona: opts.personaSlug, difficulty: opts.difficulty }),
    }).returning();
    const [rp] = await this.db.insert(roleplaySessions).values({
      learnerId: userId, scenarioId: scenario.id, sessionId: sess!.id,
    }).returning();
    const opener = scenario.opener;
    if (opener) {
      await this.db.insert(roleplayTurns).values({
        roleplaySessionId: rp!.id, role: 'ai', content: opener,
      });
    }
    return { rpSession: rp!, scenario, opener };
  }

  async get(userId: string, rpId: string, includeHidden = false) {
    const rp = await this.db.query.roleplaySessions.findFirst({
      where: and(eq(roleplaySessions.id, rpId), eq(roleplaySessions.learnerId, userId)),
    });
    if (!rp) return null;
    const [scenario, turns] = await Promise.all([
      this.db.query.roleplayScenarios.findFirst({ where: eq(roleplayScenarios.id, rp.scenarioId) }),
      this.db.query.roleplayTurns.findMany({
        where: eq(roleplayTurns.roleplaySessionId, rpId), orderBy: asc(roleplayTurns.createdAt),
      }),
    ]);
    // §31: hiddenScript never returned before end
    const config = (scenario?.config ?? {}) as Record<string, unknown>;
    if (scenario && !includeHidden && !rp.endedAt) {
      scenario.config = { ...config, hiddenScript: undefined };
    }
    return { rp, scenario, turns };
  }

  async turn(userId: string, rpId: string, learnerText: string) {
    const got = await this.get(userId, rpId, true);
    if (!got) throw new Error('roleplay not found');
    const { rp, scenario } = got;
    if (rp.endedAt) throw new Error('roleplay already ended');

    await this.db.insert(roleplayTurns).values({
      roleplaySessionId: rpId, role: 'learner', content: learnerText,
    });
    const turns = await this.db.query.roleplayTurns.findMany({
      where: eq(roleplayTurns.roleplaySessionId, rpId), orderBy: asc(roleplayTurns.createdAt),
    });
    const sess = rp.sessionId ? await this.db.query.learningSessions.findFirst({ where: eq(learningSessions.id, rp.sessionId) }) : undefined;
    const goal = (() => { try { return JSON.parse(sess?.sessionGoal ?? '{}'); } catch { return {}; } })() as { persona?: string; difficulty?: string };
    const cfg = scenarioConfig(scenario!, goal);
    // feed history as transcript context in a single user message (schema is strict)
    const history = turns.slice(-12).map((t) => `${t.role}: ${t.content}`).join('\n');

    const res = await getAI().llm.structured({
      name: 'roleplay-turn', schema: RoleplayTurnSchema, tier: 'frontier',
      system: ROLEPLAY_PERSONA_SYSTEM({
        scenarioTitle: scenario!.title, setting: scenario!.description ?? '',
        aiRole: cfg.aiRole, learnerRole: cfg.learnerRole,
        personaBrief: cfg.personaBrief, hiddenGoals: cfg.hiddenGoals,
        difficulty: goal.difficulty ?? scenario!.difficulty ?? 'Realistic', difficultyBrief: cfg.difficultyBrief,
        register: cfg.register,
      }),
      messages: [
        { role: 'user', content: `Transcript so far:\n${history}\n\nLearner's latest line (respond in character):\n${learnerText}` },
      ],
    });
    await this.db.insert(roleplayTurns).values({
      roleplaySessionId: rpId, role: 'ai',
      content: res.data.reply, hiddenNote: res.data.internalNote,
    });
    let evaluation = null;
    if (res.data.ended) evaluation = await this.evaluate(userId, rpId);
    return { reply: res.data.reply, ended: res.data.ended, evaluation };
  }

  /** §55 — negotiation gets TWO separate ScoreResults, never a combined number. */
  async evaluate(userId: string, rpId: string) {
    const got = await this.get(userId, rpId, true);
    if (!got) throw new Error('roleplay not found');
    const { rp, scenario, turns } = got;
    const transcript = turns.map((t) => `${t.role}: ${t.content}`).join('\n');
    const learnerText = turns.filter((t) => t.role === 'learner').map((t) => t.content).join('\n');
    const kind = scenario!.domain;

    let evaluation: Record<string, unknown>;
    let system: string; let name: string;
    if (kind === 'negotiation') {
      const res = await getAI().llm.structured({
        name: 'negotiation-evaluation', schema: NegotiationEvaluationSchema, tier: 'frontier',
        system: NEGOTIATION_EVALUATOR_SYSTEM,
        messages: [{ role: 'user', content: `Scenario: ${scenario!.title}\nTranscript:\n${transcript}` }],
      });
      const scores = computeNegotiationScore({
        language: res.data.language, negotiation: res.data.negotiation,
      });
      evaluation = { kind: 'negotiation', raw: res.data, scores };
      system = NEGOTIATION_EVALUATOR_SYSTEM; name = 'negotiation-evaluation';
    } else if (kind === 'debate') {
      const res = await getAI().llm.structured({
        name: 'debate-evaluation', schema: DebateEvaluationSchema, tier: 'frontier',
        system: DEBATE_EVALUATOR_SYSTEM,
        messages: [{ role: 'user', content: `Debate transcript:\n${transcript}` }],
      });
      evaluation = { kind: 'debate', raw: res.data };
      system = DEBATE_EVALUATOR_SYSTEM; name = 'debate-evaluation';
    } else {
      // business/simulator/presentation → speech-evaluation over learner turns + self-check objectives
      const res = await getAI().llm.structured({
        name: 'speech-evaluation', schema: SpeechEvaluationSchema, tier: 'balanced',
        system: SPEECH_EVALUATOR_SYSTEM,
        messages: [{ role: 'user', content: `Transcript:\n${learnerText}\n\nContext: roleplay "${scenario!.title}"` }],
      });
      evaluation = {
        kind: scenario!.domain, raw: res.data,
        objectivesForSelfCheck: scenarioConfig(scenario!).objectives,
        counterpartNotes: turns
          .filter((t) => t.role === 'ai')
          .map((t) => t.hiddenNote)
          .filter(Boolean),
      };
      system = SPEECH_EVALUATOR_SYSTEM; name = 'speech-evaluation';
    }

    // capture mistakes from the evaluation's grammarErrors into the vault
    const errs = (evaluation.raw as { grammarErrors?: GrammarError[] }).grammarErrors ?? [];
    if (errs.length) {
      await new MistakeService(this.db).recordDetected(userId, errs, learnerText, {
        sessionId: rp.sessionId ?? undefined, context: `roleplay:${scenario!.slug}`,
      });
    }
    await recordAIEvent({
      kind: name, provider: 'llm', model: 'structured', ms: 0,
      evaluatorVersion: `${name}.v1`,
      promptVersionId: await ensurePromptVersion(this.db, 'evaluators', EVALUATOR_PROMPT_VERSION, system),
      confidence: 'medium', inputEvidence: { rpSessionId: rpId, turns: turns.length },
    });
    const [upd] = await this.db.update(roleplaySessions)
      .set({ endedAt: new Date(), evaluation: evaluation as never })
      .where(eq(roleplaySessions.id, rpId)).returning();
    return { evaluation, rp: upd };
  }
}
