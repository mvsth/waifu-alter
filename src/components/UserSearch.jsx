import React, { useState, useRef, useEffect } from 'react';
import {
  TextField, Paper, List, ListItemButton, ListItemText,
  ListItemAvatar, Avatar, InputAdornment, ClickAwayListener, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../api';
import { ACCENT, BG_DARK, BG_SURFACE, BORDER, TEXT_MUTED, LIST_HOVER } from '../theme';

function saveVisit(user) {
  const MAX = 12;
  let list = [];
  try { list = JSON.parse(localStorage.getItem('lastVisited')) || []; } catch {}
  list = list.filter(Boolean);
  const existing = list.findIndex((u) => u.id === user.id);
  const pinned = existing >= 0 ? list[existing].pinned : false;
  if (existing >= 0) list.splice(existing, 1);
  const entry = { id: user.id, name: user.name || user.username, avatarUrl: user.avatarUrl, pinned };
  const pinnedItems = list.filter((u) => u.pinned);
  const unpinned = list.filter((u) => !u.pinned);
  if (pinned) {
    pinnedItems.unshift(entry);
  } else {
    unpinned.unshift(entry);
  }
  const merged = [...pinnedItems, ...unpinned].slice(0, MAX);
  localStorage.setItem('lastVisited', JSON.stringify(merged));
}

export default function UserSearch({ width = 300 }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchUsers(query);
        const list = Array.isArray(data?.value) ? data.value : Array.isArray(data) ? data : [];
        setResults(list);
        setOpen(list.length > 0);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  const handleSelect = (user) => {
    setOpen(false);
    setQuery('');
    saveVisit(user);
    navigate(`/user/${user.id}/profile`);
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div style={{ position: 'relative', width }}>
        <TextField
          size="small"
          placeholder="Szukaj użytkownika..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: TEXT_MUTED }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              bgcolor: BG_DARK,
              borderRadius: 2,
              '& fieldset': { borderColor: BORDER },
              '&:hover fieldset': { borderColor: ACCENT },
              '&.Mui-focused fieldset': { borderColor: ACCENT },
            },
          }}
        />

        {open && results.length > 0 && (
          <Paper
            sx={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              zIndex: 1300, mt: 0.5, maxHeight: 320, overflow: 'auto',
              bgcolor: BG_SURFACE,
            }}
          >
            <List dense disablePadding>
              {results.map((user) => (
                <ListItemButton
                  key={user.id}
                  component="a"
                  href={`/user/${user.id}/profile`}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                      e.preventDefault();
                      handleSelect(user);
                    } else {
                      saveVisit(user);
                      setOpen(false);
                      setQuery('');
                    }
                  }}
                  sx={{ '&:hover': { bgcolor: LIST_HOVER } }}
                >
                  {user.avatarUrl && (
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar src={user.avatarUrl} sx={{ width: 28, height: 28 }} />
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    primary={user.name || user.username || `User ${user.id}`}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}

        {loading && (
          <Typography
            variant="caption"
            sx={{ position: 'absolute', top: '100%', left: 8, mt: 0.5, color: TEXT_MUTED }}
          >
            Szukam...
          </Typography>
        )}
      </div>
    </ClickAwayListener>
  );
}
