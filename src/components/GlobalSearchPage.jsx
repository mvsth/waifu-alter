import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Pagination, CircularProgress, Alert, Link, Tooltip,
  TextField, InputAdornment, Button, MenuItem, MenuList,
  Popper, Grow, Paper, ClickAwayListener, IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { getTotalCards } from '../api';
import { ACCENT, BG_DARK, BG_SURFACE, BG_CARD, BORDER } from '../theme';
import CardDetail from './CardDetail';
import CardIcons from './CardIcons';
import LazyCard from './LazyCard';

const getPageSize = () => {
  try { const v = parseInt(localStorage.getItem('cardsPageSize')); return (v >= 100 && v <= 4000) ? v : 100; } catch { return 100; }
};

const SORT_OPTIONS = [
  { label: 'Id', asc: 'id', desc: 'idDes' },
  { label: 'Nazwa', asc: 'name', desc: 'nameDes' },
  { label: 'Ranga', asc: 'rarity', desc: 'rarityDes' },
  { label: 'Tytuł anime', asc: 'title', desc: 'titleDes' },
  { label: 'Życie', asc: 'health', desc: 'healthDes' },
  { label: 'Bazowe \u017cycie', asc: 'healthBase', desc: 'healthBaseDes' },
  { label: 'Atak', asc: 'atack', desc: 'atackDes' },
  { label: 'Obrona', asc: 'defence', desc: 'defenceDes' },
  { label: 'Do\u015bwiadczenie', asc: 'exp', desc: 'expDes' },
  { label: 'Dere', asc: 'dere', desc: 'dereDes' },
  { label: 'Obrazek', asc: 'picture', desc: 'pictureDes' },
  { label: 'Relacja', asc: 'relation', desc: 'relationDes' },
  { label: 'Moc', asc: 'cardPower', desc: 'cardPowerDes' },
  { label: 'Liczba KC', asc: 'WhoWantsCount', desc: 'WhoWantsCountDes' },
  { label: 'Zablokowane', asc: 'Blocked', desc: 'BlockedDes' },
];

const COLOR = ACCENT;

export default function GlobalSearchPage() {
  const [cards, setCards] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sortIdx, setSortIdx] = useState(-1);
  const [sortDir, setSortDir] = useState('desc');
  const [openSort, setOpenSort] = useState(false);
  const sortRef = React.useRef(null);

  const buildFilter = useCallback(() => {
    return {
      orderBy: sortIdx >= 0
        ? (sortDir === 'asc' ? SORT_OPTIONS[sortIdx].asc : SORT_OPTIONS[sortIdx].desc)
        : 'id',
      includeTags: [],
      excludeTags: [],
      searchText: appliedSearch || null,
      filterTagsMethod: 0,
      cardIds: [],
    };
  }, [appliedSearch, sortIdx, sortDir]);

  const fetchCards = useCallback(async () => {
    if (!appliedSearch) return;
    setLoading(true);
    setError(null);
    try {
      const size = getPageSize();
      const offset = (page - 1) * size;
      const filter = buildFilter();
      const data = await getTotalCards(offset, size, filter);
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
  }, [page, appliedSearch, buildFilter]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleSearch = () => {
    if (!searchText.trim()) return;
    setAppliedSearch(searchText.trim());
    setPage(1);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  const handleSortClick = (idx) => {
    if (sortIdx === idx) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortIdx(idx);
      setSortDir('desc');
    }
  };

  useEffect(() => {
    if (appliedSearch) {
      setPage(1);
      // trigger re-fetch via buildFilter change
    }
  }, [sortIdx, sortDir]);

  const handleClear = () => {
    setSearchText('');
    setAppliedSearch('');
    setCards([]);
    setTotalCards(0);
    setTotalPages(1);
    setSortIdx(-1);
    setSortDir('desc');
  };

  const activeSort = sortIdx >= 0 ? SORT_OPTIONS[sortIdx] : null;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: COLOR, mb: 2 }}>
        Wyszukiwarka kart
      </Typography>

      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap',
        bgcolor: BG_SURFACE, borderRadius: 2, px: 2, py: 1.4, mb: 2,
      }}>
        <Button
          ref={sortRef}
          startIcon={<SortIcon sx={{ fontSize: 18 }} />}
          onClick={() => setOpenSort((p) => !p)}
          size="small"
          sx={{
            textTransform: 'none', fontWeight: 600, borderRadius: '16px',
            bgcolor: activeSort ? `${COLOR}33` : `${COLOR}22`, color: COLOR, fontSize: '0.82rem',
            border: `1px solid ${activeSort ? `${COLOR}66` : 'transparent'}`,
            minWidth: 90,
            '&:hover': { bgcolor: `${COLOR}33` },
          }}
        >
          Sortuj
        </Button>
        <Popper open={openSort} anchorEl={sortRef.current} transition disablePortal style={{ zIndex: 999 }} placement="bottom-start">
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Paper sx={{ bgcolor: BG_CARD, border: `1px solid ${BORDER}`, maxHeight: 400, overflow: 'auto' }}>
                <ClickAwayListener onClickAway={(e) => { if (!sortRef.current?.contains(e.target)) setOpenSort(false); }}>
                  <MenuList autoFocusItem={openSort}>
                    {SORT_OPTIONS.map((opt, idx) => (
                      <MenuItem key={opt.label} onClick={() => handleSortClick(idx)}
                        sx={{ fontSize: '0.9rem', color: sortIdx === idx ? COLOR : '#c1c1c1', '&:hover': { bgcolor: `${COLOR}15` } }}>
                        <Box sx={{ flexGrow: 1 }}>{opt.label}</Box>
                        {sortIdx === idx && (
                          sortDir === 'asc'
                            ? <ArrowUpwardIcon sx={{ fontSize: 16, ml: 1, color: COLOR }} />
                            : <ArrowDownwardIcon sx={{ fontSize: 16, ml: 1, color: COLOR }} />
                        )}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>

        <TextField
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Wpisz nazwę postaci lub tytuł anime..."
          size="small"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666', fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              bgcolor: BG_DARK, borderRadius: '16px', fontSize: '0.85rem', color: '#ddd',
              '& fieldset': { borderColor: BORDER, borderRadius: '16px' },
              '&:hover fieldset': { borderColor: `${COLOR}66` },
              '&.Mui-focused fieldset': { borderColor: COLOR },
              height: 36,
            },
          }}
          sx={{ flex: '1 1 250px', minWidth: 200, maxWidth: 450 }}
        />

        <Button onClick={handleSearch} size="small" variant="contained"
          disabled={!searchText.trim()}
          sx={{
            bgcolor: COLOR, color: '#000', textTransform: 'none', fontWeight: 600,
            borderRadius: '16px', fontSize: '0.82rem', minWidth: 'auto', px: 2,
            '&:hover': { bgcolor: COLOR, opacity: 0.85 },
          }}>
          Szukaj
        </Button>

        <Tooltip title="Wyczyść" arrow>
          <IconButton onClick={handleClear} size="small" sx={{ color: '#888', '&:hover': { color: '#ccc' } }}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {activeSort && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Typography sx={{ fontSize: '0.78rem', color: '#777' }}>
            Sortowanie: {activeSort.label} {sortDir === 'asc' ? '↑' : '↓'}
          </Typography>
        </Box>
      )}

      {totalCards > 0 && (
        <Typography sx={{ textAlign: 'center', color: '#666', fontSize: '0.82rem', mb: 1 }}>
          Znaleziono: {totalCards} kart
        </Typography>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: COLOR }} size={60} />
        </Box>
      )}

      {!loading && !appliedSearch && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ color: '#888', fontSize: '1.1rem' }}>
            Wpisz nazwę postaci lub tytuł anime, aby wyszukać karty.
          </Typography>
        </Box>
      )}

      {!loading && appliedSearch && cards.length > 0 && (
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
                      border: `2px solid ${COLOR}`,
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
                        color: COLOR, fontWeight: 600, fontSize: '0.8rem',
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

      {!loading && appliedSearch && cards.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ color: '#888', fontSize: '1.1rem' }}>
            Brak kart do wyświetlenia.
          </Typography>
          <Typography variant="body2" sx={{ color: '#555', mt: 1 }}>
            Spróbuj inną frazę.
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
