// Idempotent content seeder (Phase 2B). Upserts by stable slug — safe to re-run.
import { inArray, sql } from 'drizzle-orm';
import { GRAMMAR_LESSONS } from '../../content/grammar-lessons';
import { COLLOCATIONS } from '../../content/collocations';
import { DEBATE_TOPICS } from '../../content/debate-topics';
import { IDIOMS } from '../../content/idioms';
import { LISTENING_MODES } from '../../content/listening-templates';
import { MODERN_ENGLISH } from '../../content/modern-english';
import { PHRASAL_VERBS } from '../../content/phrasal-verbs';
import { PRECISION_MAP } from '../../content/precision';
import { PRESENTATION_TOPICS } from '../../content/presentation-topics';
import { IPA_MODULES, SHADOWING_SETS, SOUND_CONTRASTS } from '../../content/pronunciation';
import { PUBLIC_SPEAKING } from '../../content/public-speaking';
import { RECOVERY } from '../../content/recovery';
import { REGISTERS, REGISTER_TRANSFORMS } from '../../content/register';
import { BUSINESS_SCENARIOS, NEGOTIATION_PERSONAS, NEGOTIATION_SITUATIONS, NEGOTIATION_DIFFICULTIES, SIMULATOR_SCENARIOS } from '../../content/scenarios';
import { SKILLS } from '../../content/skills';
import { TONGUE_TWISTERS } from '../../content/tongue-twisters';
import { VOCABULARY } from '../../content/vocabulary';
import { WRITING_MODES } from '../../content/writing-templates';
import type { Db } from './client';
import { collocations, contentItems, idioms, phrasalVerbs, roleplayScenarios, skillDefinitions, skillPrerequisites, vocabularyItems } from './schema';

const CHUNK = 100;

async function upsert<T>(
  db: Db,
  table: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  target: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  rows: T[],
  set: Record<string, unknown>,
): Promise<void> {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    if (!chunk.length) continue;
    await db
      .insert(table)
      .values(chunk as never)
      .onConflictDoUpdate({ target, set });
  }
}

async function contentBatch(db: Db, kind: string, items: { slug: string; title: string; difficulty?: number; [k: string]: unknown }[]) {
  await upsert(
    db, contentItems, contentItems.slug,
    items.map(({ slug, title, difficulty, ...payload }) => ({
      slug, contentKind: kind, title, difficulty, payload,
    })),
    { title: sql`excluded.title`, contentKind: sql`excluded.content_kind`, difficulty: sql`excluded.difficulty`, payload: sql`excluded.payload` },
  );
}

export async function seedContent(db: Db): Promise<Record<string, number>> {
  // skills + prerequisite edges
  await upsert(db, skillDefinitions, skillDefinitions.slug, SKILLS.map((s) => ({
    slug: s.slug, domain: s.domain, name: s.name, description: s.description,
    difficulty: s.difficulty, importance: s.importance, cefrRelevance: s.cefr,
    exerciseTypes: s.exerciseTypes, masteryThreshold: s.masteryThreshold,
  })), {
    domain: sql`excluded.domain`, name: sql`excluded.name`, description: sql`excluded.description`,
    difficulty: sql`excluded.difficulty`, importance: sql`excluded.importance`, cefrRelevance: sql`excluded.cefr_relevance`,
    exerciseTypes: sql`excluded.exercise_types`, masteryThreshold: sql`excluded.mastery_threshold`,
  });
  const rows = await db.select({ id: skillDefinitions.id, slug: skillDefinitions.slug }).from(skillDefinitions);
  const idBySlug = new Map(rows.map((r) => [r.slug, r.id]));
  const edges: { skillId: string; prerequisiteSkillId: string }[] = [];
  for (const s of SKILLS)
    for (const pre of s.prerequisites) {
      const a = idBySlug.get(s.slug); const b = idBySlug.get(pre);
      if (a && b) edges.push({ skillId: a, prerequisiteSkillId: b });
    }
  // replace the edges wholesale — graph data is owned by the seed
  if (edges.length) {
    await db.delete(skillPrerequisites).where(inArray(skillPrerequisites.skillId, edges.map((e) => e.skillId)));
    await db.insert(skillPrerequisites).values(edges);
  }

  // dedicated tables
  await upsert(db, vocabularyItems, vocabularyItems.slug, VOCABULARY.map((v) => ({
    slug: v.slug, word: v.word, ipa: v.ipa, partOfSpeech: v.pos, meaning: v.meaning,
    tamilExplanation: v.tamil, exampleSimple: v.simple, exampleNatural: v.natural,
    exampleBusiness: v.business, synonyms: v.synonyms, antonyms: v.antonyms,
    collocations: v.collocations, wordFamily: v.wordFamily, register: v.register,
    commonMistakes: v.commonMistakes, category: v.category,
  })), {
    word: sql`excluded.word`, ipa: sql`excluded.ipa`, partOfSpeech: sql`excluded.part_of_speech`,
    meaning: sql`excluded.meaning`, tamilExplanation: sql`excluded.tamil_explanation`,
    exampleSimple: sql`excluded.example_simple`, exampleNatural: sql`excluded.example_natural`,
    exampleBusiness: sql`excluded.example_business`, synonyms: sql`excluded.synonyms`,
    antonyms: sql`excluded.antonyms`, collocations: sql`excluded.collocations`,
    wordFamily: sql`excluded.word_family`, register: sql`excluded.register`,
    commonMistakes: sql`excluded.common_mistakes`, category: sql`excluded.category`,
  });

  await upsert(db, collocations, collocations.slug, COLLOCATIONS.map((c) => ({
    slug: c.slug, phrase: c.collocation, meaning: c.meaning, register: c.register,
    example: c.example, awkwardAlternatives: c.awkwardAlternatives,
  })), { phrase: sql`excluded.phrase`, meaning: sql`excluded.meaning`, register: sql`excluded.register`, example: sql`excluded.example`, awkwardAlternatives: sql`excluded.awkward_alternatives` });

  await upsert(db, idioms, idioms.slug, IDIOMS.map((i) => ({
    slug: i.slug, phrase: i.idiom, meaning: i.meaning,
    naturalContext: `${i.literal} — ${i.example}`,
    formalSuitability: false, casualSuitability: true, businessSuitability: true,
    example: i.example, misuseWarning: i.registerCaution,
  })), { phrase: sql`excluded.phrase`, meaning: sql`excluded.meaning`, naturalContext: sql`excluded.natural_context`, example: sql`excluded.example`, misuseWarning: sql`excluded.misuse_warning` });

  await upsert(db, phrasalVerbs, phrasalVerbs.slug, PHRASAL_VERBS.map((p) => {
    const space = p.verb.indexOf(' ');
    return {
      slug: p.slug, verb: space === -1 ? p.verb : p.verb.slice(0, space),
      particle: space === -1 ? '' : p.verb.slice(space + 1),
      meaning: p.meaning, example: `${p.examples.daily} / ${p.examples.business}`,
    };
  }), { verb: sql`excluded.verb`, particle: sql`excluded.particle`, meaning: sql`excluded.meaning`, example: sql`excluded.example` });

  // roleplay scenarios
  const scenarios = [
    ...BUSINESS_SCENARIOS.map((s) => ({
      slug: s.slug, domain: 'business', title: s.title,
      description: `${s.setting} — AI: ${s.aiRole}; learner: ${s.learnerRole}`,
      persona: { aiRole: s.aiRole, learnerRole: s.learnerRole, objectives: s.objectives },
      difficulty: s.difficultyVariants[2] ?? 'Realistic', opener: s.openingLine,
      config: { module: s.module, difficultyVariants: s.difficultyVariants, evaluationFocus: s.evaluationFocus },
    })),
    ...NEGOTIATION_SITUATIONS.map((s) => ({
      slug: s.slug, domain: 'negotiation', title: s.title, description: s.setup,
      persona: { personas: NEGOTIATION_PERSONAS, skillsTested: s.skillsTested },
      difficulty: 'Realistic', opener: s.aiOpening,
      config: { difficulties: NEGOTIATION_DIFFICULTIES },
    })),
    ...SIMULATOR_SCENARIOS.map((s) => ({
      slug: s.slug, domain: 'simulator', title: s.title, description: s.setting,
      persona: { aiRole: s.aiRole, learnerRole: s.learnerRole, objectives: s.objectives },
      difficulty: String(s.difficulty), opener: null,
      config: { hiddenScript: s.hiddenScript, objectives: s.objectives },
    })),
  ];
  await upsert(db, roleplayScenarios, roleplayScenarios.slug, scenarios, {
    domain: sql`excluded.domain`, title: sql`excluded.title`, description: sql`excluded.description`,
    persona: sql`excluded.persona`, difficulty: sql`excluded.difficulty`, opener: sql`excluded.opener`,
    config: sql`excluded.config`,
  });

  // content_items for everything else
  await contentBatch(db, 'grammar_lesson', GRAMMAR_LESSONS.map((l) => ({ ...l, slug: l.slug, title: l.topic })));
  await contentBatch(db, 'sound_contrast', SOUND_CONTRASTS.map((s) => ({ ...s, slug: s.slug, title: s.title })));
  await contentBatch(db, 'ipa_module', IPA_MODULES.map((m) => ({ ...m, slug: m.slug, title: m.title })));
  await contentBatch(db, 'shadowing_set', SHADOWING_SETS.map((s) => ({ ...s, slug: s.slug, title: s.level })));
  await contentBatch(db, 'tongue_twister', TONGUE_TWISTERS.map((t) => ({ ...t, slug: t.slug, title: t.text })));
  await contentBatch(db, 'presentation_topic', PRESENTATION_TOPICS.map((p) => ({ ...p, slug: p.slug, title: p.title })));
  await contentBatch(db, 'debate_topic', DEBATE_TOPICS.map((d) => ({ ...d, slug: d.slug, title: d.topic })));
  await contentBatch(db, 'public_speaking_technique', PUBLIC_SPEAKING.map((t) => ({ ...t, slug: t.slug, title: t.technique })));
  await contentBatch(db, 'modern_english', MODERN_ENGLISH.map((m) => ({ ...m, slug: m.slug, title: m.expression })));
  await contentBatch(db, 'register', REGISTERS.map((r) => ({ ...r, slug: r.slug, title: r.name })));
  await contentBatch(db, 'register_transform', REGISTER_TRANSFORMS.map((r) => ({ ...r, slug: r.slug, title: r.meaning })));
  await contentBatch(db, 'recovery', RECOVERY.map((r) => ({ ...r, slug: r.slug, title: r.purpose })));
  await contentBatch(db, 'precision_map', PRECISION_MAP.map((p) => ({ ...p, slug: p.slug, title: p.vague })));
  await contentBatch(db, 'listening_mode', LISTENING_MODES.map((l) => ({ ...l, slug: l.slug, title: l.mode })));
  await contentBatch(db, 'writing_mode', WRITING_MODES.map((w) => ({ ...w, slug: w.slug, title: w.mode })));

  return {
    skill_definitions: SKILLS.length,
    skill_prerequisites: edges.length,
    vocabulary_items: VOCABULARY.length,
    collocations: COLLOCATIONS.length,
    idioms: IDIOMS.length,
    phrasal_verbs: PHRASAL_VERBS.length,
    roleplay_scenarios: scenarios.length,
    content_items: GRAMMAR_LESSONS.length + SOUND_CONTRASTS.length + IPA_MODULES.length
      + SHADOWING_SETS.length + TONGUE_TWISTERS.length + PRESENTATION_TOPICS.length
      + DEBATE_TOPICS.length + PUBLIC_SPEAKING.length + MODERN_ENGLISH.length
      + REGISTERS.length + REGISTER_TRANSFORMS.length + RECOVERY.length
      + PRECISION_MAP.length + LISTENING_MODES.length + WRITING_MODES.length,
  };
}

// pnpm db:seed entry point
export async function main() {
  const { getDb } = await import('./client');
  const db = await getDb();
  const counts = await seedContent(db);
  for (const [table, n] of Object.entries(counts)) console.log(`${table}: ${n}`);
  console.log('seed complete');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  void main();
}
