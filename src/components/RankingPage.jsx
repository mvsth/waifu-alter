import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, CircularProgress, Avatar, IconButton, Fab,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate } from 'react-router-dom';
import { BG_DARK, BG_SURFACE, BORDER, TEXT_PRIMARY, TEXT_DIM, TEXT_FAINT, TEXT_WHITE, TEXT_SECONDARY, HOVER_BG } from '../theme';

const GOLD    = '#ffd700';
const SILVER  = '#c0c0c0';
const BRONZE  = '#cd7f32';
const GOLD_GRADIENT    = 'linear-gradient(135deg, #fce38a 0%, #ffd700 50%, #fce38a 100%)';
const SILVER_GRADIENT  = 'linear-gradient(135deg, #d4d4d4 0%, #f0f0f0 50%, #d4d4d4 100%)';
const BRONZE_GRADIENT  = 'linear-gradient(135deg, #d4985a 0%, #e8b87a 50%, #d4985a 100%)';
const WRP_GRADIENT     = 'linear-gradient(135deg, #f5af19, #ffd700, #f5af19)';
const SSS_GRADIENT     = 'linear-gradient(135deg, #ffb3cc 0%, #d4aaff 25%, #a8d8ff 50%, #aaffd8 75%, #fff0a8 100%)';
const ULTIMATE_GRADIENT = 'linear-gradient(135deg, #c850c0 0%, #8b5cf6 50%, #f59e0b 100%)';

const RARITY_COLORS = {
  sss: '#FFD700', ss: '#FF4466', s: '#AA44FF',
  a: '#4488FF', b: '#44BB44', c: '#44BBBB',
  d: '#FF8844', e: '#888888',
};

const QUALITY_NAME = {
  broken:'Broken', alpha:'Alpha', beta:'Beta', gamma:'Gamma',
  delta:'Delta', epsilon:'Epsilon', zeta:'Zeta', eta:'Eta',
  theta:'Theta', jota:'Jota', lambda:'Lambda', sigma:'Sigma', omega:'Omega',
};
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '');

/* ── Tab definitions ──────────────────────────────────────────── */
const TABS = [
  { key: 'wrp', label: 'WRP' },
  { key: 'karma', label: 'Karma' },
  { key: 'scalpels', label: 'Skalpele' },
  { key: 'restarts', label: 'Restarty na karcie' },
  { key: 'lottery', label: 'Przepustki' },
  { key: 'cardPower', label: 'Moc karty' },
];

const KARMA_MODES = [
  { key: 'total', label: 'Łącznie' },
  { key: 'positive', label: 'Dodatnia' },
  { key: 'negative', label: 'Ujemna' },
];

function timeSince(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h temu`;
  if (h > 0) return `${h}h temu`;
  return 'przed chwilą';
}

function timeUntil(dateStr) {
  if (!dateStr) return '';
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'wkrótce';
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `za ${d}d ${h % 24}h`;
  if (h > 0) return `za ${h}h`;
  return `za ${Math.max(1, Math.floor(diff / 60000))}min`;
}

function fmt(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('pl-PL');
}

/* ── Sub-ranking builders (from full players array) ───────────── */
function buildKarmaRanking(players, mode) {
  let filtered = players;
  if (mode === 'positive') filtered = players.filter((p) => (p.stats?.karma ?? 0) > 0);
  else if (mode === 'negative') filtered = players.filter((p) => (p.stats?.karma ?? 0) < 0);

  const sorted = [...filtered].sort((a, b) => Math.abs(b.stats?.karma ?? 0) - Math.abs(a.stats?.karma ?? 0));
  return sorted.map((p, i) => ({
    rank: i + 1,
    userId: p.userId,
    username: p.username,
    avatarUrl: p.avatarUrl,
    displayValue: fmt(p.stats?.karma ?? 0),
    sortValue: Math.abs(p.stats?.karma ?? 0),
  }));
}

function buildScalpelRanking(players) {
  const sorted = [...players].sort((a, b) => (b.stats?.scalpels ?? 0) - (a.stats?.scalpels ?? 0));
  return sorted.map((p, i) => ({
    rank: i + 1,
    userId: p.userId,
    username: p.username,
    avatarUrl: p.avatarUrl,
    displayValue: fmt(p.stats?.scalpels ?? 0),
    sortValue: p.stats?.scalpels ?? 0,
  }));
}

function buildRestartRanking(players) {
  const sorted = [...players].sort((a, b) => (b.stats?.topCardRestarts ?? 0) - (a.stats?.topCardRestarts ?? 0));
  return sorted.map((p, i) => ({
    rank: i + 1,
    userId: p.userId,
    username: p.username,
    avatarUrl: p.avatarUrl,
    displayValue: fmt(p.stats?.topCardRestarts ?? 0),
    sortValue: p.stats?.topCardRestarts ?? 0,
    card: p.stats?.topCard || null,
  }));
}

function buildLotteryRanking(players) {
  const sorted = [...players].sort((a, b) => (b.stats?.lottery ?? 0) - (a.stats?.lottery ?? 0));
  return sorted.map((p, i) => ({
    rank: i + 1,
    userId: p.userId,
    username: p.username,
    avatarUrl: p.avatarUrl,
    displayValue: fmt(p.stats?.lottery ?? 0),
    sortValue: p.stats?.lottery ?? 0,
  }));
}

function buildCardPowerRanking(players) {
  const sorted = [...players].sort((a, b) => (b.stats?.cardPower ?? 0) - (a.stats?.cardPower ?? 0));
  return sorted.map((p, i) => ({
    rank: i + 1,
    userId: p.userId,
    username: p.username,
    avatarUrl: p.avatarUrl,
    displayValue: (p.stats?.cardPower ?? 0).toFixed(1),
    sortValue: p.stats?.cardPower ?? 0,
    card: p.stats?.mostPowerfulCard || null,
  }));
}

/* ── Tab arrow navigation ─────────────────────────────────────── */
function TabNav({ activeTab, onTabChange }) {
  const idx = TABS.findIndex((t) => t.key === activeTab);
  const label = TABS[idx]?.label ?? '';

  function prev() {
    onTabChange(TABS[(idx - 1 + TABS.length) % TABS.length].key);
  }
  function next() {
    onTabChange(TABS[(idx + 1) % TABS.length].key);
  }

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 1, mt: 2, mb: 2.5,
    }}>
      <IconButton onClick={prev} size="small" sx={{ color: GOLD, '&:hover': { bgcolor: `${GOLD}18` } }}>
        <ArrowBackIosNewIcon sx={{ fontSize: '1rem' }} />
      </IconButton>
      <Typography sx={{
        minWidth: 200, textAlign: 'center',
        fontWeight: 800, fontSize: '1rem',
        color: TEXT_WHITE, letterSpacing: '0.04em',
      }}>
        {label}
      </Typography>
      <IconButton onClick={next} size="small" sx={{ color: GOLD, '&:hover': { bgcolor: `${GOLD}18` } }}>
        <ArrowForwardIosIcon sx={{ fontSize: '1rem' }} />
      </IconButton>
    </Box>
  );
}

/* ── Karma mode picker ────────────────────────────────────────── */
function KarmaModePicker({ mode, onModeChange }) {
  return (
    <Box sx={{
      display: 'flex', justifyContent: 'center', gap: 0.6, mb: 2,
    }}>
      {KARMA_MODES.map((m) => {
        const active = m.key === mode;
        return (
          <Box
            key={m.key}
            component="button"
            onClick={() => onModeChange(m.key)}
            sx={{
              fontWeight: active ? 700 : 500,
              fontSize: '0.76rem',
              px: 1.4, py: 0.4,
              borderRadius: 1.5,
              bgcolor: active ? `${GOLD}22` : 'transparent',
              color: active ? GOLD : TEXT_DIM,
              border: active ? `1px solid ${GOLD}55` : `1px solid ${BORDER}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              '&:hover': {
                bgcolor: `${GOLD}18`,
                color: GOLD,
                borderColor: `${GOLD}55`,
              },
            }}
          >
            {m.label}
          </Box>
        );
      })}
    </Box>
  );
}

/* ── Card badge (for restarts/power sub-rankings) ─────────────── */
function CardBadge({ card }) {
  if (!card) return null;
  const isUlt = card.isUltimate;
  const rarityKey = card.rarity?.toLowerCase();
  const qualityStr = card.ultimateQuality
    ? `${QUALITY_NAME[card.ultimateQuality.toLowerCase()] ?? capitalize(card.ultimateQuality)}${(card.ultimateOverflow ?? 0) > 0 ? `+${card.ultimateOverflow}` : ''}`
    : null;

  let badgeBg, badgeColor, badgeLabel;
  if (isUlt) {
    badgeBg = ULTIMATE_GRADIENT;
    badgeColor = '#fff';
    badgeLabel = qualityStr ?? 'ULT';
  } else if (rarityKey === 'sss') {
    badgeBg = SSS_GRADIENT;
    badgeColor = '#fff';
    badgeLabel = 'SSS';
  } else {
    const RARITY_BG_SOLID = {
      ss: '#ff658e', s: '#ffe149', a: '#f49244',
      b: '#a556d8', c: '#0069ab', d: '#3e7315', e: '#848484',
    };
    badgeBg = RARITY_BG_SOLID[rarityKey] ?? '#888';
    badgeColor = '#fff';
    badgeLabel = (rarityKey ?? '?').toUpperCase();
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, flexShrink: 1, minWidth: 0 }}>
      <Typography sx={{
        fontSize: '0.74rem', color: TEXT_SECONDARY, fontWeight: 600,
        wordBreak: 'break-word',
      }}>
        {(card.name || '').trim()}
      </Typography>
      <Box sx={{
        flexShrink: 0, px: 0.55, py: 0.05,
        borderRadius: 0.8,
        background: badgeBg,
      }}>
        <Typography sx={{ fontSize: '0.58rem', fontWeight: 900, color: badgeColor, lineHeight: 1.5, textShadow: '0 1px 4px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.6)' }}>
          {badgeLabel}
        </Typography>
      </Box>
    </Box>
  );
}

/* ── Sub-ranking list row ─────────────────────────────────────── */
function SubRankRow({ entry, unit, navigate }) {
  return (
    <Box
      component="a"
      href={`/user/${entry.userId}/profile`}
      onClick={(e) => {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
          navigate(`/user/${entry.userId}/profile`);
        }
      }}
      sx={{
        display: 'flex', alignItems: 'center', gap: { xs: 1.2, sm: 2 },
        px: { xs: 1.5, sm: 2.5 }, py: 1.1,
        borderBottom: `1px solid ${BORDER}`,
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'background 0.15s',
        '&:hover': { bgcolor: HOVER_BG },
      }}
    >
      <Typography sx={{
        width: 32, textAlign: 'center', flexShrink: 0,
        fontSize: entry.rank <= 3 ? '1.05rem' : '0.95rem',
        fontWeight: entry.rank <= 3 ? 900 : 700,
        color: entry.rank === 1 ? GOLD : entry.rank === 2 ? SILVER : entry.rank === 3 ? BRONZE : TEXT_FAINT,
      }}>
        {entry.rank}
      </Typography>

      <Avatar
        src={entry.avatarUrl}
        sx={{
          width: 38, height: 38, flexShrink: 0,
          border: entry.rank <= 3 ? `2px solid ${entry.rank === 1 ? GOLD : entry.rank === 2 ? SILVER : BRONZE}44` : 'none',
        }}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ color: TEXT_PRIMARY, fontWeight: 600, fontSize: '0.9rem' }}>
          {entry.username}
        </Typography>
        {entry.card && <CardBadge card={entry.card} />}
      </Box>

      <Box sx={{
        bgcolor: `${GOLD}14`, border: `1px solid ${GOLD}44`,
        borderRadius: 1.2, px: 1.3, py: 0.25, flexShrink: 0,
      }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: GOLD }}>
          {entry.displayValue}
        </Typography>
      </Box>
    </Box>
  );
}

/* ── Sub-ranking list view ────────────────────────────────────── */
function SubRankingList({ entries, emptyText, navigate }) {
  if (!entries || entries.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography sx={{ color: TEXT_DIM, fontSize: '0.9rem' }}>
          {emptyText || 'Brak danych.'}
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{
      bgcolor: BG_SURFACE, border: `1px solid ${BORDER}`, borderRadius: 2,
      overflow: 'hidden',
    }}>
      {entries.map((entry) => (
        <SubRankRow key={entry.userId} entry={entry} navigate={navigate} />
      ))}
    </Box>
  );
}

/* ── Podium card (top 3) ──────────────────────────────────────── */
function PodiumCard({ player, medal, gradient, color, height, navigate }) {
  if (!player) return null;
  return (
    <Box
      component="a"
      href={`/user/${player.userId}/profile`}
      onClick={(e) => {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
          navigate(`/user/${player.userId}/profile`);
        }
      }}
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: { xs: '30%', sm: 200 },
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' },
      }}
    >
      {/* Medal */}
      <Box sx={{
        position: 'relative', mb: 1,
      }}>
        <Avatar
          src={player.avatarUrl}
          sx={{
            width: { xs: 64, sm: 88 }, height: { xs: 64, sm: 88 },
            border: `3px solid ${color}`,
            boxShadow: `0 0 20px ${color}44`,
          }}
        />
        <Box sx={{
          position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
          background: gradient, borderRadius: '50%',
          width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 8px ${color}66`,
          border: `2px solid ${BG_DARK}`,
        }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, color: '#000' }}>
            {player.rank}
          </Typography>
        </Box>
      </Box>

      {/* Name */}
      <Typography noWrap sx={{
        color: color, fontWeight: 700, fontSize: { xs: '0.78rem', sm: '0.92rem' },
        mt: 1.5, maxWidth: '100%',
      }}>
        {player.username}
      </Typography>

      {/* WRP */}
      <Box sx={{
        background: WRP_GRADIENT, borderRadius: 1.5, px: 1.8, py: 0.4, mt: 0.6,
      }}>
        <Typography sx={{
          fontSize: { xs: '0.85rem', sm: '1.05rem' }, fontWeight: 900, color: '#000',
          letterSpacing: '0.04em',
        }}>
          {player.wrp.toLocaleString('pl-PL')} <span style={{ fontSize: '0.7em', fontWeight: 700 }}>WRP</span>
        </Typography>
      </Box>

      {/* Podium block */}
      <Box sx={{
        width: '100%', mt: 1.2,
        height: { xs: height * 0.65, sm: height },
        background: `linear-gradient(180deg, ${color}22 0%, ${color}08 100%)`,
        border: `1px solid ${color}33`,
        borderRadius: '8px 8px 0 0',
      }} />
    </Box>
  );
}

/* ── WRP Row (rank 4+) ────────────────────────────────────────── */
function RankRow({ player, navigate }) {
  return (
    <Box
      component="a"
      href={`/user/${player.userId}/profile`}
      onClick={(e) => {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
          navigate(`/user/${player.userId}/profile`);
        }
      }}
      sx={{
        display: 'flex', alignItems: 'center', gap: 2,
        px: { xs: 1.5, sm: 2.5 }, py: 1.2,
        borderBottom: `1px solid ${BORDER}`,
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'background 0.15s',
        '&:hover': { bgcolor: HOVER_BG },
      }}
    >
      {/* Rank number */}
      <Typography sx={{
        width: 32, textAlign: 'center',
        fontSize: '1.1rem', fontWeight: 800, color: TEXT_FAINT,
      }}>
        {player.rank}
      </Typography>

      {/* Avatar */}
      <Avatar
        src={player.avatarUrl}
        sx={{ width: 42, height: 42 }}
      />

      {/* Name */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ color: TEXT_PRIMARY, fontWeight: 600, fontSize: '0.92rem' }}>
          {player.username}
        </Typography>
      </Box>

      {/* WRP */}
      <Box sx={{
        background: WRP_GRADIENT, borderRadius: 1.2, px: 1.4, py: 0.3,
        flexShrink: 0,
      }}>
        <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#000' }}>
          {player.wrp.toLocaleString('pl-PL')} <span style={{ fontSize: '0.65em', fontWeight: 700 }}>WRP</span>
        </Typography>
      </Box>
    </Box>
  );
}

/* ── WRP view (podium + list) ─────────────────────────────────── */
function WrpView({ players, navigate }) {
  const p1 = players.find((p) => p.rank === 1);
  const p2 = players.find((p) => p.rank === 2);
  const p3 = players.find((p) => p.rank === 3);
  const rest = players.filter((p) => p.rank > 3);

  return (
    <>
      {/* Podium */}
      <Box sx={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        gap: { xs: 1, sm: 2.5 }, mt: 2, mb: 3,
      }}>
        <PodiumCard player={p2} medal={2} gradient={SILVER_GRADIENT} color={SILVER} height={100} navigate={navigate} />
        <PodiumCard player={p1} medal={1} gradient={GOLD_GRADIENT} color={GOLD} height={140} navigate={navigate} />
        <PodiumCard player={p3} medal={3} gradient={BRONZE_GRADIENT} color={BRONZE} height={75} navigate={navigate} />
      </Box>

      {/* Positions 4+ */}
      {rest.length > 0 && (
        <Box sx={{
          bgcolor: BG_SURFACE, border: `1px solid ${BORDER}`, borderRadius: 2,
          overflow: 'hidden', mt: 2,
        }}>
          {rest.map((player) => (
            <RankRow key={player.rank} player={player} navigate={navigate} />
          ))}
        </Box>
      )}
    </>
  );
}

/* ── Calculating animation ────────────────────────────────────── */
function CalculatingOverlay() {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', py: 12, gap: 3,
    }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          size={80}
          sx={{
            color: GOLD,
            '& .MuiCircularProgress-circle': {
              filter: `drop-shadow(0 0 8px ${GOLD}66)`,
            },
          }}
        />
        <Box sx={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <EmojiEventsIcon sx={{ color: GOLD, fontSize: 32 }} />
        </Box>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{
          color: GOLD, fontWeight: 700, fontSize: '1.1rem', mb: 0.5,
        }}>
          Obliczanie rankingu…
        </Typography>
        <Typography sx={{ color: TEXT_DIM, fontSize: '0.82rem' }}>
          Zbieramy dane z API — to może chwilę potrwać.
        </Typography>
      </Box>
    </Box>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function RankingPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState('wrp');
  const [karmaMode, setKarmaMode] = useState('total');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch(`/ranking.json?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Reset to WRP on every mount (navigating to /ranking always starts on WRP)
  useEffect(() => {
    setActiveTab('wrp');
    setKarmaMode('total');
  }, []);

  // Build sub-rankings from full players list
  const subRankings = useMemo(() => {
    if (!data?.players) return {};
    const players = data.players;
    return {
      karma: buildKarmaRanking(players, karmaMode),
      scalpels: buildScalpelRanking(players),
      restarts: buildRestartRanking(players),
      lottery: buildLotteryRanking(players),
      cardPower: buildCardPowerRanking(players),
    };
  }, [data, karmaMode]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: GOLD }} size={60} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography sx={{ color: GOLD, fontWeight: 700, fontSize: '1.2rem' }}>
          Nie udało się pobrać rankingu.
        </Typography>
      </Box>
    );
  }

  if (data.status === 'calculating') {
    return (
      <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
        <Header />
        <CalculatingOverlay />
      </Box>
    );
  }

  if (data.status === 'empty' || !data.players?.length) {
    return (
      <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
        <Header nextUpdate={data.nextUpdate} />
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <EmojiEventsIcon sx={{ fontSize: 56, color: TEXT_FAINT, mb: 2 }} />
          <Typography sx={{ color: TEXT_DIM, fontSize: '0.95rem' }}>
            Ranking nie został jeszcze obliczony.
          </Typography>
          <Typography sx={{ color: TEXT_FAINT, fontSize: '0.8rem', mt: 0.5 }}>
            Pierwsza aktualizacja wkrótce — proszę czekać.
          </Typography>
          {data.nextUpdate && (
            <Typography sx={{ color: TEXT_FAINT, fontSize: '0.72rem', mt: 0.8 }}>
              Następna aktualizacja: {timeUntil(data.nextUpdate)}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  const SUB_CONFIG = {
    karma:     { empty: 'Brak graczy z taką karmą.' },
    scalpels:  { empty: 'Brak danych o skalpelach.' },
    restarts:  { empty: 'Brak danych o restartach.' },
    lottery:   { empty: 'Brak danych o przepustkach.' },
    cardPower: { empty: 'Brak danych o mocy kart.' },
  };

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', mt: 2, px: 1 }}>
      <Header lastUpdated={data.lastUpdated} nextUpdate={data.nextUpdate} totalParticipants={data.totalParticipants} />

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'wrp' && (
        <WrpView players={data.players} navigate={navigate} />
      )}

      {activeTab === 'karma' && (
        <>
          <KarmaModePicker mode={karmaMode} onModeChange={setKarmaMode} />
          <SubRankingList
            entries={subRankings.karma}
            emptyText={SUB_CONFIG.karma.empty}
            navigate={navigate}
          />
        </>
      )}

      {activeTab !== 'wrp' && activeTab !== 'karma' && (
        <SubRankingList
          entries={subRankings[activeTab]}
          emptyText={SUB_CONFIG[activeTab]?.empty}
          navigate={navigate}
        />
      )}

      {showScrollTop && (
        <Fab
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          size="small"
          sx={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1200,
            bgcolor: GOLD, color: '#000',
            '&:hover': { bgcolor: GOLD, opacity: 0.85 },
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      )}
    </Box>
  );
}

function Header({ lastUpdated, nextUpdate, totalParticipants }) {
  return (
    <Box sx={{ textAlign: 'center', mb: 1 }}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
        <EmojiEventsIcon sx={{ fontSize: 32, color: GOLD, filter: `drop-shadow(0 0 6px ${GOLD}44)` }} />
        <Typography sx={{
          fontSize: { xs: '1.5rem', sm: '1.8rem' },
          fontWeight: 900,
          background: 'linear-gradient(135deg, #f5af19, #ffd700, #fff6a0, #ffd700, #f5af19)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.06em',
        }}>
          RANKING
        </Typography>
        <EmojiEventsIcon sx={{ fontSize: 32, color: GOLD, filter: `drop-shadow(0 0 6px ${GOLD}44)` }} />
      </Box>
      {lastUpdated && (
        <Typography sx={{ color: TEXT_FAINT, fontSize: '0.7rem', mt: 0.3 }}>
          Ostatnia aktualizacja: {timeSince(lastUpdated)}
          {totalParticipants > 0 && ` · ${totalParticipants} uczestników`}
        </Typography>
      )}
      {nextUpdate && (
        <Typography sx={{ color: TEXT_FAINT, fontSize: '0.66rem', mt: 0.2 }}>
          Następna aktualizacja: {timeUntil(nextUpdate)}
        </Typography>
      )}
    </Box>
  );
}
