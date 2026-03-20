import React from 'react';
import { Box, Typography } from '@mui/material';

const SSS_GRADIENT = 'linear-gradient(135deg, #ffb3cc 0%, #d4aaff 25%, #a8d8ff 50%, #aaffd8 75%, #fff0a8 100%)';
const ULTIMATE_GRADIENT = 'linear-gradient(135deg, #c850c0 0%, #8b5cf6 50%, #f59e0b 100%)';

const RARITY_BG = {
  sss: SSS_GRADIENT, ss: '#ff658e', s: '#ffe149', a: '#f49244',
  b: '#a556d8', c: '#0069ab', d: '#3e7315', e: '#848484',
};
const RARITY_DARK_TEXT = new Set(['sss', 'ss', 's', 'a']);

const QUALITY_NAME = {
  broken: 'Broken', alpha: 'Alpha', beta: 'Beta', gamma: 'Gamma',
  delta: 'Delta', epsilon: 'Epsilon', zeta: 'Zeta', eta: 'Eta',
  theta: 'Theta', jota: 'Jota', lambda: 'Lambda', sigma: 'Sigma',
  omega: 'Omega',
};

function qualityLabel(q) {
  if (q == null) return null;
  return QUALITY_NAME[String(q).toLowerCase()] ?? String(q);
}

function Badge({ label, value, bg, color, border }) {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: bg || '#1f1f2e', border: `1px solid ${border || '#333'}`,
      borderRadius: 1.5, px: 1.55, py: 0.5, minWidth: 53,
    }}>
      <Typography sx={{
        fontSize: '0.55rem', color: `${color || '#888'}88`,
        lineHeight: 1, mb: 0.25, fontWeight: 700, letterSpacing: '0.1em',
      }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '1.01rem', color: color || '#ccc', fontWeight: 700, lineHeight: 1 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function CardBadges({ card, sx: sxOverride }) {
  if (!card) return null;

  const rarityKey = card.rarity?.toLowerCase();
  const isUlt = card.isUltimate;
  const quality = qualityLabel(card.ultimateQuality);

  return (
    <Box sx={{ display: 'flex', gap: 0.8, mt: 1.2, flexWrap: 'wrap', justifyContent: 'center', ...sxOverride }}>
      {isUlt ? (
        <Box sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: ULTIMATE_GRADIENT, borderRadius: 1.5, px: 1.6, py: 0.5, minWidth: 56,
        }}>
          <Typography sx={{
            fontSize: '0.5rem', color: '#ffffffbb', lineHeight: 1, mb: 0.25,
            fontWeight: 700, letterSpacing: '0.1em',
          }}>
            ULTIMATE
          </Typography>
          <Typography sx={{
            fontSize: '0.92rem', color: '#fff', fontWeight: 800, lineHeight: 1,
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}>
            {quality || '?'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: RARITY_BG[rarityKey] || '#555', borderRadius: 1.5,
          px: 1.6, py: 0.5, minWidth: 52,
        }}>
          <Typography sx={{
            fontSize: '0.5rem',
            color: RARITY_DARK_TEXT.has(rarityKey) ? '#1a1a1a99' : '#ffffff99',
            lineHeight: 1, mb: 0.25, fontWeight: 700, letterSpacing: '0.1em',
          }}>
            RANGA
          </Typography>
          <Typography sx={{
            fontSize: '0.92rem',
            color: RARITY_DARK_TEXT.has(rarityKey) ? '#1a1a1a' : '#fff',
            fontWeight: 800, lineHeight: 1,
          }}>
            {(card.rarity || '?').toUpperCase()}
          </Typography>
        </Box>
      )}
      {card.dere && (
        <Badge label="DERE" value={card.dere.charAt(0).toUpperCase() + card.dere.slice(1).toLowerCase()} bg="#1a1a2a" border="#7b4fc433" color="#b08adf" />
      )}
      {card.affection && (
        <Badge label="RELACJA" value={card.affection} bg="#1e1520" border="#ff6b6b22" color="#d4918a" />
      )}
    </Box>
  );
}
