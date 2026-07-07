'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

export type AuthState = 'locked' | 'unlocked';
export type Role = 'boy' | 'girl' | null;

interface AppContextValue {
  authState: AuthState;
  setAuthState: (state: AuthState) => void;
  role: Role;
  setRole: (role: Role) => void;
  entryComplete: boolean;
  setEntryComplete: (complete: boolean) => void;
  musicPlaying: boolean;
  setMusicPlaying: (playing: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  unlock: (role: Role) => void;
  lock: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const SESSION_AUTH_KEY = 'buggu_auth_state';
const SESSION_ROLE_KEY = 'buggu_role';

export function AppProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthStateRaw] = useState<AuthState>('locked');
  const [role, setRoleRaw] = useState<Role>(null);
  const [entryComplete, setEntryComplete] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedAuth = sessionStorage.getItem(SESSION_AUTH_KEY) as AuthState | null;
      const savedRole = sessionStorage.getItem(SESSION_ROLE_KEY) as Role;

      if (savedAuth === 'unlocked' && (savedRole === 'boy' || savedRole === 'girl')) {
        setAuthStateRaw('unlocked');
        setRoleRaw(savedRole);
      }
    } catch {
      /* sessionStorage unavailable — stay locked */
    }
    setHydrated(true);
  }, []);

  const setAuthState = useCallback((state: AuthState) => {
    setAuthStateRaw(state);
    try {
      sessionStorage.setItem(SESSION_AUTH_KEY, state);
    } catch {
      /* ignore */
    }
  }, []);

  const setRole = useCallback((newRole: Role) => {
    setRoleRaw(newRole);
    try {
      if (newRole) {
        sessionStorage.setItem(SESSION_ROLE_KEY, newRole);
      } else {
        sessionStorage.removeItem(SESSION_ROLE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const unlock = useCallback(
    (newRole: Role) => {
      setAuthState('unlocked');
      setRole(newRole);
    },
    [setAuthState, setRole],
  );

  const lock = useCallback(() => {
    setAuthState('locked');
    setRole(null);
    setEntryComplete(false);
    try {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      sessionStorage.removeItem(SESSION_ROLE_KEY);
    } catch {
      /* ignore */
    }
  }, [setAuthState, setRole]);

  if (!hydrated) {
    return null;
  }

  return (
    <AppContext.Provider
      value={{
        authState,
        setAuthState,
        role,
        setRole,
        entryComplete,
        setEntryComplete,
        musicPlaying,
        setMusicPlaying,
        activeSection,
        setActiveSection,
        unlock,
        lock,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
