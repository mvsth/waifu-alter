let _data = null; // { serverMs, clientMs }
const _listeners = new Set();

export function setDiagnostic(serverMs, clientMs) {
  _data = { serverMs, clientMs };
  _listeners.forEach((fn) => fn(_data));
}

export function getDiagnostic() {
  return _data;
}

export function clearDiagnostic() {
  _data = null;
  _listeners.forEach((fn) => fn(null));
}

export function subscribe(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}
