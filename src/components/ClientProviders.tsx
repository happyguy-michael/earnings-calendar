'use client';

import { ReactNode } from 'react';
import { ToastProvider } from './Toast';
import { UndoToastProvider } from './UndoToast';
import { MotionPreferencesProvider } from './MotionPreferences';
import { AudioFeedbackProvider } from './AudioFeedback';
import { KeyPressEchoProvider } from './KeyPressEcho';
import { CursorAmbientLight } from './CursorAmbientLight';
import { SmoothThemeTransition } from './SmoothThemeTransition';
import { FocusModeProvider, FocusModeIndicator } from './FocusMode';
import { ViewportScrollSpotlight } from './ViewportScrollSpotlight';
import { DynamicShadowProvider, DynamicShadowStyles } from './DynamicShadow';
import { LiquidButtonStyles } from './LiquidButton';
import { DynamicIslandProvider } from './DynamicIsland';
import { SpringEasingStyles } from './NativeSpringEasing';
import { SeismicWaveProvider } from './SeismicWave';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <MotionPreferencesProvider>
      <AudioFeedbackProvider>
        <KeyPressEchoProvider position="bottom-center" maxEchoes={2}>
          <DynamicShadowProvider smoothing={0.06}>
            <FocusModeProvider dimOpacity={0.35} transitionDuration={300}>
              <ToastProvider>
                <UndoToastProvider>
                  <DynamicIslandProvider>
                    <SeismicWaveProvider maxConcurrentWaves={3}>
                      <CursorAmbientLight intensity={0.12} radius={500} smoothing={0.06} />
                      <SmoothThemeTransition />
                      <ViewportScrollSpotlight />
                      <DynamicShadowStyles />
                      <LiquidButtonStyles />
                      <SpringEasingStyles />
                      <FocusModeIndicator />
                      {children}
                    </SeismicWaveProvider>
                  </DynamicIslandProvider>
                </UndoToastProvider>
              </ToastProvider>
            </FocusModeProvider>
          </DynamicShadowProvider>
        </KeyPressEchoProvider>
      </AudioFeedbackProvider>
    </MotionPreferencesProvider>
  );
}
