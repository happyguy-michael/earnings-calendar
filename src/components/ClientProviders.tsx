'use client';

import { ReactNode } from 'react';
import { ToastProvider } from './Toast';
import { UndoToastProvider } from './UndoToast';
import { MotionPreferencesProvider } from './MotionPreferences';
import { AudioFeedbackProvider } from './AudioFeedback';
import { KeyPressEchoProvider } from './KeyPressEcho';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <MotionPreferencesProvider>
      <AudioFeedbackProvider>
        <KeyPressEchoProvider position="bottom-center" maxEchoes={2}>
          <ToastProvider>
            <UndoToastProvider>
              {children}
            </UndoToastProvider>
          </ToastProvider>
        </KeyPressEchoProvider>
      </AudioFeedbackProvider>
    </MotionPreferencesProvider>
  );
}
