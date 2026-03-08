'use client';

import { ReactNode } from 'react';
import { ToastProvider } from './Toast';
import { MotionPreferencesProvider } from './MotionPreferences';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <MotionPreferencesProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </MotionPreferencesProvider>
  );
}
