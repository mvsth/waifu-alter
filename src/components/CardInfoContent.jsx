import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ACCENT, TEXT_FAINT, TEXT_DIM, TEXT_MUTED, TEXT_PRIMARY, TEXT_SOFT, TEXT_WHITE, DIVIDER, BG_SURFACE, BORDER } from '../theme';


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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2.2, mb: 0.6 }}>
      <Typography sx={{
        fontSize: 'clamp(0.7rem, 0.65rem + 0.1vw, 0.78rem)', color: TEXT_FAINT, fontWeight: 700,
        letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: DIVIDER }} />
    </Box>
  );
}

function Stat({ label, value, hint, valueColor, isLast }) {
  if (value == null) return null;
  return (
    <Box sx={{ borderBottom: isLast ? 'none' : `1px solid ${DIVIDER}`, py: 0.25, display: 'flex', alignItems: 'baseline', gap: 0.1 }}>
      <Typography sx={{ fontSize: 'clamp(0.92rem, 0.88rem + 0.15vw, 1.05rem)', lineHeight: 1.6, color: TEXT_MUTED, flexShrink: 0, minWidth: '13ch' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 'clamp(0.92rem, 0.88rem + 0.15vw, 1.05rem)', lineHeight: 1.6, color: valueColor || TEXT_PRIMARY, fontWeight: 700 }}>
        {value}
        {hint && (
          <span style={{ fontSize: '0.78em', color: TEXT_FAINT, fontWeight: 500, marginLeft: 6 }}>{hint}</span>
        )}
      </Typography>
    </Box>
  );
}

/* ── main content ────────────────────────────────────────────── */
export default function CardInfoContent({ card, showOwner }) {
  if (!card) return null;
  const navigate = useNavigate();

  return (
    <>
      {/* ── identity ─── */}
      <Typography sx={{ fontSize: 'clamp(1.35rem, 1.25rem + 0.3vw, 1.6rem)', fontWeight: 700, color: ACCENT, lineHeight: 1.2 }}>
        {card.characterUrl ? (
          <a
            href={card.characterUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none' }}
            onMouseEnter={(e) => { e.target.style.opacity = '0.8'; }}
            onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
          >
            {card.name || '???'}
          </a>
        ) : (
          card.name || '???'
        )}
      </Typography>
      <Typography sx={{ fontSize: 'clamp(0.85rem, 0.82rem + 0.1vw, 0.95rem)', color: TEXT_DIM, mt: 0.3 }}>
        <span style={{ color: TEXT_FAINT }}>WID</span>{' '}
        <span style={{ color: TEXT_MUTED, fontWeight: 600 }}>{card.id}</span>
        {card.animeTitle && (
          <>
            <span style={{ margin: '0 6px', color: BORDER }}>·</span>
            <span style={{ color: TEXT_WHITE }}>{card.animeTitle}</span>
          </>
        )}
      </Typography>
      {(card.username && card.username !== '????') && (
        <Typography sx={{ fontSize: 'clamp(0.85rem, 0.82rem + 0.1vw, 0.95rem)', color: TEXT_DIM, mt: 0.15 }}>
          <span style={{ color: TEXT_FAINT }}>Należy do</span>{' '}
          {card.shindenId ? (
            <a
              href={`/user/${card.shindenId}`}
              style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={(e) => { e.target.style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { e.target.style.textDecoration = 'none'; }}
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
                e.preventDefault();
                navigate(`/user/${card.shindenId}`);
              }}
            >
              {card.username}
            </a>
          ) : (
            <span style={{ color: TEXT_PRIMARY, fontWeight: 600 }}>{card.username}</span>
          )}
        </Typography>
      )}

      {/* ── stats ─── */}
      <Section label="Statystyki" />
      <Stat
        label="HP"
        value={card.finalHealth}
        hint={card.baseHealth != null ? `${card.baseHealth}` : null}
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
      <Stat label="Ulepszenia" value={card.upgradesCnt} />
      <Stat label="Zmęczenie" value={card.fatigue || 'Brak'} />
      <Stat label="Źródło" value={card.source} />
      <Stat
        label="Utworzono"
        value={card.createdAt ? new Date(card.createdAt).toLocaleDateString('pl-PL') : null}
      />
      <Stat label="KC" value={card.whoWantsCount ?? 0} isLast />

    </>
  );
}

export function CardStatusPills({ card }) {
  if (!card) return null;
  const activeStatus = STATUS_INDICATORS.filter((i) => i.match(card));
  if (!activeStatus.length) return null;
  return (
    <>
      {activeStatus.map((ind, i) => (
        <Box key={i} sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          bgcolor: BG_SURFACE, border: `1px solid ${DIVIDER}`,
          borderRadius: 1.5, px: 1.55, pt: 0.5, pb: '7px', minWidth: 53,
        }}>
          <Typography sx={{ fontSize: '0.47rem', color: '#80808099', fontWeight: 700, letterSpacing: '0.1em', lineHeight: 1, mb: 0.25 }}>
            STATUS
          </Typography>
          <Typography sx={{ fontSize: '0.86rem', color: TEXT_SOFT, fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap' }}>
            {ind.icon} {ind.label}
          </Typography>
        </Box>
      ))}
    </>
  );
}

export function CardTagPills({ card }) {
  if (!card) return null;
  const activeTags = TAG_INDICATORS.filter((i) => i.match(card));
  const extraTags = card.tags?.filter((t) => !INDICATOR_TAGS.has(t)) || [];
  if (!activeTags.length && !extraTags.length) return null;
  return (
    <>
      {activeTags.map((ind, i) => (
        <Box key={i} sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          bgcolor: BG_SURFACE, border: `1px solid ${DIVIDER}`,
          borderRadius: 1.5, px: 1.55, pt: 0.5, pb: '7px', minWidth: 53,
        }}>
          <Typography sx={{ fontSize: '0.47rem', color: '#7272e488', fontWeight: 700, letterSpacing: '0.1em', lineHeight: 1, mb: 0.25 }}>
            TAG
          </Typography>
          <Typography sx={{ fontSize: '0.86rem', color: TEXT_MUTED, fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap' }}>
            {ind.icon} {ind.label}
          </Typography>
        </Box>
      ))}
      {extraTags.map((tag) => (
        <Box key={tag} sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          bgcolor: BG_SURFACE, border: `1px solid ${DIVIDER}`,
          borderRadius: 1.5, px: 1.55, pt: 0.5, pb: '7px', minWidth: 53,
        }}>
          <Typography sx={{ fontSize: '0.47rem', color: '#7272e488', fontWeight: 700, letterSpacing: '0.1em', lineHeight: 1, mb: 0.25 }}>
            TAG
          </Typography>
          <Typography sx={{ fontSize: '0.86rem', color: TEXT_MUTED, fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap' }}>
            {tag}
          </Typography>
        </Box>
      ))}
    </>
  );
}
