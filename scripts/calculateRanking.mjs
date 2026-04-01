#!/usr/bin/env node
/**
 * Ranking Calculator — generates public/ranking.json
 *
 * Run:  node scripts/calculateRanking.mjs
 *
 * Rate-limited to ~3 requests/second so we don't spam the API.
 * Fetches all ultimate cards, groups by owner, fetches profiles,
 * calculates WRP (Waifu Ranking Points) and writes top 10.
 */

import axios from 'axios';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '..', 'public', 'ranking.json');
const API = 'https://api.sanakan.pl/api';
const REQUEST_DELAY_MS = 340; // ~3 req/s
const PAGE_SIZE = 500;
const BOT_USER_ID = 1;

/* ── quality weights (most important factor) ──────────────────── */
const QUALITY_WEIGHT = {
  alpha:   30,
  beta:    50,
  gamma:   75,
  delta:   110,
  epsilon: 155,
  zeta:    210,
  eta:     280,
  theta:   370,
  jota:    490,
  lambda:  650,
  sigma:   860,
  omega:   1400,
};

const QUALITY_ORDER = Object.keys(QUALITY_WEIGHT);
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

/* ── helpers ──────────────────────────────────────────────────── */
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

/* ── Step 1: fetch ALL ultimate cards ─────────────────────────── */
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

/* ── Step 2: group by owner ───────────────────────────────────── */
function groupByOwner(cards) {
  const map = new Map();
  for (const card of cards) {
    const uid = card.shindenId;
    if (!uid || uid === BOT_USER_ID) continue;
    const q = card.ultimateQuality?.toLowerCase();
    // skip Broken quality or missing
    if (!q || q === 'broken') continue;
    if (!QUALITY_WEIGHT[q]) continue;

    if (!map.has(uid)) map.set(uid, []);
    map.get(uid).push(card);
  }
  return map;
}

/* ── Step 3: fetch profiles ───────────────────────────────────── */
async function fetchProfile(userId) {
  try {
    return await apiGet(`${API}/waifu/user/${userId}/profile`);
  } catch {
    return null;
  }
}

async function fetchUsername(shindenId) {
  try {
    return await apiGet(`${API}/user/shinden/${shindenId}/username`);
  } catch {
    return null;
  }
}

/* ── Step 4: calculate WRP ────────────────────────────────────── */
function calculateWRP(cards, profile) {
  // 1. Quality score (main factor)
  let qualityScore = 0;
  for (const card of cards) {
    qualityScore += QUALITY_WEIGHT[card.ultimateQuality?.toLowerCase()] || 0;
  }

  // 2. Power score — aggregate card combat stats
  let totalPower = 0;
  for (const card of cards) {
    totalPower += (card.cardPower || 0);
  }
  const powerScore = Math.min(Math.round(totalPower / 5), 300);

  // 3. Karma score
  const karma = profile?.karma ?? 0;
  const karmaScore = Math.min(Math.round(Math.log2(Math.abs(karma) + 1) * 15), 200);

  // 4. Scalpel score (ultimate cards with custom image)
  let scalpelCount = 0;
  for (const card of cards) {
    if (card.hasCustomImage) scalpelCount++;
  }
  const scalpelScore = Math.min(scalpelCount * 45, 350);

  const wrp = qualityScore + powerScore + karmaScore + scalpelScore;

  // Find best quality
  let bestQuality = 'Alpha';
  let bestIdx = 0;
  for (const card of cards) {
    const q = card.ultimateQuality?.toLowerCase();
    const idx = QUALITY_ORDER.indexOf(q);
    if (idx > bestIdx) {
      bestIdx = idx;
      bestQuality = capitalize(q);
    }
  }

  return {
    wrp: Math.round(wrp),
    breakdown: { qualityScore, powerScore, karmaScore, scalpelScore },
    stats: {
      ultimateCount: cards.length,
      bestQuality,
      karma: Math.round(karma),
      scalpels: scalpelCount,
      totalPower: Math.round(totalPower * 100) / 100,
    },
  };
}

/* ── main ─────────────────────────────────────────────────────── */
async function main() {
  console.log('=== WRP Ranking Calculator ===');
  console.log(`Started at ${new Date().toISOString()}\n`);

  // Write "calculating" status so frontend knows
  writeSafe(OUTPUT, { status: 'calculating', lastUpdated: null, players: [] });

  // 1. Fetch all ultimate cards
  console.log('[1/4] Fetching ultimate cards…');
  const allCards = await fetchAllUltimateCards();

  // 2. Group by owner
  console.log('[2/4] Grouping by owner…');
  const ownerMap = groupByOwner(allCards);
  console.log(`  → ${ownerMap.size} qualifying owners\n`);

  // 3. Fetch profiles and calculate WRP
  console.log('[3/4] Fetching profiles & calculating WRP…');
  const results = [];
  let i = 0;
  for (const [userId, cards] of ownerMap) {
    i++;
    console.log(`  [${i}/${ownerMap.size}] User ${userId} (${cards.length} ultimate cards)…`);

    const profile = await fetchProfile(userId);
    const username = await fetchUsername(userId);
    const wrpData = calculateWRP(cards, profile);

    results.push({
      userId,
      username: username || `User ${userId}`,
      avatarUrl: `https://cdn.shinden.eu/cdn1/avatars/225x350/${userId}.jpg`,
      ...wrpData,
    });
  }

  // 4. Sort and take top 15
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

  console.log(`\n✓ Done! ${reqCount} total API requests.`);
  console.log(`  Top 3:`);
  top15.slice(0, 3).forEach((p) =>
    console.log(`    #${p.rank} ${p.username} — ${p.wrp} WRP`)
  );
  console.log(`\nOutput: ${OUTPUT}`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message || err);
  // Write error status
  try {
    let existing = {};
    try { existing = JSON.parse(readFileSync(OUTPUT, 'utf-8')); } catch {}
    if (existing.status !== 'ready') {
      writeSafe(OUTPUT, { status: 'error', lastUpdated: null, players: [] });
    }
  } catch {}
  process.exit(1);
});
