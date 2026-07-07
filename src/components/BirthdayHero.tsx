'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useApp } from '@/context/AppContext';

interface BirthdayHeroProps {
  onStartSurprise?: () => void;
}

const BALLOONS = [
  { emoji: '🎈', x: '8%', delay: 0, duration: 7, sineAmp: 18, color: '#FF6FA5' },
  { emoji: '🎈', x: '22%', delay: 1.2, duration: 8.5, sineAmp: 22, color: '#D9C6FF' },
  { emoji: '🎈', x: '78%', delay: 0.6, duration: 6.5, sineAmp: 15, color: '#FF9BC0' },
  { emoji: '🎈', x: '88%', delay: 2.0, duration: 9, sineAmp: 20, color: '#FFE3A3' },
  { emoji: '🎈', x: '45%', delay: 0.3, duration: 7.8, sineAmp: 25, color: '#FF6FA5' },
  { emoji: '🎈', x: '62%', delay: 1.5, duration: 8, sineAmp: 17, color: '#D9C6FF' },
];

const NICKNAME_PILLS = [
  { name: 'Pro Player', emoji: '🎮' },
  { name: 'Gundi', emoji: '😎' },
  { name: 'Rasmalai', emoji: '🍰' },
  { name: 'Kaju Katli', emoji: '✨' },
  { name: 'Buggu', emoji: '🧸' },
  { name: 'Duldul', emoji: '💖' },
  { name: 'Rani', emoji: '👑' },
];

export default function BirthdayHero({ onStartSurprise }: BirthdayHeroProps) {
  const { setActiveSection } = useApp();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const handleStartSurprise = () => {
    if (onStartSurprise) {
      onStartSurprise();
    } else {
      setActiveSection('cake');
    }
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pb-24"
      style={{
        background: 'linear-gradient(180deg, #FFF3F8 0%, #F1E9FF 40%, #FFF3F8 70%, #FFE3A3 100%)',
      }}
    >
      {/* Ambient background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            top: '-5%',
            right: '-8%',
            background: 'radial-gradient(circle, rgba(255, 155, 192, 0.15) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 250,
            height: 250,
            bottom: '10%',
            left: '-5%',
            background: 'radial-gradient(circle, rgba(217, 198, 255, 0.15) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            top: '40%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'radial-gradient(circle, rgba(255, 227, 163, 0.1) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* Floating balloons */}
      {BALLOONS.map((balloon, i) => (
        <motion.div
          key={`balloon-${i}`}
          className="absolute text-4xl md:text-5xl pointer-events-none select-none"
          style={{ left: balloon.x, bottom: '-10%' }}
          animate={{
            y: [0, -(typeof window !== 'undefined' ? window.innerHeight + 200 : 1200)],
          }}
          transition={{
            y: {
              duration: balloon.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: balloon.delay,
            },
          }}
        >
          <motion.span
            className="inline-block"
            animate={{
              x: [0, balloon.sineAmp, 0, -balloon.sineAmp, 0],
              rotate: [0, 8, 0, -8, 0],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {balloon.emoji}
          </motion.span>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
          {/* Text column */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 order-2 md:order-1">
            {/* Sub-badge for Birthday Date */}
            <motion.div
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
              style={{
                backgroundColor: 'rgba(255, 155, 192, 0.15)',
                color: '#FF6FA5',
                border: '1px solid rgba(255, 155, 192, 0.25)'
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              🎂 8 July 2026 • 15th Birthday 🌟
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5"
              style={{
                background: 'linear-gradient(135deg, #FF9BC0 0%, #FF6FA5 50%, #D9C6FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              Happy Birthday Buggu 🎂
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg md:text-xl font-medium mb-8 max-w-md"
              style={{ color: '#5B3A5D' }}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 0.8, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            >
              A tiny world made only to make you smile.
            </motion.p>

            {/* Nickname pills */}
            <motion.div
              className="flex flex-wrap gap-3 mb-10 justify-center md:justify-start"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {NICKNAME_PILLS.map((pill, i) => (
                <motion.div
                  key={pill.name}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 4px 16px rgba(255, 155, 192, 0.15)',
                    color: '#5B3A5D',
                  }}
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 2.5 + i * 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.4,
                  }}
                >
                  {pill.emoji} {pill.name}
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.button
              className="px-10 py-4 rounded-full text-white font-semibold text-lg tracking-wide cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #FF9BC0 0%, #FF6FA5 50%, #D9C6FF 100%)',
                boxShadow: '0 6px 30px rgba(255, 111, 165, 0.35)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 8px 40px rgba(255, 111, 165, 0.5)',
              }}
              whileTap={{ scale: 0.96 }}
              transition={{
                type: 'spring',
                damping: 15,
                stiffness: 250,
                delay: 0.8,
              }}
              onClick={handleStartSurprise}
            >
              Go To Cake Cutting 🎂
            </motion.button>
          </div>

          {/* Cake column */}
          <div className="flex-1 flex items-center justify-center order-1 md:order-2">
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
              transition={{
                type: 'spring',
                damping: 10,
                stiffness: 120,
                delay: 0.2,
              }}
            >
              {/* Glow behind cake */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 227, 163, 0.3) 0%, transparent 60%)',
                  transform: 'scale(1.8)',
                }}
                animate={{ scale: [1.6, 1.9, 1.6], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Cake emoji */}
              <motion.div
                className="relative text-[120px] md:text-[160px] lg:text-[200px] leading-none select-none"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                🎂
              </motion.div>

              {/* Floating sparkles around cake */}
              {['✨', '🌟', '⭐', '💫', '✨', '🌟'].map((sparkle, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute text-lg md:text-xl pointer-events-none"
                  style={{
                    left: `${['-15%', '105%', '-20%', '110%', '50%', '45%'][i]}`,
                    top: `${['-5%', '10%', '60%', '70%', '-12%', '95%'][i]}`,
                  }}
                  animate={{
                    y: [0, -10, 0, 8, 0],
                    x: [0, 6, -4, 3, 0],
                    scale: [1, 1.3, 0.9, 1.15, 1],
                    opacity: [0.5, 1, 0.6, 0.9, 0.5],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.4,
                  }}
                >
                  {sparkle}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(255, 243, 248, 0.8) 0%, transparent 100%)',
        }}
      />
    </section>
  );
}
