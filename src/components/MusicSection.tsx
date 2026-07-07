'use client';

import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';

export default function MusicSection() {
  const { musicPlaying, setMusicPlaying } = useApp();

  const toggleMusic = () => {
    setMusicPlaying(!musicPlaying);
  };

  return (
    <section
      id="music-section"
      className="relative min-h-screen py-20 px-4 w-full max-w-md mx-auto flex flex-col items-center justify-center text-center"
    >
      {/* Background slow zoom */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FFE3A3, transparent)' }}
        />
      </motion.div>

      {/* Control Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative z-10 w-full rounded-3xl p-8 backdrop-blur-[20px] bg-white/60 border border-white/70 shadow-[0_12px_40px_rgba(255,155,192,0.22)] flex flex-col items-center"
      >
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#5B3A5D]/60 mb-6">
          Now Playing
        </span>

        {/* Vinyl/CD Graphic (rotates when playing) */}
        <motion.div
          className="w-40 h-40 rounded-full bg-[#1A1030] border-8 border-white/80 shadow-md flex items-center justify-center relative mb-8"
          animate={musicPlaying ? { rotate: 360 } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-12 h-12 rounded-full bg-[#FF9BC0] border-4 border-white/90 flex items-center justify-center">
            <span className="text-white text-xs">💖</span>
          </div>
          <div className="absolute inset-4 rounded-full border border-dashed border-white/20 pointer-events-none" />
          <div className="absolute inset-8 rounded-full border border-dashed border-white/20 pointer-events-none" />
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#5B3A5D] mb-1">
          Soft Birthday Music 🎵
        </h3>
        <p className="text-xs text-[#5B3A5D]/60 font-semibold mb-8">
          Made with Love for Buggu
        </p>

        {/* Animated Waveform */}
        <div className="flex items-end gap-[4px] h-10 mb-8 justify-center w-full">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <motion.div
              key={i}
              className="w-[5px] rounded-full"
              style={{
                backgroundColor: '#FF6FA5',
                originY: 1,
              }}
              animate={
                musicPlaying
                  ? { height: ['20%', '100%', '40%', '80%', '20%'] }
                  : { height: '20%' }
              }
              transition={{
                duration: 0.6 + (i % 3) * 0.15,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.05,
              }}
            />
          ))}
        </div>

        {/* Play/Pause Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMusic}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg shadow-pink-primary/30"
          style={{
            background: 'linear-gradient(135deg, #FF9BC0 0%, #FF6FA5 100%)',
          }}
        >
          {musicPlaying ? (
            <svg
              className="w-6 h-6 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 fill-current ml-1"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.button>
      </motion.div>
    </section>
  );
}
