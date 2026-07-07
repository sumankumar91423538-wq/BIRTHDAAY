'use client';

import { motion } from 'framer-motion';

export default function Watermark() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.8, ease: 'easeOut' }}
      className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 pointer-events-none select-none"
    >
      <div
        className="
          px-4 py-1.5
          rounded-full
          text-xs
          text-plum/60
          backdrop-blur-md
          border border-pink-primary/20
          shadow-sm
          whitespace-nowrap
        "
        style={{
          background: 'rgba(255, 255, 255, 0.45)',
        }}
      >
        Made by Prince for Meri Jaan Buggu 💕
      </div>
    </motion.div>
  );
}
