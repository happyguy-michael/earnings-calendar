'use client';

import { useCallback, useEffect, useState, createContext, useContext, ReactNode } from 'react';

/**
 * AudioFeedback - Subtle UI Sound Effects
 * 
 * Uses Web Audio API to synthesize sounds on-the-fly.
 * No external audio files needed - pure procedural generation.
 * 
 * Sound Types:
 * - click: Quick subtle tap (for buttons, selections)
 * - success: Rising triumphant tone (for beats, completions)
 * - error: Descending alert (for misses, failures)
 * - notification: Gentle ping (for new data, updates)
 * - toggle: Soft switch sound (for toggles, filters)
 * - hover: Barely audible whisper (for focus/hover states)
 * - countdown: Urgent tick (for imminent events)
 * - celebration: Ascending chime cascade (for monster beats)
 * 
 * Inspired by: macOS Sonoma UI sounds, Bloomberg Terminal, Robinhood
 */

type SoundType = 
  | 'click' 
  | 'success' 
  | 'error' 
  | 'notification' 
  | 'toggle' 
  | 'hover' 
  | 'countdown'
  | 'celebration';

interface AudioContextState {
  isSupported: boolean;
  isEnabled: boolean;
  volume: number;
  play: (sound: SoundType) => void;
  toggle: () => void;
  setVolume: (vol: number) => void;
}

const AudioContext = createContext<AudioContextState | null>(null);

// Singleton AudioContext (created on first interaction)
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  return audioContext;
}

// Sound synthesis functions
const sounds: Record<SoundType, (ctx: AudioContext, volume: number) => void> = {
  click: (ctx, volume) => {
    // Quick subtle tap - 2ms attack, 30ms decay
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.03);
    
    gain.gain.setValueAtTime(0.08 * volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  },

  success: (ctx, volume) => {
    // Rising triumphant tone - two notes ascending
    const now = ctx.currentTime;
    
    [523.25, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.1 * volume, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.2);
    });
  },

  error: (ctx, volume) => {
    // Descending warning - minor third fall
    const now = ctx.currentTime;
    
    [440, 349.23].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.08 * volume, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.25);
    });
  },

  notification: (ctx, volume) => {
    // Gentle ping - single soft chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06 * volume, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  },

  toggle: (ctx, volume) => {
    // Soft switch - quick whoosh
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.05 * volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  },

  hover: (ctx, volume) => {
    // Barely audible whisper - ultra-subtle
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.015 * volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.025);
  },

  countdown: (ctx, volume) => {
    // Urgent tick - like a clock's final seconds
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.04 * volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.02);
  },

  celebration: (ctx, volume) => {
    // Ascending chime cascade - for monster beats
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 - major chord arpeggio
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      
      gain.gain.setValueAtTime(0, now + i * 0.07);
      gain.gain.linearRampToValueAtTime(0.08 * volume, now + i * 0.07 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.3);
    });
  },
};

/**
 * AudioFeedbackProvider - Context provider for app-wide sound control
 */
export function AudioFeedbackProvider({ children }: { children: ReactNode }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check support on mount
  useEffect(() => {
    const supported = typeof window !== 'undefined' && 
      ('AudioContext' in window || 'webkitAudioContext' in window);
    setIsSupported(supported);
    
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Load preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('audio-feedback-enabled');
      if (stored !== null) {
        setIsEnabled(stored === 'true');
      }
      const storedVol = localStorage.getItem('audio-feedback-volume');
      if (storedVol !== null) {
        setVolumeState(parseFloat(storedVol));
      }
    } catch {}
  }, []);

  const play = useCallback((sound: SoundType) => {
    // Respect user preferences
    if (!isEnabled || prefersReducedMotion) return;
    
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
      sounds[sound](ctx, volume);
    } catch (err) {
      console.warn('Audio feedback failed:', err);
    }
  }, [isEnabled, prefersReducedMotion, volume]);

  const toggle = useCallback(() => {
    setIsEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('audio-feedback-enabled', String(next));
      } catch {}
      
      // Play a confirmation sound when enabling
      if (next) {
        const ctx = getAudioContext();
        if (ctx) {
          sounds.toggle(ctx, volume);
        }
      }
      
      return next;
    });
  }, [volume]);

  const setVolume = useCallback((vol: number) => {
    const clampedVol = Math.max(0, Math.min(1, vol));
    setVolumeState(clampedVol);
    try {
      localStorage.setItem('audio-feedback-volume', String(clampedVol));
    } catch {}
  }, []);

  return (
    <AudioContext.Provider value={{ isSupported, isEnabled, volume, play, toggle, setVolume }}>
      {children}
    </AudioContext.Provider>
  );
}

/**
 * useAudioFeedback - Hook for playing UI sounds
 */
export function useAudioFeedback() {
  const context = useContext(AudioContext);
  
  if (!context) {
    // Return a no-op version if outside provider
    return {
      isSupported: false,
      isEnabled: false,
      volume: 0,
      play: () => {},
      toggle: () => {},
      setVolume: () => {},
    };
  }
  
  return context;
}

/**
 * AudioToggle - Visual toggle for audio feedback setting
 */
interface AudioToggleProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function AudioToggle({ 
  size = 'md', 
  showLabel = false,
  className = ''
}: AudioToggleProps) {
  const { isSupported, isEnabled, toggle } = useAudioFeedback();
  
  // Don't render on unsupported browsers
  if (!isSupported) return null;
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
  };

  return (
    <button
      onClick={toggle}
      className={`audio-toggle ${sizeClasses[size]} ${isEnabled ? 'active' : ''} ${className}`}
      title={isEnabled ? 'Disable UI sounds' : 'Enable UI sounds'}
      aria-label={isEnabled ? 'Disable UI sounds' : 'Enable UI sounds'}
      aria-pressed={isEnabled}
    >
      <span className="audio-toggle-icon" aria-hidden="true">
        {isEnabled ? '🔊' : '🔇'}
      </span>
      {showLabel && (
        <span className="audio-toggle-label">
          {isEnabled ? 'On' : 'Off'}
        </span>
      )}
    </button>
  );
}

/**
 * AudioVolumeSlider - Volume control slider
 */
export function AudioVolumeSlider({ className = '' }: { className?: string }) {
  const { isSupported, isEnabled, volume, setVolume } = useAudioFeedback();
  
  if (!isSupported || !isEnabled) return null;
  
  return (
    <div className={`audio-volume-slider ${className}`}>
      <span className="audio-volume-icon" aria-hidden="true">
        {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="audio-volume-input"
        aria-label="UI sound volume"
      />
    </div>
  );
}

/**
 * SoundButton - Button that plays a sound on click
 */
interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  sound?: SoundType;
  children: React.ReactNode;
}

export function SoundButton({ 
  sound = 'click',
  onClick,
  children,
  ...props 
}: SoundButtonProps) {
  const { play } = useAudioFeedback();
  
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    play(sound);
    onClick?.(e);
  }, [play, sound, onClick]);

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

export default useAudioFeedback;
