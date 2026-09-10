'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

interface HeaderContextType {
  actions: ReactNode | null;
  setActions: (actions: ReactNode | null) => void;
  badge: ReactNode | null;
  setBadge: (badge: ReactNode | null) => void;
  customTitle: string | null;
  setCustomTitle: (title: string | null) => void;
  customSubtitle: string | null;
  setCustomSubtitle: (subtitle: string | null) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode | null>(null);
  const [badge, setBadge] = useState<ReactNode | null>(null);
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [customSubtitle, setCustomSubtitle] = useState<string | null>(null);

  return (
    <HeaderContext.Provider
      value={{
        actions,
        setActions,
        badge,
        setBadge,
        customTitle,
        setCustomTitle,
        customSubtitle,
        setCustomSubtitle,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader debe ser utilizado dentro de HeaderProvider');
  }
  return context;
}

/**
 * Componente declarativo para inyectar acciones en la cabecera global
 */
export function HeaderActions({ children }: { children: ReactNode }) {
  const { setActions } = useHeader();

  useEffect(() => {
    setActions(children);
    return () => {
      setActions(null);
    };
  }, [children, setActions]);

  return null;
}

/**
 * Componente declarativo para inyectar un badge o indicador al lado del título
 */
export function HeaderBadge({ children }: { children: ReactNode }) {
  const { setBadge } = useHeader();

  useEffect(() => {
    setBadge(children);
    return () => {
      setBadge(null);
    };
  }, [children, setBadge]);

  return null;
}
