'use client';

import { motion } from 'framer-motion';

interface StatusGlassCardProps {
  role: 'boy' | 'girl';
  label: string;
  isOnline: boolean;
  isReady: boolean;
  position: 'left' | 'right';
}

export default function StatusGlassCard({
  role,
  label,
  isOnline,
  isReady,
  position,
}: StatusGlassCardProps) {
  // Styles based on positions
  const positionClasses =
    position === 'left'
      ? 'left-4 md:left-8'
      : 'right-4 md:right-8';

  const emoji = role === 'girl' ? '👑' : '💙';

  // Status text & colors
  let statusText = 'Offline';
  let statusStyle = { color: 'rgba(91, 58, 93, 0.4)' }; // Dimmed plum

  if (isOnline) {
    if (isReady) {
      statusText = 'Ready ✓';
      statusStyle = { color: '#FFB300' }; // Soft gold
    } else {
      statusText = 'Online';
      statusStyle = { color: '#5B3A5D' }; // Normal plum
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
      className={`absolute top-16 md:top-6 z-20 pointer-events-auto w-[140px] md:w-[180px] rounded-2xl p-3 md:p-4 border border-white/60 shadow-[0_8px_32px_rgba(255,155,192,0.1)] backdrop-blur-[18px] bg-white/55 flex flex-col gap-1 ${positionClasses}`}
    >
      <div className="flex items-center gap-1.5 md:gap-2">
        <span className="text-lg md:text-xl">{emoji}</span>
        <span className="text-[10px] md:text-xs font-bold text-[#5B3A5D]/70 uppercase tracking-wider">
          {role === 'girl' ? 'Queen' : 'Partner'}
        </span>
      </div>

      <h3 className="text-xs md:text-sm font-extrabold text-[#5B3A5D] truncate">
        {label.split(' ')[0]}
      </h3>

      <div className="flex items-center gap-1.5 mt-1">
        {/* Glow indicator dot */}
        <span
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            !isOnline
              ? 'bg-neutral-300 shadow-none'
              : isReady
              ? 'bg-amber-400 shadow-[0_0_8px_#FFB300]'
              : 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'
          }`}
        />
        <motion.span
          key={statusText}
          initial={{ scale: 0.9, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[10px] md:text-xs font-extrabold"
          style={statusStyle}
        >
          {statusText}
        </motion.span>
      </div>
    </motion.div>
  );
}
