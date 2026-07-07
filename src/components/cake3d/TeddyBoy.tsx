'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TeddyBoyProps {
  state: 'idle' | 'ready_hint' | 'celebrate';
}

export default function TeddyBoy({ state }: TeddyBoyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  useFrame((sceneState) => {
    const time = sceneState.clock.getElapsedTime();

    if (!groupRef.current) return;

    // Reset base positions/scales
    groupRef.current.position.y = 0;
    groupRef.current.scale.set(1, 1, 1);

    if (state === 'idle') {
      // 1. Idle breathing scale & head tilt
      const scaleY = 1 + Math.sin(time * 1.8) * 0.015;
      groupRef.current.scale.set(1, scaleY, 1);

      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(time * 0.9) * 0.02;
      }
      if (leftArmRef.current) {
        leftArmRef.current.position.y = 0.5 + Math.sin(time * 1.8) * 0.015;
      }
      if (rightArmRef.current) {
        rightArmRef.current.position.y = 0.5 + Math.sin(time * 1.8) * 0.015;
      }
    } else if (state === 'ready_hint') {
      // 2. Faster bounce (anticipatory ready state)
      const bounceY = Math.abs(Math.sin(time * 6)) * 0.15;
      groupRef.current.position.y = bounceY;

      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(time * 6) * 0.04;
      }
      // Lift arms slightly
      if (leftArmRef.current) {
        leftArmRef.current.position.y = 0.65;
      }
      if (rightArmRef.current) {
        rightArmRef.current.position.y = 0.65;
      }
    } else if (state === 'celebrate') {
      // 3. Rapid big bounce + arms raised high
      const bounceY = Math.abs(Math.sin(time * 9)) * 0.32;
      groupRef.current.position.y = bounceY;

      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(time * 12) * 0.08;
      }
      // Raise arms high
      if (leftArmRef.current) {
        leftArmRef.current.position.y = 1.1;
        leftArmRef.current.position.x = -0.4;
      }
      if (rightArmRef.current) {
        rightArmRef.current.position.y = 1.1;
        rightArmRef.current.position.x = 0.4;
      }
    }
  });

  return (
    <group ref={groupRef} position={[-2.2, 0, 0.5]} rotation={[0, 0.3, 0]}>
      {/* Teddy Bear Body */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.55} />
      </mesh>

      {/* Belly Patch */}
      <mesh position={[0, 0.6, 0.28]} rotation={[-0.1, 0, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#D7CCC8" roughness={0.6} />
      </mesh>

      {/* Head and Face Group */}
      <group ref={headRef} position={[0, 1.3, 0]}>
        {/* Head */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#8D6E63" roughness={0.55} />
        </mesh>

        {/* Snout */}
        <mesh position={[0, 0.03, 0.3]}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#D7CCC8" roughness={0.6} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, 0.07, 0.41]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#3E2723" roughness={0.4} />
        </mesh>

        {/* Left Ear */}
        <mesh position={[-0.25, 0.4, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#8D6E63" roughness={0.55} />
        </mesh>
        <mesh position={[-0.25, 0.4, 0.05]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#FFCDD2" roughness={0.7} />
        </mesh>

        {/* Right Ear */}
        <mesh position={[0.25, 0.4, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#8D6E63" roughness={0.55} />
        </mesh>
        <mesh position={[0.25, 0.4, 0.05]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#FFCDD2" roughness={0.7} />
        </mesh>

        {/* Left Eye */}
        <mesh position={[-0.12, 0.15, 0.33]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#2E2E2E" roughness={0.2} />
        </mesh>
        {/* Highlight */}
        <mesh position={[-0.1, 0.17, 0.37]}>
          <sphereGeometry args={[0.016, 6, 6]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
        </mesh>

        {/* Right Eye */}
        <mesh position={[0.12, 0.15, 0.33]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#2E2E2E" roughness={0.2} />
        </mesh>
        {/* Highlight */}
        <mesh position={[0.14, 0.17, 0.37]}>
          <sphereGeometry args={[0.016, 6, 6]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
        </mesh>

        {/* Cheeks blush */}
        <mesh position={[-0.22, 0.02, 0.3]} rotation={[0, -0.4, 0]}>
          <circleGeometry args={[0.055, 16]} />
          <meshBasicMaterial color="#FF8A80" transparent opacity={0.55} />
        </mesh>
        <mesh position={[0.22, 0.02, 0.3]} rotation={[0, 0.4, 0]}>
          <circleGeometry args={[0.055, 16]} />
          <meshBasicMaterial color="#FF8A80" transparent opacity={0.55} />
        </mesh>

        {/* Party Hat */}
        <mesh position={[0, 0.48, 0]} rotation={[-0.1, 0, 0]}>
          <coneGeometry args={[0.16, 0.34, 12]} />
          <meshStandardMaterial color="#80D8FF" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#FFE3A3" roughness={0.3} />
        </mesh>
      </group>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.45, 0.5, 0.12]}>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshStandardMaterial color="#5D4037" roughness={0.6} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.45, 0.5, 0.12]}>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshStandardMaterial color="#5D4037" roughness={0.6} />
      </mesh>

      {/* Left Foot */}
      <mesh position={[-0.26, 0.06, 0.28]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#5D4037" roughness={0.6} />
      </mesh>

      {/* Right Foot */}
      <mesh position={[0.26, 0.06, 0.28]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#5D4037" roughness={0.6} />
      </mesh>
    </group>
  );
}
