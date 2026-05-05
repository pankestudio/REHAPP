// src/core/db.js
import { openDB } from 'idb';

const DB_NAME    = 'rehapp';
const DB_VERSION = 1;

export async function openRehappDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('state')) {
        db.createObjectStore('state');
      }
      if (!db.objectStoreNames.contains('activity_log')) {
        const log = db.createObjectStore('activity_log', { keyPath: 'id', autoIncrement: true });
        log.createIndex('by_date',      'date');
        log.createIndex('by_type',      'type');
        log.createIndex('by_timestamp', 'timestamp');
      }
      if (!db.objectStoreNames.contains('protocols')) {
        db.createObjectStore('protocols', { keyPath: 'id' });
      }
    },
  });
}

export async function migrateFromLocalStorage(db) {
  const already = await db.get('state', '__migrated__');
  if (already) return;

  const keys = ['xp', 'water', 'fasting', 'streaks', 'history', 'settings', 'last_reset'];
  const tx   = db.transaction('state', 'readwrite');

  for (const key of keys) {
    const raw = localStorage.getItem(`rehapp_${key}`);
    if (raw === null) continue;
    try   { tx.store.put(JSON.parse(raw), key); }
    catch { tx.store.put(raw, key); }
  }

  tx.store.put(true, '__migrated__');
  await tx.done;
}
