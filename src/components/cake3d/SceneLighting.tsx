'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { CameraState } from '@/lib/cakeSessionTypes';

interface SceneLightingProps {
  cameraState: CameraState;
  isCut: boolean;
}

export default function SceneLighting({ isCut }: SceneLightingProps) {
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  
  // Ambient pulse on cut
  useFrame(() => {
    if (!ambientLightRef.current) return;
    
    // Target ambient intensity
    const targetIntensity = isCut ? 1.0 : 0.7;
    
    // Lerp intensity
    ambientLightRef.current.intensity = THREE.MathUtils.lerp(
      ambientLightRef.current.intensity,
      targetIntensity,
      0.05
    );
  });

  return (
    <>
      {/* Warm pink ambient lighting */}
      <ambientLight ref={ambientLightRef} color="#FFE0EC" intensity={0.7} />

      {/* Main directional light from top-left */}
      <directionalLight position={[-3, 5, 2]} intensity={0.8} />

      {/* Soft fill light from right */}
      <directionalLight position={[2, 3, -1]} intensity={0.3} color="#F1E9FF" />

      {/* Drei soft contact shadows below the cake */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.3}
        blur={2.5}
        far={4}
        resolution={256}
        color="#D9C6FF"
      />

      {/* Dreamy sunset reflections */}
      <Environment preset="sunset" environmentIntensity={0.3} />
    </>
  );
}
