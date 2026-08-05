'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AccountUser } from '@/types/account';

/**
 * Сессия на клиенте: кто залогинен, для шапки и модалок.
 *
 * Читается запросом к `/api/auth/session`, а не при серверном рендере: layout,
 * который трогает куки, перестал бы генерироваться статически — а публичных
 * страниц у нас 80. Старый сайт делал ровно то же, только смотрел в localStorage.
 * `/user/*` этим не пользуется: там сессия проверяется на сервере.
 */

type SessionValue = {
  user: AccountUser | null;
  /** true, пока первый запрос сессии не вернулся: шапка не мигает «Войти» у залогиненных. */
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = (await res.json()) as { user: AccountUser | null };
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SessionContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </SessionContext.Provider>
  );
}
