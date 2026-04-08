import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import gsap from 'gsap';
import { SystemCore } from './SystemCore';
import { DustField } from './DustField';

const SECTION_Z     = [0, -8, -16, -24, -32];
const CAMERA_OFFSET = 5;

// Per-section drift amplitudes — ultra-calm
const DRIFT_ROT = [0.020, 0.012, 0.035, 0.008, 0.003];

// ─────────────────────────────────────────────────────────────
// WorldDrift: slow ambient rotation + mouse parallax response
// ─────────────────────────────────────────────────────────────
function WorldDrift({ section, children }) {
  const ref      = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });
  const amp      = DRIFT_ROT[section] ?? 0.012;

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;

    // Time-based base orbit
    const baseY = Math.sin(t * 0.04) * amp;
    const baseX = Math.cos(t * 0.027) * amp * 0.38;

    // Mouse adds a soft directional lean — gentle parallax feel
    const mouseScale = section === 2 ? 0.09 : 0.055; // services reacts more
    const targetY = baseY + mouseRef.current.x * mouseScale;
    const targetX = baseX - mouseRef.current.y * mouseScale * 0.6;

    // Smooth lerp toward target (not instant)
    ref.current.rotation.y += (targetY - ref.current.rotation.y) * 0.028;
    ref.current.rotation.x += (targetX - ref.current.rotation.x) * 0.028;
  });

  return <group ref={ref}>{children}</group>;
}

// ─────────────────────────────────────────────────────────────
// CameraController: staged tween + mouse parallax + Z-roll
// ─────────────────────────────────────────────────────────────
function CameraController({ section, introPhase, navDuration }) {
  const { camera }   = useThree();
  const tween        = useRef(null);
  const mouseRef     = useRef({ x: 0, y: 0 });
  const targetYRef   = useRef(0);
  const isMoving     = useRef(false);
  const moveStart    = useRef(0);
  const moveDur      = useRef(navDuration * 1000);

  // Track mouse for camera parallax
  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Staged camera transition
  useEffect(() => {
    if (introPhase !== 'done') return;

    const targetZ = SECTION_Z[section] + CAMERA_OFFSET;
    const yOff    = [0, -0.08, 0.10, -0.14, 0][section] ?? 0;
    targetYRef.current = yOff;

    if (tween.current) tween.current.kill();

    isMoving.current   = true;
    moveStart.current  = Date.now();
    moveDur.current    = navDuration * 1000;

    // Determine direction of travel
    const goingDeeper  = targetZ < camera.position.z;
    const breathDur    = navDuration * 0.11;     // ~11% of total duration
    const breathOffset = goingDeeper ? 0.22 : -0.22; // opposite direction

    const tl = gsap.timeline({
      onComplete: () => { isMoving.current = false; },
    });

    // Beat 1: "breath" — brief counter-movement before the plunge
    tl.to(camera.position, {
      z: camera.position.z + breathOffset,
      duration: breathDur,
      ease: 'power1.out',
    });

    // Beat 2: main cinematic travel
    tl.to(camera.position, {
      z: targetZ,
      y: yOff,
      duration: navDuration - breathDur,
      ease: 'power3.inOut',
    });

    tween.current = tl;
    return () => { tl.kill(); };
  }, [section, camera, introPhase, navDuration]);

  // Gentle intro push-in
  useEffect(() => {
    if (introPhase !== 'breaking') return;
    if (tween.current) tween.current.kill();
    tween.current = gsap.to(camera.position, {
      z: 4.4,
      duration: 3.5,
      ease: 'power2.inOut',
    });
  }, [introPhase, camera]);

  useFrame(() => {
    // ── LookAt: camera faces slightly toward center ──────────
    camera.lookAt(
      camera.position.x * 0.02,
      camera.position.y * 0.02,
      camera.position.z - 5,
    );

    // ── Mouse parallax on X: very subtle lateral drift ───────
    const targetX = mouseRef.current.x * 0.3;
    camera.position.x += (targetX - camera.position.x) * 0.022;

    // ── Z-roll during transition: peaks at midpoint ───────────
    if (isMoving.current) {
      const elapsed  = (Date.now() - moveStart.current) / moveDur.current;
      const roll     = Math.sin(Math.min(elapsed, 1) * Math.PI) * 0.022;
      camera.rotation.z += (roll - camera.rotation.z) * 0.12;
    } else {
      // Ease roll back to 0 after transition complete
      camera.rotation.z *= 0.90;
    }
  });

  return null;
}

// ─────────────────────────────────────────────────────────────
// CatGroup: follows camera Z depth
// ─────────────────────────────────────────────────────────────
function CatGroup({ section, introPhase, navDuration, children }) {
  const ref   = useRef();
  const tween = useRef(null);

  useEffect(() => {
    if (introPhase !== 'done' || !ref.current) return;

    const breathDur = navDuration * 0.11;
    // Per-section X offset — landing: cat centered (text floats below), others: center
    const xOffsets = [0, 0, 0, 0, 0];
    const xOff = xOffsets[section] ?? 0;

    if (tween.current) tween.current.kill();

    const tl = gsap.timeline();
    // CatGroup tweens Z (depth) and X (lateral) simultaneously
    tl.to(ref.current.position, {
      z: SECTION_Z[section],
      x: xOff,
      duration: navDuration,
      delay: breathDur * 0.5,  // slight lag behind camera breath
      ease: 'power3.inOut',
    });

    tween.current = tl;
    return () => { tl.kill(); };
  }, [section, introPhase, navDuration]);

  return <group ref={ref}>{children}</group>;
}

// ─────────────────────────────────────────────────────────────
// Main Scene
// ─────────────────────────────────────────────────────────────
export function Scene({ section, introPhase, navDuration = 3.5 }) {
  return (
    <>
      {/* ── Lighting ─────────────────────────────────────── */}
      {/* Darker ambient, punchier directional lights to separate cat from background */}
      <ambientLight intensity={0.06} />
      <directionalLight position={[3, 5, 4]}  intensity={3.8} color="#d5e8f8" />
      <spotLight
        position={[-4, 3, 0]}
        intensity={5.4}
        angle={0.32}
        penumbra={1}
        color="#ffffff"
      />
      <pointLight position={[0, -3, 2]} intensity={0.6} color="#888fa0" />

      {/* Chrome reflections */}
      <Environment preset="city" />

      {/* Camera */}
      <CameraController
        section={section}
        introPhase={introPhase}
        navDuration={navDuration}
      />

      {/* Very sparse dust — depth cue. Further reduced density in Landing/Hero (s0) */}
      <DustField count={section === 0 ? 15 : 55} section={section} />

      {/* Pixel cat entity */}
      <CatGroup section={section} introPhase={introPhase} navDuration={navDuration}>
        {/* General fill light — close to entity */}
        <pointLight position={[0, 0.5, 2.6]} intensity={1.8} color="#ffffff" distance={9} decay={2} />
        {/* Contact-section boost: very close light so fog-dimmed core still glows */}
        <pointLight
          position={[0, 0, 0.5]}
          intensity={section === 4 ? 6.5 : 0}
          color="#c8d8f0"
          distance={section === 4 ? 2.0 : 0.1}
          decay={2}
        />
        <WorldDrift section={section}>
          <SystemCore section={section} introPhase={introPhase} />
        </WorldDrift>
      </CatGroup>

      {/* Soft bloom */}
      <EffectComposer>
        <Bloom
          intensity={0.65}
          luminanceThreshold={0.62}
          luminanceSmoothing={0.92}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}
