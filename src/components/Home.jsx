import React, { useState, useEffect } from 'react';
import {
  Box, Typography, List, ListItemButton, ListItemText,
  ListItemAvatar, Avatar, IconButton, Tooltip, CircularProgress,
  Divider, Button, Chip,
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { getActivity } from '../api';
import { ACCENT, ACCENT_LIGHT, BG_SURFACE, BG_DARK, BORDER } from '../theme';

const EXTERNAL_LINKS = [
  { label: 'wiki.sanakan.pl', url: 'https://wiki.sanakan.pl' },
  { label: 'profil.sanakan.pl', url: 'https://profil.sanakan.pl' },
  { label: 'skalpel.sanakan.pl', url: 'https://skalpel.sanakan.pl' },
  { label: 'uskalpel.sanakan.pl', url: 'https://uskalpel.sanakan.pl' },
];

const AVATAR_SIZE = 38;

export default function Home() {
  const navigate = useNavigate();
  const [lastVisited, setLastVisited] = useState([]);
  const [activity, setActivity] = useState(null);
  const [actError, setActError] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('lastVisited')) || [];
      setLastVisited(stored.filter(Boolean));
    } catch { setLastVisited([]); }
  }, []);

  useEffect(() => {
    getActivity(12)
      .then((data) => {
        const filtered = data
          .filter((item) =>
            item.shindenId !== 0 &&
            item.type !== 'wonLottery' &&
            item.type !== 'Muted' &&
            item.type !== 'Banned' &&
            item.type !== 'Kicked' &&
            item.type !== 'Connected'
          )
          .map((item) => {
            const splitMisc = item.misc.split(';');
            let subText = item.text;
            const regex = /<(t|w|p|c|u|wp)@(\d+)>/g;
            let match;
            while ((match = regex.exec(item.text)) !== null) {
              const prefix = match[1];
              const found = splitMisc.find((p) => p.startsWith(`${prefix}:`));
              if (found) subText = subText.replace(match[0], found.substring(prefix.length + 1));
            }
            const userEntry = splitMisc.find((p) => p.startsWith('u:'));
            return { ...item, subText, username: userEntry ? userEntry.substring(2) : '?' };
          })
          .slice(0, 8);
        setActivity(filtered);
      })
      .catch(() => setActError(true));
  }, []);

  const togglePin = (user) => {
    const updated = lastVisited.map((u) =>
      u.id === user.id ? { ...u, pinned: !u.pinned } : u
    );
    const pinned = updated.filter((u) => u.pinned);
    const unpinned = updated.filter((u) => !u.pinned);
    const merged = [...pinned, ...unpinned];
    setLastVisited(merged);
    localStorage.setItem('lastVisited', JSON.stringify(merged));
  };

  const handleActivityClick = (item) => {
    if (item.type === 'addedToWishlistCharacter') {
      window.open(`https://shinden.pl/character/${item.targetId}`, '_blank', 'noopener');
    } else if (item.targetId) {
      navigate(`/card/${item.targetId}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 1120, mx: 'auto' }}>
      <Box sx={{
        display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2,
        justifyContent: 'center',
      }}>
        {EXTERNAL_LINKS.map(({ label, url }) => (
          <Button
            key={url}
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            endIcon={<OpenInNewIcon sx={{ fontSize: '0.8rem !important' }} />}
            sx={{
              bgcolor: BG_SURFACE, border: `1px solid ${BORDER}`,
              color: '#bbb', borderRadius: 2, px: 1.5, py: 0.6,
              fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.02em',
              textTransform: 'none',
              '&:hover': { bgcolor: '#2a2a2a', color: ACCENT_LIGHT, borderColor: ACCENT_LIGHT },
            }}
          >
            {label}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, justifyContent: 'center' }}>
        <Button
          size="small"
          onClick={() => navigate('/cards/unique')}
          sx={{
            bgcolor: '#0080d822', border: '1px solid #0080d8',
            color: '#0080d8', borderRadius: 2, px: 2, py: 0.6,
            fontSize: '0.82rem', fontWeight: 700, textTransform: 'none',
            '&:hover': { bgcolor: '#0080d844' },
          }}
        >
          Karty Unikatowe
        </Button>
        <Button
          size="small"
          onClick={() => navigate('/cards/ultimate')}
          sx={{
            bgcolor: '#d8440022', border: '1px solid #d84400',
            color: '#d84400', borderRadius: 2, px: 2, py: 0.6,
            fontSize: '0.82rem', fontWeight: 700, textTransform: 'none',
            '&:hover': { bgcolor: '#d8440044' },
          }}
        >
          Karty Ultimate
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>

        <Box sx={panelSx}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
            Ostatnio odwiedzane
          </Typography>
          {lastVisited.length === 0 ? (
            <Typography color="text.secondary">
              Nikogo jeszcze nie odwiedzałeś — wyszukaj użytkownika powyżej.
            </Typography>
          ) : (
            <List dense disablePadding>
              {lastVisited.map((user) => (
                <ListItemButton
                  key={user.id}
                  onClick={() => navigate(`/user/${user.id}/profile`)}
                  sx={{ borderRadius: 1, '&:hover': { bgcolor: '#333' } }}
                >
                  <ListItemAvatar sx={{ minWidth: AVATAR_SIZE + 10 }}>
                    <Avatar
                      src={user.avatarUrl}
                      sx={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name || `User ${user.id}`}
                    sx={{ '& .MuiListItemText-primary': { color: '#e0e0e0' } }}
                  />
                  <Tooltip title={user.pinned ? 'Odepnij' : 'Przypnij'} arrow>
                    <IconButton
                      edge="end" size="small"
                      onClick={(e) => { e.stopPropagation(); togglePin(user); }}
                      sx={{ color: user.pinned ? ACCENT : '#555' }}
                    >
                      {user.pinned ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  </Tooltip>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        <Box sx={panelSx}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
            Aktywność
          </Typography>
          {actError ? (
            <Typography color="text.secondary">Nie udało się pobrać aktywności.</Typography>
          ) : activity === null ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress sx={{ color: ACCENT }} />
            </Box>
          ) : activity.length === 0 ? (
            <Typography color="text.secondary">Brak aktywności.</Typography>
          ) : (
            <List dense disablePadding>
              {activity.map((item, idx) => (
                <React.Fragment key={idx}>
                  <ListItemButton
                    onClick={() => handleActivityClick(item)}
                    sx={{ borderRadius: 1, '&:hover': { bgcolor: '#333' }, px: 1 }}
                  >
                    <ListItemAvatar sx={{ minWidth: AVATAR_SIZE + 10 }}>
                      <Avatar
                        src={item.shindenId ? `https://cdn.shinden.eu/cdn1/avatars/225x350/${item.shindenId}.jpg` : ''}
                        sx={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ color: ACCENT_LIGHT, fontWeight: 600 }}>
                          {item.username}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: '#bbb' }}>
                          {item.subText}
                        </Typography>
                      }
                    />
                    {item.type !== 'addedToWishlistCharacter' && item.targetId ? (
                      <Chip
                        label="Karta"
                        size="small"
                        sx={{
                          ml: 1, flexShrink: 0, bgcolor: BG_DARK,
                          color: '#888', fontSize: '0.65rem', height: 20,
                          border: `1px solid ${BORDER}`,
                        }}
                      />
                    ) : null}
                  </ListItemButton>
                  {idx < activity.length - 1 && <Divider sx={{ borderColor: '#2a2a2a' }} />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const panelSx = {
  flex: '1 1 400px', maxWidth: 540, minWidth: 0,
  bgcolor: BG_SURFACE, borderRadius: 2, p: 3,
  border: `1px solid ${BORDER}`,
};


