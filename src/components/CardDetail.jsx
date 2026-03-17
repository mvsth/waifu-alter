import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Chip, Grid, CircularProgress, IconButton, Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getCardDetail } from '../api';
import { RARITY_COLORS, ACCENT, BG_SURFACE, BORDER } from '../theme';
import CardIcons from './CardIcons';

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

  const rarityColor = RARITY_COLORS[card?.rarity?.toLowerCase()] || '#555';

  return (
    <Dialog
      open onClose={onClose} maxWidth={false}
      slotProps={{ backdrop: { sx: { backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.8)' } } }}
      PaperProps={{
        sx: {
          bgcolor: BG_SURFACE,
          border: `1px solid ${BORDER}`,
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
          borderRadius: 2,
          width: {
            xs: 'calc(100vw - 16px)',
            sm: 'min(792px, calc(100vw - 30px))',
            md: 'min(864px, calc(100vw - 40px))',
          },
          maxWidth: 'none',
          maxHeight: 'calc(100vh - 40px)',
          m: { xs: 0.75, sm: 2 },
        },
      }}
    >
      <DialogTitle sx={sx.title}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', flexGrow: 1 }}>
            {card ? `${card.name || '???'} #${card.id}` : `Karta #${cardId}`}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#aaa' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={sx.content}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: ACCENT }} />
          </Box>
        ) : card ? (
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ height: '100%' }}>
            <Grid item xs={12} sm={5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
              <Box
                component="img"
                src={card.imageUrl || ''}
                alt={card.name || ''}
                sx={{
                  width: '100%',
                  maxWidth: { xs: 300, sm: 280 },
                  display: 'block',
                  aspectRatio: '225 / 350',
                  maxHeight: { xs: '50vh', sm: '62vh' },
                  objectFit: 'contain',
                  objectPosition: 'center',
                  borderRadius: 1,
                }}
                onError={(e) => { e.target.style.opacity = '0'; }}
              />
            </Grid>

            <Grid item xs={12} sm={7}>
              <Box sx={sx.details}>
                <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5, mt: { xs: 0, sm: 0.5 }, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip
                    label={(card.rarity || '?').toUpperCase()} size="small"
                    sx={{ bgcolor: rarityColor, color: '#fff', fontWeight: 700, height: 24 }}
                  />
                  {card.dere && <Chip label={card.dere} size="small" variant="outlined" sx={{ borderColor: '#444', color: '#bbb', height: 24 }} />}
                  {card.affection && <Chip label={card.affection} size="small" variant="outlined" sx={{ borderColor: '#444', color: '#bbb', height: 24 }} />}
                </Box>

                <CardIcons card={card} />

                <Row label="❤️ HP" value={card.baseHealth != null ? `${card.finalHealth} / ${card.baseHealth}` : null} />
                <Row label="⚔️ Atak" value={card.attack} />
                <Row label="🛡️ Obrona" value={card.defence} />
                <Row label="💪 Moc" value={card.cardPower != null ? (Math.round(card.cardPower * 100) / 100) : null} />
                <Row label="✨ EXP" value={card.expCnt != null ? `${Math.round(card.expCnt * 100) / 100} / ${card.expCntForNextLevel ?? '?'}` : null} />
                <Row label="🔄 Restarty" value={card.restartCnt} />
                <Row label="⬆️ Ulepszenia" value={card.upgradesCnt} />
                <Row label="📦 Źródło" value={card.source} />
                <Row label="📅 Utworzono" value={card.createdAt ? new Date(card.createdAt).toLocaleDateString('pl-PL') : null} />
                {card.whoWantsCount > 0 && <Row label="💕 Chce" value={card.whoWantsCount} />}


                {card.tags?.length > 0 && (
                  <Box sx={{ mt: 1.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {card.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined"
                        sx={{ borderColor: '#555', fontSize: '0.75rem', color: '#aaa' }} />
                    ))}
                  </Box>
                )}

                {card.username && (
                  <Typography variant="body2" sx={{ color: '#888', mt: 1.5 }}>
                    Właściciel: <span style={{ color: '#ccc' }}>{card.username}</span>
                  </Typography>
                )}

                {card.characterUrl && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <a href={card.characterUrl} target="_blank" rel="noopener noreferrer"
                      style={{ color: ACCENT, textDecoration: 'none' }}>
                      → Shinden
                    </a>
                  </Typography>
                )}
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
      </DialogActions>
    </Dialog>
  );
}

function Row({ label, value }) {
  if (value == null) return null;
  return (
    <Typography sx={{ my: 0.4, fontSize: '0.88rem' }}>
      <span style={{ color: '#888' }}>{label}</span>{' '}
      <span style={{ color: '#e0e0e0', fontWeight: 500 }}>{value}</span>
    </Typography>
  );
}

const sx = {
  title: {
    bgcolor: BG_SURFACE, color: '#fff', py: 1, px: { xs: 1.4, sm: 2 },
    borderBottom: `1px solid ${BORDER}`,
  },
  content: {
    bgcolor: BG_SURFACE, color: '#c1c1c1', overflowX: 'hidden', overflowY: 'auto',
    p: { xs: 1.2, sm: 1.5, md: 1.8 },
  },
  details: {
    fontSize: 16,
    maxHeight: { xs: 'none', sm: '60vh' },
    overflowY: { xs: 'visible', sm: 'auto' },
    pr: { xs: 0, sm: 1 },
    '& p': { mt: '4px', mb: '4px' },
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
