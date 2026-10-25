/* PintaKids — armazenamento
   Perfil (pontos, favoritos, recordes) em localStorage: é pequeno e síncrono.
   Imagens (galeria, rascunhos, desenhos importados) em IndexedDB: são grandes. */
(function () {
  const KEY = 'pintakids_profile_v1';

  const defaults = () => ({
    name: '',
    totalEarned: 0,
    best: {},              // drawingId -> {score, stars, points}
    favorites: {
      colors: ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#4FC3F7', '#1E88E5', '#8E24AA', '#F06292', '#795548', '#F5CBA7', '#212121', '#FFFFFF'],
      tools: ['lapis', 'giz', 'canetinha', 'pincel', 'balde', 'borracha', 'carimbos'],
    },
    achievements: {},      // id -> data
    seenUnlocks: [],       // chaves "tipo:id" já celebradas
    stats: { saves: 0, fiveStars: 0, freeSaves: 0, stickers: 0, colors: [], tools: [], themes: [] },
    settings: { sound: true, speak: true, unlockAll: false, sensitivity: 1, useSpeed: true },
    touchCal: { min: 0, max: 0 },
    last: { tool: 'giz', color: '#E53935', size: 1, fill: 'solido', sticker: '⭐' },
  });

  function merge(base, saved) {
    for (const k in saved) {
      if (saved[k] && typeof saved[k] === 'object' && !Array.isArray(saved[k]) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) merge(base[k], saved[k]);
      else if (saved[k] !== undefined) base[k] = saved[k];
    }
    return base;
  }

  let profile;
  try { profile = merge(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
  catch (e) { profile = defaults(); }

  const Store = {
    get profile() { return profile; },
    save() { try { localStorage.setItem(KEY, JSON.stringify(profile)); } catch (e) { console.warn('save profile', e); } },
    reset() { profile = defaults(); Store.save(); },
  };

  // ---------------- IndexedDB ----------------
  let dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const rq = indexedDB.open('pintakids', 1);
      rq.onupgradeneeded = () => {
        const d = rq.result;
        if (!d.objectStoreNames.contains('art')) d.createObjectStore('art', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('drafts')) d.createObjectStore('drafts', { keyPath: 'drawingId' });
        if (!d.objectStoreNames.contains('custom')) d.createObjectStore('custom', { keyPath: 'id' });
      };
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => rej(rq.error);
    });
    return dbp;
  }
  function tx(store, mode, fn) {
    return db().then((d) => new Promise((res, rej) => {
      const t = d.transaction(store, mode);
      const s = t.objectStore(store);
      let out;
      const r = fn(s);
      if (r) r.onsuccess = () => (out = r.result);
      t.oncomplete = () => res(out);
      t.onerror = () => rej(t.error);
    }));
  }
  Store.put = (store, val) => tx(store, 'readwrite', (s) => s.put(val));
  Store.get = (store, key) => tx(store, 'readonly', (s) => s.get(key));
  Store.del = (store, key) => tx(store, 'readwrite', (s) => s.delete(key));
  Store.all = (store) => tx(store, 'readonly', (s) => s.getAll());
  Store.clearAll = () => Promise.all(['art', 'drafts', 'custom'].map((n) => tx(n, 'readwrite', (s) => s.clear())));

  // pede ao navegador para não apagar os dados quando faltar espaço
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  window.Store = Store;
})();
