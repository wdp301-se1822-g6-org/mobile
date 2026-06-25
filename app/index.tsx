import { useAuthStore } from '@/stores/useAuthStore';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const { isLoggedIn, authUser, initAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  if (!isInitialized) return null;

  if (!isLoggedIn) return <Redirect href="/(auth)/welcome" />;

  if (authUser?.role === 'washer') return <Redirect href="/(washer)/queue" />;

  if (authUser?.role === 'cashier') return <Redirect href="/(cashier)/check-in" />;

  return <Redirect href="/(tabs)/home" />;
}
