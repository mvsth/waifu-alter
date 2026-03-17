import { createTheme } from '@mui/material/styles';

export const ACCENT = '#9b30ff';
export const ACCENT_LIGHT = '#b366ff';
export const BG_DARK = '#141414';
export const BG_CARD = '#1e1e1e';
export const BG_SURFACE = '#1b1b1b';
export const BG_HEADER = '#1a1a1a';
export const BORDER = '#333333';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: ACCENT },
    background: {
      default: BG_DARK,
      paper: BG_CARD,
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#a0a0a0',
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
