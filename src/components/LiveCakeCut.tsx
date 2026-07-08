'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  getCakeSession,
  subscribeToCakeSession,
  joinCakePresence,
  updateCakeReadyWithValidation,
  resetExpiredReady,
  resetBothOnPresenceDrop,
  EXPIRY_WINDOW_MS,
  type CakeSession,
} from '@/lib/cakeRealtime';
import type { CameraState, PresenceState, ToastVariant } from '@/lib/cakeSessionTypes';
import { useApp } from '@/context/AppContext';

/* ── Dynamically import the 3D scene (no SSR) ── */
const CakeScene = dynamic(
  () => import('@/components/cake3d/CakeScene'),
  { ssr: false, loading: () => <CakeSceneLoader /> },
);

/* ── Dynamically import glass UI overlays ── */
const StatusGlassCard = dynamic(() => import('@/components/cake-ui/StatusGlassCard'), { ssr: false });
const CutButton = dynamic(() => import('@/components/cake-ui/CutButton'), { ssr: false });
const WaitingToast = dynamic(() => import('@/components/cake-ui/WaitingToast'), { ssr: false });
const CelebrationOverlay = dynamic(() => import('@/components/cake-ui/CelebrationOverlay'), { ssr: false });

const DEFAULT_SESSION: CakeSession = {
  boy_ready: false,
  girl_ready: false,
  cake_cut: false,
  boy_clicked_at: null,
  girl_clicked_at: null,
  cut_at: null,
};

/* ── Loading shimmer for the 3D scene ── */
function CakeSceneLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="w-32 h-32 rounded-3xl"
        style={{
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          backgroundColor: 'rgba(255,255,255,0.4)',
          border: '1px solid rgba(255,255,255,0.5)',
        }}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.96, 1, 0.96] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/* ── Debug Card (dev only) ── */
function DebugCard({
  role,
  presence,
  session,
  presenceStatus,
  realtimeStatus,
}: {
  role: string | null;
  presence: PresenceState;
  session: CakeSession;
  presenceStatus: string;
  realtimeStatus: string;
}) {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div
      className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] w-[320px] rounded-2xl p-3 text-[10px] font-mono leading-relaxed border border-white/60 shadow-lg"
      style={{
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        backgroundColor: 'rgba(255,255,255,0.75)',
      }}
    >
      <div className="font-bold text-[11px] text-[#5B3A5D] mb-1">🛠 Debug Panel</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[#5B3A5D]/80">
        <span>Role:</span>
        <span className="font-bold">{role ?? 'null'}</span>
        <span>Boy Online:</span>
        <span className={presence.boyOnline ? 'text-green-600 font-bold' : 'text-red-500'}>{String(presence.boyOnline)}</span>
        <span>Girl Online:</span>
        <span className={presence.girlOnline ? 'text-green-600 font-bold' : 'text-red-500'}>{String(presence.girlOnline)}</span>
        <span>Boy Ready:</span>
        <span className={session.boy_ready ? 'text-amber-600 font-bold' : ''}>{String(session.boy_ready)}</span>
        <span>Girl Ready:</span>
        <span className={session.girl_ready ? 'text-amber-600 font-bold' : ''}>{String(session.girl_ready)}</span>
        <span>Cake Cut:</span>
        <span className={session.cake_cut ? 'text-pink-600 font-bold' : ''}>{String(session.cake_cut)}</span>
        <span>Presence:</span>
        <span className="font-bold">{presenceStatus}</span>
        <span>Realtime:</span>
        <span className="font-bold">{realtimeStatus}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Custom hook: useCakeSession
   Manages session, presence, camera state, expiry
   ═══════════════════════════════════════════════ */
function useCakeSession(role: 'boy' | 'girl' | null) {
  const [session, setSession] = useState<CakeSession>(DEFAULT_SESSION);
  const [presence, setPresence] = useState<PresenceState>({ boyOnline: false, girlOnline: false });
  const [cameraState, setCameraState] = useState<CameraState>('entry');
  const [toastVariant, setToastVariant] = useState<ToastVariant>('none');
  const [loaded, setLoaded] = useState(false);
  const [presenceStatus, setPresenceStatus] = useState('disconnected');
  const [realtimeStatus, setRealtimeStatus] = useState('disconnected');

  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPresenceRef = useRef<PresenceState>({ boyOnline: false, girlOnline: false });

  // Load initial session
  useEffect(() => {
    const load = async () => {
      console.log('[LiveCake] Loading initial cake session...');
      const initial = await getCakeSession();
      console.log('[LiveCake] Initial session loaded:', initial);
      setSession(initial);
      setLoaded(true);
    };
    load();
  }, []);

  // Subscribe to DB changes
  useEffect(() => {
    console.log('[LiveCake] Setting up realtime subscription...');
    setRealtimeStatus('connecting');
    const unsubscribe = subscribeToCakeSession((updated) => {
      console.log('[LiveCake] Realtime session update received:', updated);
      setRealtimeStatus('connected');
      setSession(updated);
    });
    setRealtimeStatus('connected');
    return () => {
      setRealtimeStatus('disconnected');
      unsubscribe();
    };
  }, []);

  // Join presence channel
  useEffect(() => {
    if (!role) {
      console.log('[LiveCake] No role set, skipping presence');
      return;
    }
    console.log('[LiveCake] Joining presence as role:', role);
    setPresenceStatus('connecting');
    const leave = joinCakePresence(role, (p) => {
      console.log('[LiveCake] Presence update:', p);
      setPresenceStatus('connected');
      setPresence(p);
    });
    return () => {
      setPresenceStatus('disconnected');
      leave();
    };
  }, [role]);

  // Camera state entry → idle after 2s
  useEffect(() => {
    if (loaded && cameraState === 'entry') {
      entryTimerRef.current = setTimeout(() => {
        setCameraState('idle_waiting');
      }, 2000);
    }
    return () => {
      if (entryTimerRef.current) clearTimeout(entryTimerRef.current);
    };
  }, [loaded, cameraState]);

  // Derive camera state from session
  useEffect(() => {
    if (!loaded) return;

    if (session.cake_cut) {
      setCameraState('celebration_zoom_out');
      setToastVariant('none');
      return;
    }

    const bothReady = session.boy_ready && session.girl_ready;
    const oneSideReady =
      (session.boy_ready && !session.girl_ready) ||
      (!session.boy_ready && session.girl_ready);

    if (bothReady) {
      // Check if within expiry window
      const boyMs = session.boy_clicked_at ? new Date(session.boy_clicked_at).getTime() : 0;
      const girlMs = session.girl_clicked_at ? new Date(session.girl_clicked_at).getTime() : 0;
      const diff = Math.abs(boyMs - girlMs);
      if (diff <= EXPIRY_WINDOW_MS) {
        setCameraState('cutting');
        setToastVariant('none');
      }
    } else if (oneSideReady) {
      setCameraState('one_side_ready');
    } else if (cameraState !== 'entry') {
      setCameraState('idle_waiting');
      setToastVariant('none');
    }
  }, [session, loaded, cameraState]);

  // 10-second expiry timer when one side is ready
  useEffect(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }

    if (session.cake_cut) return;

    const oneSideReady =
      (session.boy_ready && !session.girl_ready) ||
      (!session.boy_ready && session.girl_ready);

    if (oneSideReady) {
      // Show waiting toast after a short delay
      setToastVariant('waiting');

      // Set expiry timer
      const readyRole = session.boy_ready ? 'boy' : 'girl';
      const clickedAt = readyRole === 'boy' ? session.boy_clicked_at : session.girl_clicked_at;
      const clickMs = clickedAt ? new Date(clickedAt).getTime() : Date.now();
      const remaining = Math.max(0, EXPIRY_WINDOW_MS - (Date.now() - clickMs));

      console.log('[LiveCake] Starting expiry timer:', { readyRole, remaining: remaining + 500 });

      expiryTimerRef.current = setTimeout(async () => {
        console.log('[LiveCake] Expiry timer fired for role:', readyRole);
        // Expire the ready flag
        const updated = await resetExpiredReady(readyRole as 'boy' | 'girl');
        setSession(updated);
        setToastVariant('none');
      }, remaining + 500); // small buffer
    }

    return () => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }
    };
  }, [session.boy_ready, session.girl_ready, session.cake_cut, session.boy_clicked_at, session.girl_clicked_at]);

  // Presence-drop detection: if someone leaves while ready flags are active
  useEffect(() => {
    const prev = prevPresenceRef.current;
    const hasPendingReady = (session.boy_ready || session.girl_ready) && !session.cake_cut;

    if (hasPendingReady) {
      // Check if someone who was online just went offline
      const boyDropped = prev.boyOnline && !presence.boyOnline;
      const girlDropped = prev.girlOnline && !presence.girlOnline;

      if (boyDropped || girlDropped) {
        console.log('[LiveCake] Presence drop detected:', { boyDropped, girlDropped });
        // Reset both sides
        setToastVariant('stepped_away');
        resetBothOnPresenceDrop().then((updated) => {
          setSession(updated);
          // Clear the stepped_away toast after 3s
          setTimeout(() => setToastVariant('none'), 3000);
        });
      }
    }

    prevPresenceRef.current = presence;
  }, [presence, session.boy_ready, session.girl_ready, session.cake_cut]);

  // Handle cut button click
  const handleCutClick = useCallback(async () => {
    if (!role) {
      console.warn('[LiveCake] handleCutClick called with no role');
      return;
    }

    console.log('[LiveCake] Cut button clicked by role:', role);
    const { result, session: updated } = await updateCakeReadyWithValidation(role, presence);
    console.log('[LiveCake] Cut click result:', result, updated);
    setSession(updated);

    if (result === 'PRESENCE_BLOCKED') {
      // Don't change anything, button should already be disabled
      return;
    }
  }, [role, presence]);

  // Derived states
  const isMyRoleReady = role === 'boy' ? session.boy_ready : session.girl_ready;
  const bothOnline = presence.boyOnline && presence.girlOnline;

  // Teddy states
  const getBoyTeddyState = (): 'idle' | 'ready_hint' | 'celebrate' => {
    if (session.cake_cut) return 'celebrate';
    if (session.boy_ready) return 'ready_hint';
    return 'idle';
  };

  const getGirlTeddyState = (): 'idle' | 'ready_hint' | 'celebrate' => {
    if (session.cake_cut) return 'celebrate';
    if (session.girl_ready) return 'ready_hint';
    return 'idle';
  };

  const readySide: 'boy' | 'girl' | null =
    session.boy_ready && !session.girl_ready
      ? 'boy'
      : !session.boy_ready && session.girl_ready
        ? 'girl'
        : null;

  return {
    session,
    presence,
    cameraState,
    toastVariant,
    isMyRoleReady,
    bothOnline,
    handleCutClick,
    boyTeddyState: getBoyTeddyState(),
    girlTeddyState: getGirlTeddyState(),
    readySide,
    loaded,
    presenceStatus,
    realtimeStatus,
  };
}

/* ═══════════════════════════════════════════════
   Main Component: LiveCakeCut
   ═══════════════════════════════════════════════ */
export default function LiveCakeCut() {
  const { role, setActiveSection } = useApp();

  // Log current role
  useEffect(() => {
    console.log('[LiveCake] Current cake user role:', role);
  }, [role]);

  const {
    session,
    presence,
    cameraState,
    toastVariant,
    isMyRoleReady,
    bothOnline,
    handleCutClick,
    boyTeddyState,
    girlTeddyState,
    readySide,
    presenceStatus,
    realtimeStatus,
  } = useCakeSession(role);

  const handleContinue = () => {
    setActiveSection('letter');
  };

  return (
    <div
      className="fixed inset-0 z-0"
      style={{
        background: 'linear-gradient(180deg, #FFF3F8 0%, #F1E9FF 40%, #FFF3F8 80%, #FFE3A3 100%)',
      }}
    >
      {/* Debug Card (dev only) */}
      <DebugCard
        role={role}
        presence={presence}
        session={session}
        presenceStatus={presenceStatus}
        realtimeStatus={realtimeStatus}
      />

      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0" style={{ bottom: '4rem' }}>
        <CakeScene
          cameraState={cameraState}
          isCut={session.cake_cut}
          isCelebrating={cameraState === 'celebration_zoom_out'}
          readySide={readySide}
          boyState={boyTeddyState}
          girlState={girlTeddyState}
        />
      </div>

      {/* Glass UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ bottom: '4rem' }}>
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: 'easeOut' }}
          className="absolute top-4 left-0 right-0 text-center text-xl md:text-2xl font-bold text-[#5B3A5D] z-20 pointer-events-none"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          🎂 Cut The Cake Together
        </motion.h2>

        {/* Status Cards */}
        <div className="pointer-events-auto">
          <StatusGlassCard
            role="boy"
            label="Special Partner 💙"
            isOnline={presence.boyOnline}
            isReady={session.boy_ready}
            position="left"
          />
          <StatusGlassCard
            role="girl"
            label="Birthday Queen 👑"
            isOnline={presence.girlOnline}
            isReady={session.girl_ready}
            position="right"
          />
        </div>

        {/* Cut Button */}
        <div className="pointer-events-auto">
          <CutButton
            disabled={!bothOnline || isMyRoleReady || !role}
            isMyRoleReady={isMyRoleReady}
            bothOnline={bothOnline}
            onClick={handleCutClick}
          />
        </div>

        {/* Waiting Toast */}
        <div className="pointer-events-none">
          <WaitingToast variant={toastVariant} />
        </div>

        {/* Celebration Overlay */}
        <div className="pointer-events-auto">
          <CelebrationOverlay
            show={cameraState === 'celebration_zoom_out'}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </div>
  );
}
