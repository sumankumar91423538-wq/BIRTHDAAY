'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyUnlockCode } from '@/lib/unlock';
import { useApp, type Role } from '@/context/AppContext';

interface PasswordUnlockProps {
  onUnlock?: (role: Role) => void;
}

const FLOATING_ELEMENTS = [
  { emoji: '💖', x: '8%', y: '12%', size: 22, duration: 5.2, delay: 0 },
  { emoji: '✨', x: '85%', y: '8%', size: 18, duration: 4.8, delay: 0.5 },
  { emoji: '💕', x: '15%', y: '78%', size: 20, duration: 6.0, delay: 1.0 },
  { emoji: '⭐', x: '90%', y: '72%', size: 16, duration: 5.5, delay: 0.3 },
  { emoji: '💗', x: '75%', y: '25%', size: 24, duration: 4.5, delay: 1.5 },
  { emoji: '🌟', x: '25%', y: '88%', size: 14, duration: 5.8, delay: 0.8 },
  { emoji: '💖', x: '60%', y: '5%', size: 20, duration: 5.0, delay: 1.2 },
  { emoji: '✨', x: '5%', y: '45%', size: 16, duration: 6.2, delay: 0.2 },
  { emoji: '💕', x: '92%', y: '50%', size: 18, duration: 4.9, delay: 1.8 },
  { emoji: '⭐', x: '45%', y: '92%', size: 22, duration: 5.3, delay: 0.6 },
];

export default function PasswordUnlock({ onUnlock }: PasswordUnlockProps) {
  const { setAuthState, setRole } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showErrorBorder, setShowErrorBorder] = useState(false);
  const [lockRotation, setLockRotation] = useState(0);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      const result = await verifyUnlockCode(code);

      if (result.success && result.role) {
        const mappedRole: Role = result.role;
        setLockRotation(-30);
        setIsSuccess(true);

        setTimeout(() => {
          setAuthState('unlocked');
          setRole(mappedRole);
          if (onUnlock) onUnlock(mappedRole);
        }, 1500);
      } else {
        setIsShaking(true);
        setShowErrorBorder(true);
        setError('Oops… this is not our magic date 💫');

        setTimeout(() => setIsShaking(false), 500);
        setTimeout(() => setShowErrorBorder(false), 1200);
      }
    },
    [code, onUnlock, setAuthState, setRole]
  );

  const formatAsDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < digits.length && i < 8; i++) {
      if (i === 2 || i === 4) formatted += '/';
      formatted += digits[i];
    }
    return formatted;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAsDate(e.target.value);
    setCode(formatted);
    if (error) setError('');
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated pastel gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(135deg, #FFF3F8 0%, #F1E9FF 30%, #FFE3A3 60%, #FFF3F8 100%)',
            'linear-gradient(135deg, #F1E9FF 0%, #FFE3A3 30%, #FFF3F8 60%, #D9C6FF 100%)',
            'linear-gradient(135deg, #FFE3A3 0%, #FFF3F8 30%, #D9C6FF 60%, #F1E9FF 100%)',
            'linear-gradient(135deg, #FFF3F8 0%, #F1E9FF 30%, #FFE3A3 60%, #FFF3F8 100%)',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />

      {/* Floating decorative hearts/stars */}
      {FLOATING_ELEMENTS.map((el, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{ left: el.x, top: el.y, fontSize: el.size }}
          animate={{
            y: [0, -20, 0, 15, 0],
            x: [0, 10, -8, 5, 0],
            rotate: [0, 15, -10, 8, 0],
            scale: [1, 1.15, 0.95, 1.08, 1],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.span
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{
              duration: el.duration * 0.6,
              delay: el.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {el.emoji}
          </motion.span>
        </motion.div>
      ))}

      {/* Glass card */}
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="unlock-card"
            className="relative z-10 w-[92%] max-w-[420px] mx-4"
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x: isShaking ? [-8, 8, -8, 8, 0] : 0,
            }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 260,
              x: { duration: 0.5, ease: 'easeInOut' },
            }}
          >
            <div
              className="relative p-8 md:p-10 rounded-3xl"
              style={{
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                backgroundColor: 'rgba(255, 255, 255, 0.55)',
                border: `1.5px solid ${showErrorBorder ? 'rgba(255, 80, 120, 0.7)' : 'rgba(255, 255, 255, 0.6)'}`,
                boxShadow: '0 8px 40px rgba(255, 155, 192, 0.25)',
                transition: 'border-color 0.3s ease',
              }}
            >
              {/* Lock icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  className="text-5xl"
                  animate={{ rotate: lockRotation }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                >
                  🔒
                </motion.div>
              </div>

              {/* Heading */}
              <motion.h1
                className="text-2xl md:text-[1.65rem] font-semibold text-center mb-2 leading-snug"
                style={{ color: '#5B3A5D' }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                A secret world is waiting...
              </motion.h1>

              <motion.p
                className="text-center text-sm mb-8 opacity-60"
                style={{ color: '#5B3A5D' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.4 }}
              >
                Enter the magic date to unlock ✨
              </motion.p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <motion.input
                    type="text"
                    value={code}
                    onChange={handleInputChange}
                    placeholder="DD/MM/YYYY"
                    maxLength={10}
                    className="w-full px-5 py-4 rounded-2xl text-center text-lg font-medium tracking-widest outline-none transition-all duration-300"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      border: '1.5px solid rgba(255, 155, 192, 0.3)',
                      color: '#5B3A5D',
                      animation: 'glow-pulse 2.5s ease-in-out infinite',
                    }}
                    whileFocus={{
                      scale: 1.02,
                    }}
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      className="text-center text-sm font-medium"
                      style={{ color: '#FF6FA5' }}
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  className="w-full py-4 rounded-full text-white font-semibold text-base tracking-wide cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #FF9BC0 0%, #FF6FA5 50%, #D9C6FF 100%)',
                    boxShadow: '0 4px 20px rgba(255, 111, 165, 0.35)',
                  }}
                  whileHover={{ scale: 1.03, boxShadow: '0 6px 28px rgba(255, 111, 165, 0.45)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                >
                  Unlock Surprise 🔓
                </motion.button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success-card"
            className="relative z-10 w-[92%] max-w-[420px] mx-4"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          >
            {/* Gold glow radiate */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(255, 227, 163, 0.6) 0%, transparent 70%)',
              }}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />

            <div
              className="relative p-8 md:p-10 rounded-3xl"
              style={{
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                backgroundColor: 'rgba(255, 255, 255, 0.55)',
                border: '1.5px solid rgba(255, 227, 163, 0.6)',
                boxShadow: '0 8px 40px rgba(255, 227, 163, 0.35)',
              }}
            >
              {/* Unlocked icon */}
              <motion.div
                className="flex justify-center mb-6 text-5xl"
                initial={{ rotate: -30, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 8, stiffness: 180, delay: 0.1 }}
              >
                🔓
              </motion.div>

              <motion.h2
                className="text-2xl font-semibold text-center mb-3 leading-snug"
                style={{ color: '#5B3A5D' }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Unlocked!
              </motion.h2>

              <motion.p
                className="text-center text-base font-medium"
                style={{ color: '#FF6FA5' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Welcome to our little birthday world. 💕
              </motion.p>

              {/* Sparkle particles on success */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-sm pointer-events-none"
                  style={{
                    left: `${20 + i * 12}%`,
                    top: `${15 + (i % 3) * 25}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.3, 0],
                    y: [0, -30],
                  }}
                  transition={{
                    duration: 1.0,
                    delay: 0.3 + i * 0.1,
                    ease: 'easeOut',
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
