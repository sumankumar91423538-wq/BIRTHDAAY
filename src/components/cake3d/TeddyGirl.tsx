'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TeddyGirlProps {
  state: 'idle' | 'ready_hint' | 'celebrate';
}

export default function TeddyGirl({ state }: TeddyGirlProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  useFrame((sceneState) => {
    const time = sceneState.clock.getElapsedTime();

    if (!groupRef.current) return;

    // Reset positions/scales
    groupRef.current.position.y = 0;
    groupRef.current.scale.set(1, 1, 1);

    if (state === 'idle') {
      // 1. Idle breathing scale & head tilt (slightly out of phase with boy)
      const scaleY = 1 + Math.sin(time * 1.8 + 0.4) * 0.015;
      groupRef.current.scale.set(1, scaleY, 1);

      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(time * 0.9 + 0.4) * -0.02;
      }
      if (leftArmRef.current) {
        leftArmRef.current.position.y = 0.5 + Math.sin(time * 1.8 + 0.4) * 0.015;
      }
      if (rightArmRef.current) {
        rightArmRef.current.position.y = 0.5 + Math.sin(time * 1.8 + 0.4) * 0.015;
      }
    } else if (state === 'ready_hint') {
      // 2. Faster bounce (anticipatory ready state)
      const bounceY = Math.abs(Math.sin(time * 6 + 0.4)) * 0.15;
      groupRef.current.position.y = bounceY;

      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(time * 6 + 0.4) * -0.04;
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
      const bounceY = Math.abs(Math.sin(time * 9 + 0.4)) * 0.32;
      groupRef.current.position.y = bounceY;

      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(time * 12 + 0.4) * -0.08;
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
    <group ref={groupRef} position={[2.2, 0, 0.5]} rotation={[0, -0.3, 0]}>
      {/* Panda Body (White) */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
      </mesh>

      {/* Chest Patch (Panda dark band) */}
      <mesh position={[0, 0.63, 0.01]}>
        <cylinderGeometry args={[0.56, 0.56, 0.25, 16]} />
        <meshStandardMaterial color="#2E2E2E" roughness={0.5} />
      </mesh>

      {/* Head and Face Group */}
      <group ref={headRef} position={[0, 1.3, 0]}>
        {/* Head (White) */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
        </mesh>

        {/* Snout */}
        <mesh position={[0, 0.03, 0.3]}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, 0.07, 0.41]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#2E2E2E" roughness={0.4} />
        </mesh>

        {/* Left Ear (Black) */}
        <mesh position={[-0.25, 0.4, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#2E2E2E" roughness={0.5} />
        </mesh>
        <mesh position={[-0.25, 0.4, 0.05]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#FF9BC0" roughness={0.7} />
        </mesh>

        {/* Right Ear (Black) */}
        <mesh position={[0.25, 0.4, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#2E2E2E" roughness={0.5} />
        </mesh>
        <mesh position={[0.25, 0.4, 0.05]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#FF9BC0" roughness={0.7} />
        </mesh>

        {/* Left Eye Black Patch */}
        <mesh position={[-0.12, 0.15, 0.3]} rotation={[0, 0.2, 0]} scale={[1, 1.25, 1]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#2E2E2E" roughness={0.5} />
        </mesh>
        {/* Left Eye Pupil */}
        <mesh position={[-0.12, 0.15, 0.35]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
        </mesh>

        {/* Right Eye Black Patch */}
        <mesh position={[0.12, 0.15, 0.3]} rotation={[0, -0.2, 0]} scale={[1, 1.25, 1]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#2E2E2E" roughness={0.5} />
        </mesh>
        {/* Right Eye Pupil */}
        <mesh position={[0.12, 0.15, 0.35]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
        </mesh>

        {/* Cheeks blush (More prominent pink) */}
        <mesh position={[-0.22, 0.02, 0.31]} rotation={[0, -0.4, 0]}>
          <circleGeometry args={[0.065, 16]} />
          <meshBasicMaterial color="#FF80AB" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0.22, 0.02, 0.31]} rotation={[0, 0.4, 0]}>
          <circleGeometry args={[0.065, 16]} />
          <meshBasicMaterial color="#FF80AB" transparent opacity={0.7} />
        </mesh>

        {/* Party Hat */}
        <mesh position={[0, 0.48, 0]} rotation={[-0.1, 0, 0]}>
          <coneGeometry args={[0.16, 0.34, 12]} />
          <meshStandardMaterial color="#F8BBD0" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#FFE3A3" roughness={0.3} />
        </mesh>

        {/* Pink Bow on right ear */}
        <group position={[0.28, 0.32, 0.12]} rotation={[0.2, 0, -0.4]}>
          <mesh position={[-0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.04, 0.08, 8]} />
            <meshStandardMaterial color="#FF4081" roughness={0.3} />
          </mesh>
          <mesh position={[0.04, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.04, 0.08, 8]} />
            <meshStandardMaterial color="#FF4081" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#FF4081" roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Left Arm (Panda dark arm) */}
      <mesh ref={leftArmRef} position={[-0.45, 0.5, 0.12]}>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshStandardMaterial color="#2E2E2E" roughness={0.5} />
      </mesh>

      {/* Right Arm (Panda dark arm) */}
      <mesh ref={rightArmRef} position={[0.45, 0.5, 0.12]}>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshStandardMaterial color="#2E2E2E" roughness={0.5} />
      </mesh>

      {/* Left Foot (Black) */}
      <mesh position={[-0.26, 0.06, 0.28]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#2E2E2E" roughness={0.5} />
      </mesh>

      {/* Right Foot (Black) */}
      <mesh position={[0.26, 0.06, 0.28]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#2E2E2E" roughness={0.5} />
      </mesh>
    </group>
  );
}
