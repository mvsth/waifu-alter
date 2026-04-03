const KEY = (uid) => `workshop_${uid}`;

export function getWorkshopCards(userId) {
  try {
    const raw = localStorage.getItem(KEY(userId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setWorkshopCards(userId, cards) {
  try {
    localStorage.setItem(KEY(userId), JSON.stringify(cards));
  } catch {}
}

export function clearWorkshopCards(userId) {
  try {
    localStorage.removeItem(KEY(userId));
  } catch {}
}

export function hasWorkshop(userId) {
  try {
    const raw = localStorage.getItem(KEY(userId));
    if (!raw) return false;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length > 0;
  } catch { return false; }
}
