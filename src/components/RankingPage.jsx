import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Avatar,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';
import { BG_DARK, BG_SURFACE, BORDER, TEXT_BRIGHT, TEXT_PRIMARY, TEXT_DIM, TEXT_FAINT, TEXT_WHITE, HOVER_BG } from '../theme';

const GOLD    = '#ffd700';
const SILVER  = '#c0c0c0';
const BRONZE  = '#cd7f32';
const GOLD_GRADIENT    = 'linear-gradient(135deg, #fce38a 0%, #ffd700 50%, #fce38a 100%)';
const SILVER_GRADIENT  = 'linear-gradient(135deg, #d4d4d4 0%, #f0f0f0 50%, #d4d4d4 100%)';
const BRONZE_GRADIENT  = 'linear-gradient(135deg, #d4985a 0%, #e8b87a 50%, #d4985a 100%)';
const WRP_GRADIENT     = 'linear-gradient(135deg, #f5af19, #ffd700, #f5af19)';

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

/* ── Row (rank 4–10) ──────────────────────────────────────────── */
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

  useEffect(() => {
    fetch(`/ranking.json?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

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

  const players = data.players;
  const p1 = players.find((p) => p.rank === 1);
  const p2 = players.find((p) => p.rank === 2);
  const p3 = players.find((p) => p.rank === 3);
  const rest = players.filter((p) => p.rank > 3);

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', mt: 2, px: 1 }}>
      <Header lastUpdated={data.lastUpdated} nextUpdate={data.nextUpdate} totalParticipants={data.totalParticipants} />

      {/* ── Podium ─── */}
      <Box sx={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        gap: { xs: 1, sm: 2.5 }, mt: 4, mb: 3,
      }}>
        {/* 2nd place */}
        <PodiumCard player={p2} medal={2} gradient={SILVER_GRADIENT} color={SILVER} height={100} navigate={navigate} />

        {/* 1st place */}
        <PodiumCard player={p1} medal={1} gradient={GOLD_GRADIENT} color={GOLD} height={140} navigate={navigate} />

        {/* 3rd place */}
        <PodiumCard player={p3} medal={3} gradient={BRONZE_GRADIENT} color={BRONZE} height={75} navigate={navigate} />
      </Box>

      {/* ── Positions 4–10 ─── */}
      {rest.length > 0 && (
        <Box sx={{
          bgcolor: BG_SURFACE, border: `1px solid ${BORDER}`, borderRadius: 2,
          overflow: 'hidden', mt: 2, mb: 4,
        }}>
          {rest.map((player) => (
            <RankRow key={player.rank} player={player} navigate={navigate} />
          ))}
        </Box>
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
