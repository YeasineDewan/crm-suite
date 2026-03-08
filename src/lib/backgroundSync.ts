const QUEUE_NAME = "crm-mutation-queue";
const DB_NAME = "crm-bg-sync";
const STORE_NAME = "bg-sync-mutations";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Queue a failed mutation for background sync replay.
 * Call this when a Supabase mutation fails due to being offline.
 */
export async function queueMutationForSync(request: {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}) {
  // Try using Background Sync API if available
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    const reg = await navigator.serviceWorker.ready;
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add({ ...request, timestamp: Date.now() });

    try {
      await (reg as any).sync.register(QUEUE_NAME);
    } catch {
      // Sync registration failed, will rely on online event fallback
    }
    return;
  }

  // Fallback: store in IndexedDB, useOfflineMutationSync will handle it
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).add({ ...request, timestamp: Date.now() });
}

/**
 * Replay all queued mutations (called from useOfflineMutationSync as fallback).
 */
export async function replayQueuedMutations(): Promise<number> {
  const db = await openDB();
  const pending: any[] = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  if (pending.length === 0) return 0;

  let replayed = 0;
  for (const mutation of pending) {
    try {
      await fetch(mutation.url, {
        method: mutation.method,
        headers: mutation.headers,
        body: mutation.body,
      });
      replayed++;
    } catch {
      // Stop on first failure — rest will be retried next time
      break;
    }
  }

  // Clear successfully replayed items
  if (replayed > 0) {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const keys: IDBValidKey[] = await new Promise((resolve, reject) => {
      const req = store.getAllKeys();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    for (let i = 0; i < replayed; i++) {
      store.delete(keys[i]);
    }
  }

  return replayed;
}
