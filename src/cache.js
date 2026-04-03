const mem = new Map();
export const pending = new Map();

export const TTL = {
  SEARCH:      2 * 60 * 1000,        // 2 min  — wyniki wyszukiwania
  PROFILE:    10 * 60 * 1000,        // 10 min — profil użytkownika
  USERNAME:   10 * 60 * 60 * 1000,   // 10 h   — nick
  CARDS:      10 * 1000,              // 10 s   — lista kart (paginacja)
  CARD_DETAIL:10 * 1000,              // 10 s   — szczegóły karty
  ACTIVITY:   10 * 60 * 1000,        // 10 min — aktywność
  WISHLIST:    3 * 60 * 1000,        // 3 min  — lista życzeń
};

function lsKey(k) { return 'wa_' + k; }

export function get(key) {
  const mEntry = mem.get(key);
  if (mEntry) {
    if (Date.now() < mEntry.exp) return mEntry.data;
    mem.delete(key);
  }
  try {
    const raw = localStorage.getItem(lsKey(key));
    if (raw) {
      const entry = JSON.parse(raw);
      if (Date.now() < entry.exp) {
        mem.set(key, entry);
        return entry.data;
      }
      localStorage.removeItem(lsKey(key));
    }
  } catch { /* corrupt data — ignore */ }
  return null;
}

export function set(key, data, ttl, persist = false) {
  const entry = { data, exp: Date.now() + ttl };
  mem.set(key, entry);
  if (persist) {
    try { localStorage.setItem(lsKey(key), JSON.stringify(entry)); }
    catch { /* quota exceeded — memory cache still works */ }
  }
}

export function makeKey(url, body) {
  return body != null ? url + '|' + JSON.stringify(body) : url;
}
