import axios from 'axios';
import * as cache from './cache';
import { increment } from './apiCounter';

const API = 'https://api.sanakan.pl/api';

async function cachedGet(url, ttl, persist = false) {
  const key = cache.makeKey(url);
  const hit = cache.get(key);
  if (hit !== null) return hit;
  if (cache.pending.has(key)) return cache.pending.get(key);
  increment();
  const promise = axios.get(url)
    .then(({ data }) => { cache.set(key, data, ttl, persist); return data; })
    .finally(() => cache.pending.delete(key));
  cache.pending.set(key, promise);
  return promise;
}

async function cachedPost(url, body, ttl, persist = false, config = {}) {
  const key = cache.makeKey(url, body);
  const hit = cache.get(key);
  if (hit !== null) return hit;
  if (cache.pending.has(key)) return cache.pending.get(key);
  increment();
  const promise = axios.post(url, body, config)
    .then(({ data }) => { cache.set(key, data, ttl, persist); return data; })
    .finally(() => cache.pending.delete(key));
  cache.pending.set(key, promise);
  return promise;
}

export function searchUsers(query) {
  return cachedPost(
    `${API}/User/find`,
    JSON.stringify(query),
    cache.TTL.SEARCH,
    false,
    { headers: { 'Content-Type': 'application/json', 'Accept': '*/*' } }
  );
}

export function getUserProfile(userId) {
  return cachedGet(`${API}/waifu/user/${userId}/profile`, cache.TTL.PROFILE, true);
}

export function getUsername(shindenId) {
  return cachedGet(`${API}/user/shinden/${shindenId}/username`, cache.TTL.USERNAME, true);
}

export function getUserCards(userId, offset, limit, filter = {}) {
  return cachedPost(
    `${API}/waifu/user/${userId}/cards/${offset}/${limit}`,
    filter,
    cache.TTL.CARDS
  );
}

export function getCardDetail(cardId) {
  return cachedGet(`${API}/waifu/card/${cardId}/view`, cache.TTL.CARD_DETAIL);
}

export function getActivity(count = 12) {
  return cachedPost(`${API}/waifu/user/activity/${count}`, [], cache.TTL.ACTIVITY, true);
}

export function getUserWishlist(shindenId) {
  return cachedGet(`${API}/waifu/user/shinden/${shindenId}/wishlist/raw`, cache.TTL.WISHLIST, true);
}

export function getUniqueCards(offset, limit, filter = {}) {
  return cachedPost(
    `${API}/waifu/unique/cards/${offset}/${limit}`,
    filter,
    cache.TTL.CARDS
  );
}

export function getUltimateCards(offset, limit, filter = {}) {
  return cachedPost(
    `${API}/waifu/ultimate/cards/${offset}/${limit}`,
    filter,
    cache.TTL.CARDS
  );
}
