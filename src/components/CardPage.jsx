import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Grid, CircularProgress, Button,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { getCardDetail } from '../api';
import { ACCENT, BG_CARD, BORDER, TEXT_SOFT, TEXT_WHITE } from '../theme';
import CardInfoContent, { CardStatusPills, CardTagPills } from './CardInfoContent';
import CardBadges from './CardBadges';

export default function CardPage() {
  const { cardId } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedWid, setCopiedWid] = useState(false);
  const [showStats, setShowStats] = useState(() => localStorage.getItem('hideCardStats') !== 'true');

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

  const copyWid = () => {
    navigator.clipboard.writeText(String(cardId));
    setCopiedWid(true);
    setTimeout(() => setCopiedWid(false), 2000);
  };

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={() => setShowStats((p) => !p)}
          startIcon={showStats ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
          size="small"
          variant="outlined"
          sx={{
            borderColor: BORDER,
            color: TEXT_SOFT,
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
            color: copied ? '#81c784' : TEXT_SOFT,
            textTransform: 'none', fontSize: '0.8rem',
            '&:hover': { borderColor: ACCENT, color: ACCENT },
          }}
        >
          {copied ? 'Skopiowano!' : 'Kopiuj link'}
        </Button>
        <Button
          onClick={copyWid}
          startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
          size="small"
          variant="outlined"
          sx={{
            borderColor: copiedWid ? '#4caf50' : BORDER,
            color: copiedWid ? '#81c784' : TEXT_SOFT,
            textTransform: 'none', fontSize: '0.8rem',
            '&:hover': { borderColor: ACCENT, color: ACCENT },
          }}
        >
          {copiedWid ? 'Skopiowano!' : 'Kopiuj WID'}
        </Button>
      </Box>

      <Box sx={{ bgcolor: BG_CARD, borderRadius: 2, border: `1px solid ${BORDER}`, p: { xs: 1.5, sm: 2.5 } }}>
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
                    height: 'auto',
                    display: 'block',
                    borderRadius: 1,
                  }}
                  onError={(e) => { e.target.style.opacity = '0'; }}
                />
                <CardBadges card={card} sx={{ mt: 2.5, justifyContent: 'center' }} />
              </Grid>

              <Grid item xs={12} sm={7}>
                <CardInfoContent card={card} />
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
      </Box>
    </Box>
  );
}
