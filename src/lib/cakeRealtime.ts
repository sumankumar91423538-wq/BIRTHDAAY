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
const SESSION_NAME = 'main_birthday_cake';
const PRESENCE_CHANNEL_KEY = `presence:cake_session:${SESSION_NAME}`;
const EXPIRY_WINDOW_MS = 10000; // 10-second window

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
    console.log('[CakeRT] Fetching cake session from Supabase...');
    const { data, error } = await supabase
      .from('cake_session')
      .select('*')
      .eq('session_name', SESSION_NAME)
      .maybeSingle();

    if (error) {
      console.error('[CakeRT] Supabase SELECT error:', error.message, error.details, error.hint);
      return local;
    }

    if (!data) {
      console.warn('[CakeRT] No row found for session_name =', SESSION_NAME, '— using local fallback');
      return local;
    }

    console.log('[CakeRT] Fetched session from Supabase:', data);
    const session: CakeSession = {
      boy_ready: data.boy_ready,
      girl_ready: data.girl_ready,
      cake_cut: data.cake_cut,
      boy_clicked_at: data.boy_clicked_at,
      girl_clicked_at: data.girl_clicked_at,
      cut_at: data.cut_at,
    };
    saveLocalSession(session);
    return session;
  } catch (err) {
    console.error('[CakeRT] getCakeSession exception:', err);
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

// Subscribe to session updates via Supabase Realtime + local BroadcastChannel
export function subscribeToCakeSession(
  callback: (session: CakeSession) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  // Set up local storage listeners for same-device tab sync
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

  // Set up Supabase Realtime subscription for cross-device sync
  console.log('[CakeRT] Setting up Supabase Realtime subscription for cake_session...');
  const supabaseChannel = supabase
    .channel('realtime:cake_session_updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cake_session',
        filter: `session_name=eq.${SESSION_NAME}`
      },
      (payload) => {
        console.log('[CakeRT] Realtime payload received:', payload);
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
          console.log('[CakeRT] Realtime session update:', session);
          saveLocalSession(session);
          callback(session);
        }
      }
    )
    .subscribe((status) => {
      console.log('[CakeRT] Realtime subscription status:', status);
    });

  return () => {
    console.log('[CakeRT] Cleaning up subscriptions');
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
    const { error } = await supabase
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
      .eq('session_name', SESSION_NAME);

    if (error) {
      console.error('[CakeRT] resetCakeSession error:', error.message);
    }
  } catch (err) {
    console.warn('[CakeRT] Supabase reset failed:', err);
  }
}

/* ═══════════════════════════════════════════════════════════════
   Presence Layer
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

  console.log('[CakePresence] Joining presence channel as:', role);

  const channel = supabase.channel(PRESENCE_CHANNEL_KEY, {
    config: { presence: { key: role } },
  });

  const derivePresence = () => {
    const state = channel.presenceState();
    const allKeys = Object.keys(state);
    const boyOnline = allKeys.includes('boy') && (state['boy'] as unknown[]).length > 0;
    const girlOnline = allKeys.includes('girl') && (state['girl'] as unknown[]).length > 0;
    console.log('[CakePresence] Presence state derived:', { boyOnline, girlOnline, keys: allKeys, rawState: state });
    onPresenceChange({ boyOnline, girlOnline });
  };

  channel
    .on('presence', { event: 'sync' }, () => {
      console.log('[CakePresence] Presence sync event');
      derivePresence();
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('[CakePresence] Presence JOIN:', key, newPresences);
      derivePresence();
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('[CakePresence] Presence LEAVE:', key, leftPresences);
      derivePresence();
    })
    .subscribe(async (status) => {
      console.log('[CakePresence] Channel subscribe status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('[CakePresence] Channel SUBSCRIBED — calling track() for role:', role);
        await channel.track({
          role,
          joined_at: new Date().toISOString(),
        });
        console.log('[CakePresence] track() called successfully');
        derivePresence();
      }
    });

  return () => {
    console.log('[CakePresence] Leaving presence channel, untracking role:', role);
    channel.untrack();
    supabase.removeChannel(channel);
  };
}

/* ═══════════════════════════════════════════════════════════════
   Validated Ready Logic — uses RPC for atomic updates
   ═══════════════════════════════════════════════════════════════ */

/**
 * Enhanced ready update using Supabase RPC for atomic server-side logic.
 * Falls back to client-side upsert if RPC is unavailable.
 */
export async function updateCakeReadyWithValidation(
  role: 'boy' | 'girl',
  presence: PresenceState,
): Promise<{ result: ReadyResult; session: CakeSession }> {
  // Guard: both must be online
  if (!presence.boyOnline || !presence.girlOnline) {
    console.log('[CakeRT] PRESENCE_BLOCKED — not both online:', presence);
    return { result: 'PRESENCE_BLOCKED', session: await getCakeSession() };
  }

  console.log('[CakeRT] Calling set_cake_ready RPC for role:', role);

  try {
    // Try RPC first (atomic, no race condition)
    const { data, error } = await supabase.rpc('set_cake_ready', {
      input_role: role,
    });

    if (error) {
      console.error('[CakeRT] RPC set_cake_ready error:', error.message, error.details, error.hint);
      // Fall back to client-side update
      return await fallbackClientUpdate(role);
    }

    console.log('[CakeRT] RPC set_cake_ready response:', data);

    const session: CakeSession = {
      boy_ready: data.boy_ready,
      girl_ready: data.girl_ready,
      cake_cut: data.cake_cut,
      boy_clicked_at: data.boy_clicked_at,
      girl_clicked_at: data.girl_clicked_at,
      cut_at: data.cut_at,
    };

    saveLocalSession(session);
    broadcastLocalSession(session);

    const result: ReadyResult = session.cake_cut ? 'CUT' : 'WAITING';
    console.log('[CakeRT] RPC result:', result, session);
    return { result, session };
  } catch (err) {
    console.error('[CakeRT] RPC exception, falling back to client update:', err);
    return await fallbackClientUpdate(role);
  }
}

/**
 * Fallback client-side update if RPC is not available.
 * Uses upsert to avoid check-then-insert race condition.
 */
async function fallbackClientUpdate(
  role: 'boy' | 'girl',
): Promise<{ result: ReadyResult; session: CakeSession }> {
  console.warn('[CakeRT] Using fallback client-side update for role:', role);
  const now = new Date().toISOString();
  const session = await getCakeSession();

  if (session.cake_cut) {
    return { result: 'CUT', session };
  }

  // Set our side ready
  if (role === 'boy') {
    session.boy_ready = true;
    session.boy_clicked_at = now;
  } else {
    session.girl_ready = true;
    session.girl_clicked_at = now;
  }

  // Check if both ready within window
  if (session.boy_ready && session.girl_ready) {
    const boyMs = session.boy_clicked_at ? new Date(session.boy_clicked_at).getTime() : 0;
    const girlMs = session.girl_clicked_at ? new Date(session.girl_clicked_at).getTime() : 0;
    const diff = Math.abs(boyMs - girlMs);
    if (diff <= EXPIRY_WINDOW_MS) {
      session.cake_cut = true;
      session.cut_at = now;
    }
  }

  await persistSession(session);
  return { result: session.cake_cut ? 'CUT' : 'WAITING', session };
}

/**
 * Reset an expired ready flag (one side only).
 */
export async function resetExpiredReady(role: 'boy' | 'girl'): Promise<CakeSession> {
  console.log('[CakeRT] Resetting expired ready for role:', role);
  const session = await getCakeSession();

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
  console.log('[CakeRT] Resetting both sides due to presence drop');
  const session: CakeSession = { ...DEFAULT_SESSION };
  await persistSession(session);
  return session;
}

/** Internal helper to persist session to local + broadcast + Supabase using upsert */
async function persistSession(session: CakeSession): Promise<void> {
  const now = new Date().toISOString();
  saveLocalSession(session);
  broadcastLocalSession(session);

  try {
    const { error } = await supabase
      .from('cake_session')
      .upsert(
        {
          session_name: SESSION_NAME,
          boy_ready: session.boy_ready,
          girl_ready: session.girl_ready,
          cake_cut: session.cake_cut,
          boy_clicked_at: session.boy_clicked_at,
          girl_clicked_at: session.girl_clicked_at,
          cut_at: session.cut_at,
          updated_at: now,
        },
        { onConflict: 'session_name' }
      );

    if (error) {
      console.error('[CakeRT] Supabase upsert error:', error.message, error.details, error.hint);
    } else {
      console.log('[CakeRT] Session persisted to Supabase successfully');
    }
  } catch (err) {
    console.warn('[CakeRT] Supabase persist failed, relying on local sync:', err);
  }
}

export { EXPIRY_WINDOW_MS };
