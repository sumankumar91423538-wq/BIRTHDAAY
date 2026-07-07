'use client';

import { Canvas } from '@react-three/fiber';
import SceneLighting from './SceneLighting';
import CameraRig from './CameraRig';
import FallbackCakePrimitive from './FallbackCakePrimitive';
import TeddyBoy from './TeddyBoy';
import TeddyGirl from './TeddyGirl';
import BalloonsSparkles from './BalloonsSparkles';
import CandlesGlow from './CandlesGlow';
import type { CameraState } from '@/lib/cakeSessionTypes';

interface CakeSceneProps {
  cameraState: CameraState;
  isCut: boolean;
  isCelebrating: boolean;
  readySide: 'boy' | 'girl' | null;
  boyState: 'idle' | 'ready_hint' | 'celebrate';
  girlState: 'idle' | 'ready_hint' | 'celebrate';
}

export default function CakeScene({
  cameraState,
  isCut,
  isCelebrating,
  readySide,
  boyState,
  girlState,
}: CakeSceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 6, 14], fov: 45 }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Soft pastel fog to blend scene boundaries */}
      <fog attach="fog" args={['#FFF3F8', 7, 20]} />

      {/* Lighting & Environment */}
      <SceneLighting cameraState={cameraState} isCut={isCut} />

      {/* Interactive Camera Rig */}
      <CameraRig cameraState={cameraState} readySide={readySide} />

      {/* Main Cake Model */}
      <FallbackCakePrimitive isCut={isCut} isCelebrating={isCelebrating} />

      {/* Boy Bear Mascot */}
      <TeddyBoy state={boyState} />

      {/* Girl Panda Mascot */}
      <TeddyGirl state={girlState} />

      {/* Floating balloons & Sparkles particles */}
      <BalloonsSparkles isCelebrating={isCelebrating} />

      {/* Additional ambient candles flickering lights */}
      <CandlesGlow isCut={isCut} isCelebrating={isCelebrating} />
    </Canvas>
  );
}
