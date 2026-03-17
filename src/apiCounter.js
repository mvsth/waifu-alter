const LS_KEY = 'wa_api_count';

let _count = (() => {
  try { return parseInt(localStorage.getItem(LS_KEY), 10) || 0; } catch { return 0; }
})();

const _listeners = new Set();

export function increment() {
  _count++;
  try { localStorage.setItem(LS_KEY, _count); } catch {}
  _listeners.forEach((fn) => fn(_count));
}

export function getCount() {
  return _count;
}

export function subscribe(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}
