import React, { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function Prank() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        px: 1.5,
        py: '6px',
        background: 'linear-gradient(90deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
        boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
        // mobile: full width
        left: 0,
        right: 0,
        borderBottom: '1px solid #ef4444',
        // desktop: shrink to content, centered
        '@media (min-width: 600px)': {
          left: '50%',
          right: 'auto',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          borderRadius: '0 0 8px 8px',
          border: '1px solid #ef4444',
          borderTop: 'none',
        },
      }}
    >
      <WarningAmberIcon sx={{ color: '#fbbf24', fontSize: 18, flexShrink: 0, mr: 1 }} />
      <Typography
        variant="body2"
        sx={{
          color: '#fef2f2',
          fontWeight: 600,
          fontSize: '0.8rem',
          letterSpacing: '0.01em',
          textAlign: 'center',
          lineHeight: 1.4,
          flex: 1,
        }}
      >
        30% Kart graczy zostanie usuniętych w dniu{' '}
        <Box component="span" sx={{ color: '#fbbf24', fontWeight: 700 }}>
          04.04.2026
        </Box>{' '}
        ze względu na przepełnioną bazę danych.
      </Typography>
      <IconButton
        size="small"
        onClick={() => setVisible(false)}
        sx={{
          ml: 1,
          p: '4px',
          color: '#fca5a5',
          flexShrink: 0,
          border: '1px solid rgba(252,165,165,0.4)',
          borderRadius: 1,
          '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' },
        }}
        aria-label="Zamknij powiadomienie"
      >
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
}
