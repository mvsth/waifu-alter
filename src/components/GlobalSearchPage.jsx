import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Pagination, CircularProgress, Alert, Link, Tooltip,
  TextField, InputAdornment, Button, MenuItem, MenuList,
  Popper, Grow, Paper, ClickAwayListener, IconButton, Fab, Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { getTotalCards } from '../api';
import { ACCENT, BG_DARK, BG_SURFACE, BG_CARD, BORDER, TEXT_BRIGHT, TEXT_SOFT, TEXT_DIM, TEXT_MUTED, TEXT_FAINT, TEXT_WHITE, OVERLAY_BG, CARD_BORDER_UNSEL } from '../theme';
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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [snack, setSnack] = useState(false);
  const [searchText, setSearchText] = useState('');
  const hideStats = getHideStats();
  const [appliedSearch, setAppliedSearch] = useState('');
  const [searchMode, setSearchMode] = useState('text'); // 'text' | 'charId'
  const [appliedMode, setAppliedMode] = useState('text');
  const [sortIdx, setSortIdx] = useState(-1);
  const [sortDir, setSortDir] = useState('desc');
  const [openSort, setOpenSort] = useState(false);
  const sortRef = React.useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('globalSearchState') || 'null');
      if (saved) {
        if (saved.searchText) setSearchText(saved.searchText);
        if (saved.appliedSearch) setAppliedSearch(saved.appliedSearch);
        if (saved.searchMode) setSearchMode(saved.searchMode);
        if (saved.appliedMode) setAppliedMode(saved.appliedMode);
        if (typeof saved.sortIdx === 'number') setSortIdx(saved.sortIdx);
        if (saved.sortDir) setSortDir(saved.sortDir);
      }
    } catch {}
  }, []);

  const buildFilter = useCallback(() => {
    return {
      orderBy: sortIdx >= 0
        ? (sortDir === 'asc' ? SORT_OPTIONS[sortIdx].asc : SORT_OPTIONS[sortIdx].desc)
        : 'id',
      includeTags: [],
      excludeTags: [],
      searchText: appliedMode === 'text' ? (appliedSearch || null) : null,
      filterTagsMethod: 0,
      cardIds: [],
      charIds: appliedMode === 'charId' ? [parseInt(appliedSearch, 10)] : [],
    };
  }, [appliedSearch, appliedMode, sortIdx, sortDir]);

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
    if (searchMode === 'charId' && !/^\d+$/.test(searchText.trim())) return;
    setAppliedSearch(searchText.trim());
    setAppliedMode(searchMode);
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

  useEffect(() => {
    try {
      localStorage.setItem('globalSearchState', JSON.stringify({
        searchText, appliedSearch, searchMode, appliedMode, sortIdx, sortDir,
      }));
    } catch {}
  }, [searchText, appliedSearch, searchMode, appliedMode, sortIdx, sortDir]);

  const handleClear = () => {
    setSearchText('');
    setAppliedSearch('');
    setSearchMode('text');
    setAppliedMode('text');
    setCards([]);
    setTotalCards(0);
    setTotalPages(1);
    setSortIdx(-1);
    setSortDir('desc');
    try { localStorage.removeItem('globalSearchState'); } catch {}
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
                        sx={{ fontSize: '0.9rem', color: sortIdx === idx ? COLOR : TEXT_BRIGHT, '&:hover': { bgcolor: `${COLOR}15` } }}>
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
          placeholder={searchMode === 'charId' ? 'Wpisz ID postaci ze Shindena...' : 'Wpisz nazwę postaci lub tytuł anime...'}
          size="small"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: TEXT_DIM, fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              bgcolor: BG_DARK, borderRadius: '16px', fontSize: '0.85rem', color: TEXT_BRIGHT,
              '& fieldset': { borderColor: BORDER, borderRadius: '16px' },
              '&:hover fieldset': { borderColor: `${COLOR}66` },
              '&.Mui-focused fieldset': { borderColor: COLOR },
              height: 36,
            },
          }}
          sx={{ flex: '1 1 250px', minWidth: 200, maxWidth: 450 }}
        />

        <Box sx={{ display: 'flex', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${BORDER}`, flexShrink: 0 }}>
          {[{ value: 'text', label: 'Nazwa' }, { value: 'charId', label: 'ID postaci' }].map((mode) => (
            <Button
              key={mode.value}
              size="small"
              onClick={() => { setSearchMode(mode.value); setSearchText(''); }}
              sx={{
                textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                borderRadius: 0, px: 1.5, py: 0.5, minWidth: 'auto',
                bgcolor: searchMode === mode.value ? `${COLOR}33` : 'transparent',
                color: searchMode === mode.value ? COLOR : TEXT_DIM,
                '&:hover': { bgcolor: `${COLOR}22`, color: COLOR },
              }}
            >
              {mode.label}
            </Button>
          ))}
        </Box>

        <Button onClick={handleSearch} size="small" variant="contained"
          disabled={!searchText.trim() || (searchMode === 'charId' && !/^\d+$/.test(searchText.trim()))}
          sx={{
            bgcolor: COLOR, color: '#000', textTransform: 'none', fontWeight: 600,
            borderRadius: '16px', fontSize: '0.82rem', minWidth: 'auto', px: 2,
            '&:hover': { bgcolor: COLOR, opacity: 0.85 },
          }}>
          Szukaj
        </Button>

        <Tooltip title="Wyczyść" arrow>
          <IconButton onClick={handleClear} size="small" sx={{ color: TEXT_MUTED, '&:hover': { color: TEXT_BRIGHT } }}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={selectionMode ? 'Wyłącz zaznaczanie' : 'Zaznacz karty do skopiowania'} arrow>
          <Button
            startIcon={selectionMode ? <CheckBoxIcon sx={{ fontSize: 18 }} /> : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18 }} />}
            onClick={() => setSelectionMode((p) => !p)}
            size="small"
            sx={{
              textTransform: 'none', fontWeight: 600, borderRadius: '16px',
              bgcolor: selectionMode ? `${COLOR}33` : `${COLOR}22`,
              color: COLOR, fontSize: '0.82rem',
              border: `1px solid ${selectionMode ? `${COLOR}66` : 'transparent'}`,
              minWidth: 90,
              '&:hover': { bgcolor: `${COLOR}44` },
            }}
          >
            Zaznacz{selectionMode && selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
          </Button>
        </Tooltip>
      </Box>

      {activeSort && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Typography sx={{ fontSize: '0.78rem', color: TEXT_DIM }}>
            Sortowanie: {activeSort.label} {sortDir === 'asc' ? '↑' : '↓'}
          </Typography>
        </Box>
      )}

      {totalCards > 0 && (
        <Typography sx={{ textAlign: 'center', color: TEXT_DIM, fontSize: '0.82rem', mb: 1 }}>
          Znaleziono: {totalCards} kart
        </Typography>
      )}

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
          <CircularProgress sx={{ color: COLOR }} size={60} />
        </Box>
      )}

      {!loading && !appliedSearch && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ color: TEXT_MUTED, fontSize: '1.1rem' }}>
            Wpisz nazwę postaci lub tytuł anime, aby wyszukać karty, albo przełącz tryb na <strong>ID postaci</strong>.
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
                      position: 'absolute', top: -8, left: -8, zIndex: 5,
                      borderRadius: '50%', width: 30, height: 30,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: OVERLAY_BG,
                      backdropFilter: 'blur(4px)',
                      WebkitBackdropFilter: 'blur(4px)',
                      border: `2px solid ${COLOR}`,
                      color: TEXT_WHITE, fontWeight: 800, fontSize: 13,
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
                    component="a"
                    href={`/card/${card.id}`}
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
                      e.preventDefault();
                      if (selectionMode) toggleSelect(card.id);
                      else setSelectedIdx(idx);
                    }}
                    sx={{ cursor: 'pointer', position: 'relative', display: 'block' }}
                  >
                    <Box
                      component="img"
                      src={(hideStats ? (card.profileImageUrl || card.imageUrl) : card.imageUrl) || ''}
                      alt={card.name || ''}
                      loading="lazy"
                      sx={{ width: '100%', display: 'block', height: 'auto' }}
                      onError={(e) => { e.target.style.opacity = '0'; }}
                    />
                    {selectionMode && (
                      <Box sx={{
                        position: 'absolute', inset: 0, borderRadius: 2,
                        border: `2px solid ${selectedIds.has(card.id) ? COLOR : CARD_BORDER_UNSEL}`,
                        background: selectedIds.has(card.id) ? `${COLOR}28` : 'transparent',
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
                        color: COLOR, fontWeight: 600, fontSize: '0.8rem',
                        display: 'block', mb: 0.3,
                        wordBreak: 'break-word', lineHeight: 1.3,
                      }}
                    >
                      {card.name || '???'}
                    </Link>
                    <Typography sx={{ color: TEXT_SOFT, fontSize: '0.74rem', fontWeight: 800 }}>
                      {card.id}
                    </Typography>
                    <Box sx={{ my: 0.3, minHeight: 18 }}>
                      <CardIcons card={card} />
                    </Box>
                    <Typography variant="caption" sx={{
                      color: TEXT_DIM, fontSize: '0.7rem',
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
          <Typography sx={{ color: TEXT_MUTED, fontSize: '1.1rem' }}>
            Brak kart do wyświetlenia.
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_FAINT, mt: 1 }}>
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
            bgcolor: COLOR, color: '#000',
            '&:hover': { bgcolor: COLOR, opacity: 0.85 },
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
            bgcolor: COLOR, color: '#000',
            '&:hover': { bgcolor: COLOR, opacity: 0.85 },
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
