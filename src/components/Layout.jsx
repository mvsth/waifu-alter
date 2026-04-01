import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, TextField, InputAdornment, Tooltip, Popover, Slider } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import StyleIcon from '@mui/icons-material/Style';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import UserSearch from './UserSearch';
import Prank from './Prank';
import { ACCENT, BG_DARK, BG_HEADER, BG_SURFACE, BORDER } from '../theme';
import { subscribe, getCount } from '../apiCounter';

export default function Layout({ children }) {
  const [reqCount, setReqCount] = useState(getCount());
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [widInput, setWidInput] = useState('');
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [pageSize, setPageSize] = useState(() => {
    try { const v = parseInt(localStorage.getItem('cardsPageSize')); return (v >= 200 && v <= 5000) ? v : 200; } catch { return 200; }
  });
  const [allCards, setAllCards] = useState(() => localStorage.getItem('cardsPageSize') === 'all');
  const navigate = useNavigate();
  useEffect(() => subscribe(setReqCount), []);

  const openCardDialog = () => { setWidInput(''); setCardDialogOpen(true); };
  const closeCardDialog = () => setCardDialogOpen(false);
  const goToCard = () => {
    const wid = widInput.trim();
    if (!wid || isNaN(wid)) return;
    closeCardDialog();
    navigate(`/card/${wid}`);
  };

  const handlePageSizeChange = (_, val) => {
    setAllCards(false);
    setPageSize(Math.max(200, Math.min(5000, val)));
  };

  const handleAllCards = () => setAllCards((p) => !p);

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
    const newVal = allCards ? 'all' : String(Math.max(200, Math.min(5000, pageSize)));
    const prev = localStorage.getItem('cardsPageSize');
    localStorage.setItem('cardsPageSize', newVal);
    if (prev !== newVal) {
      window.location.reload();
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG_DARK }}>
      <Prank />
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(8,8,8,0.82)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
        <Toolbar sx={{ gap: 2 }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <Box component="img" src="/a_icon.png" alt="logo" sx={{ height: 36, width: 36, objectFit: 'contain' }} />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Szukaj kart">
            <IconButton onClick={openCardDialog} size="small"
              sx={{ color: '#aaa', '&:hover': { color: ACCENT }, border: `1px solid ${BORDER}`, borderRadius: 1.5, p: 0.8 }}>
              <StyleIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <UserSearch width={240} />
          <Tooltip title="Ustawienia">
            <IconButton onClick={(e) => setSettingsAnchor(e.currentTarget)} size="small"
              sx={{ color: '#aaa', '&:hover': { color: ACCENT }, border: `1px solid ${BORDER}`, borderRadius: 1.5, p: 0.8 }}>
              <SettingsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Popover
            open={Boolean(settingsAnchor)}
            anchorEl={settingsAnchor}
            onClose={handleSettingsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { bgcolor: BG_SURFACE, border: `1px solid ${BORDER}`, p: 2, minWidth: 260 } }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: '#c7c7c7', fontWeight: 700, letterSpacing: '0.1em', mb: 1 }}>
              USTAWIENIA
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#a7a7a7', mb: 0.5 }}>
              Kart na stronie: <strong style={{ color: '#fff' }}>{allCards ? 'WSZYSTKIE' : pageSize}</strong>
            </Typography>
            <Slider
              value={allCards ? 5000 : pageSize}
              onChange={handlePageSizeChange}
              min={200} max={5000} step={200}
              disabled={allCards}
              sx={{
                color: allCards ? '#444' : ACCENT,
                '& .MuiSlider-thumb': { width: 14, height: 14 },
                '& .MuiSlider-track': { height: 3 },
                '& .MuiSlider-rail': { height: 3, bgcolor: '#131313' },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#c4c4c4' }}>200</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#c4c4c4' }}>5000</Typography>
            </Box>
            <Box
              onClick={handleAllCards}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', borderRadius: 1, py: 0.6,
                bgcolor: allCards ? `${ACCENT}22` : 'transparent',
                border: `1px solid ${allCards ? ACCENT : '#333'}`,
                color: allCards ? ACCENT : '#bbb',
                fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.08em',
                transition: 'all 0.15s',
                '&:hover': { borderColor: ACCENT, color: ACCENT },
              }}
            >
              POKAŻ WSZYSTKIE!
            </Box>
          </Popover>
        </Toolbar>
      </AppBar>
      <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 3 }}>
        {children}
      </Box>

      <Dialog open={cardDialogOpen} onClose={closeCardDialog} maxWidth="xs" fullWidth
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.8)' } } }}
        PaperProps={{ sx: { bgcolor: BG_SURFACE, backgroundImage: 'none', border: `1px solid ${BORDER}`, borderRadius: 2 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', py: 1.2, px: 2, borderBottom: `1px solid ${BORDER}` }}>
          <StyleIcon sx={{ fontSize: 18, color: ACCENT, mr: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', flexGrow: 1 }}>Szukaj kart</Typography>
          <IconButton onClick={closeCardDialog} size="small" sx={{ color: '#666' }}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: '24px !important', overflow: 'visible' }}>
          <TextField
            autoFocus
            fullWidth
            label="WID karty"
            placeholder="np. 123456"
            value={widInput}
            onChange={(e) => setWidInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') goToCard(); }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={goToCard} disabled={!widInput.trim()} sx={{ color: ACCENT }}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#e0e0e0',
                '& fieldset': { borderColor: '#555' },
                '&:hover fieldset': { borderColor: ACCENT },
                '&.Mui-focused fieldset': { borderColor: ACCENT },
              },
              '& .MuiInputLabel-root': { color: '#bbb' },
              '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
              '& .MuiInputBase-input::placeholder': { color: '#666', opacity: 1 },
            }}
          />
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography sx={{ color: '#666', fontSize: '0.78rem', mb: 1 }}>lub</Typography>
            <Button
              onClick={() => { closeCardDialog(); navigate('/cards/search'); }}
              variant="outlined"
              startIcon={<SearchIcon />}
              sx={{
                textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
                borderColor: ACCENT, color: ACCENT,
                '&:hover': { borderColor: ACCENT, bgcolor: `${ACCENT}15` },
              }}
            >
              Szukaj po nazwie / tytule
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
