'use client';

import { motion } from 'framer-motion';

interface CutButtonProps {
  disabled: boolean;
  isMyRoleReady: boolean;
  bothOnline: boolean;
  onClick: () => void;
}

export default function CutButton({
  disabled,
  isMyRoleReady,
  bothOnline,
  onClick,
}: CutButtonProps) {
  // Determine text content & styles based on state
  let buttonText = 'Cut Cake Together 🎂';
  let activeStyles = {};
  
  if (!bothOnline) {
    buttonText = 'Waiting for both of you 🍰';
    activeStyles = {
      background: 'linear-gradient(135deg, #E0D7DF 0%, #C8BCC6 100%)',
      boxShadow: 'none',
      opacity: 0.5,
    };
  } else if (isMyRoleReady) {
    buttonText = 'Waiting for partner… ⏳';
    activeStyles = {
      background: 'linear-gradient(135deg, #FFB8D2 0%, #FFA2C0 100%)',
      boxShadow: '0 0 15px rgba(255, 155, 192, 0.4)',
    };
  } else {
    // Active state with breathing glow animation
    buttonText = 'Cut Cake Together 🎂';
    activeStyles = {
      background: 'linear-gradient(135deg, #FF9BC0 0%, #FF6FA5 100%)',
      boxShadow: '0 6px 30px rgba(255, 111, 165, 0.35)',
    };
  }

  return (
    <div className="absolute bottom-[5.5rem] left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-auto flex justify-center">
      <motion.button
        disabled={disabled || isMyRoleReady}
        onClick={onClick}
        whileHover={!disabled && !isMyRoleReady ? { scale: 1.05 } : {}}
        whileTap={!disabled && !isMyRoleReady ? { scale: 0.95 } : {}}
        animate={
          bothOnline && !isMyRoleReady
            ? {
                boxShadow: [
                  '0 6px 20px rgba(255, 111, 165, 0.3)',
                  '0 6px 35px rgba(255, 111, 165, 0.55)',
                  '0 6px 20px rgba(255, 111, 165, 0.3)',
                ],
              }
            : {}
        }
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: 'easeInOut',
        }}
        className="px-10 py-4 rounded-full text-white font-extrabold text-sm md:text-base tracking-wide whitespace-nowrap cursor-pointer disabled:cursor-not-allowed select-none transition-all duration-300"
        style={activeStyles}
      >
        {buttonText}
      </motion.button>
    </div>
  );
}
