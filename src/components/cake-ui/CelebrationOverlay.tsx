'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CelebrationOverlayProps {
  show: boolean;
  onContinue: () => void;
}

const CONFETTI_COLORS = ['#FF9BC0', '#D9C6FF', '#FFE3A3', '#FF6FA5', '#F1E9FF'];

export default function CelebrationOverlay({
  show,
  onContinue,
}: CelebrationOverlayProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (show && !firedRef.current) {
      firedRef.current = true;

      // 1. Center burst
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: CONFETTI_COLORS,
      });

      // 2. Left side burst
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { x: 0.2, y: 0.5 },
          colors: CONFETTI_COLORS,
        });
      }, 300);

      // 3. Right side burst
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { x: 0.8, y: 0.5 },
          colors: CONFETTI_COLORS,
        });
      }, 600);
    }

    if (!show) {
      firedRef.current = false;
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-40 pointer-events-auto flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/15 backdrop-blur-[4px]"
          />

          {/* Centered glass card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{
              type: 'spring',
              stiffness: 150,
              damping: 12,
            }}
            className="relative w-full max-w-sm rounded-3xl p-8 border border-white/80 shadow-[0_16px_50px_rgba(255,155,192,0.25)] backdrop-blur-[22px] bg-white/75 flex flex-col items-center gap-6 text-center"
          >
            {/* Bounce animation emoji */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="text-6xl select-none"
            >
              🎉
            </motion.div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#FF6FA5] to-[#9D7DFF] bg-clip-text text-transparent">
                Cake cut together!
              </h2>
              <p className="text-sm font-extrabold text-[#5B3A5D]">
                Happy Birthday Birthday Queen 👑
              </p>
            </div>

            {/* Divider line */}
            <div className="w-16 h-[3px] rounded-full bg-gradient-to-r from-[#FF9BC0] to-[#D9C6FF]" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="px-8 py-3 rounded-full text-white font-extrabold text-sm tracking-wider cursor-pointer shadow-md shadow-pink-primary/10 bg-gradient-to-r from-[#FF9BC0] to-[#FF6FA5]"
            >
              Continue 💫
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
