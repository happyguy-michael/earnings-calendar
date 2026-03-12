'use client';

import { ReactNode } from 'react';
import { ToastProvider } from './Toast';
import { UndoToastProvider } from './UndoToast';
import { MotionPreferencesProvider } from './MotionPreferences';
import { AudioFeedbackProvider } from './AudioFeedback';
import { KeyPressEchoProvider } from './KeyPressEcho';
import { CursorAmbientLight } from './CursorAmbientLight';
import { SmoothThemeTransition } from './SmoothThemeTransition';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <MotionPreferencesProvider>
      <AudioFeedbackProvider>
        <KeyPressEchoProvider position="bottom-center" maxEchoes={2}>
          <ToastProvider>
            <UndoToastProvider>
              <CursorAmbientLight intensity={0.12} radius={500} smoothing={0.06} />
              <SmoothThemeTransition />
              {children}
            </UndoToastProvider>
          </ToastProvider>
        </KeyPressEchoProvider>
      </AudioFeedbackProvider>
    </MotionPreferencesProvider>
  );
}
