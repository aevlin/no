import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

export function SystemCore({ section, introPhase }) {
  const meshRef     = useRef();
  const materialRef = useRef();
  const { viewport } = useThree();
  const pixelData   = useRef(null);
  const mouseRef    = useRef({ x: 0, y: 0 });

  // ── Mouse tracking ─────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth)  * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // ── Intro: fade from 0 → 1 when SVG breaks ───────────────
  const introLerp = useRef(0);
  const introDone = useRef(false);

  // ── Intro phase ref (readable inside useFrame without stale closure) ──
  const introPhaseRef = useRef(introPhase);
  useEffect(() => { introPhaseRef.current = introPhase; }, [introPhase]);

  useEffect(() => {
    if (introPhase === 'intro') {
      // 2D CinematicIntro is playing — keep 3D completely hidden
      introLerp.current = 0;
      introDone.current = false;
      if (materialRef.current) materialRef.current.opacity = 0;
    } else if (introPhase === 'svg') {
      introLerp.current = 0;
      introDone.current = false;
      if (materialRef.current) materialRef.current.opacity = 0;
    } else if (introPhase === 'breaking') {
      introLerp.current = 0;        // start assembly from beginning
      introDone.current = false;
      // Opacity fades in 0.5s after scatter starts so SVG flash has
      // space to be visible before the 3D materialises
      gsap.fromTo(materialRef.current ?? {}, { opacity: 0 }, {
        opacity: 1, duration: 1.8, delay: 0.4, ease: 'power2.inOut',
      });
    } else if (introPhase === 'done') {
      introDone.current = true;
      introLerp.current = 1;
      if (materialRef.current) materialRef.current.opacity = 1;
    }
  }, [introPhase]);

  // ── Parse SVG → particle positions ───────────────────────
  useEffect(() => {
    const img = new Image();
    img.onerror = (e) => console.error('[SystemCore] SVG load error', e);
    img.onload = () => {
      const W = 140, H = 140;   // ultra-fine: full-resolution sampling grid
      const cvs = document.createElement('canvas');
      cvs.width = W; cvs.height = H;
      const ctx = cvs.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, W, H);
      const d = ctx.getImageData(0, 0, W, H).data;

      const particles = [];
      let idx = 0;

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          if (d[i + 3] < 28) continue;  // skip transparent

          const r = d[i] / 255, g = d[i+1] / 255, b = d[i+2] / 255;
          // Centre and normalize to [-1.8, 1.8]
          const nx = ((x / W) * 2 - 1) * 1.75;
          const ny = (-(y / H) * 2 + 1) * 1.75;

          // Intro scatter: random sphere, r=2.8–4.2
          const scatterR = 2.8 + Math.random() * 1.4;
          const st = Math.random() * Math.PI * 2;
          const sp = Math.acos(2 * Math.random() - 1);
          const sScatter = new THREE.Vector3(
            scatterR * Math.sin(sp) * Math.cos(st),
            scatterR * Math.sin(sp) * Math.sin(st),
            scatterR * Math.cos(sp)
          );

          // ── s0 LANDING — tight, upright cat silhouette (shifted up & scaled) ─
          const s0Scale = 1.15;
          const s0 = new THREE.Vector3(nx * s0Scale, ny * s0Scale + 0.30, 0);

          // ── s1 ABOUT — ghost expansion, slight Z depth ─────
          const s1 = new THREE.Vector3(
            nx * 1.12 + (Math.random() - 0.5) * 0.05,
            ny * 1.12 + (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.45
          );

          // ── s2 SERVICES — concentric orbit rings (matches CSS solar system) ─
          const RING_RADII_S2 = [0.58, 0.74, 0.86, 0.97, 1.10];
          const NUM_RINGS_S2  = RING_RADII_S2.length;
          const ringIdx2      = idx % NUM_RINGS_S2;
          const posInRing2    = Math.floor(idx / NUM_RINGS_S2);
          const estPerRing2   = 640; // ~3200 total / 5 rings
          const angle2        = (posInRing2 / estPerRing2) * Math.PI * 2;
          const r2            = RING_RADII_S2[ringIdx2];
          const TILT2         = 0.13; // ~7.5° tilt for subtle depth
          const s2 = new THREE.Vector3(
            r2 * Math.cos(angle2),
            r2 * Math.sin(angle2) * Math.cos(TILT2),
            r2 * Math.sin(angle2) * Math.sin(TILT2)
          );

          // ── s3 TEAM — 5 Subtle Portrait Auras ─
          // Bothering nothing: We divide the 4,500 pixels into 5 faint rectangular panes 
          // that sit strictly and deeply in the Z-background directly behind each of the 5 CSS cards.
          
          const cardIdx = idx % 5; // 0, 1, 2(Center), 3, 4
          
          // Match the approximate CSS aspect ratio of the TeamCards (148x185)
          const spanX = (Math.random() - 0.5) * 0.35; // Panel width
          const spanY = (Math.random() - 0.5) * 0.50; // Panel height
          
          // X-offset mapping equivalent to css 'gap: 20px' 
          const baseX = (cardIdx - 2) * 0.58; 
          
          const s3 = new THREE.Vector3(
            baseX + spanX,
            -0.10 + spanY, // Offset slightly down so it sits precisely behind the CSS card
            -1.25 // Pushed completely deep into the background so it never overlaps UI
          );

          // ── s4 CONTACT — Frame/Border around safe zone ─
          // STRICT RULE: Pixels must ONLY exist OUTSIDE the content area
          // Content safe zone must be completely empty. Frame forms dynamically on the edges.
          
          // Using a superellipse (squircle) to form a modern, clean frame 
          const borderT  = (idx / 3200) * Math.PI * 2 + (Math.random() * 0.02);
          const aS4      = 1.85; // Width half-extent (clears horizontal content easily)
          const bS4      = 1.45; // Height half-extent (clears headline and button)
          const power    = 2.6;  // Rounds the corners nicely
          const cosT     = Math.cos(borderT);
          const sinT     = Math.sin(borderT);
          
          const basePathX = Math.sign(cosT) * Math.pow(Math.abs(cosT), 2/power);
          const basePathY = Math.sign(sinT) * Math.pow(Math.abs(sinT), 2/power);
          
          // Add thickness pointing strictly OUTWARD so it never encroaches inner zone
          const outwardScale = 1.0 + Math.random() * 0.12;
          
          const s4X = aS4 * basePathX * outwardScale;
          const s4Y = bS4 * basePathY * outwardScale;
          const s4Z = (Math.random() - 0.5) * 0.15;
          const s4  = new THREE.Vector3(s4X, s4Y, s4Z);

          particles.push({
            color:    new THREE.Color(r, g, b),
            sScatter,
            states:   [s0, s1, s2, s3, s4],
            rand:     Math.random() * Math.PI * 2,
            speed:    0.18 + Math.random() * 0.22,
          });
          idx++;
        }
      }
      console.log(`[SystemCore] ${particles.length} particles`);
      pixelData.current = particles;
    };
    img.src = '/assets/svgviewer-output.svg';
  }, []);

  const dummy      = useMemo(() => new THREE.Object3D(), []);
  const mouseWorld  = useMemo(() => new THREE.Vector3(), []);
  // Idle tracking
  const prevMX      = useRef(0);
  const prevMY      = useRef(0);
  const lastMoveT   = useRef(0);  // elapsedTime when mouse last moved

  // Section transition lerp
  const sectionLerp = useRef(0);
  const prevSec     = useRef(section);
  const nextSec     = useRef(section);

  useEffect(() => {
    prevSec.current    = nextSec.current;
    nextSec.current    = section;
    sectionLerp.current = 0;
  }, [section]);

  // Drift amplitude per section — refined, calmer
  const DRIFT = [0.024, 0.014, 0.040, 0.008, 0.003];

  useFrame((state) => {
    if (!meshRef.current || !pixelData.current) return;

    const data = pixelData.current;
    const time = state.clock.elapsedTime;

    // ── Advance intro lerp — ONLY during 'breaking' phase ──
    let useIntroPos = false;
    const phase = introPhaseRef.current;
    if (phase === 'svg') {
      // Hold scatter positions, opacity=0 — SVG canvas is shown above
      useIntroPos = true;
      introLerp.current = 0;
    } else if (phase === 'breaking' && !introDone.current) {
      // Assemble scatter → cat silhouette while opacity fades in
      introLerp.current = Math.min(introLerp.current + 0.009, 1);
      useIntroPos = true;
      if (introLerp.current >= 1) {
        introDone.current = true;
        useIntroPos = false;
      }
    }

    // ── Advance section lerp ────────────────────────────────
    sectionLerp.current = Math.min(sectionLerp.current + 0.0045, 1);
    const raw = sectionLerp.current;
    // Smoothstep
    const t = raw * raw * (3 - 2 * raw);

    const prev  = Math.max(0, Math.min(4, prevSec.current));
    const next  = Math.max(0, Math.min(4, nextSec.current));
    const dAmp  = DRIFT[next] ?? 0.018;

    mouseWorld.set(
      mouseRef.current.x * viewport.width  * 0.38,
      mouseRef.current.y * viewport.height * 0.38,
      0
    );

    // ── Idle detection — calm system when mouse is still ────
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    if (Math.abs(mx - prevMX.current) + Math.abs(my - prevMY.current) > 0.0008) {
      prevMX.current = mx;
      prevMY.current = my;
      lastMoveT.current = time;
    }
    const idleSecs  = time - lastMoveT.current;
    // Ramps 0→1 over 1.5s after 0.8s of inactivity; instantly resets on move
    const idleRatio = Math.min(1, Math.max(0, (idleSecs - 0.8) / 1.5));
    // Calm drift to ~12% of normal at full idle; instantly fully alive on move
    const calmScale = 1 - idleRatio * 0.88;

    const dAmpScaled = dAmp * calmScale;

    data.forEach((px, i) => {
      if (!px.states[prev] || !px.states[next]) return;

      if (useIntroPos) {
        const it = introLerp.current;
        const is = it * it * (3 - 2 * it);
        dummy.position.lerpVectors(px.sScatter, px.states[0], is);
      } else {
        dummy.position.lerpVectors(px.states[prev], px.states[next], t);
      }

      // Minimal float — calms to near-nothing when user is idle
      dummy.position.y += Math.sin(time * px.speed * 0.48 + px.rand) * dAmpScaled;
      dummy.position.x += Math.cos(time * px.speed * 0.28 + px.rand) * dAmpScaled * 0.42;

      // Cursor probe — gentle nudge, NOT aggressive displacement
      // Reduced pull strength and tighter radius for premium feel
      const pull = next === 0 ? 0.005 : next === 1 ? 0.003 : next === 2 ? 0.006 : 0.002;
      const dx   = mouseWorld.x - dummy.position.x;
      const dy   = mouseWorld.y - dummy.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (next === 4) {
        // STRICT RULE: For contact section frame, react but NEVER pull into center.
        // If mouse is near, just ripple/push outwards slightly.
        const mag = Math.max(0, 1.2 - dist) * 0.003; 
        // We push strictly outward from the center (0,0) to maintain the hollow core,
        // rather than pulling towards the mouse which could drag them inside.
        const outwardDist = Math.max(0.1, Math.sqrt(dummy.position.x ** 2 + dummy.position.y ** 2));
        dummy.position.x += (dummy.position.x / outwardDist) * mag;
        dummy.position.y += (dummy.position.y / outwardDist) * mag;
      } else {
        const mag  = Math.max(0, 0.9 - dist) * pull; // tighter radius
        dummy.position.x += dx * mag;
        dummy.position.y += dy * mag;
      }

      // Very slow voxel tumble
      const rS = next === 4 ? 0.001 : 0.012;
      dummy.rotation.set(
        time * rS * 0.5,
        time * rS + px.rand * 0.015,
        time * rS * 0.3
      );

      // Hero specific enhancements: slow breathing and subtle individual rotation
      let scaleMod = 1.0;
      if (next === 0) {
        // Slow structural breath
        scaleMod = 1.0 + Math.sin(time * 1.2 + px.rand * 0.5) * 0.025; 
        
        // Very subtle entity-level rotation (the whole form breathes and slightly shifts)
        dummy.position.x *= 1.0 + Math.cos(time * 0.8) * 0.01;
        dummy.position.y *= 1.0 + Math.sin(time * 0.8) * 0.01;
      }

      dummy.scale.setScalar(scaleMod);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, px.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  if (!pixelData.current) return null;
  const N = pixelData.current?.length || 0;

  return (
    <instancedMesh ref={meshRef} args={[null, null, N]}>
      <boxGeometry args={[0.016, 0.016, 0.016]} />
      <meshStandardMaterial
        ref={materialRef}
        roughness={0.06}
        metalness={0.97}
        envMapIntensity={6.5}
        transparent
        opacity={0}
      />
    </instancedMesh>
  );
}
