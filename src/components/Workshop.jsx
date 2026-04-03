import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, CircularProgress, Link, Tooltip, Fab, Snackbar, Alert,
  MenuItem, Select, IconButton,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { getUserProfile, getUsername } from '../api';
import { ACCENT, CARD_TILE_BG, TEXT_BRIGHT, TEXT_SOFT, TEXT_DIM, TEXT_MUTED,
  TEXT_FAINT, TEXT_WHITE, OVERLAY_BG, BG_DARK, BORDER, TOOLBAR_BG, TOOLBAR_BORDER, CARD_BORDER_UNSEL,
} from '../theme';
import UserNavBar from './UserNavBar';
import ExpeditionsDialog from './ExpeditionsDialog';
import CardDetail from './CardDetail';
import CardIcons from './CardIcons';
import LazyCard from './LazyCard';
import { getWorkshopCards, clearWorkshopCards } from '../workshop';

const SORT_OPTIONS = [
  { label: 'Id',             value: 'id' },
  { label: 'Nazwa',          value: 'name' },
  { label: 'Ranga',          value: 'rarity' },
  { label: 'Tytuł anime',    value: 'title' },
  { label: 'Życie',          value: 'health' },
  { label: 'Bazowe życie',   value: 'healthBase' },
  { label: 'Atak',           value: 'atack' },
  { label: 'Obrona',         value: 'defence' },
  { label: 'Doświadczenie',  value: 'exp' },
  { label: 'Dere',           value: 'dere' },
  { label: 'Obrazek',        value: 'picture' },
  { label: 'Relacja',        value: 'relation' },
  { label: 'Moc',            value: 'cardPower' },
  { label: 'Liczba KC',      value: 'whoWantsCount' },
  { label: 'Zablokowane',    value: 'blocked' },
  { label: 'Klątwa',         value: 'curse' },
  { label: 'Zmęczenie',      value: 'fatigue' },
  { label: 'Overflow',       value: 'overflow' },
];

const RARITY_ORDER = ['sss', 'ss', 's', 'a', 'b', 'c', 'd', 'e', 'f'];

function sortCards(cards, sortBy, asc) {
  const dir = asc ? 1 : -1;
  return [...cards].sort((a, b) => {
    let va, vb;
    switch (sortBy) {
      case 'id':           va = a.id ?? 0;             vb = b.id ?? 0;             break;
      case 'name':         return dir * ((a.name ?? '').localeCompare(b.name ?? '', 'pl'));
      case 'rarity':       va = RARITY_ORDER.indexOf((a.rarity||'f').toLowerCase()); vb = RARITY_ORDER.indexOf((b.rarity||'f').toLowerCase()); break;
      case 'title':        return dir * ((a.animeTitle ?? '').localeCompare(b.animeTitle ?? '', 'pl'));
      case 'health':       va = a.health ?? 0;         vb = b.health ?? 0;         break;
      case 'healthBase':   va = a.healthBase ?? 0;     vb = b.healthBase ?? 0;     break;
      case 'atack':        va = a.atack ?? 0;          vb = b.atack ?? 0;          break;
      case 'defence':      va = a.defence ?? 0;        vb = b.defence ?? 0;        break;
      case 'exp':          va = a.exp ?? 0;            vb = b.exp ?? 0;            break;
      case 'dere':         return dir * ((a.dere ?? '').localeCompare(b.dere ?? '', 'pl'));
      case 'picture':      va = a.picture ?? 0;        vb = b.picture ?? 0;        break;
      case 'relation':     va = a.relation ?? 0;       vb = b.relation ?? 0;       break;
      case 'cardPower':    va = a.cardPower ?? 0;      vb = b.cardPower ?? 0;      break;
      case 'whoWantsCount':va = a.whoWantsCount ?? 0;  vb = b.whoWantsCount ?? 0;  break;
      case 'blocked':      va = a.blocked ? 1 : 0;    vb = b.blocked ? 1 : 0;    break;
      case 'curse':        va = a.curse ?? 0;          vb = b.curse ?? 0;          break;
      case 'fatigue':      va = a.fatigue ?? 0;        vb = b.fatigue ?? 0;        break;
      case 'overflow':     va = a.overflow ?? 0;       vb = b.overflow ?? 0;       break;
      default:             va = a.id ?? 0;             vb = b.id ?? 0;
    }
    return dir * (va - vb);
  });
}

export default function Workshop() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState(null);
  const [cards, setCards] = useState([]);
  const [expOpen, setExpOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortBy, setSortBy] = useState('id');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [snack, setSnack] = useState(false);

  useEffect(() => {
    if (!selectionMode) setSelectedIds(new Set());
  }, [selectionMode]);

  useEffect(() => {
    getUserProfile(userId).then(setProfile).catch(() => {});
    getUsername(userId).then(setUsername).catch(() => {});
    const saved = getWorkshopCards(userId);
    setCards(Array.isArray(saved) ? saved : []);
  }, [userId]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const userColor = profile?.foregroundColor || ACCENT;
  const hideStats = localStorage.getItem('hideCardStats') === 'true';

  const sorted = useMemo(() => sortCards(cards, sortBy, sortAsc), [cards, sortBy, sortAsc]);

  function closeWorkshop() {
    clearWorkshopCards(userId);
    navigate(`/user/${userId}/cards`);
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function copyWids() {
    if (selectedIds.size > 0) {
      navigator.clipboard.writeText([...selectedIds].join(' '));
      setSnack(true);
    }
  }

  return (
    <Box>
      <UserNavBar userId={userId} profile={profile} username={username}
        onExpeditions={() => setExpOpen(true)} />

      {/* Sort / info bar */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
        mb: 2.5, px: 0.5, py: 1.25,
        bgcolor: TOOLBAR_BG, borderRadius: 2,
        border: `1px solid ${TOOLBAR_BORDER}`,
      }}>
        <BuildIcon sx={{ fontSize: 18, color: userColor, ml: 0.5 }} />
        <Typography sx={{ fontWeight: 700, color: TEXT_BRIGHT, fontSize: '0.97rem' }}>
          Warsztat
        </Typography>
        <Chip
          label={cards.length}
          size="small"
          sx={{ bgcolor: `${userColor}22`, color: userColor, fontWeight: 700, height: 22 }}
        />

        <Box sx={{ flex: 1 }} />

        {/* Selection toggle */}
        <Tooltip title={selectionMode ? 'Wyłącz zaznaczanie' : 'Zaznacz karty do skopiowania'} arrow>
          <IconButton
            size="small"
            onClick={() => setSelectionMode((p) => !p)}
            sx={{ color: selectionMode ? userColor : TEXT_MUTED, '&:hover': { color: userColor } }}
          >
            {selectionMode ? <CheckBoxIcon sx={{ fontSize: 20 }} /> : <CheckBoxOutlineBlankIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Tooltip>

        {/* Sort select */}
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          size="small"
          variant="outlined"
          MenuProps={{ PaperProps: { sx: { maxHeight: 260 } } }}
          sx={{
            height: 32, fontSize: '0.82rem', color: TEXT_BRIGHT,
            bgcolor: BG_DARK, borderRadius: 1,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: BORDER },
            '& .MuiSelect-icon': { color: TEXT_MUTED },
            minWidth: 120,
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.82rem' }}>{o.label}</MenuItem>
          ))}
        </Select>

        <IconButton
          size="small"
          onClick={() => setSortAsc((v) => !v)}
          sx={{ color: TEXT_MUTED, '&:hover': { color: userColor } }}
        >
          {sortAsc ? <ArrowUpwardIcon sx={{ fontSize: 18 }} /> : <ArrowDownwardIcon sx={{ fontSize: 18 }} />}
        </IconButton>

        {/* Close workshop */}
        <Fab
          variant="extended"
          size="small"
          onClick={closeWorkshop}
          sx={{
            bgcolor: '#c62828', color: '#fff', boxShadow: 'none',
            '&:hover': { bgcolor: '#b71c1c' },
            fontWeight: 700, fontSize: '0.75rem', textTransform: 'none',
            height: 32, borderRadius: 1, px: 1.5,
          }}
        >
          <CloseIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Zamknij warsztat
        </Fab>
      </Box>

      {cards.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography sx={{ color: TEXT_MUTED, fontSize: '1.1rem' }}>Warsztat jest pusty.</Typography>
        </Box>
      )}

      {sorted.length > 0 && (
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: { xs: 1.25, sm: 1.5, md: 1.75 },
        }}>
          {sorted.map((card, idx) => (
            <Box key={card.id} sx={{
              position: 'relative',
              width: { xs: 'calc(50% - 6px)', sm: '179px', md: '185px', lg: '196px', xl: '208px' },
              flexShrink: 0, px: '4px', overflow: 'visible',
              transition: 'transform 0.15s ease',
              ...(selectionMode && selectedIds.has(card.id) && { transform: 'scale(0.85)' }),
            }}>
              <LazyCard height={280}>
                {card.whoWantsCount > 0 && (
                  <Tooltip title="Liczba KC" arrow>
                    <Box sx={{
                      position: 'absolute', top: 2, left: 7, zIndex: 5,
                      borderRadius: '50%', width: 30, height: 30,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: userColor,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.6)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: card.whoWantsCount >= 10 ? 12 : 15,
                      textShadow: '0 1px 4px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.6)',
                    }}>
                      {card.whoWantsCount}
                    </Box>
                  </Tooltip>
                )}
                <Box sx={{
                  bgcolor: CARD_TILE_BG, borderRadius: 2,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                  display: 'flex', flexDirection: 'column', height: '100%',
                }}>
            <Box
                    component="a"
                    href={`/card/${card.id}`}
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
                      e.preventDefault();
                      if (selectionMode) toggleSelect(card.id);
                      else setSelectedIdx(idx);
                    }}
                    sx={{ cursor: 'pointer', position: 'relative', display: 'block', pt: '5px', px: '5px' }}
                  >
                    <Box
                      component="img"
                      src={(hideStats ? (card.profileImageUrl || card.imageUrl) : card.imageUrl) || ''}
                      alt={card.name || ''}
                      loading="lazy"
                      sx={{ width: '100%', display: 'block', height: 'auto', borderRadius: '6px 6px 0 0' }}
                      onError={(e) => { e.target.style.opacity = '0'; }}
                    />
                    {selectionMode && (
                      <Box sx={{
                        position: 'absolute', inset: 0, borderRadius: 2,
                        border: `2px solid ${selectedIds.has(card.id) ? userColor : CARD_BORDER_UNSEL}`,
                        background: selectedIds.has(card.id) ? `${userColor}28` : 'transparent',
                        transition: 'all 0.15s', pointerEvents: 'none',
                      }} />
                    )}
                  </Box>
                  <Box sx={{
                    p: { xs: '9px 8px 10px', sm: '10px 9px 11px' }, textAlign: 'center',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.25,
                  }}>
                    <Link
                      href={card.characterUrl || '#'}
                      target="_blank" rel="noopener" underline="hover"
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        color: userColor, fontWeight: 600, fontSize: '0.88rem',
                        display: 'block', wordBreak: 'break-word', lineHeight: 1.3,
                      }}
                    >
                      {card.name || '???'}
                    </Link>
                    <Typography sx={{ color: TEXT_SOFT, fontSize: '0.74rem', fontWeight: 800 }}>
                      {card.id}
                    </Typography>
                    <Box sx={{ minHeight: 18 }}>
                      <CardIcons card={card} />
                    </Box>
                    <Typography variant="caption" sx={{
                      color: TEXT_DIM, fontSize: '0.735rem',
                      wordBreak: 'break-word', lineHeight: 1.3,
                    }}>
                      {card.animeTitle || ''}
                    </Typography>
                  </Box>
                </Box>
              </LazyCard>
            </Box>
          ))}
        </Box>
      )}

      {selectedIdx != null && (
        <CardDetail
          cardId={sorted[selectedIdx]?.id}
          initialCard={sorted[selectedIdx]}
          onClose={() => setSelectedIdx(null)}
          onPrev={selectedIdx > 0 ? () => setSelectedIdx((i) => i - 1) : null}
          onNext={selectedIdx < sorted.length - 1 ? () => setSelectedIdx((i) => i + 1) : null}
          showOwner
        />
      )}

      {profile?.expeditions && (
        <ExpeditionsDialog
          open={expOpen} onClose={() => setExpOpen(false)}
          expeditions={profile.expeditions} userColor={userColor}
        />
      )}

      {showScrollTop && (
        <Fab
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          size="small"
          sx={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1200,
            bgcolor: userColor, color: '#000',
            '&:hover': { bgcolor: userColor, opacity: 0.85 },
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      )}

      {selectionMode && selectedIds.size > 0 && (
        <Fab
          onClick={copyWids}
          size="small"
          variant="extended"
          sx={{
            position: 'fixed', bottom: showScrollTop ? 72 : 24, right: 24, zIndex: 1200,
            bgcolor: userColor, color: '#000',
            '&:hover': { bgcolor: userColor, opacity: 0.85 },
            fontWeight: 700, fontSize: '0.75rem', textTransform: 'none',
            transition: 'bottom 0.2s ease',
          }}
        >
          <ContentCopyIcon sx={{ mr: 0.5, fontSize: 18 }} />
          Kopiuj ({selectedIds.size})
        </Fab>
      )}

      <Snackbar open={snack} autoHideDuration={2500} onClose={() => setSnack(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnack(false)}>Skopiowano WID&apos;y kart.</Alert>
      </Snackbar>
    </Box>
  );
}
