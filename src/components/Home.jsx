import React, { useState, useEffect } from 'react';
import {
  Box, Typography, List, ListItemButton, ListItemText,
  ListItemAvatar, Avatar, IconButton, Tooltip, CircularProgress,
  Divider, Button,
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { getActivity } from '../api';
import { ACCENT, ACCENT_LIGHT, BG_SURFACE, BG_DARK, BORDER, TEXT_BRIGHT, TEXT_PRIMARY, TEXT_FAINT, TEXT_WHITE, DIVIDER, HOVER_BG } from '../theme';

const EXTERNAL_LINKS = [
  { label: 'waifu.sanakan.pl', url: 'https://waifu.sanakan.pl' },
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

  const movePinned = (user, dir) => {
    const pinned = lastVisited.filter((u) => u.pinned);
    const unpinned = lastVisited.filter((u) => !u.pinned);
    const idx = pinned.findIndex((u) => u.id === user.id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= pinned.length) return;
    [pinned[idx], pinned[newIdx]] = [pinned[newIdx], pinned[idx]];
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
              color: TEXT_BRIGHT, borderRadius: 2, px: 1.5, py: 0.6,
              fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.02em',
              textTransform: 'none',
              '&:hover': { bgcolor: HOVER_BG, color: ACCENT_LIGHT, borderColor: ACCENT_LIGHT },
            }}
          >
            {label}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, justifyContent: 'center' }}>
        <Button
          size="small"
          component="a"
          href="/cards/unique"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
              e.preventDefault();
              navigate('/cards/unique');
            }
          }}
          sx={{
            bgcolor: '#80ccff22', border: '1px solid #80ccff',
            color: '#80ccff', borderRadius: 2, px: 2, py: 0.6,
            fontSize: '0.82rem', fontWeight: 700, textTransform: 'none',
            '&:hover': { bgcolor: '#80ccff44' },
          }}
        >
          Karty Unikatowe
        </Button>
        <Button
          size="small"
          component="a"
          href="/cards/ultimate"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
              e.preventDefault();
              navigate('/cards/ultimate');
            }
          }}
          sx={{
            bgcolor: '#dc2cff22', border: '1px solid #dc2cff',
            color: '#dc2cff', borderRadius: 2, px: 2, py: 0.6,
            fontSize: '0.82rem', fontWeight: 700, textTransform: 'none',
            '&:hover': { bgcolor: '#dc2cff44' },
          }}
        >
          Karty Ultimate
        </Button>
        <Button
          size="small"
          component="a"
          href="/user/1/profile"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
              e.preventDefault();
              navigate('/user/1/profile');
            }
          }}
          sx={{
            bgcolor: `${ACCENT}22`, border: `1px solid ${ACCENT}`,
            color: ACCENT, borderRadius: 2, px: 2, py: 0.6,
            fontSize: '0.82rem', fontWeight: 700, textTransform: 'none',
            '&:hover': { bgcolor: `${ACCENT}44` },
          }}
        >
          Sanakan
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>

        <Box sx={panelSx}>
            <Typography variant="h5" sx={{ color: TEXT_WHITE, fontWeight: 700, mb: 2 }}>
            Ostatnio odwiedzane
          </Typography>
          {lastVisited.length === 0 ? (
            <Typography color="text.secondary">
              Nie widziano Cię jeszcze nigdzie...
            </Typography>
          ) : (
            <List dense disablePadding>
              {lastVisited.map((user) => (
                <ListItemButton
                  key={user.id}
                  component="a"
                  href={`/user/${user.id}/profile`}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                      e.preventDefault();
                      navigate(`/user/${user.id}/profile`);
                    }
                  }}
                  sx={{ borderRadius: 1, '&:hover': { bgcolor: HOVER_BG } }}
                >
                  <ListItemAvatar sx={{ minWidth: AVATAR_SIZE + 10 }}>
                    <Avatar
                      src={user.avatarUrl}
                      sx={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name || `User ${user.id}`}
                    sx={{ '& .MuiListItemText-primary': { color: TEXT_PRIMARY } }}
                  />
                  <Tooltip title={user.pinned ? 'Odepnij' : 'Przypnij'} arrow>
                    <IconButton
                      edge="end" size="small"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin(user); }}
                      sx={{ color: user.pinned ? ACCENT : TEXT_FAINT }}
                    >
                      {user.pinned ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  </Tooltip>
                  {user.pinned && (
                    <>
                      <Tooltip title="W górę" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); movePinned(user, -1); }}
                          sx={{ color: TEXT_FAINT, ml: 0.3, '&:hover': { color: ACCENT } }}
                        >
                          <ArrowUpwardIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="W dół" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); movePinned(user, 1); }}
                          sx={{ color: TEXT_FAINT, '&:hover': { color: ACCENT } }}
                        >
                          <ArrowDownwardIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        <Box sx={panelSx}>
            <Typography variant="h5" sx={{ color: TEXT_WHITE, fontWeight: 700, mb: 2 }}>
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
              {activity.map((item, idx) => {
                const isExternalAct = item.type === 'addedToWishlistCharacter';
                const actHref = isExternalAct
                  ? `https://shinden.pl/character/${item.targetId}`
                  : item.targetId ? `/card/${item.targetId}` : null;
                return (
                <React.Fragment key={idx}>
                  <ListItemButton
                    component={actHref ? 'a' : 'div'}
                    href={actHref || undefined}
                    target={isExternalAct ? '_blank' : undefined}
                    rel={isExternalAct ? 'noopener noreferrer' : undefined}
                    onClick={(e) => {
                      if (isExternalAct) return;
                      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                        e.preventDefault();
                        handleActivityClick(item);
                      }
                    }}
                    sx={{ borderRadius: 1, '&:hover': { bgcolor: HOVER_BG }, px: 1 }}
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
                        <Typography variant="caption" sx={{ color: TEXT_BRIGHT }}>
                          {item.subText}
                        </Typography>
                      }
                    />

                  </ListItemButton>
                  {idx < activity.length - 1 && <Divider sx={{ borderColor: DIVIDER }} />}
                </React.Fragment>
                );
              })}
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


