import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, Grid, CircularProgress, IconButton, Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getCardDetail } from '../api';
import { RARITY_COLORS, ACCENT, BG_CARD, BG_SURFACE, BORDER } from '../theme';
import CardIcons from './CardIcons';

export default function CardPage() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const rarityColor = RARITY_COLORS[card?.rarity?.toLowerCase()] || '#555';

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: '#aaa', '&:hover': { color: '#fff' } }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ color: '#ddd', fontWeight: 700, flexGrow: 1 }}>
          {card ? `${card.name || '???'} #${card.id}` : `Karta #${cardId}`}
        </Typography>
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
            <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                component="img"
                src={card.imageUrl || ''}
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
            </Grid>

            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', gap: 0.8, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
                  Właściciel:{' '}
                  <a
                    href={`/user/${card.userId || ''}`}
                    style={{ color: '#ccc', textDecoration: 'none' }}
                  >
                    {card.username}
                  </a>
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

function Row({ label, value }) {
  if (value == null) return null;
  return (
    <Typography sx={{ my: 0.4, fontSize: '0.88rem' }}>
      <span style={{ color: '#888' }}>{label}</span>{' '}
      <span style={{ color: '#e0e0e0', fontWeight: 500 }}>{value}</span>
    </Typography>
  );
}
