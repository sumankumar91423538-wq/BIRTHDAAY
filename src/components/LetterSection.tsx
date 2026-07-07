'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const letterLines = [
  'Dear Gundi,',
  '',
  'On this special day, I just want you to know that every moment with you feels like a fairy tale.',
  'Your smile is my favorite thing in this entire universe.',
  'You make everything brighter, softer, and more beautiful just by being you.',
  '',
  'Happy Birthday to the most amazing person I know. Today is YOUR day, and I hope it\'s as magical as you are.',
  '',
  'You deserve all the happiness in the world. Every. Single. Bit. 💕',
];

const signature = 'Forever yours, Prince 💕';

export default function LetterSection() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <section
      id="letter"
      className="relative min-h-screen py-20 px-4 w-full flex flex-col items-center justify-center"
    >
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-3xl sm:text-4xl font-bold text-[#5B3A5D] mb-12 text-center z-10"
      >
        💌 A Letter For You
      </motion.h2>

      <div className="w-full max-w-lg mx-auto relative z-10" style={{ perspective: '1500px' }}>
        <AnimatePresence mode="wait">
          {!isOpen ? (
            /* Sealed Envelope Card */
            <motion.div
              key="closed"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, rotateX: 90, y: -50 }}
              transition={{ duration: 0.4 }}
              className="w-full rounded-3xl p-8 backdrop-blur-[20px] bg-white/60 border border-white/70 shadow-[0_12px_40px_rgba(255,155,192,0.2)] flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 rounded-full bg-[#FFF3F8] border border-[#FF9BC0]/25 flex items-center justify-center text-4xl shadow-inner">
                ✉️
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-[#5B3A5D]">
                  You have a private letter
                </h3>
                <p className="text-xs text-[#5B3A5D]/60 font-semibold mt-1">
                  Click below to open and reveal the surprise
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleOpen}
                className="px-8 py-3 rounded-full text-white font-bold text-sm tracking-wider cursor-pointer shadow-md shadow-pink-primary/10"
                style={{
                  background: 'linear-gradient(135deg, #FF9BC0 0%, #FF6FA5 100%)',
                }}
              >
                Open Letter 💌
              </motion.button>
            </motion.div>
          ) : (
            /* Opened iOS Notes Glass Card */
            <motion.div
              key="open"
              initial={{ opacity: 0, rotateX: -90, y: 50, scale: 0.96 }}
              animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
              className="w-full rounded-3xl p-6 sm:p-10 backdrop-blur-[22px] border border-white/80 shadow-[0_16px_50px_rgba(255,155,192,0.22)] relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,253,248,0.75) 100%)',
              }}
            >
              {/* Lined paper effect styling */}
              <div 
                className="absolute inset-0 z-0 pointer-events-none opacity-30" 
                style={{
                  backgroundImage: 'linear-gradient(#D9C6FF 1px, transparent 1px)',
                  backgroundSize: '100% 28px',
                  marginTop: '4.5rem',
                  marginLeft: '2rem',
                  marginRight: '2rem'
                }}
              />

              {/* Red margin line */}
              <div 
                className="absolute top-0 bottom-0 left-8 w-[1px] bg-red-400/40 z-0 pointer-events-none" 
              />

              <div className="relative z-10 pl-4">
                {/* Greeting */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-2xl sm:text-3xl text-[#FF6FA5] mb-6"
                  style={{ fontFamily: 'Caveat, cursive' }}
                >
                  {letterLines[0]}
                </motion.p>

                {/* Content */}
                <div className="space-y-4 text-[#5B3A5D] text-base sm:text-lg leading-[28px] font-semibold">
                  {letterLines.slice(2).map((line, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + idx * 0.15, duration: 0.5 }}
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>

                {/* Signature */}
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                  className="text-xl sm:text-2xl text-[#FF6FA5] mt-10 text-right"
                  style={{ fontFamily: 'Caveat, cursive' }}
                >
                  {signature}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
