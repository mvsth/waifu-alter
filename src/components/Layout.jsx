import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, TextField, InputAdornment, Tooltip, Popover, Slider, Switch } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import StyleIcon from '@mui/icons-material/Style';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import UserSearch from './UserSearch';
import Prank from './Prank';
import { ACCENT, BG_DARK, BG_HEADER, BG_SURFACE, BORDER, TEXT_SOFT, TEXT_MUTED, TEXT_SECONDARY, TEXT_BRIGHT, TEXT_WHITE, TEXT_DIM, TEXT_PRIMARY, TEXT_FAINT, DIVIDER, SLIDER_RAIL, APPBAR_BG, APPBAR_BORDER, THEME_MODE } from '../theme';
import { subscribe, getCount } from '../apiCounter';

export default function Layout({ children }) {
  const [reqCount, setReqCount] = useState(getCount());
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [widInput, setWidInput] = useState('');
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [pageSize, setPageSize] = useState(() => {
    try { const v = parseInt(localStorage.getItem('cardsPageSize')); return (v >= 100 && v <= 4000) ? v : 200; } catch { return 200; }
  });
  const [allCards, setAllCards] = useState(() => localStorage.getItem('cardsPageSize') === 'all');
  const [hideStats, setHideStats] = useState(() => localStorage.getItem('hideCardStats') === 'true');
  const [themeMode, setThemeMode] = useState(THEME_MODE);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => subscribe(setReqCount), []);

  const isUserPage = /^\/user\//.test(location.pathname);

  useEffect(() => {
    if (!isUserPage) { setScrolled(false); return; }
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isUserPage]);

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
    setPageSize(Math.max(100, Math.min(4000, val)));
  };

  const handleAllCards = () => setAllCards((p) => !p);

  const handleThemeChange = (val) => {
    setThemeMode(val);
    localStorage.setItem('themeMode', val);
    window.location.reload();
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
    const newVal = allCards ? 'all' : String(Math.max(100, Math.min(4000, pageSize)));
    const prev = localStorage.getItem('cardsPageSize');
    localStorage.setItem('cardsPageSize', newVal);
    localStorage.setItem('hideCardStats', String(hideStats));
    if (prev !== newVal) {
      window.location.reload();
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG_DARK }}>
      <Prank />
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: isUserPage && !scrolled ? 'rgba(8,8,8,0.35)' : APPBAR_BG,
        backdropFilter: isUserPage && !scrolled ? 'blur(1px)' : 'blur(10px)',
        WebkitBackdropFilter: isUserPage && !scrolled ? 'blur(1px)' : 'blur(10px)',
        borderBottom: isUserPage && !scrolled ? '1px solid rgba(255,255,255,0.04)' : `1px solid ${APPBAR_BORDER}`,
        transition: 'background-color 0.3s, backdrop-filter 0.3s, border-color 0.3s',
      }}>
        <Toolbar sx={{ gap: 2 }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <Box component="img" src="/a_icon.png" alt="logo" sx={{ height: 41, width: 41, objectFit: 'contain' }} />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Szukaj kart">
            <IconButton onClick={openCardDialog} size="small"
              sx={{ color: TEXT_SOFT, bgcolor: BG_DARK, '&:hover': { color: ACCENT, bgcolor: BG_DARK }, border: `1px solid ${BORDER}`, borderRadius: 1.5, p: 0.8 }}>
              <StyleIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <UserSearch width={240} />
          <Tooltip title="Ustawienia">
            <IconButton onClick={(e) => setSettingsAnchor(e.currentTarget)} size="small"
              sx={{ color: TEXT_SOFT, bgcolor: BG_DARK, '&:hover': { color: ACCENT, bgcolor: BG_DARK }, border: `1px solid ${BORDER}`, borderRadius: 1.5, p: 0.8 }}>
              <SettingsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Popover
            open={Boolean(settingsAnchor)}
            anchorEl={settingsAnchor}
            onClose={handleSettingsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { bgcolor: BG_SURFACE, border: `1px solid ${BORDER}`, p: 2.3, minWidth: 300 } }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: TEXT_BRIGHT, fontWeight: 700, letterSpacing: '0.1em', mb: 1 }}>
              USTAWIENIA
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: TEXT_SECONDARY, mb: 0.5 }}>
              Kart na stronie: <strong style={{ color: TEXT_WHITE }}>{allCards ? 'WSZYSTKIE' : pageSize}</strong>
            </Typography>
            <Slider
              value={allCards ? 4000 : pageSize}
              onChange={handlePageSizeChange}
              min={100} max={4000} step={100}
              disabled={allCards}
              sx={{
                color: allCards ? TEXT_MUTED : ACCENT,
                '& .MuiSlider-thumb': { width: 14, height: 14 },
                '& .MuiSlider-track': { height: 3 },
                '& .MuiSlider-rail': { height: 3, bgcolor: SLIDER_RAIL },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', color: TEXT_BRIGHT }}>100</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: TEXT_BRIGHT }}>4000</Typography>
            </Box>
            <Box
              onClick={handleAllCards}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', borderRadius: 1, py: 0.6,
                bgcolor: allCards ? `${ACCENT}22` : 'transparent',
                border: `1px solid ${allCards ? ACCENT : BORDER}`,
                color: allCards ? ACCENT : TEXT_BRIGHT,
                fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.08em',
                transition: 'all 0.15s',
                '&:hover': { borderColor: ACCENT, color: ACCENT },
              }}
            >
              POKAŻ WSZYSTKIE!
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5, pt: 1.2, borderTop: `1px solid ${DIVIDER}` }}>
              <Typography sx={{ fontSize: '0.82rem', color: TEXT_SECONDARY }}>
                Ukryj statystyki
              </Typography>
              <Switch
                size="small"
                checked={hideStats}
                onChange={(e) => setHideStats(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: `1px solid ${DIVIDER}` }}>
              <Typography sx={{ fontSize: '0.82rem', color: TEXT_SECONDARY }}>
                Motyw
              </Typography>
              <Box sx={{ display: 'flex', borderRadius: '16px', overflow: 'hidden', border: '2px solid #1a1a1a', flexShrink: 0, bgcolor: '#242424' }}>
                {[{ value: 'dark', label: 'Ciemny' }, { value: 'light', label: 'Jasny' }].map((m) => (
                  <Button
                    key={m.value}
                    size="small"
                    onClick={() => handleThemeChange(m.value)}
                    sx={{
                      textTransform: 'none', fontWeight: 700, fontSize: '0.75rem',
                      borderRadius: '14px', px: 1.5, py: 0.4, minWidth: 'auto',
                      bgcolor: themeMode === m.value ? '#000000' : 'transparent',
                      color: ACCENT,
                      boxShadow: themeMode === m.value ? 'inset 0 0 0 1.5px #000000' : 'none',
                      '&:hover': { bgcolor: '#000000', color: ACCENT },
                    }}
                  >
                    {m.label}
                  </Button>
                ))}
              </Box>
            </Box>
          </Popover>
        </Toolbar>
      </AppBar>
      <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: isUserPage ? 0 : 3 }}>
        {children}
      </Box>

      <Box component="footer" sx={{
        textAlign: 'center', py: 3, mt: 4,
        bgcolor: 'rgba(0,0,0,0.25)',
        color: TEXT_DIM, fontSize: '0.82rem',
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.8, flexWrap: 'wrap',
      }}>
        <Typography component="span" sx={{ fontSize: '0.82rem', color: TEXT_DIM }}>
          <Box component="span" sx={{ color: TEXT_SOFT }}>©</Box> 2026{' '}
          <Box component="a" href="https://sanakan.pl" target="_blank" rel="noopener noreferrer"
            sx={{ color: TEXT_SOFT, textDecoration: 'none', fontWeight: 600, '&:hover': { color: ACCENT } }}>
            Sanakan
          </Box>
        </Typography>
        <Typography component="span" sx={{ fontSize: '0.72rem', color: TEXT_FAINT }}>•</Typography>
        <Typography component="span" sx={{ fontSize: '0.82rem', color: TEXT_FAINT }}>
          Propozycje lub błędy zgłaszaj do:  <Box component="span" sx={{ color: TEXT_SOFT, fontWeight: 600 }}>@mvysther</Box>
        </Typography>
      </Box>

      <Dialog open={cardDialogOpen} onClose={closeCardDialog} maxWidth="xs" fullWidth
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.8)' } } }}
        PaperProps={{ sx: { bgcolor: BG_SURFACE, backgroundImage: 'none', border: `1px solid ${BORDER}`, borderRadius: 2 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', py: 1.2, px: 2, borderBottom: `1px solid ${BORDER}` }}>
          <StyleIcon sx={{ fontSize: 18, color: ACCENT, mr: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: TEXT_WHITE, flexGrow: 1 }}>Szukaj kart</Typography>
          <IconButton onClick={closeCardDialog} size="small" sx={{ color: TEXT_DIM }}><CloseIcon fontSize="small" /></IconButton>
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
                color: TEXT_PRIMARY,
                '& fieldset': { borderColor: TEXT_FAINT },
                '&:hover fieldset': { borderColor: ACCENT },
                '&.Mui-focused fieldset': { borderColor: ACCENT },
              },
              '& .MuiInputLabel-root': { color: TEXT_BRIGHT },
              '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
              '& .MuiInputBase-input::placeholder': { color: TEXT_DIM, opacity: 1 },
            }}
          />
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography sx={{ color: TEXT_DIM, fontSize: '0.78rem', mb: 1 }}>lub</Typography>
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
