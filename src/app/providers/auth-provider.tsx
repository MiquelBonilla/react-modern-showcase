import { useSyncExternalStore, type ReactNode } from 'react';
import { useAuthStore } from '@features/auth';

interface AuthProviderProps {
  children: ReactNode;
}

function subscribe(callback: () => void) {
  const unsubscribe = useAuthStore.persist.onFinishHydration(callback);
  return unsubscribe;
}

function getSnapshot() {
  return useAuthStore.persist.hasHydrated();
}

function getServerSnapshot() {
  return true;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const isHydrated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
