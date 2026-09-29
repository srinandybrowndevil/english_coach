import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { CurriculumService } from '@/server/services/curriculum';
import { SettingsService } from '@/server/services/settings';
import { DailyClient } from './DailyClient';

export const metadata = { title: "Today's training" };

export default async function DailyPage() {
  const session = await requireSession();
  const db = await getDb();
  const settings = await new SettingsService(db).get(session.userId);
  const today = await new CurriculumService(db).todayPlan(session.userId);
  return <DailyClient today={today} defaultMinutes={settings.learning.dailyTargetMinutes} />;
}
