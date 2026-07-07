'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NicknameData {
  nickname: string;
  emoji: string;
  message: string;
}

const nicknames: NicknameData[] = [
  {
    nickname: 'Pro Player',
    emoji: '🎮',
    message: 'My ultimate pro player who plays with my heart and wins every time! 🏆🎮',
  },
  {
    nickname: 'Gundi',
    emoji: '😎',
    message: 'The one and only Gundi, my favourite chaos 😎💕',
  },
  {
    nickname: 'Rasmalai',
    emoji: '🍰',
    message: 'Sweetest rasmalai, way sweeter than any dessert in this world 🍰🍬',
  },
  {
    nickname: 'Kaju Katli',
    emoji: '✨',
    message: 'My delicate, precious Kaju Katli! ✨🍬',
  },
  {
    nickname: 'Buggu',
    emoji: '🧸',
    message: 'My sweetest buggu, my entire galaxy 🌌🧸',
  },
  {
    nickname: 'Duldul',
    emoji: '💖',
    message: 'My cute little duldul, who rides straight into my heart! 💖✨',
  },
  {
    nickname: 'Rani',
    emoji: '👑',
    message: 'My queen who rules my heart forever! 👑💍',
  },
];

/* Alternating pastel bg colors for pills */
const pillColors = [
  'rgba(255, 155, 192, 0.18)',
  'rgba(217, 198, 255, 0.22)',
  'rgba(255, 227, 163, 0.22)',
  'rgba(255, 155, 192, 0.18)',
  'rgba(217, 198, 255, 0.22)',
  'rgba(255, 227, 163, 0.22)',
  'rgba(255, 155, 192, 0.18)',
  'rgba(217, 198, 255, 0.22)',
];

export default function NicknameWall() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handlePillClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleClose = () => {
    setActiveIndex(null);
  };

  return (
    <section
      id="nicknames"
      className="relative min-h-screen py-20 px-4"
    >
      {/* Section Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-3xl sm:text-4xl font-bold text-[#5B3A5D] mb-14 text-center"
      >
        💕 What I Call You
      </motion.h2>

      {/* Pills Container */}
      <div className="max-w-2xl mx-auto flex flex-wrap justify-center gap-3 sm:gap-4">
        {nicknames.map((item, index) => (
          <motion.button
            key={index}
            onClick={() => handlePillClick(index)}
            className="relative px-5 py-3 sm:px-6 sm:py-3.5
              rounded-full cursor-pointer select-none
              backdrop-blur-[14px] border border-white/60
              shadow-[0_4px_20px_rgba(255,155,192,0.15)]
              hover:shadow-[0_6px_30px_rgba(255,155,192,0.3)]
              transition-shadow duration-300
              text-[#5B3A5D] font-semibold text-sm sm:text-base"
            style={{ backgroundColor: pillColors[index % pillColors.length] }}
            /* Lazy floating animation */
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              y: {
                duration: 3 + (index % 3) * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.2,
              },
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="mr-1.5">{item.emoji}</span>
            {item.nickname}
          </motion.button>
        ))}
      </div>

      {/* Popup Overlay + Card */}
      <AnimatePresence>
        {activeIndex !== null && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[6px]"
            />

            {/* Popup Card */}
            <motion.div
              key="popup"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                mass: 0.8,
              }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-6"
            >
              <div
                className="pointer-events-auto relative w-full max-w-sm rounded-3xl p-8
                  backdrop-blur-[18px] bg-white/55 border border-white/60
                  shadow-[0_8px_40px_rgba(255,155,192,0.25)]
                  text-center"
                style={{
                  boxShadow:
                    '0 8px 40px rgba(255,155,192,0.25), 0 0 40px rgba(217,198,255,0.2), inset 0 0 30px rgba(217,198,255,0.1)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Glow border effect */}
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    boxShadow: 'inset 0 0 0 1.5px rgba(217,198,255,0.5)',
                  }}
                />

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full
                    bg-[#F1E9FF] hover:bg-[#D9C6FF] transition-colors
                    flex items-center justify-center text-[#5B3A5D] text-sm font-bold
                    cursor-pointer"
                  aria-label="Close"
                >
                  ✕
                </button>

                {/* Emoji */}
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="text-5xl sm:text-6xl block mb-4"
                >
                  {nicknames[activeIndex].emoji}
                </motion.span>

                {/* Nickname */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="text-xl sm:text-2xl font-bold text-[#5B3A5D] mb-3"
                >
                  {nicknames[activeIndex].nickname}
                </motion.h3>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="text-[#5B3A5D]/80 text-base leading-relaxed"
                >
                  {nicknames[activeIndex].message}
                </motion.p>

                {/* Tap to close hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="mt-5 text-xs text-[#5B3A5D]/50"
                >
                  tap anywhere to close
                </motion.p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
