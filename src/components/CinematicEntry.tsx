'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useApp } from '@/context/AppContext';

interface CinematicEntryProps {
  onEnter?: () => void;
}

/* ──────────────────────────────────────────────
   Floating element generators (memoised once)
   ────────────────────────────────────────────── */

interface Heart {
  id: number;
  x: number;
  bottom: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

interface Balloon {
  id: number;
  x: number;
  bottom: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface TinyStar {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const HEART_COLORS = [
  'rgba(255, 155, 192, 0.6)',
  'rgba(255, 182, 210, 0.5)',
  'rgba(237, 175, 215, 0.5)',
  'rgba(255, 200, 221, 0.45)',
];

const BALLOON_COLORS = [
  'rgba(255, 155, 192, 0.5)',
  'rgba(217, 198, 255, 0.5)',
  'rgba(255, 218, 233, 0.45)',
  'rgba(200, 180, 255, 0.45)',
  'rgba(255, 227, 163, 0.4)',
];

function generateHearts(count: number): Heart[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 90 + 5,
    bottom: -(Math.random() * 10 + 5),
    size: Math.random() * 14 + 10,
    duration: Math.random() * 8 + 12,
    delay: Math.random() * 10,
    color: HEART_COLORS[i % HEART_COLORS.length],
  }));
}

function generateBalloons(count: number): Balloon[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 85 + 7,
    bottom: -(Math.random() * 15 + 5),
    size: Math.random() * 18 + 20,
    duration: Math.random() * 10 + 14,
    delay: Math.random() * 12,
    color: BALLOON_COLORS[i % BALLOON_COLORS.length],
  }));
}

function generateSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 90 + 5,
    y: Math.random() * 90 + 5,
    size: Math.random() * 6 + 4,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 6,
  }));
}

function generateStars(count: number): TinyStar[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 95 + 2,
    y: Math.random() * 95 + 2,
    size: Math.random() * 3 + 1.5,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
  }));
}

/* ──────────────────────────────────────────────
   Text constants
   ────────────────────────────────────────────── */

const DATE_TEXT = '26 November 2025';
const TITLE_TEXT = 'Gundi Ka Happy Wala Birthday 🎈';
const SUBTITLE_TEXT = 'A tiny birthday world made only to make you smile.';
const BUTTON_TEXT = 'Enter Surprise ✨';

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

export default function CinematicEntry({ onEnter }: CinematicEntryProps) {
  const { setEntryComplete } = useApp();
  const [phase, setPhase] = useState<'loading' | 'reveal' | 'exiting'>('loading');
  const [showDate, setShowDate] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const layerAx = useTransform(mouseX, [-500, 500], [6, -6]);
  const layerAy = useTransform(mouseY, [-500, 500], [6, -6]);
  const layerBx = useTransform(mouseX, [-500, 500], [12, -12]);
  const layerBy = useTransform(mouseY, [-500, 500], [12, -12]);

  // Memoised floating elements
  const hearts = useMemo(() => generateHearts(10), []);
  const balloons = useMemo(() => generateBalloons(6), []);
  const sparkles = useMemo(() => generateSparkles(16), []);
  const stars = useMemo(() => generateStars(25), []);

  // Mouse tracking
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      let px: number, py: number;
      if ('touches' in e) {
        px = e.touches[0].clientX;
        py = e.touches[0].clientY;
      } else {
        px = e.clientX;
        py = e.clientY;
      }
      mouseX.set(px - cx);
      mouseY.set(py - cy);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove as EventListener);
    };
  }, [mouseX, mouseY]);

  // Staggered reveal sequence
  useEffect(() => {
    const t0 = setTimeout(() => setPhase('reveal'), 300);
    const t1 = setTimeout(() => setShowDate(true), 600);
    const t2 = setTimeout(() => setShowTitle(true), 1400);
    const t3 = setTimeout(() => setShowSubtitle(true), 2200);
    const t4 = setTimeout(() => setShowButton(true), 3000);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleEnter = useCallback(() => {
    setPhase('exiting');
    setTimeout(() => {
      setEntryComplete(true);
      if (onEnter) onEnter();
    }, 900);
  }, [setEntryComplete, onEnter]);

  const isExiting = phase === 'exiting';

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden cursor-default"
      initial={{ opacity: 0 }}
      animate={
        isExiting
          ? { scale: 1.3, opacity: 0, filter: 'blur(12px)' }
          : { opacity: 1, scale: 1, filter: 'blur(0px)' }
      }
      transition={{
        duration: isExiting ? 0.9 : 0.6,
        ease: isExiting ? [0.4, 0, 1, 1] : 'easeOut',
      }}
      style={{
        background:
          'linear-gradient(145deg, #FFF0F5 0%, #FDE4F0 15%, #F3E0FF 35%, #E8D5FF 50%, #FFF0F5 65%, #FFEAF2 80%, #FFF8FA 100%)',
      }}
    >
      {/* ── Animated background layer with slow zoom ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ animation: 'entry-bg-zoom 12s ease-in-out infinite' }}
      >
        {/* Soft glowing blur circles */}
        {[
          { x: '15%', y: '20%', size: 220, color: 'rgba(255, 182, 210, 0.35)' },
          { x: '75%', y: '15%', size: 180, color: 'rgba(217, 198, 255, 0.3)' },
          { x: '60%', y: '70%', size: 240, color: 'rgba(255, 200, 221, 0.3)' },
          { x: '25%', y: '75%', size: 160, color: 'rgba(200, 180, 255, 0.25)' },
          { x: '50%', y: '40%', size: 200, color: 'rgba(255, 227, 200, 0.2)' },
        ].map((orb, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              transform: 'translate(-50%, -50%)',
              animation: `glow-orb-drift ${7 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}

        {/* ── Parallax Layer A: Tiny Stars ── */}
        <motion.div className="absolute inset-0" style={{ x: layerAx, y: layerAy }}>
          {stars.map((s) => (
            <div
              key={`star-${s.id}`}
              className="absolute"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 200, 220, 0.7)',
                boxShadow: `0 0 ${s.size * 2}px rgba(255, 155, 192, 0.4)`,
                animation: `tiny-star-pulse ${s.duration}s ease-in-out infinite`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </motion.div>

        {/* ── Parallax Layer B: Floating Hearts + Balloons + Sparkles ── */}
        <motion.div className="absolute inset-0" style={{ x: layerBx, y: layerBy }}>
          {/* Hearts */}
          {hearts.map((h) => (
            <div
              key={`heart-${h.id}`}
              className="absolute select-none"
              style={{
                left: `${h.x}%`,
                bottom: `${h.bottom}%`,
                fontSize: h.size,
                color: h.color,
                animation: `float-heart ${h.duration}s ease-in-out infinite`,
                animationDelay: `${h.delay}s`,
                filter: `drop-shadow(0 0 4px ${h.color})`,
              }}
            >
              ♥
            </div>
          ))}

          {/* Balloons */}
          {balloons.map((b) => (
            <div
              key={`balloon-${b.id}`}
              className="absolute select-none"
              style={{
                left: `${b.x}%`,
                bottom: `${b.bottom}%`,
                fontSize: b.size,
                animation: `float-balloon ${b.duration}s ease-in-out infinite`,
                animationDelay: `${b.delay}s`,
                filter: `drop-shadow(0 0 6px ${b.color})`,
                opacity: 0.65,
              }}
            >
              🎈
            </div>
          ))}

          {/* Sparkles */}
          {sparkles.map((sp) => (
            <div
              key={`sparkle-${sp.id}`}
              className="absolute"
              style={{
                left: `${sp.x}%`,
                top: `${sp.y}%`,
                width: sp.size,
                height: sp.size,
                animation: `sparkle-twinkle ${sp.duration}s ease-in-out infinite`,
                animationDelay: `${sp.delay}s`,
              }}
            >
              <svg viewBox="0 0 24 24" fill="rgba(255, 200, 160, 0.7)" width="100%" height="100%">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
              </svg>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Glassmorphism Card ── */}
      <div className="relative z-10 flex items-center justify-center w-full px-4 sm:px-6">
        <AnimatePresence>
          {phase !== 'loading' && (
            <motion.div
              className="relative w-full max-w-[380px] sm:max-w-md overflow-hidden"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={
                isExiting
                  ? { opacity: 0, scale: 1.1, filter: 'blur(16px)' }
                  : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
              }
              transition={{
                duration: isExiting ? 0.7 : 0.8,
                ease: isExiting ? 'easeIn' : [0.22, 1, 0.36, 1],
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                borderRadius: '2rem',
                border: '1px solid rgba(255, 200, 220, 0.5)',
                boxShadow:
                  '0 8px 40px rgba(255, 155, 192, 0.15), 0 2px 12px rgba(217, 198, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                padding: '2.5rem 1.5rem 2rem',
              }}
            >
              {/* Glowing pink edge (top) */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-3/4 rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255, 155, 192, 0.6), rgba(217, 198, 255, 0.5), transparent)',
                }}
              />

              {/* Shimmer overlay */}
              <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.25) 50%, transparent 60%)',
                    animation: 'shimmer-slide 4s ease-in-out infinite',
                    animationDelay: '2s',
                  }}
                />
              </div>

              {/* Card Content */}
              <div className="relative flex flex-col items-center text-center select-none">
                {/* Date */}
                <div className="min-h-[28px] mb-4 flex items-center justify-center">
                  <AnimatePresence>
                    {showDate && (
                      <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase"
                        style={{
                          color: 'rgba(180, 140, 170, 0.85)',
                          fontFamily: 'var(--font-poppins-var), sans-serif',
                        }}
                      >
                        {DATE_TEXT}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Title */}
                <div className="min-h-[80px] sm:min-h-[100px] mb-3 flex items-center justify-center">
                  <AnimatePresence>
                    {showTitle && (
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.8,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="text-[1.7rem] sm:text-4xl leading-snug font-bold px-1"
                        style={{
                          fontFamily: 'var(--font-dancing-var), cursive',
                          background:
                            'linear-gradient(135deg, #FF9BC0 0%, #E896C0 25%, #D9A0E0 50%, #C9A0F0 70%, #FFD4A8 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          filter: 'drop-shadow(0 2px 8px rgba(255, 155, 192, 0.3))',
                        }}
                      >
                        {TITLE_TEXT}
                      </motion.h1>
                    )}
                  </AnimatePresence>
                </div>

                {/* Subtitle */}
                <div className="min-h-[40px] mb-8 flex items-center justify-center">
                  <AnimatePresence>
                    {showSubtitle && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.8, y: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="text-sm sm:text-base font-medium leading-relaxed max-w-[280px] sm:max-w-xs"
                        style={{
                          color: 'rgba(130, 100, 140, 0.85)',
                          fontFamily: 'var(--font-poppins-var), sans-serif',
                        }}
                      >
                        {SUBTITLE_TEXT}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Button */}
                <div className="min-h-[56px] flex items-center justify-center">
                  <AnimatePresence>
                    {showButton && (
                      <motion.button
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          type: 'spring',
                          damping: 12,
                          stiffness: 200,
                        }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow:
                            '0 0 40px rgba(255, 155, 192, 0.4), 0 0 80px rgba(217, 198, 255, 0.2)',
                        }}
                        whileTap={{ scale: 0.94 }}
                        onClick={handleEnter}
                        className="relative cursor-pointer select-none overflow-hidden px-10 py-3.5 sm:px-12 sm:py-4 rounded-full text-white font-semibold text-base sm:text-lg tracking-wide"
                        style={{
                          fontFamily: 'var(--font-poppins-var), sans-serif',
                          background:
                            'linear-gradient(135deg, #FF9BC0 0%, #E88FCF 40%, #D9A0E0 70%, #C9A0F0 100%)',
                          animation: 'button-glow-pulse 2.5s ease-in-out infinite',
                        }}
                      >
                        {/* Button shimmer */}
                        <span
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              'linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, 0.3) 50%, transparent 65%)',
                            animation: 'shimmer-slide 3s ease-in-out infinite',
                          }}
                        />
                        <span className="relative z-10">{BUTTON_TEXT}</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
