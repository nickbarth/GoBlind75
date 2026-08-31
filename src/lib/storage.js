const DB_NAME = 'blind75-go-practice';
const STORE_NAME = 'practice-state';
const STATE_KEY = 'current';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function transact(mode, callback) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = callback(store);
    transaction.oncomplete = () => { db.close(); resolve(request?.result); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}

export async function loadState() {
  const state = await transact('readonly', (store) => store.get(STATE_KEY));
  return state ?? { codeByProblemId: {}, completedProblemIds: [] };
}

export async function saveState(state) {
  await transact('readwrite', (store) => store.put(state, STATE_KEY));
}

export async function clearState() {
  await transact('readwrite', (store) => store.delete(STATE_KEY));
}
