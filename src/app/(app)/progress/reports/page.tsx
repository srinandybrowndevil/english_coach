import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { weeklyReports, monthlyReports } from '@/lib/db/schema';
import { ReportService } from '@/server/services/report';

export const metadata = { title: 'Reports' };

function monday(d: Date) { const x = new Date(d); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); x.setUTCHours(0, 0, 0, 0); return x; }

export default async function ReportsPage() {
  const session = await requireSession();
  const db = await getDb();
  const svc = new ReportService(db);

  // lazy-generate finished periods (no cron)
  const thisMonday = monday(new Date());
  const lastWeek = new Date(thisMonday.getTime() - 7 * 86_400_000);
  await svc.weekly(session.userId, lastWeek);
  const prevMonth = new Date(Date.UTC(thisMonday.getUTCFullYear(), thisMonday.getUTCMonth() - 1, 1));
  await svc.monthly(session.userId, prevMonth);

  const [weekly, monthly] = await Promise.all([
    db.query.weeklyReports.findMany({ where: eq(weeklyReports.learnerId, session.userId), orderBy: desc(weeklyReports.weekStart), limit: 24 }),
    db.query.monthlyReports.findMany({ where: eq(monthlyReports.learnerId, session.userId), orderBy: desc(monthlyReports.month), limit: 12 }),
  ]);
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <h2 className="font-semibold">Weekly</h2>
      <ul className="space-y-2">
        {weekly.map((r) => (
          <li key={r.id}><Link href={`/progress/reports/${r.id}?kind=weekly`}
            className="block rounded-xl border border-border p-3 text-sm hover:bg-surface">Week of {r.weekStart}</Link></li>
        ))}
      </ul>
      <h2 className="font-semibold">Monthly</h2>
      <ul className="space-y-2">
        {monthly.map((r) => (
          <li key={r.id}><Link href={`/progress/reports/${r.id}?kind=monthly`}
            className="block rounded-xl border border-border p-3 text-sm hover:bg-surface">{r.month}</Link></li>
        ))}
      </ul>
    </div>
  );
}
