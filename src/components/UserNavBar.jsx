import React, { useState, useEffect } from 'react';
import { keyframes } from '@mui/system';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Avatar, Typography, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StyleIcon from '@mui/icons-material/Style';
import ExploreIcon from '@mui/icons-material/Explore';
import FavoriteIcon from '@mui/icons-material/FavoriteBorder';
import BuildIcon from '@mui/icons-material/Build';
import bgDefault from './g4g44gg.png';
import { ACCENT, BG_DARK, BG_SURFACE, BORDER, TEXT_WHITE, NAV_OVERLAY, NAV_BORDER, BADGE_BG } from '../theme';
import { hasWorkshop } from '../workshop';

const shimmer = keyframes`
  0%   { transform: translateX(-220%) skewX(-12deg); }
  30%  { transform: translateX(-220%) skewX(-12deg); }
  70%  { transform: translateX(320%)  skewX(-12deg); }
  100% { transform: translateX(320%)  skewX(-12deg); }
`;

export default function UserNavBar({ userId, profile, username, onExpeditions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [wrpData, setWrpData] = useState(null);

  useEffect(() => {
    fetch('/ranking.json')
      .then((r) => r.json())
      .then((json) => {
        const uid = parseInt(userId, 10);
        const player = json.players?.find((p) => p.userId === uid);
        if (player) setWrpData({ rank: player.rank, wrp: player.wrp });
        else setWrpData(null);
      })
      .catch(() => {});
  }, [userId]);

  const userColor = profile?.foregroundColor || ACCENT;
  const bgImg = profile?.backgroundImageUrl || null;
  const bgPos = profile?.backgroundPosition || 35;

  const path = location.pathname;
  const activeTab = path.includes('/workshop') ? 'workshop'
    : path.includes('/cards') ? 'cards'
    : path.includes('/wishlist') ? 'wishlist'
    : 'profile';

  const workshopActive = hasWorkshop(userId);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: <PersonIcon sx={{ fontSize: 20 }} />,
      href: `/user/${userId}/profile`,
      action: () => navigate(`/user/${userId}/profile`) },
    { id: 'cards', label: 'Karty', icon: <StyleIcon sx={{ fontSize: 20 }} />,
      href: `/user/${userId}/cards`,
      action: () => navigate(`/user/${userId}/cards`) },
    ...(workshopActive ? [{ id: 'workshop', label: 'Warsztat', icon: <BuildIcon sx={{ fontSize: 20 }} />,
      href: `/user/${userId}/workshop`,
      action: () => navigate(`/user/${userId}/workshop`) }] : []),
    { id: 'expeditions', label: 'Wyprawy', icon: <ExploreIcon sx={{ fontSize: 20 }} />,
      action: onExpeditions, badge: profile?.expeditions?.length || 0 },
    { id: 'wishlist', label: 'Lista życzeń', icon: <FavoriteIcon sx={{ fontSize: 20 }} />,
      href: `/user/${userId}/wishlist`,
      action: () => navigate(`/user/${userId}/wishlist`) },
  ];

  return (
    <Box sx={{
      mb: 3,
      borderRadius: 0,
      overflow: 'hidden',
      position: 'relative',
      isolation: 'isolate',
      mx: { xs: -1, sm: -2, md: -3 },
      mt: '-64px',
      pt: '64px',
    }}>
      <Box sx={{
        position: 'absolute', inset: 0,
        backgroundImage: bgImg ? `url(${bgImg})` : `url(${bgDefault})`,
        backgroundSize: 'cover', backgroundPosition: `50% ${bgPos}%`,
      }}>
        {profile?.foregroundImageUrl && (
          <Box sx={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: `url(${profile.foregroundImageUrl})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `${profile.foregroundPosition || 0}% top`,
            backgroundSize: 'auto 100%',
          }} />
        )}
      </Box>
      <Box sx={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
        pointerEvents: 'none',
      }} />
      <Box sx={{ height: 225, position: 'relative' }} />

      <Box sx={{
        position: 'relative', zIndex: 2,
        bgcolor: NAV_OVERLAY,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: `1px solid ${NAV_BORDER}`,
        borderRadius: 0,
        px: { xs: 1.5, sm: 2.5 }, py: 1.0,
        display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap',
      }}>
        <Avatar
          src={userId == 1 ? 'https://sanakan.pl/sanakan.jpg'
            : `https://cdn.shinden.eu/cdn1/avatars/225x350/${userId}.jpg`}
          sx={{
            width: 120, height: 120, mt: { xs: 0, sm: -9.5 },
            border: `4px solid ${userColor}`, bgcolor: BG_DARK,
            boxShadow: `0 4px 16px ${userColor}33`,
          }}
        />
        <Box sx={{ minWidth: 0, flex: '0 1 auto', mr: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ minWidth: 0, ml: { xs: 1, sm: 2 } }}>
            <Typography variant="h6" noWrap sx={{
              color: '#fff', fontWeight: 700, lineHeight: 1.2,
              fontSize: { xs: '1.27rem', sm: '1.61rem' },
            }}>
              {username || `Użytkownik ${userId}`}
            </Typography>
            {(userId === '1' || profile?.userTitle) && (
              <Typography variant="body2" noWrap sx={{ color: userColor, opacity: 0.85, display: 'block', fontSize: '0.98rem' }}>
                {userId === '1' ? 'Safeguard' : profile.userTitle}
              </Typography>
            )}
          </Box>
          {wrpData && (() => {
            const isPodium = wrpData.rank <= 3;

            return (
              <Box
                component="a"
                href="/ranking"
                onClick={(e) => { if (!e.ctrlKey && !e.metaKey && !e.shiftKey) { e.preventDefault(); navigate('/ranking'); } }}
                sx={{
                  position: 'relative', overflow: 'hidden', flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', gap: 0.7,
                  px: 1.5, py: 0.9, borderRadius: '20px',
                  bgcolor: BADGE_BG,
                  border: `2px solid ${userColor}55`,
                  textDecoration: 'none', cursor: 'pointer',
                  transition: 'background-color 0.15s, border-color 0.15s',
                  '&:hover': { borderColor: userColor },
                }}
              >
                <Box sx={{
                  position: 'absolute', top: 0, left: 0,
                  width: '55%', height: '100%',
                  background: `linear-gradient(75deg,
                    transparent 0%,
                    rgba(255,255,255,0.00) 30%,
                    rgba(255,255,255,0.07) 38%,
                    rgba(255,255,255,0.16) 44%,
                    rgba(255,255,255,0.26) 50%,
                    rgba(255,255,255,0.16) 56%,
                    rgba(255,255,255,0.07) 62%,
                    rgba(255,255,255,0.00) 70%,
                    transparent 100%)`,
                  animation: `${shimmer} 4s ease-in-out infinite`,
                  pointerEvents: 'none',
                }} />
                {isPodium && (
                  <Typography sx={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0 }}>
                    {wrpData.rank === 1 ? '🥇' : wrpData.rank === 2 ? '🥈' : '🥉'}
                  </Typography>
                )}
                {!isPodium && (
                  <Typography sx={{ fontSize: '0.93rem', fontWeight: 800, lineHeight: 1 }}>
                    <span style={{ color: userColor }}>#</span><span style={{ color: '#fff' }}>{wrpData.rank}</span>
                  </Typography>
                )}
                <Typography sx={{ fontSize: '0.93rem', fontWeight: 800, color: userColor, lineHeight: 1 }}>
                  WRP
                </Typography>
                <Typography sx={{ fontSize: '0.93rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                  {wrpData.wrp.toLocaleString('pl-PL')}
                </Typography>
              </Box>
            );
          })()}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', alignItems: 'center' }}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const isPopup = tab.id === 'expeditions';
            return (
              <Button
                key={tab.id}
                disableRipple
                component={!isPopup && tab.href ? 'a' : undefined}
                href={!isPopup && tab.href ? tab.href : undefined}
                startIcon={tab.icon}
                onClick={(e) => {
                  if (!isPopup && tab.href) {
                    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                      e.preventDefault();
                      tab.action();
                    }
                  } else {
                    tab.action(e);
                  }
                }}
                size="small"
                variant="outlined"
                sx={{
                  px: { xs: 1.8, sm: 2.5 }, py: 0.9, borderRadius: '20px',
                  textTransform: 'none', fontWeight: 600, fontSize: '0.93rem',
                  bgcolor: isActive ? userColor : 'transparent',
                  color: isActive ? '#000' : '#d0d0d0',
                  borderColor: isActive ? userColor : NAV_BORDER,
                  borderWidth: '2px',
                  minWidth: 'auto',
                  transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
                  '&:hover': {
                    bgcolor: isActive ? userColor : `${userColor}18`,
                    borderColor: userColor,
                    color: isActive ? '#000' : '#e0e0e0',
                    borderWidth: '2px',
                  },
                }}
              >
                {tab.label}
                {isPopup && tab.badge > 0 && (
                  <Box component="span" sx={{
                    ml: 0.7, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: 18, height: 18, borderRadius: '9px', fontSize: 11, fontWeight: 700,
                    bgcolor: isActive ? 'rgba(0,0,0,0.25)' : `${userColor}33`,
                    color: isActive ? '#000' : userColor, px: 0.5,
                  }}>
                    {tab.badge}
                  </Box>
                )}
              </Button>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
