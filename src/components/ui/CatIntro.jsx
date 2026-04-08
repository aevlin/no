import React, { useRef, useEffect, useState } from 'react';

/**
 * CatIntro — shows flat SVG then pixel explosion into 3D space.
 * Phases:
 *   'svg'      → static white glowing cat logo (2s)
 *   'breaking' → canvas pixel explosion (1.05s), fades out
 *   'done'     → unmounts
 */
export function CatIntro({ phase }) {
  const canvasRef  = useRef(null);
  const dataRef    = useRef(null);
  const animRef    = useRef(null);
  const [visible, setVisible] = useState(false);

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Rasterize SVG → pixel array for explosion
  useEffect(() => {
    const S    = 96;   // internal resolution
    const STEP = 4;   // pixel block size
    const img  = new Image();

    img.onload = () => {
      const tmp = document.createElement('canvas');
      tmp.width = S; tmp.height = S;
      const ctx = tmp.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, S, S);
      const raw = ctx.getImageData(0, 0, S, S).data;

      const pixels = [];
      for (let y = 0; y < S; y += STEP) {
        for (let x = 0; x < S; x += STEP) {
          const i = (y * S + x) * 4;
          // Pick up any pixel with meaningful alpha
          if (raw[i + 3] < 30) continue;

          // Force monochrome white (regardless of fill color)
          const alpha = raw[i + 3] / 255;
          const cx    = x - S / 2;
          const cy    = y - S / 2;
          const angle = Math.atan2(cy, cx) + (Math.random() - 0.5) * 0.5;
          const dist  = 42 + Math.random() * 58;
          pixels.push({ qx: x, qy: y, angle, dist, alpha });
        }
      }
      dataRef.current = { pixels, S };
    };
    img.src = '/assets/svgviewer-output.svg';
  }, []);

  // Pixel explosion during 'breaking'
  useEffect(() => {
    if (phase !== 'breaking') return;
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const tryAnimate = () => {
      if (!canvasRef.current || !dataRef.current) {
        setTimeout(tryAnimate, 50);
        return;
      }
      const { pixels, S } = dataRef.current;
      const cvs = canvasRef.current;
      cvs.width = S; cvs.height = S;
      const ctx = cvs.getContext('2d');
      const DURATION = 1100;
      let start = null;

      const frame = (ts) => {
        if (!start) start = ts;
        const t     = Math.min((ts - start) / DURATION, 1);
        const eased = 1 - Math.pow(1 - t, 2.8); // ease-out cubic

        ctx.clearRect(0, 0, S, S);
        pixels.forEach(px => {
          const dx    = Math.cos(px.angle) * px.dist * eased;
          const dy    = Math.sin(px.angle) * px.dist * eased;
          // Fade: full until 40%, then linear to 0
          const fade  = t < 0.40 ? 1.0 : Math.max(0, 1 - (t - 0.40) / 0.60);
          if (fade <= 0.01) return;
          const a = (fade * px.alpha).toFixed(2);
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.fillRect(Math.round(px.qx + dx), Math.round(px.qy + dy), 4, 4);
        });

        if (t < 1) animRef.current = requestAnimationFrame(frame);
      };
      animRef.current = requestAnimationFrame(frame);
    };

    tryAnimate();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [phase]);

  if (phase === 'done') return null;

  // Display size — large and cinematic
  const SZ = 380;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      zIndex: 200, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity:    visible ? 1 : 0,
      transition: 'opacity 0.5s ease',
    }}>

      {/* Static SVG — svg phase */}
      {phase === 'svg' && (
        <img
          src="/assets/svgviewer-output.svg"
          alt=""
          style={{
            width:  SZ,
            height: SZ,
            objectFit: 'contain',
            display: 'block',
            // brightness(0) makes every non-transparent pixel black,
            // invert(1) flips that to white — guaranteed visibility
            // regardless of the SVG's original fill colors.
            filter: [
              'brightness(0)',
              'invert(1)',
              'drop-shadow(0 0 18px rgba(255,255,255,0.55))',
              'drop-shadow(0 0 48px rgba(255,255,255,0.18))',
            ].join(' '),
          }}
        />
      )}

      {/* Canvas pixel explosion — breaking phase */}
      {phase === 'breaking' && (
        <canvas
          ref={canvasRef}
          style={{
            width:  SZ,
            height: SZ,
            imageRendering: 'pixelated',
            display: 'block',
          }}
        />
      )}

    </div>
  );
}
