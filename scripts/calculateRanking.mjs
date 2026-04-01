#!/usr/bin/env node
import axios from 'axios';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '..', 'public', 'ranking.json');
const API = 'https://api.sanakan.pl/api';
const REQUEST_DELAY_MS = 340;
const PAGE_SIZE = 500;
const BOT_USER_ID = 1;

const QUALITY_WEIGHT = {
  alpha:   22,
  beta:    38,
  gamma:   56,
  delta:   82,
  epsilon: 116,
  zeta:    158,
  eta:     210,
  theta:   278,
  jota:    368,
  lambda:  488,
  sigma:   645,
  omega:   1050,
};

const QUALITY_ORDER = Object.keys(QUALITY_WEIGHT);
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let reqCount = 0;

async function apiGet(url) {
  await delay(REQUEST_DELAY_MS);
  reqCount++;
  const { data } = await axios.get(url);
  return data;
}

async function apiPost(url, body = {}) {
  await delay(REQUEST_DELAY_MS);
  reqCount++;
  const { data } = await axios.post(url, body);
  return data;
}

function writeSafe(path, obj) {
  writeFileSync(path, JSON.stringify(obj, null, 2), 'utf-8');
}

async function fetchAllUltimateCards() {
  const all = [];
  let offset = 0;
  let total = null;
  while (total === null || offset < total) {
    console.log(`  Fetching ultimate cards ${offset}–${offset + PAGE_SIZE}…`);
    const res = await apiPost(
      `${API}/waifu/ultimate/cards/${offset}/${PAGE_SIZE}`,
      { orderBy: 'id', includeTags: [], excludeTags: [], searchText: null, filterTagsMethod: 0, cardIds: [] },
    );
    const cards = res.cards || (Array.isArray(res) ? res : []);
    all.push(...cards);
    if (total === null) total = res.totalCards ?? cards.length;
    offset += PAGE_SIZE;
    if (cards.length === 0) break;
  }
  console.log(`  → ${all.length} ultimate cards fetched (${reqCount} requests so far)`);
  return all;
}

function groupByOwner(cards) {
  const map = new Map();
  for (const card of cards) {
    const uid = card.shindenId;
    if (!uid || uid === BOT_USER_ID) continue;
    const q = card.ultimateQuality?.toLowerCase();
    if (!q || q === 'broken') continue;
    if (!QUALITY_WEIGHT[q]) continue;
    if (!map.has(uid)) map.set(uid, []);
    map.get(uid).push(card);
  }
  return map;
}

async function fetchProfile(userId) {
  try { return await apiGet(`${API}/waifu/user/${userId}/profile`); }
  catch { return null; }
}

async function fetchUsername(shindenId) {
  try { return await apiGet(`${API}/user/shinden/${shindenId}/username`); }
  catch { return null; }
}

async function fetchAllUserCards(userId) {
  const all = [];
  let offset = 0;
  let total = null;
  while (total === null || offset < total) {
    const res = await apiPost(
      `${API}/waifu/user/${userId}/cards/${offset}/${PAGE_SIZE}`,
      { orderBy: 'id', includeTags: [], excludeTags: [], searchText: null, filterTagsMethod: 0, cardIds: [] },
    );
    const cards = res.cards || (Array.isArray(res) ? res : []);
    all.push(...cards);
    if (total === null) total = res.totalCards ?? cards.length;
    offset += PAGE_SIZE;
    if (cards.length === 0) break;
  }
  return all;
}

function calculateWRP(ultCards, allCards, profile) {
  let qualityScore = 0;
  for (const card of ultCards) {
    qualityScore += QUALITY_WEIGHT[card.ultimateQuality?.toLowerCase()] || 0;
  }

  let totalPower = 0;
  for (const card of ultCards) {
    totalPower += (card.cardPower || 0);
  }
  const powerScore = Math.min(Math.round(totalPower / 2), 600);

  const karma = profile?.karma ?? 0;
  const karmaScore = Math.min(Math.round(Math.log2(Math.abs(karma) + 1) * 25), 400);

  let scalpelCount = 0;
  for (const card of allCards) {
    if (card.hasCustomImage) scalpelCount++;
  }
  const scalpelScore = Math.min(scalpelCount * 8, 500);

  const wrp = qualityScore + powerScore + karmaScore + scalpelScore;

  let bestQuality = 'Alpha';
  let bestIdx = 0;
  for (const card of ultCards) {
    const q = card.ultimateQuality?.toLowerCase();
    const idx = QUALITY_ORDER.indexOf(q);
    if (idx > bestIdx) {
      bestIdx = idx;
      bestQuality = capitalize(q);
    }
  }

  return {
    wrp: Math.round(wrp),
    stats: {
      ultimateCount: ultCards.length,
      bestQuality,
      karma: Math.round(karma),
      scalpels: scalpelCount,
      totalPower: Math.round(totalPower * 100) / 100,
    },
  };
}

async function main() {
  console.log('=== WRP Ranking Calculator ===');
  console.log(`Started at ${new Date().toISOString()}\n`);

  writeSafe(OUTPUT, { status: 'calculating', lastUpdated: null, players: [] });

  console.log('[1/4] Fetching ultimate cards…');
  const allUltCards = await fetchAllUltimateCards();

  console.log('[2/4] Grouping by owner…');
  const ownerMap = groupByOwner(allUltCards);
  console.log(`  → ${ownerMap.size} qualifying owners\n`);

  console.log('[3/4] Fetching profiles, cards & calculating WRP…');
  const results = [];
  let i = 0;
  for (const [userId, ultCards] of ownerMap) {
    i++;
    console.log(`  [${i}/${ownerMap.size}] User ${userId} (${ultCards.length} ult)…`);

    const profile = await fetchProfile(userId);
    const username = await fetchUsername(userId);
    const allCards = await fetchAllUserCards(userId);
    const wrpData = calculateWRP(ultCards, allCards, profile);

    results.push({
      userId,
      username: username || `User ${userId}`,
      avatarUrl: `https://cdn.shinden.eu/cdn1/avatars/225x350/${userId}.jpg`,
      ...wrpData,
    });
  }

  console.log('\n[4/4] Sorting & writing output…');
  results.sort((a, b) => b.wrp - a.wrp);
  const top15 = results.slice(0, 15).map((p, idx) => ({ rank: idx + 1, ...p }));

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const output = {
    status: 'ready',
    lastUpdated: now.toISOString(),
    nextUpdate: nextWeek.toISOString(),
    totalParticipants: results.length,
    players: top15,
  };

  writeSafe(OUTPUT, output);

  console.log(`\n Done! ${reqCount} total API requests.`);
  console.log(`  Top 3:`);
  top15.slice(0, 3).forEach((p) =>
    console.log(`    #${p.rank} ${p.username} — ${p.wrp} WRP`)
  );
  console.log(`\nOutput: ${OUTPUT}`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message || err);
  try {
    let existing = {};
    try { existing = JSON.parse(readFileSync(OUTPUT, 'utf-8')); } catch {}
    if (existing.status !== 'ready') {
      writeSafe(OUTPUT, { status: 'error', lastUpdated: null, players: [] });
    }
  } catch {}
  process.exit(1);
});
