import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Pagination, CircularProgress, Alert, Link, Tooltip, Fab,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { getUserCards, getUserProfile, getUsername } from '../api';
import { ACCENT, BG_DARK, BG_CARD } from '../theme';
import UserNavBar from './UserNavBar';
import ExpeditionsDialog from './ExpeditionsDialog';
import FilterBar from './FilterBar';
import CardDetail from './CardDetail';
import CardIcons from './CardIcons';
import LazyCard from './LazyCard';

const getPageSize = () => {
  try {
    const raw = localStorage.getItem('cardsPageSize');
    if (raw === 'all') return 99999;
    const v = parseInt(raw);
    return (v >= 200 && v <= 5000) ? v : 200;
  } catch { return 200; }
};

const DEFAULT_FILTER = {
  orderBy: 'id', includeTags: [], excludeTags: [],
  searchText: null, filterTagsMethod: 0, cardIds: [],
};

const getSavedFilter = (userId) => {
  try {
    const raw = localStorage.getItem(`builtFilter_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export default function UserCards() {
  const { userId } = useParams();
  const [cards, setCards] = useState([]);
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [expOpen, setExpOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filter, setFilter] = useState(() => getSavedFilter(userId) || DEFAULT_FILTER);

  useEffect(() => {
    setPage(1); setCards([]); setProfile(null); setError(null); setUsername(null);
    setFilter(getSavedFilter(userId) || DEFAULT_FILTER);
  }, [userId]);

  useEffect(() => { getUserProfile(userId).then(setProfile).catch(() => {}); }, [userId]);
  useEffect(() => { getUsername(userId).then(setUsername).catch(() => {}); }, [userId]);

  const fetchCards = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const size = getPageSize();
      const offset = (page - 1) * size;
      const data = await getUserCards(userId, offset, size, filter);
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
  }, [userId, page, filter]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

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

  const handleFilter = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const userColor = profile?.foregroundColor || ACCENT;

  return (
    <Box>
      <UserNavBar userId={userId} profile={profile} username={username}
        onExpeditions={() => setExpOpen(true)} />

      <FilterBar
        userColor={userColor}
        tagList={profile?.tagList || []}
        cards={cards}
        onApply={handleFilter}
        selectionMode={selectionMode}
        onToggleSelectionMode={() => setSelectionMode((p) => !p)}
        selectedIds={selectedIds}
        persistKey={userId}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: userColor }} size={60} />
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
                      border: `2px solid ${userColor}`,
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
                  <Box
                    onClick={() => selectionMode ? toggleSelect(card.id) : setSelectedIdx(idx)}
                    sx={{ cursor: 'pointer', position: 'relative' }}
                  >
                    <Box
                      component="img"
                      src={card.imageUrl || ''}
                      alt={card.name || ''}
                      loading="lazy"
                      sx={{
                        width: '100%', display: 'block',
                        height: 'auto',
                      }}
                      onError={(e) => { e.target.style.opacity = '0'; }}
                    />
                    {selectionMode && (
                      <Box sx={{
                        position: 'absolute', inset: 0, borderRadius: 2,
                        border: `2px solid ${selectedIds.has(card.id) ? userColor : 'rgba(255,255,255,0.12)'}`,
                        background: selectedIds.has(card.id) ? `${userColor}28` : 'transparent',
                        transition: 'all 0.15s', pointerEvents: 'none',
                      }} />
                    )}
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
                        color: userColor, fontWeight: 600, fontSize: '0.8rem',
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
            Spróbuj zmienić filtry lub tagi.
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

      {selectedIdx != null && (
        <CardDetail
          cardId={cards[selectedIdx]?.id}
          initialCard={cards[selectedIdx]}
          onClose={() => setSelectedIdx(null)}
          onPrev={selectedIdx > 0 ? () => setSelectedIdx((i) => i - 1) : null}
          onNext={selectedIdx < cards.length - 1 ? () => setSelectedIdx((i) => i + 1) : null}
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
    </Box>
  );
}
