import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function DustField({ count = 250, section }) {
  const ref = useRef();
  const materialRef = useRef();

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      vel.push({
        x: (Math.random() - 0.5) * 0.006,
        y: (Math.random() - 0.5) * 0.003,
        rand: Math.random() * Math.PI * 2,
        speed: 0.1 + Math.random() * 0.2,
      });
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3]     += velocities[i].x;
      pos.array[i * 3 + 1] += Math.sin(t * velocities[i].speed + velocities[i].rand) * 0.001;
      // Wrap
      if (pos.array[i * 3] >  9) pos.array[i * 3] = -9;
      if (pos.array[i * 3] < -9) pos.array[i * 3] =  9;
    }
    pos.needsUpdate = true;
    
    // Fade out dust entirely in section 4 (Contact) to ensure 100% clean safe zone
    if (materialRef.current) {
      const targetOpacity = section === 4 ? 0 : 0.22;
      materialRef.current.opacity += (targetOpacity - materialRef.current.opacity) * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.014}
        color="#ffffff"
        transparent
        opacity={0.22}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
