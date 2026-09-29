import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { SettingsService } from '@/server/services/settings';
import { SettingsClient } from './SettingsClient';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const session = await requireSession();
  const settings = await new SettingsService(await getDb()).get(session.userId);
  return <SettingsClient initial={settings} />;
}
