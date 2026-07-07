'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FallbackCakePrimitiveProps {
  isCut: boolean;
  isCelebrating: boolean;
}

export default function FallbackCakePrimitive({
  isCut,
  isCelebrating,
}: FallbackCakePrimitiveProps) {
  const leftHalfRef = useRef<THREE.Group>(null);
  const rightHalfRef = useRef<THREE.Group>(null);
  const entireCakeRef = useRef<THREE.Group>(null);

  // Flame and light refs for noise flicker
  const flame1Ref = useRef<THREE.MeshStandardMaterial>(null);
  const flame2Ref = useRef<THREE.MeshStandardMaterial>(null);
  const flame3Ref = useRef<THREE.MeshStandardMaterial>(null);
  const flame4Ref = useRef<THREE.MeshStandardMaterial>(null);
  const flame5Ref = useRef<THREE.MeshStandardMaterial>(null);

  const light1Ref = useRef<THREE.PointLight>(null);
  const light2Ref = useRef<THREE.PointLight>(null);
  const light3Ref = useRef<THREE.PointLight>(null);
  const light4Ref = useRef<THREE.PointLight>(null);
  const light5Ref = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Gentle breathing scale for the whole cake
    if (entireCakeRef.current && !isCut) {
      const scaleY = 1 + Math.sin(time * 2) * 0.01;
      entireCakeRef.current.scale.set(1, scaleY, 1);
    }

    // 2. Animate split halves if isCut is true
    const targetSplitX = isCut ? 0.75 : 0;
    const targetRotZ = isCut ? 0.08 : 0;

    if (leftHalfRef.current) {
      leftHalfRef.current.position.x = THREE.MathUtils.lerp(
        leftHalfRef.current.position.x,
        -targetSplitX,
        0.05
      );
      leftHalfRef.current.rotation.z = THREE.MathUtils.lerp(
        leftHalfRef.current.rotation.z,
        -targetRotZ,
        0.05
      );
    }

    if (rightHalfRef.current) {
      rightHalfRef.current.position.x = THREE.MathUtils.lerp(
        rightHalfRef.current.position.x,
        targetSplitX,
        0.05
      );
      rightHalfRef.current.rotation.z = THREE.MathUtils.lerp(
        rightHalfRef.current.rotation.z,
        targetRotZ,
        0.05
      );
    }

    // 3. Flame flicker & PointLight intensity noise
    const flameRefs = [flame1Ref, flame2Ref, flame3Ref, flame4Ref, flame5Ref];
    const lightRefs = [light1Ref, light2Ref, light3Ref, light4Ref, light5Ref];

    flameRefs.forEach((flameRef, index) => {
      if (flameRef.current) {
        // Base emissive intensity
        const base = isCelebrating ? 1.5 : 1.0;
        const noise = (Math.random() - 0.5) * 0.25;
        flameRef.current.emissiveIntensity = base + noise;
      }
    });

    lightRefs.forEach((lightRef) => {
      if (lightRef.current) {
        const baseLight = isCelebrating ? 0.9 : 0.45;
        const noise = (Math.random() - 0.5) * 0.15;
        lightRef.current.intensity = Math.max(0.1, baseLight + noise);
      }
    });
  });

  // Helper for rendering cake half meshes
  const renderCakeHalf = (isLeft: boolean) => {
    // We adjust geometry clipping or render them as half-cylinders.
    // Standard R3F cylinders have thetaStart and thetaLength!
    // This allows perfect clean splitting inside webGL!
    const thetaStart = isLeft ? Math.PI / 2 : -Math.PI / 2;
    const thetaLength = Math.PI;

    return (
      <>
        {/* Bottom Tier */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.6, 32, 1, false, thetaStart, thetaLength]} />
          <meshStandardMaterial color="#FFB6C1" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Middle Tier */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.5, 32, 1, false, thetaStart, thetaLength]} />
          <meshStandardMaterial color="#FFF8E7" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Top Tier */}
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 0.4, 32, 1, false, thetaStart, thetaLength]} />
          <meshStandardMaterial color="#FF9BC0" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Top Frosting Layer */}
        <mesh position={[0, 1.51, 0]}>
          <cylinderGeometry args={[0.66, 0.66, 0.03, 32, 1, false, thetaStart, thetaLength]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>

        {/* Decorative frosting drips */}
        <mesh position={[0, 1.48, 0]}>
          <cylinderGeometry args={[0.67, 0.67, 0.05, 32, 1, false, thetaStart, thetaLength]} />
          <meshStandardMaterial color="#FF6FA5" roughness={0.4} />
        </mesh>

        {/* Lined flat cut plane inside the split face */}
        <mesh position={[0, 0.77, 0]} rotation={[0, isLeft ? -Math.PI / 2 : Math.PI / 2, 0]}>
          <planeGeometry args={[2.4, 1.5]} />
          <meshStandardMaterial color="#FFFEEA" roughness={0.5} />
        </mesh>
      </>
    );
  };

  // Candle positioning around top tier
  const candles = [
    { pos: [-0.4, 1.62, 0.15], rot: 0, flameRef: flame1Ref, lightRef: light1Ref },
    { pos: [0.4, 1.62, 0.15], rot: 0, flameRef: flame2Ref, lightRef: light2Ref },
    { pos: [-0.25, 1.62, -0.35], rot: 0, flameRef: flame3Ref, lightRef: light3Ref },
    { pos: [0.25, 1.62, -0.35], rot: 0, flameRef: flame4Ref, lightRef: light4Ref },
    { pos: [0, 1.62, 0.4], rot: 0, flameRef: flame5Ref, lightRef: light5Ref },
  ];

  return (
    <group ref={entireCakeRef} position={[0, 0, 0]}>
      {/* LEFT HALF */}
      <group ref={leftHalfRef}>
        {renderCakeHalf(true)}

        {/* Left Side Candles */}
        {candles
          .filter((c) => c.pos[0] < 0)
          .map((c, i) => (
            <group key={`l-c-${i}`} position={[c.pos[0], c.pos[1], c.pos[2]]}>
              {/* Stick */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.25, 8]} />
                <meshStandardMaterial color="#FFE3A3" roughness={0.3} />
              </mesh>
              {/* Flame */}
              <mesh position={[0, 0.16, 0]}>
                <sphereGeometry args={[0.038, 8, 8]} />
                <meshStandardMaterial
                  ref={c.flameRef}
                  color="#FF8C00"
                  emissive="#FF4500"
                  emissiveIntensity={1}
                />
              </mesh>
              {/* Point Light */}
              <pointLight
                ref={c.lightRef}
                position={[0, 0.2, 0]}
                intensity={0.4}
                distance={2.5}
                color="#FF7F00"
              />
            </group>
          ))}
      </group>

      {/* RIGHT HALF */}
      <group ref={rightHalfRef}>
        {renderCakeHalf(false)}

        {/* Right & Middle Candles */}
        {candles
          .filter((c) => c.pos[0] >= 0)
          .map((c, i) => (
            <group key={`r-c-${i}`} position={[c.pos[0], c.pos[1], c.pos[2]]}>
              {/* Stick */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.25, 8]} />
                <meshStandardMaterial color="#FFE3A3" roughness={0.3} />
              </mesh>
              {/* Flame */}
              <mesh position={[0, 0.16, 0]}>
                <sphereGeometry args={[0.038, 8, 8]} />
                <meshStandardMaterial
                  ref={c.flameRef}
                  color="#FF8C00"
                  emissive="#FF4500"
                  emissiveIntensity={1}
                />
              </mesh>
              {/* Point Light */}
              <pointLight
                ref={c.lightRef}
                position={[0, 0.2, 0]}
                intensity={0.4}
                distance={2.5}
                color="#FF7F00"
              />
            </group>
          ))}
      </group>
    </group>
  );
}
