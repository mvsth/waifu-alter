import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, CircularProgress, IconButton, Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { getCardDetail } from '../api';
import { ACCENT, BG_CARD, BORDER } from '../theme';
import CardInfoContent from './CardInfoContent';
import CardBadges from './CardBadges';

export default function CardPage() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    setLoading(true);
    setCard(null);
    getCardDetail(cardId)
      .then(setCard)
      .catch(() => setCard(null))
      .finally(() => setLoading(false));
  }, [cardId]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: '#aaa', '&:hover': { color: '#fff' } }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={() => setShowStats((p) => !p)}
          startIcon={showStats ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
          size="small"
          variant="outlined"
          sx={{
            borderColor: BORDER,
            color: '#aaa',
            textTransform: 'none', fontSize: '0.8rem',
            '&:hover': { borderColor: ACCENT, color: ACCENT },
          }}
        >
          {showStats ? 'Ukryj statystyki' : 'Pokaż statystyki'}
        </Button>
        <Button
          onClick={copyLink}
          startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
          size="small"
          variant="outlined"
          sx={{
            borderColor: copied ? '#4caf50' : BORDER,
            color: copied ? '#81c784' : '#aaa',
            textTransform: 'none', fontSize: '0.8rem',
            '&:hover': { borderColor: ACCENT, color: ACCENT },
          }}
        >
          {copied ? 'Skopiowano!' : 'Kopiuj link'}
        </Button>
      </Box>

      <Box sx={{ bgcolor: BG_CARD, borderRadius: 2, border: `1px solid ${BORDER}`, p: { xs: 1.5, sm: 2.5 } }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: ACCENT }} />
          </Box>
        ) : card ? (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                component="img"
                src={(showStats ? card.imageUrl : (card.profileImageUrl || card.imageUrl)) || ''}
                alt={card.name || ''}
                sx={{
                  width: '100%',
                  maxWidth: 260,
                  aspectRatio: '225 / 350',
                  objectFit: 'contain',
                  borderRadius: 1,
                  display: 'block',
                }}
                onError={(e) => { e.target.style.opacity = '0'; }}
              />
              <CardBadges card={card} />
            </Grid>

            <Grid item xs={12} sm={8}>
              <CardInfoContent card={card} />
            </Grid>
          </Grid>
        ) : (
          <Typography color="error" sx={{ py: 4, textAlign: 'center' }}>
            Nie udało się załadować karty #{cardId}.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
