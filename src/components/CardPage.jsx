import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, CircularProgress, IconButton, Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getCardDetail } from '../api';
import { ACCENT, BG_CARD, BG_SURFACE, BORDER } from '../theme';
import CardIcons from './CardIcons';

const SSS_GRADIENT = 'linear-gradient(135deg, #ffb3cc 0%, #d4aaff 25%, #a8d8ff 50%, #aaffd8 75%, #fff0a8 100%)';
const CARD_RARITY_SOLID = {
  sss: SSS_GRADIENT, ss: '#ff658e', s: '#ffe149', a: '#f49244',
  b: '#a556d8',       c: '#0069ab', d: '#3e7315', e: '#848484',
};
const CARD_RARITY_TEXT_DARK = new Set(['sss', 'ss', 's', 'a']);

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

  const rarityKey = card?.rarity?.toLowerCase();
  const rarityBg = CARD_RARITY_SOLID[rarityKey] || '#555';
  const rarityTextColor = CARD_RARITY_TEXT_DARK.has(rarityKey) ? '#1a1a1a' : '#fff';

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
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
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
                  Właściciel:{' '}
                  {card.shindenId ? (
                    <span
                      onClick={() => navigate(`/user/${card.shindenId}/profile`)}
                      style={{ color: ACCENT, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {card.username}
                    </span>
                  ) : (
                    <span style={{ color: '#ccc' }}>{card.username}</span>
                  )}
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
    <Typography sx={{ my: 0.4, fontSize: '0.95rem' }}>
      <span style={{ color: '#888' }}>{label}</span>{' '}
      <span style={{ color: '#e0e0e0', fontWeight: 500 }}>{value}</span>
    </Typography>
  );
}


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
                  {card.shindenId ? (
                    <span
                      onClick={() => navigate(`/user/${card.shindenId}/profile`)}
                      style={{ color: ACCENT, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {card.username}
                    </span>
                  ) : (
                    <span style={{ color: '#ccc' }}>{card.username}</span>
                  )}
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
