/* ─── Shared types for the 3D Cake Cutting page ─── */

/** Camera state machine states */
export type CameraState =
  | 'entry'
  | 'idle_waiting'
  | 'one_side_ready'
  | 'cutting'
  | 'celebration_zoom_out';

/** Presence state derived from Supabase Realtime Presence */
export interface PresenceState {
  boyOnline: boolean;
  girlOnline: boolean;
}

/** Result of an attempted cake-ready click */
export type ReadyResult =
  | 'WAITING'
  | 'CUT'
  | 'EXPIRED_RESET'
  | 'PRESENCE_BLOCKED';

/** Toast message variant */
export type ToastVariant = 'waiting' | 'stepped_away' | 'none';
