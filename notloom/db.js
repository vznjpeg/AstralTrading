// NotLoom — tiny IndexedDB wrapper shared by the offscreen recorder,
// the library page and the player page (all run on the extension origin).

const NOTLOOM_DB = 'notloom';
const NOTLOOM_STORE = 'recordings';

function dbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(NOTLOOM_DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(NOTLOOM_STORE, { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function dbRequest(mode, fn) {
  return dbOpen().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(NOTLOOM_STORE, mode);
        const req = fn(tx.objectStore(NOTLOOM_STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      })
  );
}

function dbAdd(rec) {
  return dbRequest('readwrite', (store) => store.add(rec));
}

function dbGet(id) {
  return dbRequest('readonly', (store) => store.get(id));
}

function dbAll() {
  return dbRequest('readonly', (store) => store.getAll());
}

function dbPut(rec) {
  return dbRequest('readwrite', (store) => store.put(rec));
}

function dbDelete(id) {
  return dbRequest('readwrite', (store) => store.delete(id));
}
