'use client';

import { AuthStoreProvider } from '@/providers/auth-store-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthStoreProvider>
        <Toaster />
        {children}
      </AuthStoreProvider>
    </QueryClientProvider>
  );
}