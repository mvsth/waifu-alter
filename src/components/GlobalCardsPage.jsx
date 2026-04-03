import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Pagination, CircularProgress, Alert, Link, Tooltip, Fab, Snackbar,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getUniqueCards, getUltimateCards } from '../api';
import { ACCENT, BG_DARK, BG_CARD, CARD_TILE_BG, TEXT_BRIGHT, TEXT_SOFT, TEXT_DIM, TEXT_MUTED, TEXT_FAINT, TEXT_WHITE, OVERLAY_BG, CARD_BORDER_UNSEL } from '../theme';
import FilterBar from './FilterBar';
import CardDetail from './CardDetail';
import CardIcons from './CardIcons';
import LazyCard from './LazyCard';

const getPageSize = () => {
  try {
    const raw = localStorage.getItem('cardsPageSize');
    if (raw === 'all') return 99999;
    const v = parseInt(raw);
    return (v >= 100 && v <= 4000) ? v : 200;
  } catch { return 200; }
};

const getHideStats = () => localStorage.getItem('hideCardStats') === 'true';

const CONFIG = {
  unique: {
    label: 'Karty Unikatowe',
    color: '#80ccff',
    fetch: getUniqueCards,
  },
  ultimate: {
    label: 'Karty Ultimate',
    color: '#dc2cff',
    fetch: getUltimateCards,
  },
};

const EMPTY_FILTER = {
  orderBy: 'id',
  includeTags: [],
  excludeTags: [],
  searchText: null,
  filterTagsMethod: 0,
  cardIds: [],
};

const getSavedFilter = (key) => {
  try {
    const raw = localStorage.getItem(`builtFilter_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export default function GlobalCardsPage({ type }) {
  const cfg = CONFIG[type];

  const [cards, setCards] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [snack, setSnack] = useState(false);
  const [filter, setFilter] = useState(() => getSavedFilter(`global_${type}`) || EMPTY_FILTER);
  const hideStats = getHideStats();

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const size = getPageSize();
      const offset = (page - 1) * size;
      const data = await cfg.fetch(offset, size, filter);
      const cardList = data.cards || (Array.isArray(data) ? data : []);
      setCards(cardList);
      const total = data.totalCards ?? cardList.length;
      setTotalCards(total);
      setTotalPages(Math.max(1, Math.ceil(total / size)));
    } catch {
      setCards([]);
      setError('Nie udało się załadować kart.');
    }
    setLoading(false);
  }, [page, filter, type]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleFilter = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!selectionMode) setSelectedIds(new Set());
  }, [selectionMode]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const copyWids = () => {
    if (selectedIds.size > 0) {
      navigator.clipboard.writeText([...selectedIds].join(' '));
      setSnack(true);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: cfg.color, mb: 2 }}>
        {cfg.label}
      </Typography>

      <FilterBar
        userColor={cfg.color}
        tagList={[]}
        cards={cards}
        onApply={handleFilter}
        selectionMode={selectionMode}
        onToggleSelectionMode={() => setSelectionMode((p) => !p)}
        selectedIds={selectedIds}
        persistKey={`global_${type}`}
      />

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Pagination
            count={totalPages} page={page}
            onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            color="primary"
            sx={{ '& .MuiPaginationItem-root': { color: TEXT_BRIGHT } }}
          />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: cfg.color }} size={60} />
        </Box>
      )}

      {!loading && cards.length > 0 && (
        <Box>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: { xs: 1.25, sm: 1.5, md: 1.75 },
          }}>
            {cards.map((card, idx) => (
              <Box key={card.id} sx={{
                position: 'relative',
                width: { xs: 'calc(50% - 6px)', sm: '179px', md: '185px', lg: '196px', xl: '208px' },
                flexShrink: 0,
                px: '4px',
                overflow: 'visible',
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
                      bgcolor: cfg.color,
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
                  bgcolor: CARD_TILE_BG,
                  borderRadius: 2,
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
                        border: `2px solid ${selectedIds.has(card.id) ? cfg.color : CARD_BORDER_UNSEL}`,
                        background: selectedIds.has(card.id) ? `${cfg.color}28` : 'transparent',
                        transition: 'all 0.15s', pointerEvents: 'none',
                      }} />
                    )}
                  </Box>

                  <Box sx={{
                    p: { xs: '9px 8px 10px', sm: '10px 9px 11px' }, textAlign: 'center',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    gap: 0.25,
                  }}>
                    <Link
                      href={card.characterUrl || '#'}
                      target="_blank" rel="noopener"
                      underline="hover"
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        color: cfg.color, fontWeight: 600, fontSize: '0.88rem',
                        display: 'block',
                        wordBreak: 'break-word', lineHeight: 1.3,
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
        </Box>
      )}

      {!loading && cards.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ color: TEXT_MUTED, fontSize: '1.1rem' }}>
            Brak kart do wyświetlenia.
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_FAINT, mt: 1 }}>
            Spróbuj zmienić filtry.
          </Typography>
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 4 }}>
          <Pagination
            count={totalPages} page={page}
            onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            color="primary"
            sx={{ '& .MuiPaginationItem-root': { color: TEXT_BRIGHT } }}
          />
        </Box>
      )}

      {selectedIdx !== null && cards[selectedIdx] && (
        <CardDetail
          cardId={cards[selectedIdx].id}
          initialCard={cards[selectedIdx]}
          onClose={() => setSelectedIdx(null)}
          onPrev={selectedIdx > 0 ? () => setSelectedIdx((i) => i - 1) : null}
          onNext={selectedIdx < cards.length - 1 ? () => setSelectedIdx((i) => i + 1) : null}
          showOwner
        />
      )}

      {showScrollTop && (
        <Fab
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          size="small"
          sx={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1200,
            bgcolor: cfg.color, color: '#000',
            '&:hover': { bgcolor: cfg.color, opacity: 0.85 },
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
            bgcolor: cfg.color, color: '#000',
            '&:hover': { bgcolor: cfg.color, opacity: 0.85 },
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


