#!/usr/bin/env node
import axios from 'axios';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '..', 'public', 'ranking.json');
const API = 'https://api.sanakan.pl/api';
const REQUEST_DELAY_MS = 650;
const PAGE_SIZE = 500;
const BOT_USER_ID = 1;

// ── Wagi jakości kart ultimate ────────────────────────────────────
// Progresja oparta na koszcie merge (2^n Alpha), kompresja pierwiastkowa (~1.40x między poziomami)
// Liniowa redukcja: omega -15%, alpha 0% (proporcjonalnie coraz mniej dla niższych jakości)
const QUALITY_WEIGHT = {
  alpha:   26,
  beta:    35,
  gamma:   48,
  delta:   65,
  epsilon: 91,
  zeta:    123,
  eta:     167,
  theta:   229,
  jota:    311,
  lambda:  424,
  sigma:   577,
  omega:   796,
};

const QUALITY_ORDER = Object.keys(QUALITY_WEIGHT);
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

// Zwraca efektywną jakość uwzględniając overflow (np. Delta+2 = Zeta)
function getEffectiveQuality(card) {
  const q = card.ultimateQuality?.toLowerCase();
  const baseIdx = QUALITY_ORDER.indexOf(q);
  if (baseIdx < 0) return null;
  const overflow = card.ultimateOverflow ?? 0;
  const effectiveIdx = Math.min(baseIdx + overflow, QUALITY_ORDER.length - 1);
  return { idx: effectiveIdx, key: QUALITY_ORDER[effectiveIdx] };
}

// ── Liniowe skalowanie z cappowaniem ─────────────────────────────
function linearScore(value, maxValue, maxPts) {
  if (!value || value <= 0) return 0;
  return Math.min(Math.round((value / maxValue) * maxPts), maxPts);
}

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

// ── Wzór WRP ──────────────────────────────────────────────────────
// Suma wszystkich składników / 2 = WRP
//
// Składnik              | Max pkt | Poziom max
// ─────────────────────────────────────────────
// Jakość kart ultimate  |  brak   | suma wag (redukcja od góry)
// Karma (|x|, ±bez różnicy) |  915  | 100 000
// Skalpele              |   759   |     600
// Karty SSS             |   458   |     600
// Unleashed             |   330   |     500
// Loteria               |   847   |   3 500
// Karta max restartów   |   436   |   1 100
// Moc najsilniejszej    |   484   |   1 100
// ─────────────────────────────────────────────
// WRP = ceil(suma składników / 1.3)

function calculateWRP(ultCards, profile) {
  // 1. Jakość kart ultimate – suma wag za każdą kartę (z uwzględnieniem overflow)
  let qualityScore = 0;
  for (const card of ultCards) {
    const eff = getEffectiveQuality(card);
    if (!eff) continue;
    qualityScore += QUALITY_WEIGHT[eff.key] || 0;
  }

  // 2. Karma (abs, max 915 przy 100k)
  const karmaScore = linearScore(Math.abs(profile?.karma ?? 0), 100_000, 915);

  // 3. Skalpele (max 759 przy 600)
  const scalpelScore = linearScore(profile?.scalpelCount ?? 0, 600, 759);

  // 4. Karty SSS (max 458 przy 600)
  const sssScore = linearScore(profile?.cardsCount?.SSS ?? 0, 600, 458);

  // 5. Unleashed (max 330 przy 500)
  const unleashedScore = linearScore(profile?.miscStats?.unleashed ?? 0, 500, 330);

  // 6. Loteria (max 847 przy 3500)
  const lotteryScore = linearScore(profile?.miscStats?.lottery ?? 0, 3_500, 847);

  // 7. Karta z największą liczbą restartów z kart użytkownika (max 436 przy 1100)
  const topCardRestarts = profile?.cardWithMostRestarts?.restartCnt ?? 0;
  const topCardScore = linearScore(topCardRestarts, 1_100, 436);

  // 8. Moc najsilniejszej karty (max 484 przy 1100)
  const mostPowerfulCardPower = profile?.mostPowerfulCard?.cardPower ?? 0;
  const cardPowerScore = linearScore(mostPowerfulCardPower, 1_100, 484);

  const total = qualityScore + karmaScore + scalpelScore + sssScore
              + unleashedScore + lotteryScore + topCardScore + cardPowerScore;

  const wrp = Math.ceil(total / 1.3);

  // Najlepsza jakość do wyświetlenia (z uwzględnieniem overflow)
  let bestQuality = 'Alpha';
  let bestIdx = 0;
  for (const card of ultCards) {
    const eff = getEffectiveQuality(card);
    if (!eff) continue;
    if (eff.idx > bestIdx) { bestIdx = eff.idx; bestQuality = capitalize(eff.key); }
  }

  return {
    wrp,
    stats: {
      ultimateCount: ultCards.length,
      bestQuality,
      karma: Math.round(profile?.karma ?? 0),
      scalpels: profile?.scalpelCount ?? 0,
      sssCards: profile?.cardsCount?.SSS ?? 0,
      restarts: profile?.restartsCount ?? 0,
      unleashed: profile?.miscStats?.unleashed ?? 0,
      lottery: profile?.miscStats?.lottery ?? 0,
      topCardRestarts,
      topCard: {
        name: profile?.cardWithMostRestarts?.name ?? null,
        rarity: profile?.cardWithMostRestarts?.rarity ?? null,
        isUltimate: profile?.cardWithMostRestarts?.isUltimate ?? false,
        ultimateQuality: profile?.cardWithMostRestarts?.ultimateQuality ?? null,
        ultimateOverflow: profile?.cardWithMostRestarts?.ultimateOverflow ?? 0,
      },
      cardPower: mostPowerfulCardPower,
      mostPowerfulCard: {
        name: profile?.mostPowerfulCard?.name ?? null,
        rarity: profile?.mostPowerfulCard?.rarity ?? null,
        cardPower: mostPowerfulCardPower,
        isUltimate: profile?.mostPowerfulCard?.isUltimate ?? false,
        ultimateQuality: profile?.mostPowerfulCard?.ultimateQuality ?? null,
        ultimateOverflow: profile?.mostPowerfulCard?.ultimateOverflow ?? 0,
      },
      ultDistribution: (() => {
        const dist = {};
        for (const card of ultCards) {
          const eff = getEffectiveQuality(card);
          if (!eff) continue;
          dist[eff.key] = (dist[eff.key] || 0) + 1;
        }
        return dist;
      })(),
      breakdown: {
        qualityScore,
        karmaScore,
        scalpelScore,
        sssScore,
        unleashedScore,
        lotteryScore,
        topCardScore,
        cardPowerScore,
        total,
      },
    },
  };
}

async function main() {
  console.log('=== WRP Ranking Calculator ===');
  console.log(`Started at ${new Date().toISOString()}\n`);

  writeSafe(OUTPUT, { status: 'calculating', lastUpdated: null, players: [] });

  console.log('[1/3] Fetching ultimate cards…');
  const allUltCards = await fetchAllUltimateCards();

  console.log('[2/3] Grouping by owner…');
  const ownerMap = groupByOwner(allUltCards);
  console.log(`  → ${ownerMap.size} qualifying owners\n`);

  console.log('[3/3] Fetching profiles & calculating WRP…');
  const results = [];
  let i = 0;
  for (const [userId, ultCards] of ownerMap) {
    i++;
    console.log(`  [${i}/${ownerMap.size}] User ${userId} (${ultCards.length} ult)…`);

    const profile = await fetchProfile(userId);
    const username = await fetchUsername(userId);
    const wrpData = calculateWRP(ultCards, profile);

    results.push({
      userId,
      username: username || `User ${userId}`,
      avatarUrl: `https://cdn.shinden.eu/cdn1/avatars/225x350/${userId}.jpg`,
      ...wrpData,
    });
  }

  console.log('\nSorting & writing output…');
  results.sort((a, b) => b.wrp - a.wrp);
  const allRanked = results.map((p, idx) => ({ rank: idx + 1, ...p }));

  // Sub-rankings top 10 wg poszczególnych składników
  function makeSubRank(getVal, extra) {
    return results
      .filter(p => getVal(p) > 0)
      .sort((a, b) => getVal(b) - getVal(a))
      .slice(0, 10)
      .map((p, i) => ({
        rank: i + 1,
        userId: p.userId,
        username: p.username,
        avatarUrl: p.avatarUrl,
        value: getVal(p),
        ...(extra ? extra(p) : {}),
      }));
  }

  const subRankings = {
    quality:   makeSubRank(p => p.stats.breakdown.qualityScore, p => ({ dist: p.stats.ultDistribution })),
    topCard:   makeSubRank(p => p.stats.topCardRestarts, p => ({ card: p.stats.topCard })),
    lottery:   makeSubRank(p => p.stats.lottery),
    karma:     makeSubRank(p => Math.abs(p.stats.karma), p => ({ rawKarma: p.stats.karma })),
    scalpels:  makeSubRank(p => p.stats.scalpels),
    cardPower: makeSubRank(p => p.stats.cardPower, p => ({ card: p.stats.mostPowerfulCard })),
    sssCards:  makeSubRank(p => p.stats.sssCards),
    unleashed: makeSubRank(p => p.stats.unleashed),
  };

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const output = {
    status: 'ready',
    lastUpdated: now.toISOString(),
    nextUpdate: nextWeek.toISOString(),
    totalParticipants: results.length,
    players: allRanked,
    subRankings,
  };

  writeSafe(OUTPUT, output);

  console.log(`\n Done! ${reqCount} total API requests.`);
  console.log(`  Top 3:`);
  allRanked.slice(0, 3).forEach((p) =>
    console.log(`    #${p.rank} ${p.username} — ${p.wrp} WRP`)
  );
  console.log(`\nOutput: ${OUTPUT}`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message || err);
  try {
    writeSafe(OUTPUT, { status: 'error', lastUpdated: null, players: [] });
  } catch {}
  process.exit(1);
});
