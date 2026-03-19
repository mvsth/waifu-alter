import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Pagination, CircularProgress, Alert, Link, Tooltip,
} from '@mui/material';
import { getUniqueCards, getUltimateCards } from '../api';
import { ACCENT, BG_DARK } from '../theme';
import FilterBar from './FilterBar';
import CardDetail from './CardDetail';
import CardIcons from './CardIcons';
import LazyCard from './LazyCard';

const getPageSize = () => {
  try { const v = parseInt(localStorage.getItem('cardsPageSize')); return (v >= 200 && v <= 5000) ? v : 200; } catch { return 200; }
};

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
  const [filter, setFilter] = useState(() => getSavedFilter(`global_${type}`) || EMPTY_FILTER);

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
        persistKey={`global_${type}`}
      />

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
                width: { xs: 'calc(50% - 6px)', sm: '170px', md: '176px', lg: '187px', xl: '198px' },
                flexShrink: 0,
                px: '4px',
                overflow: 'visible',
              }}>
              <LazyCard height={280}>
                {card.whoWantsCount > 0 && (
                  <Tooltip title="Liczba KC" arrow>
                    <Box sx={{
                      position: 'absolute', top: -8, left: -8, zIndex: 5,
                      borderRadius: '50%', width: 30, height: 30,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.75)',
                      backdropFilter: 'blur(4px)',
                      WebkitBackdropFilter: 'blur(4px)',
                      border: `2px solid ${cfg.color}`,
                      color: '#fff', fontWeight: 800, fontSize: 13,
                    }}>
                      {card.whoWantsCount}
                    </Box>
                  </Tooltip>
                )}

                <Box sx={{
                  bgcolor: 'transparent',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column', height: '100%',
                }}>
                  <Box onClick={() => setSelectedIdx(idx)} sx={{ cursor: 'pointer' }}>
                    <Box
                      component="img"
                      src={card.imageUrl || ''}
                      alt={card.name || ''}
                      loading="lazy"
                      sx={{ width: '100%', display: 'block', height: 'auto' }}
                      onError={(e) => { e.target.style.opacity = '0'; }}
                    />
                  </Box>

                  <Box sx={{
                    p: { xs: '9px 8px 10px', sm: '10px 9px 11px' }, textAlign: 'center',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    gap: 0.3,
                  }}>
                    <Link
                      href={card.characterUrl || '#'}
                      target="_blank" rel="noopener"
                      underline="hover"
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        color: cfg.color, fontWeight: 600, fontSize: '0.8rem',
                        display: 'block', mb: 0.3,
                        wordBreak: 'break-word', lineHeight: 1.3,
                      }}
                    >
                      {card.name || '???'}
                    </Link>
                    <Typography sx={{ color: '#aaa', fontSize: '0.74rem', fontWeight: 800 }}>
                      {card.id}
                    </Typography>
                    <Box sx={{ my: 0.3, minHeight: 18 }}>
                      <CardIcons card={card} />
                    </Box>
                    <Typography variant="caption" sx={{
                      color: '#666', fontSize: '0.7rem',
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
          <Typography sx={{ color: '#888', fontSize: '1.1rem' }}>
            Brak kart do wyświetlenia.
          </Typography>
          <Typography variant="body2" sx={{ color: '#555', mt: 1 }}>
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
            sx={{ '& .MuiPaginationItem-root': { color: '#ccc' } }}
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
    </Box>
  );
}


