import Link from 'next/link';
import { requireSession } from '@/lib/auth/session';

export const metadata = { title: 'Practice' };

const MODULES: { href: string; title: string; desc: string }[] = [
  { href: '/practice/tamil-english', title: 'Tamil → English Lab', desc: 'Translate Tamil sentences; get literal/natural/professional versions.' },
  { href: '/practice/think-english', title: 'Think-in-English Lab', desc: 'English-only drills: describe, explain, narrate — no translation.' },
  { href: '/grammar', title: 'Grammar', desc: 'Curriculum lessons with quizzes.' },
  { href: '/vocabulary', title: 'Vocabulary', desc: 'Word bank, review, register, idioms, precision.' },
  { href: '/pronunciation', title: 'Pronunciation', desc: 'Sounds, IPA, drills.' },
  { href: '/tongue-twisters', title: 'Tongue twisters', desc: 'Speed + accuracy.' },
  { href: '/listening', title: 'Listening', desc: 'Scripted audio across accents.' },
  { href: '/fluency', title: 'Fluency drills', desc: 'Timed quick drills.' },
  { href: '/mistakes', title: 'Mistake Vault', desc: 'Your error patterns and practice.' },
];

export default async function PracticePage() {
  await requireSession();
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">Practice</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {MODULES.map((m) => (
          <li key={m.href}>
            <Link href={m.href} className="block rounded-xl border border-border p-4 hover:bg-surface">
              <p className="font-medium">{m.title}</p>
              <p className="text-sm text-fg-muted">{m.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
