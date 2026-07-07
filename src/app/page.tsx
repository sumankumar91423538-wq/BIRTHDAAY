'use client';

import { useApp } from '@/context/AppContext';
import PasswordUnlock from '@/components/PasswordUnlock';
import CinematicEntry from '@/components/CinematicEntry';
import BirthdayHero from '@/components/BirthdayHero';
import LiveCakeCut from '@/components/LiveCakeCut';
import LetterSection from '@/components/LetterSection';
import MemoriesGallery from '@/components/MemoriesGallery';
import NicknameWall from '@/components/NicknameWall';
import WishesSection from '@/components/WishesSection';
import MusicSection from '@/components/MusicSection';
import MusicPlayer from '@/components/MusicPlayer';
import FinalSurprise from '@/components/FinalSurprise';
import BottomNav from '@/components/BottomNav';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const { authState, entryComplete, activeSection } = useApp();

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <BirthdayHero />;
      case 'cake':
        return <LiveCakeCut />;
      case 'letter':
        return <LetterSection />;
      case 'memories':
        return <MemoriesGallery />;
      case 'nicknames':
        return <NicknameWall />;
      case 'wishes':
        return <WishesSection />;
      case 'music':
        return <MusicSection />;
      case 'surprise':
        return <FinalSurprise />;
      default:
        return <BirthdayHero />;
    }
  };

  const isCake = activeSection === 'cake';

  return (
    <AnimatePresence mode="wait">
      {authState === 'locked' && (
        <PasswordUnlock key="unlock-page" />
      )}

      {authState === 'unlocked' && !entryComplete && (
        <CinematicEntry key="cinematic-entry" />
      )}

      {authState === 'unlocked' && entryComplete && (
        <motion.div
          key="main-layout"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="relative min-h-screen bg-blush/30 overflow-x-hidden flex flex-col justify-between"
        >
          {/* Background Animated Gradient Mesh (hidden when cake is active — it has its own bg) */}
          {!isCake && (
            <div
              className="fixed inset-0 pointer-events-none z-0 opacity-20"
              style={{
                background:
                  'radial-gradient(circle at 30% 20%, #FFF3F8, transparent), radial-gradient(circle at 70% 60%, #F1E9FF, transparent), radial-gradient(circle at 50% 80%, #FF9BC0, transparent)',
                filter: 'blur(80px)',
              }}
            />
          )}

          {/* Cake section renders as a full-screen fixed layer */}
          {isCake && <LiveCakeCut />}

          {/* All other sections render inside the animated container */}
          {!isCake && (
            <div className="relative z-10 flex-1 flex flex-col justify-center pb-24">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -15 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex flex-col items-center justify-center"
                >
                  {renderSection()}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          <MusicPlayer />
          <BottomNav />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
