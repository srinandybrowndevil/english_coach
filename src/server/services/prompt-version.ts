import { and, eq } from 'drizzle-orm';
import type { Db } from '@/lib/db/client';
import { promptTemplates, promptVersions } from '@/lib/db/schema';

// §67 — resolves a prompt version string ('evaluators.v1') to a prompt_versions row id.
export async function ensurePromptVersion(
  db: Db, templateName: string, versionString: string, body: string,
): Promise<string | undefined> {
  const num = Number(versionString.match(/v(\d+)/)?.[1] ?? 1);
  try {
    const [tpl] = await db.insert(promptTemplates).values({ name: templateName })
      .onConflictDoNothing().returning();
    const templateId = tpl?.id
      ?? (await db.query.promptTemplates.findFirst({ where: eq(promptTemplates.name, templateName) }))!.id;
    const [v] = await db.insert(promptVersions)
      .values({ templateId, version: num, body })
      .onConflictDoNothing().returning();
    return v?.id
      ?? (await db.query.promptVersions.findFirst({
        where: and(eq(promptVersions.templateId, templateId), eq(promptVersions.version, num)),
      }))!.id;
  } catch {
    return undefined; // version bookkeeping must never break a session
  }
}
