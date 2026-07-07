'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import confetti from 'canvas-confetti';

const CONFETTI_COLORS = ['#FF9BC0', '#D9C6FF', '#FFE3A3', '#FF6FA5', '#F1E9FF'];

function fireFireworks() {
  const bursts = [
    { delay: 0, origin: { x: 0.5, y: 0.4 }, particleCount: 100, spread: 70 },
    { delay: 400, origin: { x: 0.3, y: 0.35 }, particleCount: 80, spread: 60 },
    { delay: 800, origin: { x: 0.7, y: 0.45 }, particleCount: 90, spread: 75 },
    { delay: 1200, origin: { x: 0.5, y: 0.3 }, particleCount: 70, spread: 90 },
  ];

  bursts.forEach(({ delay, origin, particleCount, spread }) => {
    setTimeout(() => {
      confetti({
        particleCount,
        spread,
        origin,
        colors: CONFETTI_COLORS,
        gravity: 0.6,
        ticks: 300,
        scalar: 1.1,
      });
    }, delay);
  });
}

export default function FinalSurprise() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [hasRevealed, setHasRevealed] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const confettiFiredRef = useRef(false);

  const triggerReveal = useCallback(() => {
    if (!confettiFiredRef.current) {
      confettiFiredRef.current = true;
      setTimeout(() => fireFireworks(), 600);
    }
    setHasRevealed(true);
  }, []);

  const handleReplay = () => {
    confettiFiredRef.current = false;
    setHasRevealed(false);
    setRevealKey((k) => k + 1);
    setTimeout(() => {
      confettiFiredRef.current = false;
      setHasRevealed(false);
      requestAnimationFrame(() => {
        setHasRevealed(true);
        confettiFiredRef.current = true;
        fireFireworks();
      });
    }, 100);
  };

  if (isInView && !hasRevealed) {
    triggerReveal();
  }

  return (
    <section
      ref={sectionRef}
      id="surprise"
      className="relative min-h-screen flex flex-col items-center justify-center py-20 px-4 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #F1E9FF 0%, #FFF3F8 40%, #F1E9FF 100%)',
      }}
    >
      {/* Ambient glow orbs */}
      <div
        className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FF9BC0, transparent)' }}
      />
      <div
        className="absolute bottom-20 right-10 w-64 h-64 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FFE3A3, transparent)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #D9C6FF, transparent)' }}
      />

      {/* Main Reveal Card */}
      {hasRevealed && (
        <motion.div
          key={revealKey}
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 180,
            damping: 10,
            mass: 0.8,
          }}
          className="relative z-10 w-full max-w-lg mx-auto"
        >
          <div
            className="rounded-3xl p-8 md:p-10 text-center"
            style={{
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              backgroundColor: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow:
                '0 8px 40px rgba(255,155,192,0.25), 0 0 60px rgba(255,155,192,0.15), 0 0 80px rgba(255,227,163,0.1)',
            }}
          >
            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{
                color: '#5B3A5D',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              🎉 The Final Surprise
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-base md:text-lg leading-relaxed mb-6"
              style={{ color: '#5B3A5D' }}
            >
              Happy Birthday Gundi! You are the most precious person in my life.
              Every day with you is a gift, and today I celebrate YOU. This
              little galaxy was made just for you — because you deserve your own
              universe of love. 💕🌌
            </motion.p>

            {/* Love line */}
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 15 }}
              className="text-xl md:text-2xl font-bold mb-6"
              style={{
                color: '#FF6FA5',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              I love you to the moon and back 🌙
            </motion.p>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="h-px w-24 mx-auto mb-4"
              style={{
                background:
                  'linear-gradient(90deg, transparent, #FF9BC0, transparent)',
              }}
            />

            {/* Signature */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-lg font-semibold italic"
              style={{ color: '#5B3A5D' }}
            >
              — Prince 💕
            </motion.p>

            {/* Replay Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.4 }}
              onClick={handleReplay}
              className="mt-8 px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{
                backgroundColor: 'rgba(255,155,192,0.15)',
                color: '#FF6FA5',
                border: '1px solid rgba(255,155,192,0.3)',
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block"
              >
                Replay The Surprise 🔄
              </motion.span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Teaser before reveal */}
      {!hasRevealed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl block"
          >
            🎁
          </motion.span>
          <p
            className="mt-4 text-lg font-medium"
            style={{ color: '#5B3A5D' }}
          >
            Scroll down for a surprise...
          </p>
        </motion.div>
      )}
    </section>
  );
}
