import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Box, Typography, Grid, CircularProgress, IconButton, Tooltip, Snackbar, Alert,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ACCENT, BG_SURFACE, BORDER } from '../theme';
import CardInfoContent, { CardStatusPills, CardTagPills } from './CardInfoContent';
import CardBadges from './CardBadges';

export default function CardDetail({ cardId, initialCard, onClose, showOwner = false, onPrev = null, onNext = null }) {
  const [card, setCard] = useState(initialCard || null);
  const [loading, setLoading] = useState(!initialCard);
  const [snackMsg, setSnackMsg] = useState('');
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    if (!cardId) return;
    if (initialCard) {
      // Already have card data — only fetch username if needed
      setCard(initialCard);
      setLoading(false);
      // username will come directly from card data once backend adds it
      return;
    }
    // Fallback: full fetch (e.g. CardPage standalone)
    import('../api').then(({ getCardDetail }) => {
      setLoading(true);
      getCardDetail(cardId)
        .then(setCard)
        .catch(() => setCard(null))
        .finally(() => setLoading(false));
    });
  }, [cardId]);

  const copyWid = () => {
    if (card?.id) {
      navigator.clipboard.writeText(String(card.id));
      setSnackMsg('Skopiowano WID!');
    }
  };

  const copyLink = () => {
    if (card?.id) {
      const url = `${window.location.origin}/card/${card.id}`;
      navigator.clipboard.writeText(url);
      setSnackMsg('Skopiowano link!');
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

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
            sm: 'min(800px, calc(100vw - 30px))',
            md: 'min(960px, calc(100vw - 40px))',
            lg: 'min(1040px, calc(100vw - 60px))',
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
          <>
            <Grid container columnSpacing={{ xs: 2.25, sm: 3.75 }} alignItems="flex-start">
              <Grid item xs={12} sm={5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
                <Box
                  component="img"
                  src={(showStats ? card.imageUrl : (card.profileImageUrl || card.imageUrl)) || ''}
                  alt={card.name || ''}
                  sx={{
                    width: '100%',
                    maxWidth: 380,
                    display: 'block',
                    height: 'auto',
                    borderRadius: 1,
                  }}
                  onError={(e) => { e.target.style.opacity = '0'; }}
                />
                <CardBadges card={card} sx={{ mt: 2.5, justifyContent: 'center' }} />
              </Grid>

              <Grid item xs={12} sm={7}>
                <Box sx={sx.details}>
                  <CardInfoContent card={card} showOwner={showOwner} />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mt: 1.5 }}>
                  <CardStatusPills card={card} />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mt: 0.8 }}>
                  <CardTagPills card={card} />
                </Box>
              </Grid>
            </Grid>
          </>
        ) : (
          <Typography color="error" sx={{ py: 4, textAlign: 'center' }}>
            Nie udało się załadować karty #{cardId}.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={sx.actions}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={showStats ? 'Ukryj statystyki' : 'Pokaż statystyki'} arrow>
            <IconButton onClick={() => setShowStats((p) => !p)} size="small" sx={{ color: '#aaa', '&:hover': { color: ACCENT } }}>
              {showStats ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Poprzednia karta" arrow>
            <span>
              <IconButton onClick={onPrev} disabled={!onPrev} size="small" sx={sx.navBtn}>
                <NavigateBeforeIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Następna karta" arrow>
            <span>
              <IconButton onClick={onNext} disabled={!onNext} size="small" sx={sx.navBtn}>
                <NavigateNextIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Kopiuj WID" arrow>
            <IconButton onClick={copyWid} size="small" sx={{ color: '#aaa', '&:hover': { color: ACCENT } }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Kopiuj link do karty" arrow>
            <IconButton onClick={copyLink} size="small" sx={{ color: '#aaa', '&:hover': { color: ACCENT } }}>
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} size="small" sx={{ color: '#aaa', '&:hover': { color: '#fff' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogActions>

      <Snackbar open={!!snackMsg} autoHideDuration={2000} onClose={() => setSnackMsg('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackMsg('')}>{snackMsg}</Alert>
      </Snackbar>
    </Dialog>
  );
}

const sx = {
  content: {
    bgcolor: BG_SURFACE, color: '#c1c1c1', overflowX: 'hidden', overflowY: 'auto',
    p: { xs: 1.2, sm: 2, md: 2.5 },
  },
  details: {
    maxHeight: { xs: 'none', sm: '68vh' },
    overflowY: { xs: 'visible', sm: 'auto' },
    pr: { xs: 0, sm: 1 },
  },
  actions: {
    bgcolor: BG_SURFACE,
    borderTop: `1px solid ${BORDER}`,
    justifyContent: 'space-between', gap: 1, py: 1, px: 2.5,
  },
  navBtn: {
    color: '#fff', minWidth: 48,
    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
    '&.Mui-disabled': { color: '#444' },
  },
};
