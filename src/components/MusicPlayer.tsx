'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';

const barVariants: any = {
  playing: (i: number) => ({
    height: ['30%', '100%', '50%', '85%', '30%'],
    transition: {
      duration: 0.7 + i * 0.12,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }),
  paused: {
    height: '30%',
    transition: { duration: 0.3 },
  },
};

export default function MusicPlayer() {
  const { musicPlaying, setMusicPlaying } = useApp();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/music/videoplayback.m4a');
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setMusicPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [musicPlaying, setMusicPlaying]);

  const handleToggle = () => {
    setMusicPlaying(!musicPlaying);
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 15 }}
      onClick={handleToggle}
      className="fixed z-40 flex items-center gap-3 cursor-pointer"
      style={{
        bottom: '5.5rem',
        right: '1rem',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255,255,255,0.65)',
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(255,155,192,0.16)',
        borderRadius: '24px',
        padding: '0.6rem 1.2rem',
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      aria-label={musicPlaying ? 'Pause music' : 'Play music'}
    >
      {/* Sound Wave Bars */}
      <AnimatePresence mode="wait">
        {musicPlaying ? (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-end gap-[3px] h-5 w-5"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                custom={i}
                variants={barVariants}
                animate="playing"
                className="w-[3px] rounded-full"
                style={{
                  backgroundColor: '#FF6FA5',
                  originY: 1,
                }}
              />
            ))}
          </motion.div>
        ) : (
          <motion.span
            key="paused"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-base"
          >
            🎵
          </motion.span>
        )}
      </AnimatePresence>

      <span
        className="text-xs font-bold select-none text-[#5B3A5D]"
      >
        Soft Birthday Music 🎵
      </span>
    </motion.button>
  );
}
