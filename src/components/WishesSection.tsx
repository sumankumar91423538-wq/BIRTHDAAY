'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

interface Wish {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export default function WishesSection() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchWishes();

    // Subscribe to new wishes in real-time
    const subscription = supabase
      .channel('public:wishes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wishes' },
        (payload) => {
          const newWish = payload.new as Wish;
          setWishes((prev) => [newWish, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchWishes = async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('wishes')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      if (data) setWishes(data);
    } catch (err: any) {
      console.error('Error fetching wishes:', err.message);
      setError('Could not load wishes. Playing locally 🌟');
      // Mock fallback data so it doesn't look empty
      setWishes([
        {
          id: '1',
          name: 'Prince',
          message: 'Happy Birthday Buggu! Hope your day is filled with loads of sweetness and smiles. You deserve the entire world! 💕🎂',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Pari',
          message: 'To the sweetest girl in the universe, wishing you a magical birthday! ✨🌸',
          created_at: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const { data, error: err } = await supabase
        .from('wishes')
        .insert([{ name: name.trim(), message: message.trim() }])
        .select();

      if (err) throw err;

      setName('');
      setMessage('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error sending wish:', err.message);
      setError('Failed to send wish to database. Storing locally 💖');
      // Fallback local append
      const localNew: Wish = {
        id: Math.random().toString(),
        name: name.trim(),
        message: message.trim(),
        created_at: new Date().toISOString(),
      };
      setWishes((prev) => [localNew, ...prev]);
      setName('');
      setMessage('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="wishes"
      className="relative min-h-screen py-20 px-4 w-full max-w-4xl mx-auto flex flex-col items-center"
    >
      {/* Background Slow Zoom Wrapper */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #D9C6FF, transparent)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FF9BC0, transparent)' }}
        />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-3xl sm:text-4xl font-bold text-[#5B3A5D] mb-4 text-center z-10"
      >
        💌 Birthday Wishes Wall
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.7 }}
        viewport={{ once: true }}
        className="text-sm text-[#5B3A5D] mb-10 text-center z-10"
      >
        Leave your warm blessing or birthday wish for Buggu!
      </motion.p>

      <div className="grid grid-col-1 md:grid-cols-2 gap-8 w-full z-10 items-start">
        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="rounded-3xl p-6 backdrop-blur-[18px] bg-white/55 border border-white/60 shadow-[0_8px_32px_rgba(255,155,192,0.2)]"
        >
          <h3 className="text-lg font-bold text-[#5B3A5D] mb-4 flex items-center gap-1.5">
            ✨ Write a Wish
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5B3A5D]/75 mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                maxLength={40}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/60 border border-white/70 text-sm text-[#5B3A5D] font-medium outline-none focus:border-[#FF9BC0] focus:ring-1 focus:ring-[#FF9BC0] transition-all duration-200 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5B3A5D]/75 mb-1.5">
                Your Birthday Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your sweet blessing here..."
                required
                rows={4}
                maxLength={300}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/60 border border-white/70 text-sm text-[#5B3A5D] font-medium outline-none focus:border-[#FF9BC0] focus:ring-1 focus:ring-[#FF9BC0] transition-all duration-200 shadow-inner resize-none"
              />
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-500 mt-1">
                {error}
              </p>
            )}

            {success && (
              <p className="text-xs font-semibold text-green-600 mt-1">
                Wish sent successfully! 💖💫
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={submitting}
              className="mt-2 w-full py-3 rounded-full text-white font-bold text-sm tracking-wider cursor-pointer shadow-md shadow-pink-primary/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #FF9BC0 0%, #FF6FA5 100%)',
              }}
            >
              {submitting ? 'Sending... 💌' : 'Send Wish 💌'}
            </motion.button>
          </form>
        </motion.div>

        {/* Wishes List Card */}
        <div className="flex flex-col gap-4 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
          <AnimatePresence initial={false}>
            {wishes.length === 0 ? (
              <div className="text-center py-10 text-[#5B3A5D]/50 text-sm font-semibold">
                No wishes sent yet. Be the first! 🎂
              </div>
            ) : (
              wishes.map((wish, index) => (
                <motion.div
                  key={wish.id}
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -15 }}
                  transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                  className="p-5 rounded-2xl backdrop-blur-[14px] bg-white/45 border border-white/50 shadow-sm flex flex-col gap-2 relative group"
                >
                  {/* Decorative tag */}
                  <div
                    className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
                    style={{
                      background:
                        index % 3 === 0
                          ? '#FF9BC0'
                          : index % 3 === 1
                          ? '#D9C6FF'
                          : '#FFE3A3',
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#5B3A5D] flex items-center gap-1">
                      🌸 {wish.name}
                    </span>
                    <span className="text-[10px] font-bold text-[#5B3A5D]/40">
                      {new Date(wish.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-[#5B3A5D]/80 leading-relaxed font-medium">
                    {wish.message}
                  </p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
