import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/canvas/Scene';
import { NavHUD } from './components/ui/NavHUD';
import { Overlay } from './components/ui/Overlay';
import { CinematicIntro } from './components/ui/CinematicIntro';
import './index.css';

const SECTION_COUNT = 5;

// ── Navigation speed → GSAP camera duration mapping ─────────
// Slow scroll = 3.5s cinematic | Fast scroll = 1.5s minimum
const getDuration = (msSinceLast) => {
  if (msSinceLast > 1400) return 3.5;
  if (msSinceLast > 800)  return 2.4;
  if (msSinceLast > 500)  return 1.9;
  return 1.5;
};

export default function App() {
  const [section,    setSection]    = useState(0);
  // 'intro'    → CinematicIntro playing
  // 'breaking' → 3D assembling (CinematicIntro fading out simultaneously)
  // 'done'     → Full experience, navigation enabled
  const [introPhase, setIntroPhase] = useState('breaking');
  const [navDuration, setNavDuration] = useState(3.5);
  const lastNav = useRef(0);
  const transitionEndTime = useRef(0);

  // ── Skip SVG Loader and assemble 3D particles immediately ────────
  useEffect(() => {
    // 3D scene finishes gathering in about 1.8s
    const t = setTimeout(() => setIntroPhase('done'), 1800);
    return () => clearTimeout(t);
  }, []);


  // ── Cursor glow ───────────────────────────────────────────
  useEffect(() => {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;
    const onMove = (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // ── Navigation with adaptive GSAP duration ───────────────
  const navigate = useCallback((dir) => {
    if (introPhase !== 'done') return;
    if (Date.now() < transitionEndTime.current) return;

    const now     = Date.now();
    const elapsed = now - lastNav.current;
    if (elapsed < 100) return;

    const dur = getDuration(elapsed);
    lastNav.current = now;
    transitionEndTime.current = now + dur * 1000 + 200;

    setNavDuration(dur);
    setSection(p => Math.max(0, Math.min(SECTION_COUNT - 1, p + dir)));
  }, [introPhase]);

  // Direct section jump — menu / dot clicks
  const goTo = useCallback((i) => {
    if (introPhase !== 'done') return;
    if (Date.now() < transitionEndTime.current) return;
    const dur = 2.4;
    transitionEndTime.current = Date.now() + dur * 1000 + 200;
    setNavDuration(dur);
    setSection(i);
  }, [introPhase]);

  // ── Wheel ─────────────────────────────────────────────────
  useEffect(() => {
    const onWheel = (e) => { e.preventDefault(); navigate(e.deltaY > 0 ? 1 : -1); };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [navigate]);

  // ── Keys ──────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') navigate(1);
      if (e.key === 'ArrowUp'   || e.key === 'PageUp')   navigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  // ── Custom nav events (CTA buttons) ───────────────────────
  useEffect(() => {
    const onGoto = (e) => goTo(e.detail);
    window.addEventListener('noviq-goto', onGoto);
    return () => window.removeEventListener('noviq-goto', onGoto);
  }, [goTo]);

  // ── Touch ─────────────────────────────────────────────────
  const touchStart = useRef(null);
  useEffect(() => {
    const onStart = (e) => { touchStart.current = e.touches[0].clientY; };
    const onEnd   = (e) => {
      if (touchStart.current === null) return;
      const d = touchStart.current - e.changedTouches[0].clientY;
      if (Math.abs(d) > 36) navigate(d > 0 ? 1 : -1);
      touchStart.current = null;
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend',   onEnd,   { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend',   onEnd);
    };
  }, [navigate]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', overflow: 'hidden', position: 'relative' }}>

      {/* Cursor glow */}
      <div id="cursor-glow" />

      {/* ── Three.js Canvas (always rendered; opacity managed inside) ── */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40, near: 0.1, far: 75 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.8]}
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 18, 55]} />
        <Suspense fallback={null}>
          <Scene section={section} introPhase={introPhase} navDuration={navDuration} />
        </Suspense>
      </Canvas>

      {/* ── Fixed UI overlay (only after intro completes) ──────────── */}
      {introPhase === 'done' && (
        <>
          <NavHUD section={section} onNavigate={goTo} />
          <Overlay section={section} />
        </>
      )}

    </div>
  );
}
