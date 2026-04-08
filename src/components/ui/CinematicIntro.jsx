import React, { useRef, useEffect, useState, useCallback } from 'react';

// ── Timing constants (ms) ──────────────────────────────────────
const GATHER_DUR = 1400;   // particles drift toward logo
const HOLD_DUR   =  700;   // logo is held, subtle glow
const BREAK_DUR  =  650;   // logo shatters outward
const FADE_DUR   =  550;   // CSS opacity fade after break ends

// ── Easing helpers ─────────────────────────────────────────────
const easeInOut = (t) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
const easeIn    = (t) => t * t * t;
const easeOut   = (t) => 1 - Math.pow(1 - t, 2.5);

/**
 * CinematicIntro
 *
 * Flow:
 *   1. gather  — fine pixels drift from random → logo positions
 *   2. hold    — assembled logo glows subtly
 *   3. break   — pixels burst outward, opacity drops
 *               → onComplete() fires HERE so 3D assembly starts in parallel
 *   4. fade    — dark background CSS-fades to 0, revealing 3D below
 */
export function CinematicIntro({ onComplete }) {
  const canvasRef   = useRef(null);
  const dataRef     = useRef(null);         // pre-computed pixel positions
  const [opacity, setOpacity] = useState(1);
  const completedRef = useRef(false);

  // ── Load SVG → pixel data ──────────────────────────────────
  useEffect(() => {
    const SZ = 120;   // internal sampling resolution (120×120 = good density)
    const img = new Image();
    img.onload = () => {
      const tmp = document.createElement('canvas');
      tmp.width = SZ; tmp.height = SZ;
      const ctx = tmp.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, SZ, SZ);
      const raw = ctx.getImageData(0, 0, SZ, SZ).data;

      const pxs = [];
      for (let y = 0; y < SZ; y++) {
        for (let x = 0; x < SZ; x++) {
          const i = (y * SZ + x) * 4;
          if (raw[i + 3] < 25) continue;               // transparent → skip

          // Pre-compute everything random so the draw loop doesn't flicker
          const cx = x - SZ / 2;
          const cy = y - SZ / 2;
          const breakAngle = Math.atan2(cy, cx) + (Math.random() - 0.5) * 1.6;
          pxs.push({
            tx: x / SZ,                                // 0-1 target position (logo)
            ty: y / SZ,
            sx: Math.random(),                         // 0-1 random start position
            sy: Math.random(),
            ba: breakAngle,                            // burst direction
            bd: 0.5 + Math.random() * 0.7,             // burst distance multiplier
            brightness: 0.7 + Math.random() * 0.3,    // slight luminance variety
          });
        }
      }
      dataRef.current = pxs;
    };
    img.src = '/assets/svgviewer-output.svg';
  }, []);

  // ── Animation loop ─────────────────────────────────────────
  useEffect(() => {
    let raf;
    let phase     = 'gather';
    let phaseTs   = null;   // timestamp when current phase started

    const draw = (ts) => {
      if (!phaseTs) phaseTs = ts;

      const cvs = canvasRef.current;
      if (!cvs || !dataRef.current) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const ctx = cvs.getContext('2d');
      const W   = cvs.width;
      const H   = cvs.height;
      ctx.clearRect(0, 0, W, H);

      // Logo occupies 76% of canvas, centered
      const logoSz = Math.min(W, H) * 0.76;
      const ox = (W - logoSz) / 2;
      const oy = (H - logoSz) / 2;

      const phaseDur = phase === 'gather' ? GATHER_DUR
                     : phase === 'hold'   ? HOLD_DUR
                     :                      BREAK_DUR;
      const raw = Math.min((ts - phaseTs) / phaseDur, 1);
      const t   = phase === 'gather' ? easeInOut(raw)
                : phase === 'hold'   ? raw
                :                      easeIn(raw);       // accelerate outward

      const pxs = dataRef.current;

      pxs.forEach((px) => {
        const lx = px.tx * logoSz + ox;   // logo target position
        const ly = px.ty * logoSz + oy;

        let x, y, alpha;

        if (phase === 'gather') {
          x     = px.sx * W + (lx - px.sx * W) * t;
          y     = px.sy * H + (ly - px.sy * H) * t;
          alpha = (0.08 + easeOut(t) * 0.9) * px.brightness;

        } else if (phase === 'hold') {
          x     = lx;
          y     = ly;
          // Subtle breathing glow: 0.82..0.96
          alpha = (0.82 + Math.sin(ts * 0.0042) * 0.07) * px.brightness;

        } else {
          // break: fly from logo outward
          const dist = px.bd * t * Math.min(W, H) * 0.62;
          x     = lx + Math.cos(px.ba) * dist;
          y     = ly + Math.sin(px.ba) * dist;
          alpha = Math.max(0, (1 - t * 1.35) * px.brightness);
        }

        if (alpha < 0.01) return;
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
        ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
      });

      // ── Phase transition ──────────────────────────────────
      if (raw >= 1) {
        if (phase === 'gather') {
          phase   = 'hold';
          phaseTs = ts;

        } else if (phase === 'hold') {
          phase   = 'break';
          phaseTs = ts;
          // ► Signal App to start 3D assembly NOW (parallel with break)
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }

        } else {
          // break done → fade CSS overlay away, then stop loop
          setOpacity(0);
          return;
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        zIndex: 200,
        pointerEvents: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#050505',
        opacity,
        transition: `opacity ${FADE_DUR}ms ease`,
      }}
    >
      <canvas
        ref={canvasRef}
        width={480}
        height={480}
        style={{
          width: 360, height: 360,
          imageRendering: 'pixelated',
          display: 'block',
        }}
      />
    </div>
  );
}
