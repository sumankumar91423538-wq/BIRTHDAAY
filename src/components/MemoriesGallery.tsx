'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface MemoryItem {
  title: string;
  caption: string;
  date: string;
  emoji: string;
}

const memories: MemoryItem[] = [
  {
    title: 'The First Hello',
    caption: 'Where it all began...',
    date: 'Nov 2025',
    emoji: '👋',
  },
  {
    title: 'Our First Laugh',
    caption: 'The moment I knew you were special',
    date: 'Dec 2025',
    emoji: '😂',
  },
  {
    title: 'Movie Night',
    caption: 'When we watched our favorite movie together',
    date: 'Jan 2026',
    emoji: '🎬',
  },
  {
    title: 'That Long Call',
    caption: 'We talked until the sun came up',
    date: 'Feb 2026',
    emoji: '📞',
  },
  {
    title: 'Our Song',
    caption: 'The song that became ours forever',
    date: 'Mar 2026',
    emoji: '🎵',
  },
  {
    title: 'Today - Your Birthday!',
    caption: 'Making this day unforgettable',
    date: 'Jul 2026',
    emoji: '🎂',
  },
];

const borderColors = [
  '#FF9BC0', // pink
  '#D9C6FF', // lavender
  '#FFE3A3', // gold
  '#FF9BC0',
  '#D9C6FF',
  '#FFE3A3',
];

function MemoryCard({ item, index }: { item: MemoryItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      whileTap={{ y: -6, transition: { duration: 0.3 } }}
      className="group relative min-w-[280px] snap-center flex-shrink-0
        md:min-w-0 md:w-full cursor-pointer"
    >
      <div
        className="relative h-full rounded-3xl overflow-hidden
          backdrop-blur-[18px] bg-white/55 border border-white/60
          shadow-[0_8px_40px_rgba(255,155,192,0.25)]
          transition-shadow duration-400
          group-hover:shadow-[0_12px_50px_rgba(255,155,192,0.4)]"
      >
        {/* Colored top border */}
        <div
          className="absolute top-0 left-0 w-full h-1 rounded-t-3xl"
          style={{ backgroundColor: borderColors[index] }}
        />

        <div className="p-6 pt-5 flex flex-col items-center text-center gap-3">
          {/* Emoji */}
          <motion.span
            className="text-6xl block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 1.05 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {item.emoji}
          </motion.span>

          {/* Title */}
          <h3 className="text-lg font-bold text-[#5B3A5D] leading-snug">
            {item.title}
          </h3>

          {/* Caption */}
          <p className="text-[#5B3A5D]/70 text-sm leading-relaxed">
            {item.caption}
          </p>

          {/* Date pill */}
          <span
            className="inline-block mt-1 px-4 py-1.5 rounded-full text-xs font-semibold
              bg-[#F1E9FF] text-[#5B3A5D] border border-[#D9C6FF]/50"
          >
            {item.date}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function MemoriesGallery() {
  return (
    <section
      id="memories"
      className="relative min-h-screen py-20 px-4"
    >
      {/* Section Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-3xl sm:text-4xl font-bold text-[#5B3A5D] mb-12 text-center"
      >
        📸 Our Beautiful Memories
      </motion.h2>

      {/* Mobile: horizontal scroll | Desktop: 3-col grid */}
      <div className="max-w-5xl mx-auto">
        {/* Mobile scroll container */}
        <div
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4
            -mx-4 px-4
            md:hidden
            scrollbar-none"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {memories.map((item, i) => (
            <MemoryCard key={i} item={item} index={i} />
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {memories.map((item, i) => (
            <MemoryCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
