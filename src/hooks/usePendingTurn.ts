'use client';
import { useCallback, useEffect, useState } from 'react';

// ~30-line IndexedDB helper — keeps an unsent recording/transcript across reloads (§75).
const DB = 'english-os';
const STORE = 'pending-turns';

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(key: string, val: unknown) {
  const db = await idb();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(val, key);
    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
  });
}
async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await idb();
  return new Promise((res, rej) => {
    const req = db.transaction(STORE).objectStore(STORE).get(key);
    req.onsuccess = () => res(req.result as T); req.onerror = () => rej(req.error);
  });
}
async function idbDel(key: string) {
  const db = await idb();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
  });
}

export type PendingTurn = { transcript?: string; audio?: { bytes: number[]; mime: string }; savedAt: number };

export function usePendingTurn(sessionId: string | null) {
  const [pending, setPending] = useState<PendingTurn | null>(null);
  const key = sessionId ? `turn:${sessionId}` : null;

  useEffect(() => {
    if (!key) return;
    idbGet<PendingTurn>(key).then((p) => p && setPending(p)).catch(() => {});
  }, [key]);

  const save = useCallback(async (p: Omit<PendingTurn, 'savedAt'>) => {
    if (!key) return;
    const val = { ...p, savedAt: Date.now() };
    await idbSet(key, val).catch(() => {});
    setPending(val);
  }, [key]);

  const clear = useCallback(async () => {
    if (!key) return;
    await idbDel(key).catch(() => {});
    setPending(null);
  }, [key]);

  return { pending, save, clear };
}
