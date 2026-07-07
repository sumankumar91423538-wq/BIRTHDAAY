import { supabase } from './supabaseClient';
import type { PresenceState, ReadyResult } from './cakeSessionTypes';

export interface CakeSession {
  boy_ready: boolean;
  girl_ready: boolean;
  cake_cut: boolean;
  boy_clicked_at: string | null;
  girl_clicked_at: string | null;
  cut_at: string | null;
}

const STORAGE_KEY = 'cake_session';
const CHANNEL_NAME = 'cake-session';
const SESSION_KEY = 'birthday_2026_main';
const PRESENCE_CHANNEL_KEY = `presence:cake_session:${SESSION_KEY}`;
const EXPIRY_WINDOW_MS = 3000; // 3-second window

const DEFAULT_SESSION: CakeSession = {
  boy_ready: false,
  girl_ready: false,
  cake_cut: false,
  boy_clicked_at: null,
  girl_clicked_at: null,
  cut_at: null,
};

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  try {
    return new BroadcastChannel(CHANNEL_NAME);
  } catch {
    return null;
  }
}

// Helper to get local state
export function getLocalCakeSession(): CakeSession {
  if (typeof window === 'undefined') return { ...DEFAULT_SESSION };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CakeSession>;
      return {
        boy_ready: parsed.boy_ready ?? false,
        girl_ready: parsed.girl_ready ?? false,
        cake_cut: parsed.cake_cut ?? false,
        boy_clicked_at: parsed.boy_clicked_at ?? null,
        girl_clicked_at: parsed.girl_clicked_at ?? null,
        cut_at: parsed.cut_at ?? null,
      };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SESSION };
}

// Fetch current session from Supabase, or fall back to local
export async function getCakeSession(): Promise<CakeSession> {
  const local = getLocalCakeSession();
  try {
    const { data, error } = await supabase
      .from('cake_session')
      .select('*')
      .eq('session_key', SESSION_KEY)
      .maybeSingle();

    if (error || !data) {
      // If table doesn't exist or other error, fallback to local
      return local;
    }

    const session = {
      boy_ready: data.boy_ready,
      girl_ready: data.girl_ready,
      cake_cut: data.cake_cut,
      boy_clicked_at: data.boy_clicked_at,
      girl_clicked_at: data.girl_clicked_at,
      cut_at: data.cut_at,
    };
    saveLocalSession(session);
    return session;
  } catch {
    return local;
  }
}

function saveLocalSession(session: CakeSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

function broadcastLocalSession(session: CakeSession): void {
  const channel = getChannel();
  if (channel) {
    channel.postMessage({ type: 'cake_session_update', session });
    channel.close();
  }
}

// Update ready status in Supabase and locally
export async function updateCakeReady(role: 'boy' | 'girl'): Promise<CakeSession> {
  const now = new Date().toISOString();
  let session = await getCakeSession();

  if (role === 'boy') {
    session.boy_ready = true;
    session.boy_clicked_at = session.boy_clicked_at ?? now;
  } else {
    session.girl_ready = true;
    session.girl_clicked_at = session.girl_clicked_at ?? now;
  }

  if (session.boy_ready && session.girl_ready && !session.cake_cut) {
    session.cake_cut = true;
    session.cut_at = now;
  }

  // Update local state first
  saveLocalSession(session);
  broadcastLocalSession(session);

  // Try updating Supabase
  try {
    // Check if session exists in Supabase first
    const { data: existing } = await supabase
      .from('cake_session')
      .select('id')
      .eq('session_key', SESSION_KEY)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('cake_session')
        .update({
          boy_ready: session.boy_ready,
          girl_ready: session.girl_ready,
          cake_cut: session.cake_cut,
          boy_clicked_at: session.boy_clicked_at,
          girl_clicked_at: session.girl_clicked_at,
          cut_at: session.cut_at,
          updated_at: now
        })
        .eq('session_key', SESSION_KEY);
    } else {
      // Create it
      await supabase
        .from('cake_session')
        .insert({
          session_key: SESSION_KEY,
          boy_ready: session.boy_ready,
          girl_ready: session.girl_ready,
          cake_cut: session.cake_cut,
          boy_clicked_at: session.boy_clicked_at,
          girl_clicked_at: session.girl_clicked_at,
          cut_at: session.cut_at,
          updated_at: now
        });
    }
  } catch (err) {
    console.warn("Supabase update failed, relying on local sync:", err);
  }

  return session;
}

// Subscribe to session updates
export function subscribeToCakeSession(
  callback: (session: CakeSession) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  // Set up local storage listeners
  const channel = getChannel();
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'cake_session_update' && event.data.session) {
      const session = event.data.session as CakeSession;
      saveLocalSession(session);
      callback(session);
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const session = JSON.parse(event.newValue) as CakeSession;
        callback(session);
      } catch {
        // ignore
      }
    }
  };

  if (channel) {
    channel.addEventListener('message', handleMessage);
  }
  window.addEventListener('storage', handleStorage);

  // Set up Supabase Realtime subscription
  const supabaseChannel = supabase
    .channel('public:cake_session')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cake_session',
        filter: `session_key=eq.${SESSION_KEY}`
      },
      (payload) => {
        if (payload.new) {
          const data = payload.new as Record<string, unknown>;
          const session: CakeSession = {
            boy_ready: data.boy_ready as boolean,
            girl_ready: data.girl_ready as boolean,
            cake_cut: data.cake_cut as boolean,
            boy_clicked_at: data.boy_clicked_at as string | null,
            girl_clicked_at: data.girl_clicked_at as string | null,
            cut_at: data.cut_at as string | null,
          };
          saveLocalSession(session);
          callback(session);
        }
      }
    )
    .subscribe();

  return () => {
    if (channel) {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    }
    window.removeEventListener('storage', handleStorage);
    supabase.removeChannel(supabaseChannel);
  };
}

export async function resetCakeSession(): Promise<void> {
  const session = { ...DEFAULT_SESSION };
  saveLocalSession(session);
  broadcastLocalSession(session);

  try {
    await supabase
      .from('cake_session')
      .update({
        boy_ready: false,
        girl_ready: false,
        cake_cut: false,
        boy_clicked_at: null,
        girl_clicked_at: null,
        cut_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('session_key', SESSION_KEY);
  } catch (err) {
    console.warn("Supabase reset failed:", err);
  }
}

/* ═══════════════════════════════════════════════════════════════
   NEW: Presence Layer + Validated Ready Logic (Layer A + B)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Join the Supabase Realtime Presence channel for the cake page.
 * Returns an unsubscribe/leave function.
 */
export function joinCakePresence(
  role: 'boy' | 'girl',
  onPresenceChange: (presence: PresenceState) => void,
): () => void {
  if (typeof window === 'undefined') return () => {};

  const channel = supabase.channel(PRESENCE_CHANNEL_KEY, {
    config: { presence: { key: role } },
  });

  const derivePresence = () => {
    const state = channel.presenceState();
    const allKeys = Object.keys(state);
    const boyOnline = allKeys.includes('boy') && (state['boy'] as unknown[]).length > 0;
    const girlOnline = allKeys.includes('girl') && (state['girl'] as unknown[]).length > 0;
    onPresenceChange({ boyOnline, girlOnline });
  };

  channel
    .on('presence', { event: 'sync' }, () => {
      derivePresence();
    })
    .on('presence', { event: 'join' }, () => {
      derivePresence();
    })
    .on('presence', { event: 'leave' }, () => {
      derivePresence();
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          role,
          joined_at: new Date().toISOString(),
        });
        derivePresence();
      }
    });

  return () => {
    channel.untrack();
    supabase.removeChannel(channel);
  };
}

/**
 * Enhanced ready update with presence + expiry validation.
 * Returns a result indicating what happened.
 */
export async function updateCakeReadyWithValidation(
  role: 'boy' | 'girl',
  presence: PresenceState,
): Promise<{ result: ReadyResult; session: CakeSession }> {
  // Guard: both must be online
  if (!presence.boyOnline || !presence.girlOnline) {
    return { result: 'PRESENCE_BLOCKED', session: await getCakeSession() };
  }

  const now = new Date().toISOString();
  const nowMs = Date.now();
  let session = await getCakeSession();

  // If cake already cut, no-op
  if (session.cake_cut) {
    return { result: 'CUT', session };
  }

  const otherRole = role === 'boy' ? 'girl' : 'boy';
  const otherReady = otherRole === 'boy' ? session.boy_ready : session.girl_ready;
  const otherClickedAt = otherRole === 'boy' ? session.boy_clicked_at : session.girl_clicked_at;

  if (otherReady && otherClickedAt) {
    // Check if other side's click is still within the expiry window
    const otherClickMs = new Date(otherClickedAt).getTime();
    const elapsed = nowMs - otherClickMs;

    if (elapsed <= EXPIRY_WINDOW_MS) {
      // Both ready within window → CUT!
      session.cake_cut = true;
      session.cut_at = now;
      if (role === 'boy') {
        session.boy_ready = true;
        session.boy_clicked_at = now;
      } else {
        session.girl_ready = true;
        session.girl_clicked_at = now;
      }

      await persistSession(session);
      return { result: 'CUT', session };
    } else {
      // Other side's click expired — reset them, set ourselves fresh
      if (otherRole === 'boy') {
        session.boy_ready = false;
        session.boy_clicked_at = null;
      } else {
        session.girl_ready = false;
        session.girl_clicked_at = null;
      }
      if (role === 'boy') {
        session.boy_ready = true;
        session.boy_clicked_at = now;
      } else {
        session.girl_ready = true;
        session.girl_clicked_at = now;
      }

      await persistSession(session);
      return { result: 'WAITING', session };
    }
  } else {
    // Other side not ready yet — set our side
    if (role === 'boy') {
      session.boy_ready = true;
      session.boy_clicked_at = now;
    } else {
      session.girl_ready = true;
      session.girl_clicked_at = now;
    }

    await persistSession(session);
    return { result: 'WAITING', session };
  }
}

/**
 * Reset an expired ready flag (one side only).
 */
export async function resetExpiredReady(role: 'boy' | 'girl'): Promise<CakeSession> {
  let session = await getCakeSession();

  if (role === 'boy') {
    session.boy_ready = false;
    session.boy_clicked_at = null;
  } else {
    session.girl_ready = false;
    session.girl_clicked_at = null;
  }

  await persistSession(session);
  return session;
}

/**
 * Reset both sides when someone drops presence mid-window.
 */
export async function resetBothOnPresenceDrop(): Promise<CakeSession> {
  const session: CakeSession = { ...DEFAULT_SESSION };
  await persistSession(session);
  return session;
}

/** Internal helper to persist session to local + broadcast + Supabase */
async function persistSession(session: CakeSession): Promise<void> {
  const now = new Date().toISOString();
  saveLocalSession(session);
  broadcastLocalSession(session);

  try {
    const { data: existing } = await supabase
      .from('cake_session')
      .select('id')
      .eq('session_key', SESSION_KEY)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('cake_session')
        .update({
          boy_ready: session.boy_ready,
          girl_ready: session.girl_ready,
          cake_cut: session.cake_cut,
          boy_clicked_at: session.boy_clicked_at,
          girl_clicked_at: session.girl_clicked_at,
          cut_at: session.cut_at,
          updated_at: now,
        })
        .eq('session_key', SESSION_KEY);
    } else {
      await supabase
        .from('cake_session')
        .insert({
          session_key: SESSION_KEY,
          boy_ready: session.boy_ready,
          girl_ready: session.girl_ready,
          cake_cut: session.cake_cut,
          boy_clicked_at: session.boy_clicked_at,
          girl_clicked_at: session.girl_clicked_at,
          cut_at: session.cut_at,
          updated_at: now,
        });
    }
  } catch (err) {
    console.warn('Supabase persist failed, relying on local sync:', err);
  }
}
