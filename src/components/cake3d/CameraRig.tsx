'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { CameraState } from '@/lib/cakeSessionTypes';

interface CameraRigProps {
  cameraState: CameraState;
  readySide: 'boy' | 'girl' | null;
}

export default function CameraRig({ cameraState, readySide }: CameraRigProps) {
  const { camera, size } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 6, 14));
  const lookAtTarget = useRef(new THREE.Vector3(0, 1.2, 0));

  // Determine if mobile view
  const isMobile = size.width < 768;

  // Initialize camera position on mount
  useEffect(() => {
    camera.position.set(0, 6, 14);
    camera.lookAt(lookAtTarget.current);
  }, [camera]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const targetPos = new THREE.Vector3();
    let lerpFactor = 0.03;

    // Apply mobile vs desktop base offsets
    if (camera instanceof THREE.PerspectiveCamera) {
      const fovTarget = isMobile ? 52 : 45;
      if (camera.fov !== fovTarget) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, fovTarget, 0.05);
        camera.updateProjectionMatrix();
      }
    }

    // Set camera position targets based on state
    switch (cameraState) {
      case 'entry':
        targetPos.set(0, 3, 7);
        lerpFactor = 0.04;
        break;
      case 'idle_waiting':
        // Breathing drift
        const dx = Math.sin(time * 0.3) * 0.15;
        const dy = Math.sin(time * 0.2) * 0.1;
        targetPos.set(dx, 3 + dy, 7);
        break;
      case 'one_side_ready':
        // Drift slightly toward the ready side
        const readyOffset = readySide === 'boy' ? -0.4 : 0.4;
        const sx = Math.sin(time * 0.3) * 0.15 + readyOffset;
        const sy = Math.sin(time * 0.2) * 0.1;
        targetPos.set(sx, 3 + sy, 7);
        break;
      case 'cutting':
        // Tight quick zoom
        targetPos.set(0, 2.3, 3.8);
        lerpFactor = 0.06;
        break;
      case 'celebration_zoom_out':
        // Pull back wide
        targetPos.set(0, 3.8, 8.5);
        lerpFactor = 0.045;
        break;
      default:
        targetPos.set(0, 3, 7);
    }

    // Lerp camera position
    currentPos.current.lerp(targetPos, lerpFactor);
    camera.position.copy(currentPos.current);

    // Keep camera lookAt target steady
    camera.lookAt(lookAtTarget.current);
  });

  return null;
}
