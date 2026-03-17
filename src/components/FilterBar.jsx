import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, TextField, InputAdornment, Menu, MenuItem, Typography,
  Chip, Switch, IconButton, Tooltip, Snackbar, Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { ACCENT, BG_DARK, BG_SURFACE, BG_CARD, BORDER } from '../theme';

const SORT_OPTIONS = [
  { label: 'Id', asc: 'id', desc: 'idDes' },
  { label: 'Nazwa', asc: 'name', desc: 'nameDes' },
  { label: 'Ranga', asc: 'rarity', desc: 'rarityDes' },
  { label: 'Tytuł anime', asc: 'title', desc: 'titleDes' },
  { label: 'Życie', asc: 'health', desc: 'healthDes' },
  { label: 'Bazowe życie', asc: 'healthBase', desc: 'healthBaseDes' },
  { label: 'Atak', asc: 'atack', desc: 'atackDes' },
  { label: 'Obrona', asc: 'defence', desc: 'defenceDes' },
  { label: 'Doświadczenie', asc: 'exp', desc: 'expDes' },
  { label: 'Dere', asc: 'dere', desc: 'dereDes' },
  { label: 'Obrazek', asc: 'picture', desc: 'pictureDes' },
  { label: 'Relacja', asc: 'relation', desc: 'relationDes' },
  { label: 'Moc', asc: 'cardPower', desc: 'cardPowerDes' },
  { label: 'Liczba KC', asc: 'WhoWantsCount', desc: 'WhoWantsCountDes' },
  { label: 'Zablokowane', asc: 'Blocked', desc: 'BlockedDes' },
];

function getTagEmoji(name) {
  const l = name?.toLowerCase();
  if (l === 'kosz') return '🗑️';
  if (l === 'rezerwacja') return '📝';
  if (l === 'wymiana') return '🔃';
  if (l === 'galeria') return '📌';
  if (l === 'ulubione') return '💗';
  return null;
}

export default function FilterBar({ userColor, tagList, onApply, cards, selectionMode, onToggleSelectionMode, selectedIds, persistKey }) {
  const color = userColor || ACCENT;
  const savedRef = useRef(null);

  const [sortIdx, setSortIdx] = useState(-1);
  const [sortDir, setSortDir] = useState('desc');
  const [sortAnchor, setSortAnchor] = useState(null);

  const [tags, setTags] = useState([]);
  const [tagMethod, setTagMethod] = useState(0);
  const [tagAnchor, setTagAnchor] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [snack, setSnack] = useState(false);

  useEffect(() => {
    if (!persistKey) { savedRef.current = null; return; }
    try {
      const raw = localStorage.getItem(`filterState_${persistKey}`);
      savedRef.current = raw ? JSON.parse(raw) : null;
    } catch { savedRef.current = null; }
    const saved = savedRef.current;
    setSortIdx(saved?.sortIdx ?? -1);
    setSortDir(saved?.sortDir ?? 'desc');
    setTagMethod(saved?.tagMethod ?? 0);
    setSearchText(saved?.searchText ?? '');
  }, [persistKey]);

  useEffect(() => {
    if (tagList?.length) {
      const saved = savedRef.current;
      setTags(
        tagList.map((t) => {
          const existing = saved?.tagStates?.[t.id] ?? null;
          return { name: t.name, id: t.id, state: existing };
        })
      );
    }
  }, [tagList]);

  const handleSortClick = (idx) => {
    if (sortIdx === idx) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortIdx(idx);
      setSortDir('desc');
    }
  };

  const handleTagClick = (idx) => {
    setTags((prev) => {
      const next = [...prev];
      const s = next[idx].state;
      next[idx] = { ...next[idx], state: s === null ? 'include' : s === 'include' ? 'exclude' : null };
      return next;
    });
  };

  const buildFilter = () => {
    const widRegex = /wid:\s*([0-9\s]+)/gi;
    const widMatch = searchText.match(widRegex);
    let cardIds = [];
    let searchStr = searchText;

    if (widMatch) {
      widMatch.forEach((m) => {
        const nums = m.match(/\d+/g);
        if (nums) cardIds.push(...nums);
      });
      cardIds = [...new Set(cardIds)];
      searchStr = '';
    }

    return {
      orderBy: sortIdx >= 0
        ? (sortDir === 'asc' ? SORT_OPTIONS[sortIdx].asc : SORT_OPTIONS[sortIdx].desc)
        : 'id',
      includeTags: tags.filter((t) => t.state === 'include').map((t) => ({ name: t.name, id: t.id })),
      excludeTags: tags.filter((t) => t.state === 'exclude').map((t) => ({ name: t.name, id: t.id })),
      searchText: searchStr || null,
      filterTagsMethod: tagMethod,
      cardIds,
    };
  };

  const handleApply = () => {
    const f = buildFilter();
    if (persistKey) {
      try {
        localStorage.setItem(`filterState_${persistKey}`, JSON.stringify({
          sortIdx, sortDir, tagMethod, searchText,
          tagStates: Object.fromEntries(tags.map((t) => [t.id, t.state])),
        }));
      } catch {}
    }
    onApply(f);
  };

  const handleClear = () => {
    if (persistKey) {
      localStorage.removeItem(`filterState_${persistKey}`);
      savedRef.current = null;
    }
    setSortIdx(-1);
    setSortDir('desc');
    setTags((prev) => prev.map((t) => ({ ...t, state: null })));
    setTagMethod(0);
    setSearchText('');
    onApply({ orderBy: 'id', includeTags: [], excludeTags: [], searchText: null, filterTagsMethod: 0, cardIds: [] });
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleApply(); };

  const copyWids = () => {
    const idsToUse = selectedIds?.size > 0
      ? [...selectedIds]
      : cards?.map((c) => c.id);
    if (idsToUse?.length) {
      navigator.clipboard.writeText(idsToUse.join(' '));
      setSnack(true);
    }
  };

  const activeTags = tags.filter((t) => t.state !== null);
  const activeSort = sortIdx >= 0 ? SORT_OPTIONS[sortIdx] : null;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap',
        bgcolor: BG_SURFACE, borderRadius: 2, px: 2, py: 1.4,
      }}>
        <Button
          startIcon={<SortIcon sx={{ fontSize: 18 }} />}
          onClick={(e) => setSortAnchor(e.currentTarget)}
          size="small"
          sx={{
            textTransform: 'none', fontWeight: 600, borderRadius: '16px',
            bgcolor: activeSort ? `${color}33` : `${color}22`, color, fontSize: '0.82rem',
            border: `1px solid ${activeSort ? `${color}66` : 'transparent'}`,
            minWidth: 90,
            '&:hover': { bgcolor: `${color}33` },
          }}
        >
          Sortuj
        </Button>
        <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}
          PaperProps={{ sx: { bgcolor: BG_CARD, border: `1px solid ${BORDER}`, maxHeight: 400 } }}>
          {SORT_OPTIONS.map((opt, idx) => (
            <MenuItem key={opt.label} onClick={() => handleSortClick(idx)}
              sx={{ fontSize: '0.9rem', color: sortIdx === idx ? color : '#c1c1c1', '&:hover': { bgcolor: `${color}15` } }}>
              <Box sx={{ flexGrow: 1 }}>{opt.label}</Box>
              {sortIdx === idx && (
                sortDir === 'asc'
                  ? <ArrowUpwardIcon sx={{ fontSize: 16, ml: 1, color }} />
                  : <ArrowDownwardIcon sx={{ fontSize: 16, ml: 1, color }} />
              )}
            </MenuItem>
          ))}
        </Menu>

        {tags.length > 0 && (
          <>
            <Button
              startIcon={<LocalOfferIcon sx={{ fontSize: 18 }} />}
              onClick={(e) => setTagAnchor(e.currentTarget)}
              size="small"
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: '16px',
                bgcolor: activeTags.length > 0 ? `${color}33` : `${color}22`, color, fontSize: '0.82rem',
                border: `1px solid ${activeTags.length > 0 ? `${color}66` : 'transparent'}`,
                minWidth: 80,
                '&:hover': { bgcolor: `${color}33` },
              }}
            >
              Tagi
            </Button>
            <Menu anchorEl={tagAnchor} open={Boolean(tagAnchor)} onClose={() => setTagAnchor(null)}
              PaperProps={{ sx: { bgcolor: BG_CARD, border: `1px solid ${BORDER}`, maxHeight: 450, minWidth: 220 } }}>
              <MenuItem sx={{ borderBottom: `1px solid ${BORDER}`, justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ color: tagMethod === 0 ? color : '#888' }}>AND</Typography>
                <Switch size="small" checked={tagMethod === 1}
                  onChange={(e) => setTagMethod(e.target.checked ? 1 : 0)}
                  sx={{ mx: 1, '& .MuiSwitch-thumb': { bgcolor: color } }} />
                <Typography variant="caption" sx={{ color: tagMethod === 1 ? color : '#888' }}>OR</Typography>
              </MenuItem>
              <MenuItem onClick={() => {
                const states = tags.map((t) => t.state);
                const allSame = states.every((s) => s === states[0]);
                const next = allSame
                  ? (states[0] === null ? 'include' : states[0] === 'include' ? 'exclude' : null)
                  : 'include';
                setTags((prev) => prev.map((t) => ({ ...t, state: next })));
              }} sx={{ borderBottom: `1px solid ${BORDER}`, justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ color: '#aaa' }}>Zaznacz wszystko</Typography>
              </MenuItem>
              {tags.map((tag, idx) => {
                const emoji = getTagEmoji(tag.name);
                return (
                  <MenuItem key={tag.id} onClick={() => handleTagClick(idx)}
                    sx={{ fontSize: '0.9rem', color: '#c1c1c1', '&:hover': { bgcolor: `${color}15` } }}>
                    {emoji && <Typography component="span" sx={{ mr: 0.5 }}>{emoji}</Typography>}
                    <Box sx={{ flexGrow: 1 }}>{tag.name}</Box>
                    {tag.state === 'include' && <CheckIcon sx={{ fontSize: 16, color: '#4caf50' }} />}
                    {tag.state === 'exclude' && <CloseIcon sx={{ fontSize: 16, color: '#f44336' }} />}
                  </MenuItem>
                );
              })}
            </Menu>
          </>
        )}

        <TextField
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Szukaj (nazwa, wid: 123, tytuł)..."
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
              '&:hover fieldset': { borderColor: `${color}66` },
              '&.Mui-focused fieldset': { borderColor: color },
              height: 36,
            },
          }}
          sx={{ flex: '1 1 180px', minWidth: 150, maxWidth: 320 }}
        />

        <Button onClick={handleApply} size="small" variant="contained"
          sx={{
            bgcolor: color, color: '#000', textTransform: 'none', fontWeight: 600,
            borderRadius: '16px', fontSize: '0.82rem', minWidth: 'auto', px: 2,
            '&:hover': { bgcolor: color, opacity: 0.85 },
          }}>
          Zastosuj
        </Button>

        <Tooltip title="Wyczyść filtry" arrow>
          <IconButton onClick={handleClear} size="small" sx={{ color: '#888', '&:hover': { color: '#ccc' } }}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {onToggleSelectionMode && (
          <Tooltip title={selectionMode ? 'Wyłącz zaznaczanie' : 'Zaznacz karty do skopiowania'} arrow>
            <Button
              startIcon={selectionMode ? <CheckBoxIcon sx={{ fontSize: 18 }} /> : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18 }} />}
              onClick={onToggleSelectionMode}
              size="small"
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: '16px',
                bgcolor: selectionMode ? `${color}33` : `${color}22`,
                color, fontSize: '0.82rem',
                border: `1px solid ${selectionMode ? `${color}66` : 'transparent'}`,
                minWidth: 90,
                '&:hover': { bgcolor: `${color}44` },
              }}
            >
              Zaznacz{selectionMode && selectedIds?.size > 0 ? ` (${selectedIds.size})` : ''}
            </Button>
          </Tooltip>
        )}

        <Tooltip title={selectedIds?.size > 0 ? `Kopiuj ${selectedIds.size} WID-y` : "Kopiuj WID'y kart"} arrow>
          <IconButton onClick={copyWids} size="small" sx={{
            color: selectedIds?.size > 0 ? color : '#888',
            '&:hover': { color: '#ccc' },
          }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ minHeight: 32, display: 'flex', gap: 0.8, mt: 1, flexWrap: 'wrap', px: 0.5, alignItems: 'center', justifyContent: 'center' }}>
        {activeSort && (
          <Chip
            label={`${activeSort.label} ${sortDir === 'asc' ? '↑' : '↓'}`}
            size="small"
            onDelete={() => setSortIdx(-1)}
            sx={{ bgcolor: `${color}22`, color, borderColor: `${color}44`, fontWeight: 600 }}
            variant="outlined"
          />
        )}
        {activeTags.map((tag) => (
          <Chip
            key={tag.id}
            label={`${tag.state === 'include' ? '+' : '−'} ${tag.name}`}
            size="small"
            onDelete={() => setTags((prev) => prev.map((t) => t.id === tag.id ? { ...t, state: null } : t))}
            sx={{
              bgcolor: tag.state === 'include' ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)',
              color: tag.state === 'include' ? '#81c784' : '#ef9a9a',
              borderColor: tag.state === 'include' ? '#4caf5044' : '#f4433644',
              fontWeight: 600,
            }}
            variant="outlined"
          />
        ))}
      </Box>

      <Snackbar open={snack} autoHideDuration={2500} onClose={() => setSnack(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnack(false)}>Skopiowano WID&apos;y kart.</Alert>
      </Snackbar>
    </Box>
  );
}
