import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Grid, CircularProgress, IconButton, Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getCardDetail } from '../api';
import { ACCENT, BG_SURFACE, BORDER } from '../theme';
import CardIcons from './CardIcons';

const SSS_GRADIENT = 'linear-gradient(135deg, #ffb3cc 0%, #d4aaff 25%, #a8d8ff 50%, #aaffd8 75%, #fff0a8 100%)';
const CARD_RARITY_SOLID = {
  sss: SSS_GRADIENT, ss: '#ff658e', s: '#ffe149', a: '#f49244',
  b: '#a556d8',       c: '#0069ab', d: '#3e7315', e: '#848484',
};
const CARD_RARITY_TEXT_DARK = new Set(['sss', 'ss', 's', 'a']);

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

  const rarityKey = card?.rarity?.toLowerCase();
  const rarityBg = CARD_RARITY_SOLID[rarityKey] || '#555';
  const isGradient = rarityKey === 'sss';
  const rarityTextColor = CARD_RARITY_TEXT_DARK.has(rarityKey) ? '#1a1a1a' : '#fff';

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
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5, mt: { xs: 0, sm: 0.5 }, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <Box sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    background: rarityBg, borderRadius: 1.5, px: 1.6, py: 0.5, minWidth: 52,
                  }}>
                    <Typography sx={{ fontSize: '0.6rem', color: rarityTextColor, opacity: 0.7, lineHeight: 1, mb: 0.2, fontWeight: 700, letterSpacing: '0.08em' }}>RANGA</Typography>
                    <Typography sx={{ fontSize: '1.05rem', color: rarityTextColor, fontWeight: 800, lineHeight: 1 }}>{(card.rarity || '?').toUpperCase()}</Typography>
                  </Box>
                  {card.dere && (
                    <Box sx={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      bgcolor: '#231a35', border: '1px solid #7b4fc455',
                      borderRadius: 1.5, px: 1.4, py: 0.5, minWidth: 60,
                    }}>
                      <Typography sx={{ fontSize: '0.6rem', color: '#9b70cc', lineHeight: 1, mb: 0.2, fontWeight: 700, letterSpacing: '0.08em' }}>DERE</Typography>
                      <Typography sx={{ fontSize: '0.88rem', color: '#c9a0ff', fontWeight: 700, lineHeight: 1 }}>{card.dere}</Typography>
                    </Box>
                  )}
                  {card.affection && (
                    <Box sx={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      bgcolor: '#2a1a20', border: '1px solid #ff6b6b44',
                      borderRadius: 1.5, px: 1.4, py: 0.5, minWidth: 60,
                    }}>
                      <Typography sx={{ fontSize: '0.6rem', color: '#e08090', lineHeight: 1, mb: 0.2, fontWeight: 700, letterSpacing: '0.08em' }}>RELACJA</Typography>
                      <Typography sx={{ fontSize: '0.88rem', color: '#ffaaa5', fontWeight: 700, lineHeight: 1 }}>{card.affection}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                    <CardIcons card={card} />
                  </Box>
                </Box>

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
                      <Box key={tag} sx={{
                        px: 1, py: 0.35,
                        bgcolor: '#1e2632', border: '1px solid #4a6a9a55',
                        borderRadius: 1, fontSize: '0.78rem', color: '#8ab4e8', fontWeight: 600,
                      }}>
                        {tag}
                      </Box>
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
    <Typography sx={{ my: 0.4, fontSize: '0.95rem' }}>
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
