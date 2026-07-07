'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';

interface NavItem {
  id: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'cake', icon: '🎂', label: 'Cake' },
  { id: 'letter', icon: '💌', label: 'Letter' },
  { id: 'memories', icon: '📸', label: 'Memories' },
  { id: 'nicknames', icon: '💕', label: 'Names' },
  { id: 'wishes', icon: '🌠', label: 'Wishes' },
  { id: 'music', icon: '🎵', label: 'Music' },
];

export default function BottomNav() {
  const { activeSection, setActiveSection } = useApp();

  const handleNavClick = useCallback(
    (id: string) => {
      setActiveSection(id);
    },
    [setActiveSection]
  );

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid rgba(255,155,192,0.25)',
        boxShadow: '0 -4px 30px rgba(255,155,192,0.15)',
      }}
    >
      <div className="flex items-center justify-around w-full max-w-lg mx-auto px-2 py-2 pb-3">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="relative flex flex-col items-center justify-center gap-1 py-1 px-2 min-w-[48px] cursor-pointer bg-transparent border-none outline-none"
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className="text-xl leading-none transition-transform duration-200"
                style={{
                  transform: isActive ? 'scale(1.2) translateY(-2px)' : 'scale(1)',
                }}
              >
                {item.icon}
              </span>
              <span
                className="text-[10px] font-bold leading-tight transition-colors duration-200"
                style={{
                  color: isActive ? '#FF6FA5' : '#5B3A5D',
                }}
              >
                {item.label}
              </span>

              {/* Active indicator dot/pill */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1.5 h-[4px] w-6 rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #FF9BC0, #FF6FA5)',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
