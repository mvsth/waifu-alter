import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Pagination, CircularProgress, Alert, Link, Tooltip,
} from '@mui/material';
import { getUniqueCards, getUltimateCards } from '../api';
import { BG_CARD, BG_DARK } from '../theme';
import FilterBar from './FilterBar';
import CardDetail from './CardDetail';
import CardIcons from './CardIcons';

const PAGE_SIZE = 100;

const CONFIG = {
  unique: {
    label: 'Karty Unikatowe',
    color: '#0080d8',
    fetch: getUniqueCards,
  },
  ultimate: {
    label: 'Karty Ultimate',
    color: '#d84400',
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

export default function GlobalCardsPage({ type }) {
  const cfg = CONFIG[type];

  const [cards, setCards] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [filter, setFilter] = useState(EMPTY_FILTER);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * PAGE_SIZE;
      const data = await cfg.fetch(offset, PAGE_SIZE, filter);
      const cardList = data.cards || (Array.isArray(data) ? data : []);
      setCards(cardList);
      const total = data.totalCards ?? cardList.length;
      setTotalCards(total);
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
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
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 0.5 }}>
        <Typography variant="body2" sx={{ color: '#888' }}>
          {loading ? 'Ładowanie...' : `${totalCards} kart`}
          {totalPages > 1 && ` • Strona ${page}/${totalPages}`}
        </Typography>
      </Box>

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
                width: { xs: 'calc(50% - 6px)', sm: '155px', md: '160px', lg: '170px', xl: '180px' },
                flexShrink: 0,
                px: '4px',
              }}>
                {card.whoWantsCount > 0 && (
                  <Tooltip title="Liczba KC" arrow>
                    <Box sx={{
                      position: 'absolute', top: 8, left: 8, zIndex: 5,
                      borderRadius: '50%', width: 26, height: 26, lineHeight: '26px',
                      bgcolor: cfg.color, color: BG_DARK, fontWeight: 800, fontSize: 12,
                      textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
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
                    <Typography sx={{ color: '#888', fontSize: '0.74rem', fontWeight: 600 }}>
                      WID: {card.id}
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
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => { setPage(v); window.scrollTo(0, 0); }}
            size="large"
            sx={{
              '& .MuiPaginationItem-root': { color: '#aaa' },
              '& .Mui-selected': { bgcolor: `${cfg.color}33 !important`, color: cfg.color },
            }}
          />
        </Box>
      )}

      {selectedIdx !== null && cards[selectedIdx] && (
        <CardDetail
          card={cards[selectedIdx]}
          userColor={cfg.color}
          onClose={() => setSelectedIdx(null)}
          onPrev={selectedIdx > 0 ? () => setSelectedIdx(selectedIdx - 1) : null}
          onNext={selectedIdx < cards.length - 1 ? () => setSelectedIdx(selectedIdx + 1) : null}
        />
      )}
    </Box>
  );
}
