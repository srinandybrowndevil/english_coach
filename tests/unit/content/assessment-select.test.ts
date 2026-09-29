import { describe, expect, it } from 'vitest';
import { ASSESSMENT_ITEM_BANK, selectItems } from '@/content/assessment';

describe('selectItems variant determinism (§59)', () => {
  it('initial picks variant 0 in every group', () => {
    const items = selectItems('initial');
    for (const it of items) {
      const g = ASSESSMENT_ITEM_BANK.find((x) => x.variants.includes(it))!;
      expect(it).toBe(g.variants[0]);
    }
  });

  it('monthly month 1 vs month 2 differ but keep the same groups', () => {
    const m1 = selectItems('monthly', 1).map((i) => i.slug);
    const m2 = selectItems('monthly', 2).map((i) => i.slug);
    expect(m1).not.toEqual(m2);
    const groupOf = (slug: string) => slug.replace(/-v\d.*$/, '');
    expect(m1.map(groupOf)).toEqual(m2.map(groupOf)); // same groups, rotated variants
  });

  it('is deterministic — same input → same selection', () => {
    expect(selectItems('monthly', 3).map((i) => i.slug))
      .toEqual(selectItems('monthly', 3).map((i) => i.slug));
  });

  it('has ≥2 variants per group and covers all 12 sections', () => {
    for (const g of ASSESSMENT_ITEM_BANK) expect(g.variants.length).toBeGreaterThanOrEqual(2);
    const sections = new Set(ASSESSMENT_ITEM_BANK.map((g) => g.section));
    for (const s of ['Grammar', 'Vocabulary', 'Reading', 'Listening', 'Writing', 'Pronunciation',
      'Speaking', 'Conversation', 'Storytelling', 'Business', 'Negotiation', 'Spontaneous'])
      expect(sections.has(s)).toBe(true);
  });
});
