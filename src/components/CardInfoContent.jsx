import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ACCENT } from '../theme';


/* ── tag indicators (user-set tags from bot) ─────────────────── */
const TAG_INDICATORS = [
  { match: (c) => c.tags?.includes('ulubione'),      icon: '💗', label: 'Ulubione' },
  { match: (c) => c.tags?.includes('galeria'),        icon: '📌', label: 'Galeria' },
  { match: (c) => c.tags?.includes('wymiana'),        icon: '🔃', label: 'Wymiana' },
  { match: (c) => c.tags?.includes('rezerwacja'),     icon: '📝', label: 'Rezerwacja' },
  { match: (c) => c.tags?.includes('kosz'),            icon: '🗑️', label: 'Kosz' },
];

/* ── status indicators (card state flags) ────────────────────── */
const STATUS_INDICATORS = [
  { match: (c) => c.isCursed,                          icon: '💀', label: 'Klątwa' },
  { match: (c) => c.isUnique,                         icon: '💠', label: 'Unikalna' },
  { match: (c) => c.hasCustomImage,                   icon: '🖼️', label: 'Skalpel' },
  { match: (c) => c.hasCustomBorder,                  icon: '✂️', label: 'Własna ramka' },
  { match: (c) => c.isTradable === false,              icon: '⛔', label: 'Zablokowana' },
  { match: (c) => c.isInCage,                         icon: '🔒', label: 'W klatce' },
  { match: (c) => c.isActive,                         icon: '☑️', label: 'W talii' },
  { match: (c) => c.isOnExpedition,                   icon: '✈️', label: 'Na ekspedycji' },
  { match: (c) => c.value === 'high' || c.value === 1,  icon: '💰', label: 'Wysoka wartość' },
  { match: (c) => c.value === 'low'  || c.value === -1, icon: '♻️', label: 'Niska wartość' },
];

const INDICATOR_TAGS = new Set(['ulubione', 'galeria', 'wymiana', 'rezerwacja', 'kosz']);

/* ── helpers ──────────────────────────────────────────────────── */


function Section({ label }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.8, mb: 0.5 }}>
      <Typography sx={{
        fontSize: '0.65rem', color: '#555', fontWeight: 700,
        letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: '#2a2a2a' }} />
    </Box>
  );
}

function Stat({ label, value, hint, valueColor, isLast }) {
  if (value == null) return null;
  return (
    <Box sx={{ borderBottom: isLast ? 'none' : '1px solid #1f1f1f', py: 0.15 }}>
      <Typography sx={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
        <span style={{ color: '#888' }}>{label}</span>{' '}
        <span style={{ color: valueColor || '#e0e0e0', fontWeight: 600 }}>{value}</span>
        {hint && (
          <span style={{ fontSize: '0.72rem', color: '#555', fontWeight: 500, marginLeft: 6 }}>{hint}</span>
        )}
      </Typography>
    </Box>
  );
}

/* ── main content ────────────────────────────────────────────── */
export default function CardInfoContent({ card, showOwner }) {
  if (!card) return null;
  const navigate = useNavigate();

  const activeTags = TAG_INDICATORS.filter((i) => i.match(card));
  const activeStatus = STATUS_INDICATORS.filter((i) => i.match(card));
  const extraTags = card.tags?.filter((t) => !INDICATOR_TAGS.has(t)) || [];

  return (
    <>
      {/* ── identity ─── */}
      <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
        {card.characterUrl ? (
          <a
            href={card.characterUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#fff', textDecoration: 'none' }}
            onMouseEnter={(e) => { e.target.style.color = ACCENT; }}
            onMouseLeave={(e) => { e.target.style.color = '#fff'; }}
          >
            {card.name || '???'}
          </a>
        ) : (
          card.name || '???'
        )}
      </Typography>
      <Typography sx={{ fontSize: '0.82rem', color: '#666', mt: 0.3 }}>
        <span style={{ color: '#555' }}>WID</span>{' '}
        <span style={{ color: '#888', fontWeight: 600 }}>{card.id}</span>
        {card.animeTitle && (
          <>
            <span style={{ margin: '0 6px', color: '#333' }}>·</span>
            <span style={{ color: ACCENT }}>{card.animeTitle}</span>
          </>
        )}
      </Typography>

      {/* ── stats ─── */}
      <Section label="Statystyki" />
      <Stat
        label="HP"
        value={card.finalHealth}
        hint={card.baseHealth != null ? `Bazowe: ${card.baseHealth}` : null}
      />
      <Stat label="Atak" value={card.attack} />
      <Stat label="Obrona" value={card.defence} />
      <Stat
        label="Moc"
        value={card.cardPower != null ? Math.round(card.cardPower * 100) / 100 : null}
      />

      {/* ── details ─── */}
      <Section label="Szczegóły" />
      <Stat
        label="EXP"
        value={
          card.expCnt != null
            ? `${Math.round(card.expCnt * 100) / 100} / ${card.expCntForNextLevel ?? '?'}`
            : null
        }
      />
      <Stat label="Restarty" value={card.restartCnt} />
      <Stat label="Dost. ulepszenia" value={card.upgradesCnt} />
      <Stat label="Zmęczenie" value={card.fatigue || 'Brak'} />
      <Stat label="Źródło" value={card.source} />
      <Stat
        label="Utworzono"
        value={card.createdAt ? new Date(card.createdAt).toLocaleDateString('pl-PL') : null}
      />
      {card.whoWantsCount > 0 && <Stat label="KC" value={card.whoWantsCount} isLast={false} />}
      <Box sx={{ borderBottom: 'none', py: 0.15 }}>
        <Typography sx={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
          <span style={{ color: '#888' }}>Należy do</span>{' '}
          <span style={{ color: '#555' }}>—</span>
        </Typography>
      </Box>

      {/* ── status indicators ─── */}
      {activeStatus.length > 0 && (
        <>
          <Section label="Inne" />
          <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
            {activeStatus.map((ind, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: 0.4,
                px: 1, py: 0.3,
                bgcolor: '#1a1a20', border: '1px solid #2a2a30',
                borderRadius: 1, fontSize: '0.75rem', color: '#888',
              }}>
                <span style={{ fontSize: '0.8rem' }}>{ind.icon}</span>
                <span style={{ fontWeight: 600 }}>{ind.label}</span>
              </Box>
            ))}
          </Box>
        </>
      )}

      {/* ── tags ─── */}
      {activeTags.length > 0 && (
        <>
          <Section label="Tagi" />
          <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
            {activeTags.map((ind, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: 0.4,
                px: 1, py: 0.3,
                bgcolor: '#1a1a2a', border: '1px solid #2a2a3a',
                borderRadius: 1, fontSize: '0.75rem', color: '#999',
              }}>
                <span style={{ fontSize: '0.8rem' }}>{ind.icon}</span>
                <span style={{ fontWeight: 600 }}>{ind.label}</span>
              </Box>
            ))}
          </Box>
        </>
      )}

      {/* ── extra tags (tags not covered by status indicators) ─── */}
      {extraTags.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {extraTags.map((tag) => (
            <Box key={tag} sx={{
              px: 1, py: 0.3,
              bgcolor: '#161b24', border: '1px solid #2a3a5a44',
              borderRadius: 1, fontSize: '0.75rem', color: '#7a9ec8', fontWeight: 600,
            }}>
              {tag}
            </Box>
          ))}
        </Box>
      )}

    </>
  );
}
