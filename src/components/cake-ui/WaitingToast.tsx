'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ToastVariant } from '@/lib/cakeSessionTypes';

interface WaitingToastProps {
  variant: ToastVariant;
}

export default function WaitingToast({ variant }: WaitingToastProps) {
  const isNone = variant === 'none';

  let message = '';
  if (variant === 'waiting') {
    message = 'Rukonna baba, 2 min… main bhi aa raha hoon 😭🎂';
  } else if (variant === 'stepped_away') {
    message = "Looks like someone stepped away — let's try the cut again together 🎈";
  }

  return (
    <div className="absolute bottom-[10.5rem] left-1/2 -translate-x-1/2 z-30 pointer-events-none w-full max-w-xs md:max-w-sm flex justify-center">
      <AnimatePresence>
        {!isNone && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative px-5 py-3.5 text-center pointer-events-auto rounded-2xl border border-white/70 shadow-[0_8px_32px_rgba(255,155,192,0.18)] backdrop-blur-[18px] bg-white/65"
          >
            <p className="text-xs md:text-sm font-bold text-[#5B3A5D]">
              {message}
            </p>
            {/* Speech bubble down arrow */}
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b border-white/70"
              style={{
                backgroundColor: 'rgba(255,255,255,0.65)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
