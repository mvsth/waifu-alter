import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';

export default function LazyCard({ children, height = 320 }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  if (!visible) {
    return <Box ref={ref} sx={{ minHeight: height }} />;
  }

  return <>{children}</>;
}
