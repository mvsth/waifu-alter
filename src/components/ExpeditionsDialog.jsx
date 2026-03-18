import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Snackbar, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ACCENT, BG_SURFACE, BORDER } from '../theme';
import CardDetail from './CardDetail';

function timeDiff(startTime, maxTime, color) {
  let sec = Math.abs(new Date(startTime) - new Date()) / 1000;
  const min = sec / 60;
  const d = Math.floor(sec / 86400); sec -= d * 86400;
  const h = Math.floor(sec / 3600) % 24; sec -= h * 3600;
  const m = Math.floor(sec / 60) % 60;
  const str = `${d > 0 ? d + 'd ' : ''}${h}h ${m}m`;
  return min > maxTime ? <span style={{ color }}>{str}</span> : str;
}

export default function ExpeditionsDialog({ open, onClose, expeditions, userColor }) {
  const color = userColor || ACCENT;
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [sorted, setSorted] = useState(expeditions || []);
  const [snackOpen, setSnackOpen] = useState(false);
  const [cardIdx, setCardIdx] = useState(null);

  useEffect(() => { setSorted(expeditions || []); }, [expeditions]);

  const handleSort = (prop) => {
    const asc = orderBy === prop && order === 'asc';
    setOrder(asc ? 'desc' : 'asc');
    setOrderBy(prop);
    const s = [...(expeditions || [])].sort((a, b) => {
      const va = prop === 'name' || prop === 'id' ? a.card[prop] : a[prop];
      const vb = prop === 'name' || prop === 'id' ? b.card[prop] : b[prop];
      return asc ? (va < vb ? 1 : -1) : (va > vb ? 1 : -1);
    });
    setSorted(s);
  };

  const copyCmd = (cardId) => {
    navigator.clipboard.writeText('s.wyprawa koniec ' + cardId);
    setSnackOpen(true);
  };

  const cards = sorted.map((e) => e.card);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.8)' } } }}
        PaperProps={{ sx: { bgcolor: BG_SURFACE, backgroundImage: 'none', borderRadius: 2, border: `1px solid ${BORDER}`, boxShadow: '0 12px 32px rgba(0,0,0,0.5)' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', py: 1.2, px: 2, borderBottom: `1px solid ${BORDER}` }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', flexGrow: 1 }}>
            Wyprawy{' '}
            <Typography component="span" sx={{ color: '#666', fontWeight: 500, fontSize: '0.82rem' }}>
              {sorted.length}/10
            </Typography>
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#666', '&:hover': { color: '#aaa' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1, sm: 1.5 } }}>
          {sorted.length === 0 ? (
            <Typography sx={{ color: '#888', textAlign: 'center', py: 4 }}>
              Brak aktywnych wypraw.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {[
                      { id: 'id', label: 'ID' },
                      { id: 'name', label: 'Nazwa' },
                      { id: 'expedition', label: 'Typ' },
                      { id: 'startTime', label: 'Czas' },
                    ].map((col) => (
                      <TableCell key={col.id} align="center"
                        sx={{ color: '#aaa', borderBottom: `1px solid ${BORDER}`, fontWeight: 600, py: 0.8, fontSize: '0.8rem' }}>
                        <TableSortLabel
                          active={orderBy === col.id}
                          direction={orderBy === col.id ? order : 'asc'}
                          onClick={() => handleSort(col.id)}
                          sx={{ color: `${color} !important`, '& .MuiTableSortLabel-icon': { color: `${color} !important` } }}
                        >
                          {col.label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sorted.map((exp, idx) => (
                    <TableRow key={exp.card.id} sx={{
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                    }}>
                      <TableCell align="center"
                        sx={{ color: '#888', cursor: 'copy', borderBottom: `1px solid #2a2a2a`, py: 0.8, fontSize: '0.82rem' }}
                        onClick={() => copyCmd(exp.card.id)}>
                        {exp.card.id}
                      </TableCell>
                      <TableCell align="center" sx={{ borderBottom: `1px solid #2a2a2a`, py: 0.8 }}>
                        <Typography component="span" onClick={() => setCardIdx(idx)}
                          sx={{ color, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, '&:hover': { opacity: 0.8 } }}>
                          {exp.card.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#999', borderBottom: `1px solid #2a2a2a`, py: 0.8, fontSize: '0.82rem' }}>
                        {exp.expedition}
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#999', borderBottom: `1px solid #2a2a2a`, py: 0.8, fontSize: '0.82rem' }}>
                        {timeDiff(exp.startTime, exp.maxTime, color)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)}>
          Skopiowano polecenie.
        </Alert>
      </Snackbar>

      {cardIdx != null && cards[cardIdx] && (
        <CardDetail
          cardId={cards[cardIdx].id}
          initialCard={cards[cardIdx]}
          onClose={() => setCardIdx(null)}
        />
      )}
    </>
  );
}
