import { createTheme } from '@mui/material/styles';

// --- Theme mode (persisted in localStorage) ---
export const THEME_MODE = (() => {
  try { return localStorage.getItem('themeMode') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
})();

const IS_LIGHT = THEME_MODE === 'light';

// --- Palette ---
export const ACCENT = '#9b30ff';
export const ACCENT_LIGHT = '#b366ff';
export const BG_DARK    = IS_LIGHT ? '#37373a' : '#141414';
export const BG_CARD    = IS_LIGHT ? '#404044' : '#1e1e1e';
export const BG_SURFACE = IS_LIGHT ? '#3d3d41' : '#1b1b1b';
export const BG_HEADER  = IS_LIGHT ? '#3c3c40' : '#1a1a1a';
export const BORDER     = IS_LIGHT ? '#5a5a62' : '#333333';

// Text helpers for components with hardcoded grays
export const TEXT_PRIMARY   = IS_LIGHT ? '#ececec' : '#e0e0e0';
export const TEXT_SECONDARY = IS_LIGHT ? '#b0b0b0' : '#a0a0a0';
export const TEXT_MUTED     = IS_LIGHT ? '#acacac' : '#888888';
export const TEXT_DIM       = IS_LIGHT ? '#929292' : '#666666';
export const TEXT_FAINT     = IS_LIGHT ? '#808080' : '#555555';
export const TEXT_SOFT      = IS_LIGHT ? '#bbbbbb' : '#aaaaaa';
export const TEXT_BRIGHT    = IS_LIGHT ? '#dddddd' : '#cccccc';
export const TEXT_WHITE     = IS_LIGHT ? '#ffffff' : '#ffffff';
export const ROW_ALT        = IS_LIGHT ? '#45454a' : '#222426';
export const DIVIDER        = IS_LIGHT ? '#505056' : '#2a2a2a';
export const SLIDER_RAIL    = IS_LIGHT ? '#343438' : '#131313';
export const APPBAR_BG      = IS_LIGHT ? 'rgba(48,48,52,0.88)' : 'rgba(8,8,8,0.82)';
export const APPBAR_BORDER  = IS_LIGHT ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.07)';
export const HOVER_BG       = IS_LIGHT ? '#56565a' : '#333333';
export const LIST_HOVER     = IS_LIGHT ? '#58585a' : '#353535';
export const NAV_OVERLAY    = IS_LIGHT ? 'rgba(43,43,46,0.72)' : 'rgba(8,8,8,0.65)';
export const NAV_BORDER     = IS_LIGHT ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.07)';
export const CARD_BORDER_UNSEL = IS_LIGHT ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.12)';
export const OVERLAY_BG     = IS_LIGHT ? 'rgba(0,0,0,0.70)' : 'rgba(0,0,0,0.75)';
export const STAT_BOX_1     = IS_LIGHT ? '#404046' : '#1e1e22';
export const STAT_BOX_2     = IS_LIGHT ? '#3b3b42' : '#19191d';
export const STAT_BOX_3     = IS_LIGHT ? '#3c3c42' : '#1a1a1e';
export const PANEL_DARK     = IS_LIGHT ? '#303036' : '#0e0e12';
export const PANEL_BORDER   = IS_LIGHT ? '#62626a' : '#3a3a3a';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: ACCENT },
    background: {
      default: BG_DARK,
      paper: BG_CARD,
    },
    text: {
      primary: TEXT_PRIMARY,
      secondary: TEXT_SECONDARY,
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, sans-serif',
  },
});

export default theme;

export const RARITY_COLORS = {
  sss: '#FFD700', ss: '#FF4466', s: '#AA44FF',
  a: '#4488FF',   b: '#44BB44',  c: '#44BBBB',
  d: '#FF8844',   e: '#888888',
};
