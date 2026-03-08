// Background sync service worker module
// This is injected into the Workbox service worker via importScripts

const QUEUE_NAME = "crm-mutation-queue";
const STORE_NAME = "bg-sync-mutations";
const DB_NAME = "crm-bg-sync";

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

async function getAllPending(): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function clearPending(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Listen for messages from the main app to queue mutations
self.addEventListener("message", async (event: any) => {
  if (event.data?.type === "QUEUE_MUTATION") {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add({
      url: event.data.url,
      method: event.data.method,
      headers: event.data.headers,
      body: event.data.body,
      timestamp: Date.now(),
    });
  }
});

// Replay queued mutations when sync event fires
self.addEventListener("sync", async (event: any) => {
  if (event.tag === QUEUE_NAME) {
    event.waitUntil(replayMutations());
  }
});

async function replayMutations() {
  const pending = await getAllPending();
  for (const mutation of pending) {
    try {
      await fetch(mutation.url, {
        method: mutation.method,
        headers: mutation.headers,
        body: mutation.body,
      });
    } catch (e) {
      console.error("[BG Sync] Failed to replay mutation:", e);
      // If any fails, the browser will retry the sync event later
      throw e;
    }
  }
  await clearPending();
}

export {};
