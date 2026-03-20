import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Grid, Tooltip, CircularProgress, Divider,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { getUserProfile, getUsername } from '../api';
import { ACCENT, ACCENT_LIGHT, BG_DARK, BG_SURFACE, BG_CARD, BORDER } from '../theme';
import UserNavBar from './UserNavBar';
import ExpeditionsDialog from './ExpeditionsDialog';
import CardDetail from './CardDetail';

const SSS_GRADIENT = 'linear-gradient(135deg, #ffb3cc 0%, #d4aaff 25%, #a8d8ff 50%, #aaffd8 75%, #fff0a8 100%)';
const RARITY_BAR = {
  SSS: SSS_GRADIENT,
  SS: '#ff658e', S: '#ffe149', A: '#f49244',
  B: '#a556d8', C: '#0069ab', D: '#3e7315', E: '#848484',
};
const RARITY_ORDER = ['SSS', 'SS', 'S', 'A', 'B', 'C', 'D', 'E'];
const RARITY_SOLID = {
  SSS: '#f5c8d8', SS: '#ff658e', S: '#ffe149', A: '#f49244',
  B: '#a556d8', C: '#0069ab', D: '#3e7315', E: '#848484',
};

function sortGallery(gallery, order) {
  if (!order?.length) return gallery;
  const sorted = [...gallery];
  [...order].reverse().forEach((id) => {
    if (id === 0) return;
    const idx = sorted.findIndex((c) => c.id === id);
    if (idx > 0) sorted.unshift(sorted.splice(idx, 1)[0]);
  });
  return sorted;
}

const MD_COMPONENTS = (userColor) => ({
  p: ({ children }) => <p style={{ margin: '3px 0', lineHeight: 1.45 }}>{children}</p>,
  h1: ({ children }) => <p style={{ margin: '5px 0', fontWeight: 800, fontSize: '1.05rem', color: userColor }}>{children}</p>,
  h2: ({ children }) => <p style={{ margin: '5px 0', fontWeight: 700, fontSize: '0.98rem', color: userColor }}>{children}</p>,
  h3: ({ children }) => <p style={{ margin: '4px 0', fontWeight: 700, fontSize: '0.94rem', color: userColor }}>{children}</p>,
  h4: ({ children }) => <p style={{ margin: '3px 0', fontWeight: 700, fontSize: '0.92rem', color: userColor }}>{children}</p>,
  ul: ({ children }) => <ul style={{ textAlign: 'left', paddingLeft: 18, margin: '3px 0' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ textAlign: 'left', paddingLeft: 18, margin: '3px 0' }}>{children}</ol>,
  li: ({ children }) => <li style={{ margin: '1px 0' }}>{children}</li>,
  strong: ({ children }) => <strong style={{ color: '#fff' }}>{children}</strong>,
  em: ({ children }) => <em style={{ color: '#ddd' }}>{children}</em>,
  img: ({ src, alt }) => (
    <img src={src} alt={alt}
      style={{ maxWidth: '100%', borderRadius: 4, margin: '4px auto', display: 'block' }} />
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ color: ACCENT_LIGHT }}>{children}</a>
  ),
});

export default function Profile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [nick, setNick] = useState(null);
  const [error, setError] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(null);
  const [expOpen, setExpOpen] = useState(false);

  useEffect(() => { setProfile(null); setNick(null); setError(false); }, [userId]);

  useEffect(() => {
    getUserProfile(userId)
      .then((data) => {
        if (data.gallery && data.galleryOrder) data.gallery = sortGallery(data.gallery, data.galleryOrder);
        setProfile(data);
      })
      .catch(() => setError(true));
  }, [userId]);

  useEffect(() => { getUsername(userId).then(setNick).catch(() => {}); }, [userId]);

  const userColor = profile?.foregroundColor || ACCENT;

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h4" sx={{ color: ACCENT, fontWeight: 700 }}>404</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>Nie odnaleziono profilu.</Typography>
      </Box>
    );
  }
  if (!profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: ACCENT }} size={80} />
      </Box>
    );
  }

  const cc = profile.cardsCount || {};

  return (
    <Box>
      <UserNavBar userId={userId} profile={profile} username={nick}
        onExpeditions={() => setExpOpen(true)} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3.5}>
          <Box sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle2" sx={{ color: userColor, mb: 1.5, fontWeight: 700, textAlign: 'center', fontSize: '0.9rem', letterSpacing: '0.08em' }}>
              ZASADY WYMIANY
            </Typography>
            {profile.exchangeConditions ? (
              <Box sx={{
                color: '#c1c1c1', fontSize: '1rem',
                textAlign: 'center',
                '& ul, & ol': { textAlign: 'left' },
              }}>
                <ReactMarkdown components={MD_COMPONENTS(userColor)}>
                  {profile.exchangeConditions}
                </ReactMarkdown>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#555', fontStyle: 'italic' }}>
                Brak zasad wymiany
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', pt: '3%', pb: '2%' }}>
          {profile.waifu ? (
            <Box sx={{ textAlign: 'center', maxWidth: 360 }}>
              <Box
                component="img"
                src={profile.waifu.profileImageUrl || profile.waifu.imageUrl}
                alt={profile.waifu.name}
                sx={{ maxWidth: '100%', width: 342, borderRadius: 2, display: 'block', mx: 'auto' }}
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
              <Typography sx={{ color: '#555' }}>Brak waifu</Typography>
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={3.5}>
          <Box sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', gap: 0.7, mb: 1.2 }}>
              <Box sx={{ flex: 1, bgcolor: '#1e1e22', borderRadius: 1, py: 0.9, textAlign: 'center' }}>
                <Typography sx={{ color: '#777', fontSize: '0.72rem', display: 'block', lineHeight: 1.2 }}>Posiadane</Typography>
                <Typography sx={{ color: '#e0e0e0', fontWeight: 800, fontSize: '1.4rem', lineHeight: 1.1 }}>
                  {cc.total || 0}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, bgcolor: '#19191d', borderRadius: 1, py: 0.9, textAlign: 'center' }}>
                <Typography sx={{ color: '#555', fontSize: '0.72rem', display: 'block', lineHeight: 1.2 }}>Limit</Typography>
                <Typography sx={{ color: '#4a4a4a', fontWeight: 800, fontSize: '1.4rem', lineHeight: 1.1 }}>
                  {cc.max || 0}
                </Typography>
              </Box>
            </Box>

            {cc.total > 0 && (
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', borderRadius: 1, overflow: 'hidden', height: 12 }}>
                  {RARITY_ORDER.map((r) => {
                    const count = cc[r] || 0;
                    if (!count) return null;
                    return (
                      <Tooltip key={r} title={`${r}: ${count}`} arrow>
                        <Box sx={{
                          width: `${(count / cc.total) * 100}%`,
                          background: RARITY_BAR[r], minWidth: 3, transition: 'width 0.3s',
                        }} />
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            )}

            <Box sx={{ borderTop: `3px solid ${BORDER}`, mb: 1 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.7, mb: 1.2 }}>
              {RARITY_ORDER.map((r) => {
                const isSss = r === 'SSS';
                return (
                  <Box key={r} sx={{ textAlign: 'center' }}>
                    <Box sx={{
                      borderRadius: 0.75, py: 0.65, mb: 0.4,
                      background: isSss ? SSS_GRADIENT : RARITY_SOLID[r],
                    }}>
                      <Typography sx={{ fontWeight: 900, fontSize: '0.78rem', color: '#000', lineHeight: 1 }}>{r}</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1, color: '#e0e0e0' }}>
                      {cc[r] || 0}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {profile.wallet && (
              <Box sx={{ pt: 0.8, borderTop: `3px solid ${BORDER}` }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5 }}>

                  <Box sx={{ bgcolor: '#1a1a1e', borderRadius: 1, px: 0.5, py: 0.65, textAlign: 'center' }}>
                    <Typography sx={{ color: userColor, fontWeight: 800, fontSize: '0.7rem', lineHeight: 1.2, letterSpacing: '0.03em' }}>Karma</Typography>
                    <Typography sx={{ color: '#ccc', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>
                      {(profile.karma ?? 0).toLocaleString('pl-PL', { maximumFractionDigits: 0 })}
                    </Typography>
                  </Box>
                  {['TC', 'AC'].map((k) => (
                    <Box key={k} sx={{ bgcolor: '#1a1a1e', borderRadius: 1, px: 0.5, py: 0.65, textAlign: 'center' }}>
                      <Typography sx={{ color: userColor, fontWeight: 800, fontSize: '0.7rem', lineHeight: 1.2, letterSpacing: '0.03em' }}>{k}</Typography>
                      <Typography sx={{ color: '#ccc', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>
                        {(profile.wallet[k] ?? 0).toLocaleString('pl-PL')}
                      </Typography>
                    </Box>
                  ))}
                  {['CT', 'PC', 'SC'].map((k) => (
                    <Box key={k} sx={{ bgcolor: '#1a1a1e', borderRadius: 1, px: 0.5, py: 0.65, textAlign: 'center', mt: 0.6 }}>
                      <Typography sx={{ color: userColor, fontWeight: 800, fontSize: '0.7rem', lineHeight: 1.2, letterSpacing: '0.03em' }}>{k}</Typography>
                      <Typography sx={{ color: '#ccc', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>
                        {(profile.wallet[k] ?? 0).toLocaleString('pl-PL')}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {profile.gallery?.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, mt: 1 }}>
            <Box sx={{ flex: 1, height: 2, background: `linear-gradient(90deg, transparent, ${userColor}44)` }} />
            <Typography sx={{
              px: 3, color: userColor, fontWeight: 800, fontSize: '0.8rem',
              letterSpacing: '0.18em', textTransform: 'uppercase', flexShrink: 0,
            }}>Galeria</Typography>
            <Box sx={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${userColor}44, transparent)` }} />
          </Box>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: { xs: 1.5, sm: 2 },
          }}>
            {profile.gallery.map((card, idx) => (
              <Box
                key={card.id}
                component="a"
                href={`/card/${card.id}`}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey || e.shiftKey) return;
                  e.preventDefault();
                  setGalleryIdx(idx);
                }}
                sx={{
                  cursor: 'pointer', borderRadius: 2,
                  overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.2s',
                  display: 'block', textDecoration: 'none',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' },
                  width: { xs: 'calc(50% - 10px)', sm: '204px', md: '216px' },
                  flexShrink: 0,
                  px: '4px',
                }}
              >
                <Box component="img"
                  src={card.profileImageUrl || card.imageUrl}
                  alt={card.name} loading="lazy"
                  sx={{
                    width: '100%', display: 'block',
                    aspectRatio: '225 / 350', objectFit: 'contain', objectPosition: 'center',
                    borderRadius: 1.5,
                  }}
                  onError={(e) => { e.target.style.opacity = '0'; }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {galleryIdx != null && profile.gallery?.[galleryIdx] && (
        <CardDetail
          cardId={profile.gallery[galleryIdx].id}
          initialCard={profile.gallery[galleryIdx]}
          onClose={() => setGalleryIdx(null)}
          onPrev={galleryIdx > 0 ? () => setGalleryIdx((i) => i - 1) : null}
          onNext={galleryIdx < profile.gallery.length - 1 ? () => setGalleryIdx((i) => i + 1) : null}
          showOwner
        />
      )}

      <ExpeditionsDialog
        open={expOpen} onClose={() => setExpOpen(false)}
        expeditions={profile.expeditions || []} userColor={userColor}
      />
    </Box>
  );
}
