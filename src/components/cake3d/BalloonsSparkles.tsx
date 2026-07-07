'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface BalloonsSparklesProps {
  isCelebrating: boolean;
}

interface BalloonState {
  x: number;
  y: number;
  z: number;
  speed: number;
  sineOffset: number;
  color: string;
}

export default function BalloonsSparkles({ isCelebrating }: BalloonsSparklesProps) {
  // Hardcoded initial balloon states to prevent re-creation on render
  const balloonsRef = useRef<BalloonState[]>([
    { x: -3.8, y: 0.5, z: -3.0, speed: 0.15, sineOffset: 0.0, color: '#FF9BC0' }, // Pink
    { x: 3.8, y: 2.2, z: -2.8, speed: 0.12, sineOffset: 1.5, color: '#D9C6FF' },  // Lavender
    { x: -2.5, y: 3.8, z: -3.5, speed: 0.18, sineOffset: 3.0, color: '#FFE3A3' }, // Gold
    { x: 2.8, y: -0.8, z: -4.0, speed: 0.14, sineOffset: 0.8, color: '#80D8FF' },  // Blue
    { x: -4.2, y: -1.8, z: -3.2, speed: 0.16, sineOffset: 2.2, color: '#F8BBD0' }, // Soft pink
  ]);

  const balloonGroupsRef = useRef<(THREE.Group | null)[]>([]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    balloonsRef.current.forEach((balloon, index) => {
      const group = balloonGroupsRef.current[index];
      if (!group) return;

      // Update vertical position (y)
      balloon.y += delta * balloon.speed * (isCelebrating ? 2.5 : 1.0);
      if (balloon.y > 6.5) {
        balloon.y = -3.5; // Reset position to bottom
      }

      // Add gentle horizontal sway (sine)
      const swayX = balloon.x + Math.sin(time * 0.8 + balloon.sineOffset) * 0.25;

      group.position.set(swayX, balloon.y, balloon.z);
    });
  });

  return (
    <>
      {/* Sparkles particle layer */}
      <Sparkles
        count={isCelebrating ? 80 : 45}
        size={isCelebrating ? 2.5 : 1.5}
        speed={isCelebrating ? 0.9 : 0.22}
        color="#FFE3A3"
        opacity={0.65}
        scale={[10, 7, 7]}
      />

      {/* Background floating balloons */}
      {balloonsRef.current.map((balloon, index) => (
        <group
          key={`balloon-${index}`}
          ref={(el) => {
            balloonGroupsRef.current[index] = el;
          }}
          position={[balloon.x, balloon.y, balloon.z]}
        >
          {/* Balloon shape (Elongated sphere) */}
          <mesh scale={[1, 1.25, 1]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color={balloon.color} roughness={0.4} metalness={0.1} />
          </mesh>

          {/* Balloon knot */}
          <mesh position={[0, -0.28, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.025, 0.05, 6]} />
            <meshStandardMaterial color={balloon.color} roughness={0.4} />
          </mesh>

          {/* Hanging string */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.6, 4]} />
            <meshStandardMaterial color="#B0BEC5" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </>
  );
}
