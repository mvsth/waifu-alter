import { createTheme } from '@mui/material/styles';

// --- Theme mode (persisted in localStorage) ---
const VALID_MODES = ['deep', 'dark', 'soft'];
export const THEME_MODE = (() => {
  try { const m = localStorage.getItem('themeMode'); return VALID_MODES.includes(m) ? m : 'dark'; } catch { return 'dark'; }
})();

const M = THEME_MODE;
const pick = (deep, dark, soft) => ({ deep, dark, soft })[M];

// --- Palette ---
export const ACCENT = '#9b30ff';
export const ACCENT_LIGHT = '#b366ff';
export const BG_DARK    = pick('#000000', '#121212', '#29292c');
export const BG_CARD    = pick('#0e0e0e', '#1c1c1c', '#323236');
export const BG_SURFACE = pick('#0b0b0b', '#191919', '#2f2f33');
export const BG_HEADER  = pick('#0a0a0a', '#181818', '#2e2e32');
export const BORDER     = pick('#1c1c1c', '#313131', '#4c4c54');

// Always-dark constants (for toolbar/sort bar — same regardless of theme)
export const TOOLBAR_BG      = '#1b1b1b';
export const TOOLBAR_BG_CARD = '#1e1e1e';
export const TOOLBAR_BG_DARK = '#141414';
export const TOOLBAR_BORDER  = '#333333';

// Text helpers for components with hardcoded grays
export const TEXT_PRIMARY   = pick('#d2d2d2', '#e0e0e0', '#eeeeee');
export const TEXT_SECONDARY = pick('#929292', '#a0a0a0', '#b2b2b2');
export const TEXT_MUTED     = pick('#7a7a7a', '#888888', '#aeaeae');
export const TEXT_DIM       = pick('#5a5a5a', '#666666', '#949494');
export const TEXT_FAINT     = pick('#424242', '#555555', '#828282');
export const TEXT_SOFT      = pick('#9a9a9a', '#aaaaaa', '#bdbdbd');
export const TEXT_BRIGHT    = pick('#bababa', '#cccccc', '#dfdfdf');
export const TEXT_WHITE     = '#ffffff';
export const ROW_ALT        = pick('#121212', '#202224', '#37373c');
export const DIVIDER        = pick('#1a1a1a', '#282828', '#424248');
export const SLIDER_RAIL    = pick('#040404', '#111111', '#26262a');
export const APPBAR_BG      = pick('rgba(0,0,0,0.90)', 'rgba(6,6,6,0.82)', 'rgba(34,34,38,0.88)');
export const APPBAR_BORDER  = pick('rgba(255,255,255,0.04)', 'rgba(255,255,255,0.07)', 'rgba(255,255,255,0.09)');
export const HOVER_BG       = pick('#222222', '#313131', '#48484c');
export const LIST_HOVER     = pick('#242424', '#333333', '#4a4a4d');
export const NAV_OVERLAY    = pick('rgba(0,0,0,0.76)', 'rgba(6,6,6,0.65)', 'rgba(29,29,32,0.72)');
export const NAV_BORDER     = pick('rgba(255,255,255,0.04)', 'rgba(255,255,255,0.07)', 'rgba(255,255,255,0.09)');
export const CARD_BORDER_UNSEL = pick('rgba(255,255,255,0.08)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.14)');
export const OVERLAY_BG     = pick('rgba(0,0,0,0.85)', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.70)');
export const STAT_BOX_1     = pick('#0e0e12', '#1c1c20', '#323238');
export const STAT_BOX_2     = pick('#09090d', '#17171b', '#2d2d34');
export const STAT_BOX_3     = pick('#0a0a0e', '#18181c', '#2e2e34');
export const PANEL_DARK     = pick('#000002', '#0c0c10', '#222228');
export const PANEL_BORDER   = pick('#242424', '#383838', '#54545c');

// Card tile bg — always one step darker than theme bg
export const CARD_TILE_BG   = pick('#0e0e0e', '#151515', '#1c1c1c');

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
