import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Chip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MovieIcon from '@mui/icons-material/Movie';
import StyleIcon from '@mui/icons-material/Style';
import { getUserProfile, getUsername, getUserWishlist } from '../api';
import { ACCENT, BG_SURFACE, BG_CARD } from '../theme';
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
          <Typography variant="h6" sx={{ color: '#888' }}>{error}</Typography>
        </Box>
      )}

      {!loading && !error && wishes && (
        <>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ color: '#ddd', fontWeight: 700 }}>
              Lista życzeń
            </Typography>
            <Chip label={wishes.length} size="small"
              sx={{ bgcolor: `${userColor}22`, color: userColor, fontWeight: 700 }} />
          </Box>

          {wishes.length === 0 ? (
            <Typography sx={{ color: '#888', textAlign: 'center', py: 6 }}>
              Lista życzeń jest pusta.
            </Typography>
          ) : (
            (() => {
              const groups = TYPE_ORDER.map((type) => ({
                type,
                label: TYPE_LABELS[type] || type,
                items: wishes.filter((w) => w.type === type),
              })).filter((g) => g.items.length > 0);

              return groups.map((group) => (
                <Box key={group.type} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                    {group.type === 'title' ? (
                      <MovieIcon sx={{ fontSize: 18, color: '#888' }} />
                    ) : group.type === 'card' ? (
                      <StyleIcon sx={{ fontSize: 18, color: '#888' }} />
                    ) : (
                      <FavoriteIcon sx={{ fontSize: 18, color: '#888' }} />
                    )}
                    <Typography variant="body2" sx={{ color: '#888', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                      {group.label} ({group.items.length})
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 1.5,
                  }}>
                    {group.items.map((wish, wIdx) => (
                      <Box key={wish.id} sx={{
                        bgcolor: wIdx % 2 === 1 ? '#222426' : BG_CARD, borderRadius: 2, p: 2,
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        transition: 'background 0.15s',
                        '&:hover': { bgcolor: BG_SURFACE },
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
                                color: '#e0e0e0', fontWeight: 600, display: 'block',
                                textDecoration: 'none',
                                '&:hover': { color: userColor, textDecoration: 'underline' },
                              }}
                            >
                              {wish.objectName || `#${wish.objectId}`}
                            </Typography>
                          ) : (
                            <Typography variant="body2" noWrap sx={{ color: '#e0e0e0', fontWeight: 600 }}>
                              {wish.objectName || `#${wish.objectId}`}
                            </Typography>
                          )}
                          {wish.entry === 1 && (
                            <Chip label="Stałe" size="small"
                              sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#4caf5022', color: '#81c784', mt: 0.3 }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#555', flexShrink: 0 }}>
                          #{wish.objectId}
                        </Typography>
                      </Box>
                    ))}
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
    </Box>
  );
}
