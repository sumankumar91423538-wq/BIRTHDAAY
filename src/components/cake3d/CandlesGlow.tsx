'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CandlesGlowProps {
  isCut: boolean;
  isCelebrating: boolean;
}

export default function CandlesGlow({ isCut, isCelebrating }: CandlesGlowProps) {
  const lightsRef = useRef<(THREE.PointLight | null)[]>([]);

  // Candle positions relative to the cake center
  const candlePositions = [
    [-0.4, 1.82, 0.15],
    [0.4, 1.82, 0.15],
    [-0.25, 1.82, -0.35],
    [0.25, 1.82, -0.35],
    [0, 1.82, 0.4],
  ];

  useFrame(() => {
    lightsRef.current.forEach((light) => {
      if (!light) return;

      if (isCut) {
        // Flickers die down or stay minimal after cake is cut
        light.intensity = THREE.MathUtils.lerp(light.intensity, 0.05, 0.05);
        return;
      }

      // Base intensity
      const base = isCelebrating ? 0.7 : 0.4;
      const noise = (Math.random() - 0.5) * 0.12;
      
      light.intensity = THREE.MathUtils.lerp(
        light.intensity,
        Math.max(0.15, base + noise),
        0.1
      );
    });
  });

  return (
    <group>
      {candlePositions.map((pos, index) => {
        // If cut, separate candles will move with the halves
        // But for ambient flickering glow, rendering them is great!
        const adjustedX = isCut ? (pos[0] < 0 ? pos[0] - 0.75 : pos[0] + 0.75) : pos[0];
        const adjustedZ = isCut ? (pos[0] < 0 ? pos[2] : pos[2]) : pos[2]; // rotation adjustments can be skipped here for simple ambient lights

        return (
          <pointLight
            key={`candle-light-${index}`}
            ref={(el) => {
              lightsRef.current[index] = el;
            }}
            position={[adjustedX, pos[1] + 0.1, adjustedZ]}
            distance={3.5}
            color="#FF8C00"
            intensity={0.4}
          />
        );
      })}
    </group>
  );
}
