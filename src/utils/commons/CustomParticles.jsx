import React, { useEffect, useMemo, useRef } from 'react';
import { Box, useTheme } from '@mui/material';

// ========================
// ParticleField Component (.js version)
// ========================

export default function ParticleField({
  density = 18,
  speed = 0.25,
  linkDistance = 120,
  radius = { min: 1, max: 2.2 },
  opacity = 0.6,
  hoverRepel = 0.6,
  scrollReactive = true,
  color,
  zIndex = -1,
  borderRadius,
  pointerEventsNone = false,
  className,
  sx,
}) {
  const theme = useTheme();
  const canvasRef = useRef(null);

  const strokeColor = useMemo(
    () => color || theme.palette.primary?.main || '#51b2b6',
    [color, theme]
  );

  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    let particles = [];

    const computeCount = () => {
      const area = (width * height) / 100000;
      return Math.max(20, Math.floor(area * density));
    };

    const rand = (min, max) => Math.random() * (max - min) + min;

    const initParticles = () => {
      const count = computeCount();
      particles = new Array(count).fill(0).map(() => ({
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-speed, speed),
        vy: rand(-speed, speed),
        r: rand(radius.min, radius.max),
      }));
    };

    const mouse = { x: -9999, y: -9999 };
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    let scrollBoost = 0;
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      if (!scrollReactive) return;
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      scrollBoost = Math.max(-2, Math.min(2, scrollBoost + delta * 0.002));
    };

    const bgClear = () => {
      ctx.clearRect(0, 0, width, height);
    };

    const draw = () => {
      bgClear();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 140 * 140) {
          const dist = Math.sqrt(dist2) || 0.001;
          const force = ((140 - dist) / 140) * hoverRepel;
          p.vx += (dx / dist) * force * 0.4;
          p.vy += (dy / dist) * force * 0.4;
        }

        p.vy += scrollBoost * 0.02;

        p.vx *= 0.995;
        p.vy *= 0.995;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }

      ctx.lineWidth = 1;
      ctx.strokeStyle = hexToRgba(strokeColor, opacity * 0.5);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d <= linkDistance) {
            ctx.globalAlpha = (1 - d / linkDistance) * opacity;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = hexToRgba(strokeColor, opacity);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      scrollBoost *= 0.96;

      raf = requestAnimationFrame(draw);
    };

    const hexToRgba = (hex, a) => {
      if (hex.startsWith('rgb')) return hex.replace(/\)$/, ' , ' + a + ')');
      let c = hex.replace('#', '');
      if (c.length === 3)
        c = c
          .split('')
          .map((ch) => ch + ch)
          .join('');
      const r = parseInt(c.slice(0, 2), 16);
      const g = parseInt(c.slice(2, 4), 16);
      const b = parseInt(c.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    resize();
    let raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [
    density,
    speed,
    linkDistance,
    radius.min,
    radius.max,
    opacity,
    hoverRepel,
    scrollReactive,
    strokeColor,
    dpr,
  ]);

  return (
    <Box
      className={className}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex,
        borderRadius,
        overflow: borderRadius ? 'hidden' : undefined,
        pointerEvents: pointerEventsNone ? 'none' : 'auto',
        ...sx,
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </Box>
  );
}

export function ParticleHeroDemo() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: 380, md: 520 },
        bgcolor: theme.palette.background.default,
      }}
    >
      <ParticleField
        density={22}
        speed={0.25}
        linkDistance={140}
        hoverRepel={0.75}
        opacity={0.55}
        pointerEventsNone
        scrollReactive
      />
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          px: 3,
          textAlign: 'center',
        }}
      >
        <Box>
          <Box component="h1" sx={{ m: 0, fontSize: { xs: 28, md: 44 }, fontWeight: 800 }}>
            Scroll-Reactive Particles
          </Box>
          <Box component="p" sx={{ opacity: 0.8, mt: 1, mb: 0 }}>
            Pure canvas, MUI-friendly, theme-aware. Hover to repel, scroll to energize.
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
