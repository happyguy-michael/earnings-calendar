'use client';

import { ReactNode } from 'react';
import { ToastProvider } from './Toast';
import { UndoToastProvider } from './UndoToast';
import { MotionPreferencesProvider } from './MotionPreferences';
import { AudioFeedbackProvider } from './AudioFeedback';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <MotionPreferencesProvider>
      <AudioFeedbackProvider>
        <ToastProvider>
          <UndoToastProvider>
            {children}
          </UndoToastProvider>
        </ToastProvider>
      </AudioFeedbackProvider>
    </MotionPreferencesProvider>
  );
}
