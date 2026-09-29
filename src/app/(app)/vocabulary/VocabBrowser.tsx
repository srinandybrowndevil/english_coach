'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { VocabSeed } from '@/content/vocabulary';
import type { IdiomSeed } from '@/content/idioms';
import type { PhrasalVerb } from '@/content/phrasal-verbs';
import type { CollocationSeed } from '@/content/collocations';
import type { ModernExpr } from '@/content/modern-english';
import type { RegisterInfo, RegisterTransform } from '@/content/register';
import type { RecoveryItem } from '@/content/recovery';
import type { PrecisionMap } from '@/content/precision';

const TABS = ['My Words', 'Due Today', 'Word Bank', 'Idioms', 'Phrasal Verbs', 'Collocations',
  'Modern English', 'Register', 'Recovery', 'Precision'] as const;

function WordCard({ v }: { v: VocabSeed }) {
  const [ta, setTa] = useState(false);
  return (
    <div className="rounded-xl border border-border p-4 space-y-1">
      <div className="flex items-baseline justify-between">
        <span className="font-medium">{v.word} <span className="text-xs text-fg-muted">{v.pos ?? ''} {v.ipa ?? ''}</span></span>
      </div>
      <p className="text-sm">{v.meaning}</p>
      <p className="text-xs text-fg-muted">e.g. {v.business}</p>
      {v.tamil && (
        <button className="text-xs underline text-fg-muted" onClick={() => setTa(!ta)}>
          {ta ? v.tamil : 'Show Tamil'}
        </button>
      )}
    </div>
  );
}

export function VocabBrowser(props: {
  myWords: { id: string; status: string; word: string; meaning: string }[];
  dueCount: number;
  vocabulary: VocabSeed[]; idioms: IdiomSeed[]; phrasalVerbs: PhrasalVerb[];
  collocations: CollocationSeed[]; modern: ModernExpr[];
  registers: RegisterInfo[]; registerTransforms: RegisterTransform[];
  recovery: RecoveryItem[]; precision: PrecisionMap[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Due Today');
  const [selfMark, setSelfMark] = useState<Record<string, string>>({});

  const markAttempt = async (slug: string, registerName: string, ok: boolean) => {
    await fetch('/api/exercise-attempts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseSlug: `register:${slug}:${registerName}`, payload: { ok } }),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vocabulary</h1>
        <Link href="/vocabulary/review" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
          Review session ({props.dueCount} due) →
        </Link>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full border px-3 py-1 ${tab === t ? 'border-accent bg-accent/10' : 'border-border'}`}>
            {t}{t === 'Due Today' && props.dueCount ? ` (${props.dueCount})` : ''}
          </button>
        ))}
      </div>

      {tab === 'My Words' && (
        <ul className="space-y-1 text-sm">
          {props.myWords.map((w) => (
            <li key={w.id} className="flex justify-between rounded-lg bg-surface px-3 py-2">
              <span><strong>{w.word}</strong> — {w.meaning}</span>
              <span className="text-xs text-fg-muted">{w.status}</span>
            </li>
          ))}
          {!props.myWords.length && <li className="text-sm text-fg-muted">Words you learn are added automatically from evaluations.</li>}
        </ul>
      )}

      {tab === 'Due Today' && (
        <p className="text-sm text-fg-muted">
          {props.dueCount
            ? <Link className="text-accent underline" href="/vocabulary/review">{props.dueCount} words due — start the review session →</Link>
            : 'Nothing due. Words come back on their spaced schedule.'}
        </p>
      )}

      {tab === 'Word Bank' && (
        <div className="grid gap-3 md:grid-cols-2">{props.vocabulary.map((v) => <WordCard key={v.slug} v={v} />)}</div>
      )}

      {tab === 'Idioms' && (
        <ul className="space-y-2">
          {props.idioms.map((i) => (
            <li key={i.slug} className="rounded-lg border border-border p-3 text-sm">
              <strong>{i.idiom}</strong> — {i.meaning}
              <div className="text-xs text-fg-muted">{i.literal}</div>
              <div className="text-xs text-amber-700">⚠ {i.registerCaution}</div>
              <div className="text-xs text-fg-muted">e.g. {i.example}</div>
            </li>
          ))}
        </ul>
      )}

      {tab === 'Phrasal Verbs' && (
        <ul className="space-y-2">
          {props.phrasalVerbs.map((p) => (
            <li key={p.slug} className="rounded-lg border border-border p-3 text-sm">
              <strong>{p.verb}</strong> — {p.meaning} <span className="text-xs text-fg-muted">({p.register})</span>
              <div className="text-xs text-fg-muted">daily: {p.examples.daily}</div>
              <div className="text-xs text-fg-muted">business: {p.examples.business}</div>
            </li>
          ))}
        </ul>
      )}

      {tab === 'Collocations' && (
        <ul className="space-y-2">
          {props.collocations.map((c) => (
            <li key={c.slug} className="rounded-lg border border-border p-3 text-sm">
              <strong>{c.collocation}</strong> — {c.meaning}
              <div className="text-xs text-fg-muted">e.g. {c.example}</div>
              {!!c.awkwardAlternatives.length && (
                <div className="text-xs text-amber-700">avoid: {c.awkwardAlternatives.join(', ')}</div>
              )}
            </li>
          ))}
        </ul>
      )}

      {tab === 'Modern English' && (
        <>
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            Casual register — know when NOT to use these (client calls, formal writing).
          </p>
          <ul className="space-y-2">
            {props.modern.map((m) => (
              <li key={m.slug} className="rounded-lg border border-border p-3 text-sm">
                <strong>{m.expression}</strong> — {m.meaning} <span className="text-xs text-fg-muted">({m.register})</span>
                {m.potentiallyDated && <div className="text-xs text-amber-700">May sound dated — safer: “{m.saferAlternative}”</div>}
                <div className="text-xs text-fg-muted">e.g. {m.example}</div>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === 'Register' && (
        <div className="space-y-4">
          {props.registerTransforms.map((t) => (
            <div key={t.slug} className="rounded-xl border border-border p-4">
              <p className="text-sm font-medium">{t.meaning}</p>
              <div className="mt-2 space-y-2">
                {Object.entries(t.versions).map(([reg, model]) => (
                  <div key={reg} className="rounded bg-surface p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase text-fg-muted">{reg}</span>
                      <button className="text-xs underline" onClick={() => setSelfMark((s) => ({ ...s, [`${t.slug}:${reg}`]: 'show' }))}>
                        Try it / show model
                      </button>
                    </div>
                    {selfMark[`${t.slug}:${reg}`] === 'show' && (
                      <>
                        <p className="mt-1 text-fg-muted">Model: {model}</p>
                        <div className="mt-1 flex gap-2 text-xs">
                          <button onClick={() => markAttempt(t.slug, reg, true)} className="text-green-700 underline">I got it right</button>
                          <button onClick={() => markAttempt(t.slug, reg, false)} className="text-amber-700 underline">Needs work</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Recovery' && (
        <ul className="space-y-2">
          {props.recovery.map((r) => (
            <li key={r.slug} className="rounded-lg border border-border p-3 text-sm">
              <strong>{r.purpose}</strong>
              <ul className="mt-1 list-inside list-disc text-fg-muted">{r.phrases.map((p) => <li key={p}>{p}</li>)}</ul>
              <div className="mt-1 text-xs text-fg-muted">Drill: {r.drill}</div>
            </li>
          ))}
        </ul>
      )}

      {tab === 'Precision' && (
        <ul className="space-y-2">
          {props.precision.map((p) => (
            <li key={p.slug} className="rounded-lg border border-border p-3 text-sm">
              vague: <em>{p.vague}</em> → precise: {p.precise.join(' / ')}
              <div className="text-xs text-fg-muted">contexts: {p.contexts.join(', ')}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
