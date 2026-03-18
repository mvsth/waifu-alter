import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Box, Typography, Grid, CircularProgress, Button, IconButton,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getCardDetail } from '../api';
import { ACCENT, BG_SURFACE, BORDER } from '../theme';
import CardInfoContent from './CardInfoContent';
import CardBadges from './CardBadges';

export default function CardDetail({ cardId, cards, currentIdx, onNavigate, onClose }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cardId) return;
    setLoading(true);
    getCardDetail(cardId)
      .then(setCard)
      .catch(() => setCard(null))
      .finally(() => setLoading(false));
  }, [cardId]);

  const canPrev = currentIdx > 0;
  const canNext = cards && currentIdx < cards.length - 1;

  const goPrev = useCallback(() => { if (canPrev) onNavigate(currentIdx - 1); }, [canPrev, currentIdx, onNavigate]);
  const goNext = useCallback(() => { if (canNext) onNavigate(currentIdx + 1); }, [canNext, currentIdx, onNavigate]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goPrev, goNext, onClose]);

  return (
    <Dialog
      open onClose={onClose} maxWidth={false}
      scroll="paper"
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          height: '100dvh',
        },
      }}
      slotProps={{ backdrop: { sx: {
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        backgroundColor: 'rgba(0,0,0,0.8)',
      } } }}
      PaperProps={{
        sx: {
          bgcolor: BG_SURFACE,
          border: `1px solid ${BORDER}`,
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
          borderRadius: { xs: 1.5, sm: 2 },
          width: {
            xs: 'calc(100vw - 32px)',
            sm: 'min(910px, calc(100vw - 30px))',
            md: 'min(1000px, calc(100vw - 40px))',
          },
          maxWidth: 'none',
          maxHeight: { xs: 'calc(100dvh - 32px)', sm: 'calc(100dvh - 40px)' },
          m: { xs: 2, sm: 2.5 },
          overscrollBehavior: 'contain',
        },
      }}
    >
      <DialogContent sx={sx.content}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: ACCENT }} />
          </Box>
        ) : card ? (
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ height: '100%' }}>
            <Grid item xs={12} sm={5.5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: { xs: 0, sm: 1.5 } }}>
              <Box
                component="img"
                src={card.imageUrl || ''}
                alt={card.name || ''}
                sx={{
                  width: '100%',
                  maxWidth: { xs: 340, sm: 320 },
                  display: 'block',
                  aspectRatio: '225 / 350',
                  maxHeight: { xs: '50vh', sm: '70vh' },
                  objectFit: 'contain',
                  objectPosition: 'center',
                  borderRadius: 1,
                }}
                onError={(e) => { e.target.style.opacity = '0'; }}
              />
              <CardBadges card={card} />
            </Grid>

            <Grid item xs={12} sm={6.5}>
              <Box sx={sx.details}>
                <CardInfoContent card={card} />
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Typography color="error" sx={{ py: 4, textAlign: 'center' }}>
            Nie udało się załadować karty #{cardId}.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={sx.actions}>
        <Button onClick={goPrev} disabled={!canPrev} sx={sx.navBtn}>
          <ArrowBackIcon />
        </Button>
        <Button onClick={goNext} disabled={!canNext} sx={sx.navBtn}>
          <ArrowForwardIcon />
        </Button>
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={onClose} size="small" sx={{ color: '#aaa', '&:hover': { color: '#fff' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}

const sx = {
  content: {
    bgcolor: BG_SURFACE, color: '#c1c1c1', overflowX: 'hidden', overflowY: 'auto',
    p: { xs: 1.2, sm: 1.5, md: 1.8 },
  },
  details: {
    fontSize: 16,
    maxHeight: { xs: 'none', sm: '60vh' },
    overflowY: { xs: 'visible', sm: 'auto' },
    pr: { xs: 0, sm: 1 },
  },
  actions: {
    bgcolor: BG_SURFACE,
    borderTop: `1px solid ${BORDER}`,
    justifyContent: 'center', gap: 2, py: 1,
  },
  navBtn: {
    color: '#fff', minWidth: 48,
    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
    '&.Mui-disabled': { color: '#444' },
  },
};
