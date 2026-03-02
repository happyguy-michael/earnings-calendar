'use client';

import { ReactNode } from 'react';
import { ToastProvider } from './Toast';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
