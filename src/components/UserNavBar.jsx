import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Avatar, Typography, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StyleIcon from '@mui/icons-material/Style';
import ExploreIcon from '@mui/icons-material/Explore';
import FavoriteIcon from '@mui/icons-material/FavoriteBorder';
import bgDefault from './g4g44gg.png';
import { ACCENT, BG_DARK, BG_SURFACE, BORDER } from '../theme';

export default function UserNavBar({ userId, profile, username, onExpeditions }) {
  const navigate = useNavigate();
  const location = useLocation();

  const userColor = profile?.foregroundColor || ACCENT;
  const bgImg = profile?.backgroundImageUrl || null;
  const bgPos = profile?.backgroundPosition || 35;

  const path = location.pathname;
  const activeTab = path.includes('/cards') ? 'cards'
    : path.includes('/wishlist') ? 'wishlist'
    : 'profile';

  const tabs = [
    { id: 'profile', label: 'Profil', icon: <PersonIcon sx={{ fontSize: 20 }} />,
      action: () => navigate(`/user/${userId}/profile`) },
    { id: 'cards', label: 'Karty', icon: <StyleIcon sx={{ fontSize: 20 }} />,
      action: () => navigate(`/user/${userId}/cards`) },
    { id: 'expeditions', label: 'Wyprawy', icon: <ExploreIcon sx={{ fontSize: 20 }} />,
      action: onExpeditions, badge: profile?.expeditions?.length || 0 },
    { id: 'wishlist', label: 'Lista życzeń', icon: <FavoriteIcon sx={{ fontSize: 20 }} />,
      action: () => navigate(`/user/${userId}/wishlist`) },
  ];

  return (
    <Box sx={{ mb: 3, borderRadius: '12px', overflow: 'hidden', position: 'relative', isolation: 'isolate' }}>
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
      <Box sx={{ height: 195, position: 'relative' }} />

      <Box sx={{
        position: 'relative', zIndex: 2,
        bgcolor: 'rgba(8,8,8,0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0 0 12px 12px',
        px: { xs: 1.5, sm: 2.5 }, py: 1.5,
        display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap',
      }}>
        <Avatar
          src={userId == 1 ? 'https://sanakan.pl/sanakan.jpg'
            : `https://cdn.shinden.eu/cdn1/avatars/225x350/${userId}.jpg`}
          sx={{
            width: 110, height: 110, mt: { xs: 0, sm: -5.5 },
            border: `4px solid ${userColor}`, bgcolor: BG_DARK,
            boxShadow: `0 4px 16px ${userColor}33`,
          }}
        />
        <Box sx={{ minWidth: 0, flex: '0 1 auto', mr: 'auto' }}>
          <Typography variant="h6" noWrap sx={{
            color: '#fff', fontWeight: 700, lineHeight: 1.2,
            fontSize: { xs: '1.27rem', sm: '1.61rem' },
          }}>
            {username || `Użytkownik ${userId}`}
          </Typography>
          {profile?.userTitle && (
            <Typography variant="body2" noWrap sx={{ color: userColor, opacity: 0.85, display: 'block', fontSize: '0.98rem' }}>
              {profile.userTitle}
            </Typography>
          )}
          {profile?.waifu && (
            <Typography noWrap sx={{ color: '#c8b8e8', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.88rem', mt: 0.4, fontWeight: 500 }}>
              <FavoriteIcon sx={{ fontSize: 14, color: '#e088bb' }} />
              {profile.waifu.name}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const isPopup = tab.id === 'expeditions';
            return (
              <Button
                key={tab.id}
                startIcon={tab.icon}
                onClick={tab.action}
                size="small"
                variant={isActive ? 'contained' : 'outlined'}
                sx={{
                  px: { xs: 1.8, sm: 2.5 }, py: 0.9, borderRadius: '20px',
                  textTransform: 'none', fontWeight: 600, fontSize: '0.93rem',
                  bgcolor: isActive ? userColor : 'transparent',
                  color: isActive ? '#000' : '#d0d0d0',
                  borderColor: isActive ? userColor : 'rgba(255,255,255,0.2)',
                  borderWidth: '2px',
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: isActive ? userColor : `${userColor}18`,
                    borderColor: isActive ? userColor : userColor,
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
