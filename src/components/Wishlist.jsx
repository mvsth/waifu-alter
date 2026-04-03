import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Chip, TextField, InputAdornment, Snackbar, ToggleButtonGroup, ToggleButton, Fab } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MovieIcon from '@mui/icons-material/Movie';
import StyleIcon from '@mui/icons-material/Style';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { getUserProfile, getUsername, getUserWishlist } from '../api';
import { ACCENT, BG_SURFACE, BG_CARD, BG_DARK, BORDER, TEXT_MUTED, TEXT_DIM, TEXT_BRIGHT, TEXT_PRIMARY, TEXT_FAINT, ROW_ALT_LIGHT, ROW_ALT_DARK } from '../theme';
import UserNavBar from './UserNavBar';
import ExpeditionsDialog from './ExpeditionsDialog';

const TYPE_LABELS = { character: 'Postacie', card: 'Karty', title: 'Tytuły' };
const TYPE_ORDER = ['character', 'card', 'title'];

function getShindenUrl(wish) {
  if (wish.type === 'character' && wish.objectId) return `https://shinden.pl/character/${wish.objectId}`;
  if (wish.type === 'title' && wish.objectId) return `https://shinden.pl/titles/${wish.objectId}`;
  return null;
}

export default function Wishlist() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState(null);
  const [wishes, setWishes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expOpen, setExpOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const [copiedId, setCopiedId] = useState(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [cmdMode, setCmdMode] = useState('remove');
  const [sortAlpha, setSortAlpha] = useState(false);

  function copyCommand(wish) {
    const action = cmdMode === 'add' ? 'wadd' : 'wremove';
    const typeChar = wish.type === 'title' ? 't' : 'p';
    const cmd = `s.${action} ${typeChar} ${wish.objectId}`;
    navigator.clipboard.writeText(cmd).catch(() => {});
    setCopiedId(wish.id);
    setSnackOpen(true);
    setTimeout(() => setCopiedId(null), 1500);
  }

  useEffect(() => {
    setProfile(null); setUsername(null); setWishes(null); setError(null); setLoading(true);
  }, [userId]);

  useEffect(() => {
    getUserProfile(userId).then(setProfile).catch(() => {});
    getUsername(userId).then(setUsername).catch(() => {});
    getUserWishlist(userId)
      .then((data) => { setWishes(data || []); setLoading(false); })
      .catch((err) => {
        setError(
          err?.response?.status === 401
            ? 'Lista życzeń jest prywatna.'
            : 'Nie udało się pobrać listy życzeń.'
        );
        setLoading(false);
      });
  }, [userId]);

  const userColor = profile?.foregroundColor || ACCENT;

  return (
    <Box>
      <UserNavBar userId={userId} profile={profile} username={username}
        onExpeditions={() => setExpOpen(true)} />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: ACCENT }} size={60} />
        </Box>
      )}

      {error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: TEXT_MUTED }}>{error}</Typography>
        </Box>
      )}

      {!loading && !error && wishes && (
        <>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ color: TEXT_BRIGHT, fontWeight: 700 }}>
              Lista życzeń
            </Typography>
            <Chip label={wishes.length} size="small"
              sx={{ bgcolor: `${userColor}22`, color: userColor, fontWeight: 700 }} />
            <Box sx={{ flex: 1 }} />
            <ToggleButtonGroup
              value={sortAlpha ? 'az' : ''}
              exclusive
              onChange={(_, v) => setSortAlpha(v === 'az')}
              size="small"
              sx={{
                height: 36,
                '& .MuiToggleButton-root': {
                  px: 1.5, py: 0, fontSize: '0.78rem', fontWeight: 700, letterSpacing: 0.5,
                  border: `1px solid ${BORDER}`, color: TEXT_MUTED, textTransform: 'none',
                  bgcolor: BG_DARK,
                  '&.Mui-selected': { bgcolor: `${userColor}22`, color: userColor, borderColor: `${userColor}66` },
                  '&:hover': { bgcolor: `${userColor}12` },
                },
              }}
            >
              <ToggleButton value="az">A–Z</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
              value={cmdMode}
              exclusive
              onChange={(_, v) => { if (v) setCmdMode(v); }}
              size="small"
              sx={{
                height: 36,
                '& .MuiToggleButton-root': {
                  px: 1.5, py: 0, fontSize: '0.78rem', fontWeight: 700, letterSpacing: 0.5,
                  border: `1px solid ${BORDER}`, color: TEXT_MUTED, textTransform: 'none',
                  bgcolor: BG_DARK,
                  '&.Mui-selected': { bgcolor: `${userColor}22`, color: userColor, borderColor: `${userColor}66` },
                  '&:hover': { bgcolor: `${userColor}12` },
                },
              }}
            >
              <ToggleButton value="add">ADD</ToggleButton>
              <ToggleButton value="remove">REMOVE</ToggleButton>
            </ToggleButtonGroup>
            <TextField
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Szukaj po nazwie..."
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
                  '&:hover fieldset': { borderColor: `${userColor}66` },
                  '&.Mui-focused fieldset': { borderColor: userColor },
                  height: 36,
                },
              }}
              sx={{ minWidth: 180, maxWidth: 300 }}
            />
          </Box>

          {wishes.length === 0 ? (
          <Typography sx={{ color: TEXT_MUTED, textAlign: 'center', py: 6 }}>
              Lista życzeń jest pusta.
            </Typography>
          ) : (
            (() => {
              const query = searchText.trim().toLowerCase();
              const groups = TYPE_ORDER.map((type) => ({
                type,
                label: TYPE_LABELS[type] || type,
                items: wishes.filter((w) => {
                  if (!query) return w.type === type;
                  return w.type === type && (w.objectName || '').toLowerCase().includes(query);
                }).slice().sort((a, b) => sortAlpha
                  ? (a.objectName || '').localeCompare(b.objectName || '', 'pl')
                  : 0),
              })).filter((g) => g.items.length > 0);

              let globalIdx = 0;
              return groups.map((group) => (
                <Box key={group.type} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                    {group.type === 'title' ? (
                    <MovieIcon sx={{ fontSize: 18, color: TEXT_MUTED }} />
                  ) : group.type === 'card' ? (
                    <StyleIcon sx={{ fontSize: 18, color: TEXT_MUTED }} />
                    ) : (
                      <FavoriteIcon sx={{ fontSize: 18, color: TEXT_MUTED }} />
                    )}
                    <Typography variant="body2" sx={{ color: TEXT_MUTED, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                      {group.label} ({group.items.length})
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 2,
                  }}>
                    {group.items.map((wish) => {
                      const isDark = globalIdx % 2 === 1;
                      globalIdx++;
                      const isCopied = copiedId === wish.id;
                      return (
                        <Box key={wish.id} sx={{
                          bgcolor: ROW_ALT_LIGHT, borderRadius: 2, p: 2.5,
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.35)',
                        }}>
                          <Box sx={{
                            width: 36, height: 36, borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            bgcolor: `${userColor}18`, color: userColor, flexShrink: 0,
                          }}>
                            <FavoriteIcon sx={{ fontSize: 20 }} />
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            {getShindenUrl(wish) ? (
                              <Typography
                                component="a"
                                href={getShindenUrl(wish)}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="body2"
                                noWrap
                                sx={{
                                  color: TEXT_PRIMARY, fontWeight: 600, display: 'block',
                                  textDecoration: 'none',
                                  '&:hover': { color: userColor, textDecoration: 'underline' },
                                }}
                              >
                                {wish.objectName || `#${wish.objectId}`}
                              </Typography>
                            ) : (
                              <Typography variant="body2" noWrap sx={{ color: TEXT_PRIMARY, fontWeight: 600 }}>
                                {wish.objectName || `#${wish.objectId}`}
                              </Typography>
                            )}
                            {wish.entry === 1 && (
                              <Chip label="Stałe" size="small"
                                sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#4caf5022', color: '#81c784', mt: 0.3 }} />
                            )}
                          </Box>
                          <Box
                            onClick={() => copyCommand(wish)}
                            sx={{
                              display: 'flex', alignItems: 'center', gap: 0.4, flexShrink: 0,
                              cursor: 'pointer', px: 0.8, py: 0.4, borderRadius: 1,
                              color: isCopied ? '#81c784' : TEXT_FAINT,
                              bgcolor: isCopied ? '#4caf5018' : 'transparent',
                              transition: 'color 0.15s, background 0.15s',
                              '&:hover': { color: userColor, bgcolor: `${userColor}18` },
                            }}
                          >
                            {isCopied
                              ? <CheckIcon sx={{ fontSize: 13 }} />
                              : <ContentCopyIcon sx={{ fontSize: 13 }} />
                            }
                            <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 600 }}>
                              #{wish.objectId}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ));
            })()
          )}
        </>
      )}

      {profile?.expeditions && (
        <ExpeditionsDialog
          open={expOpen} onClose={() => setExpOpen(false)}
          expeditions={profile.expeditions} userColor={userColor}
        />
      )}

      <Snackbar
        open={snackOpen}
        autoHideDuration={1500}
        onClose={() => setSnackOpen(false)}
        message="Skopiowano komendę!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

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
