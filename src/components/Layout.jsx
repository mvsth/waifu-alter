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
import { subscribe as subscribeDiag, getDiagnostic } from '../profileDiagnostic';

export default function Layout({ children }) {
  const [reqCount, setReqCount] = useState(getCount());
  const [diagnostic, setDiagnostic] = useState(getDiagnostic());
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [widInput, setWidInput] = useState('');
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [pageSize, setPageSize] = useState(() => {
    try { const v = parseInt(localStorage.getItem('cardsPageSize')); return (v >= 100 && v <= 4000) ? v : 100; } catch { return 100; }
  });
  const [allCards, setAllCards] = useState(() => localStorage.getItem('cardsPageSize') === 'all');
  const [hideStats, setHideStats] = useState(() => localStorage.getItem('hideCardStats') === 'true');
  const [themeMode, setThemeMode] = useState(THEME_MODE);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => subscribe(setReqCount), []);
  useEffect(() => subscribeDiag(setDiagnostic), []);

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
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  const handleApply = () => {
    const newVal = allCards ? 'all' : String(Math.max(100, Math.min(4000, pageSize)));
    const prevSize = localStorage.getItem('cardsPageSize');
    const prevHide = localStorage.getItem('hideCardStats');
    const prevTheme = localStorage.getItem('themeMode') || 'dark';
    localStorage.setItem('cardsPageSize', newVal);
    localStorage.setItem('hideCardStats', String(hideStats));
    localStorage.setItem('themeMode', themeMode);
    setSettingsAnchor(null);
    if (prevSize !== newVal || prevHide !== String(hideStats) || prevTheme !== themeMode) {
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
            PaperProps={{ sx: { bgcolor: '#08080a', border: '1px solid #2a2a2e', boxShadow: '0 8px 32px rgba(0,0,0,0.9)', p: 2, minWidth: 290 } }}
          >
            {/* --- Kart na stronie --- */}
            <Typography sx={{ fontSize: '0.78rem', color: '#aaa', mb: 0.8 }}>
              Kart na stronie:{' '}
              <Box component="span" sx={{ color: '#fff', fontWeight: 700 }}>
                {allCards ? 'WSZYSTKIE' : pageSize}
              </Box>
            </Typography>
            <Slider
              value={allCards ? 4000 : pageSize}
              onChange={handlePageSizeChange}
              min={100} max={4000} step={100}
              disabled={allCards}
              sx={{
                color: allCards ? '#444' : ACCENT,
                '& .MuiSlider-thumb': {
                  width: 16, height: 16,
                  bgcolor: allCards ? '#444' : ACCENT,
                  '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 6px ${ACCENT}28` },
                },
                '& .MuiSlider-track': { height: 4, border: 'none' },
                '& .MuiSlider-rail': { height: 4, bgcolor: '#2a2a2e' },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#aaa' }}>100</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#aaa' }}>4000</Typography>
            </Box>
            <Box
              onClick={handleAllCards}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', borderRadius: 1.5, py: 0.6,
                bgcolor: allCards ? `${ACCENT}20` : '#1a1a1e',
                border: `1.5px solid ${allCards ? ACCENT : '#333'}`,
                color: allCards ? ACCENT : '#888',
                fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em',
                transition: 'all 0.15s',
                '&:hover': { borderColor: ACCENT, color: ACCENT, bgcolor: `${ACCENT}15` },
              }}
            >
              {allCards ? '✓ WSZYSTKIE KARTY' : 'POKAŻ WSZYSTKIE'}
            </Box>

            {/* --- Ukryj statystyki --- */}
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '2px solid #333' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#aaa' }}>Ukryj statystyki</Typography>
                <Switch
                  size="small"
                  checked={hideStats}
                  onChange={(e) => { setHideStats(e.target.checked); }}
                  sx={{
                    '& .MuiSwitch-switchBase': { color: '#555' },
                    '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: `${ACCENT}88` },
                    '& .MuiSwitch-track': { bgcolor: '#333' },
                  }}
                />
              </Box>
            </Box>

            {/* --- Motyw --- */}
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '2px solid #333' }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#aaa', mb: 1.5 }}>Motyw</Typography>
              <Box sx={{ px: 0.5 }}>
                {(() => {
                  const modes = ['deep', 'dark', 'soft'];
                  const idx = modes.indexOf(themeMode);
                  return (
                    <Box
                      sx={{
                        display: 'flex', alignItems: 'center',
                        bgcolor: '#111114', borderRadius: 2, p: '4px', gap: '4px',
                      }}
                    >
                      {modes.map((m, i) => (
                        <Box
                          key={m}
                          onClick={() => handleThemeChange(m)}
                          sx={{
                            flex: 1, height: 28, borderRadius: 1.5,
                            cursor: 'pointer',
                            bgcolor: idx === i ? ACCENT : 'transparent',
                            transition: 'background-color 0.15s',
                            '&:hover': { bgcolor: idx === i ? ACCENT : '#2a2a30' },
                          }}
                        />
                      ))}
                    </Box>
                  );
                })()}
              </Box>
            </Box>

            {/* --- Zastosuj --- */}
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '2px solid #333' }}>
              <Box
                onClick={handleApply}
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', borderRadius: 1.5, py: 0.8,
                  bgcolor: ACCENT, color: '#fff',
                  fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.12em',
                  transition: 'opacity 0.15s',
                  '&:hover': { opacity: 0.85 },
                }}
              >
                ZASTOSUJ
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
        {diagnostic != null && (
          <>
            <Typography component="span" sx={{ fontSize: '0.72rem', color: TEXT_FAINT }}>•</Typography>
            <Typography component="span" sx={{ fontSize: '0.76rem', color: TEXT_FAINT }}>
              profil wczytany w{' '}
              <Box component="span" sx={{ color: TEXT_SOFT, fontWeight: 600 }}>{diagnostic.clientMs} ms</Box>
              {diagnostic.serverMs != null && (
                <Box component="span" sx={{ color: TEXT_FAINT }}>
                  {' '}(serwer: {diagnostic.serverMs} ms)
                </Box>
              )}
            </Typography>
          </>
        )}
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
