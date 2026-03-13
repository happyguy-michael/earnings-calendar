'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { useAudioFeedback } from './AudioFeedback';
import { useHaptic } from './HapticFeedback';
import { useToast } from './Toast';

/**
 * KonamiEasterEgg - Hidden celebration trigger
 * 
 * Enter the legendary Konami Code to unlock a party mode:
 * ↑ ↑ ↓ ↓ ← → ← → B A
 * 
 * When triggered:
 * - Confetti burst animation
 * - Celebration sound effect
 * - Haptic feedback pattern
 * - Fun toast message
 * - Rainbow border glow effect (temporary)
 * 
 * References:
 * - Original Konami Code from Gradius (1986)
 * - Modern implementations: GitHub, Digg, ESPN
 * - Adds personality and delight without cluttering UI
 * 
 * The effect is temporary and subtle - it celebrates the discovery
 * without breaking the app's professional appearance.
 */

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp', 
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

// Alternative: Support both key and code for better compatibility
const KONAMI_KEYS = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

interface PartyParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  speedX: number;
  speedY: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'star' | 'circle' | 'heart' | 'diamond';
}

const PARTY_COLORS = [
  '#ff6b6b', // Red
  '#ffd93d', // Yellow
  '#6bcb77', // Green
  '#4d96ff', // Blue
  '#9d4edd', // Purple
  '#ff6b9d', // Pink
  '#00d4ff', // Cyan
  '#ff9f43', // Orange
];

const PARTY_MESSAGES = [
  '🎉 Party Mode Activated!',
  '🚀 You found the secret!',
  '✨ Konami Code Unlocked!',
  '🎮 30 Extra Lives! (just kidding)',
  '🏆 Achievement Unlocked: Code Master',
  '🎊 Let\'s celebrate!',
];

const SHAPES = ['star', 'circle', 'heart', 'diamond'] as const;

function KonamiEasterEggComponent() {
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const [isPartyMode, setIsPartyMode] = useState(false);
  const [particles, setParticles] = useState<PartyParticle[]>([]);
  const [showRainbowBorder, setShowRainbowBorder] = useState(false);
  const { play: playAudio } = useAudioFeedback();
  const { trigger: haptic } = useHaptic();
  const { showToast } = useToast();

  // Create party particles
  const createParticles = useCallback(() => {
    const newParticles: PartyParticle[] = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const velocity = 8 + Math.random() * 15;
      
      newParticles.push({
        id: i,
        x: 50, // Center of screen
        y: 40,
        size: 8 + Math.random() * 12,
        color: PARTY_COLORS[Math.floor(Math.random() * PARTY_COLORS.length)],
        rotation: Math.random() * 360,
        speedX: Math.cos(angle) * velocity,
        speedY: Math.sin(angle) * velocity - 5, // Bias upward
        rotationSpeed: (Math.random() - 0.5) * 20,
        opacity: 1,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      });
    }

    return newParticles;
  }, []);

  // Trigger the party
  const triggerParty = useCallback(() => {
    if (isPartyMode) return; // Prevent re-triggering while active
    
    setIsPartyMode(true);
    
    // Play celebration sound
    playAudio('celebration');
    
    // Haptic pattern: success, wait, success, wait, success
    haptic('success');
    setTimeout(() => haptic('light'), 150);
    setTimeout(() => haptic('success'), 300);
    
    // Show random fun message
    const message = PARTY_MESSAGES[Math.floor(Math.random() * PARTY_MESSAGES.length)];
    showToast(message, { 
      type: 'success', 
      duration: 4000,
      icon: '🎉',
    });
    
    // Create particles
    setParticles(createParticles());
    
    // Enable rainbow border
    setShowRainbowBorder(true);
    
    // Animate particles
    const startTime = Date.now();
    const duration = 4000;
    
    const animateParticles = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed > duration) {
        setParticles([]);
        setIsPartyMode(false);
        setShowRainbowBorder(false);
        return;
      }

      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.speedX * 0.08,
        y: p.y + p.speedY * 0.08,
        speedY: p.speedY + 0.4, // Gravity
        speedX: p.speedX * 0.99, // Air resistance
        rotation: p.rotation + p.rotationSpeed,
        opacity: Math.max(0, 1 - (elapsed / duration) * 0.7),
      })));

      requestAnimationFrame(animateParticles);
    };

    requestAnimationFrame(animateParticles);
  }, [isPartyMode, createParticles, playAudio, haptic, showToast]);

  // Listen for key sequence
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Get the key pressed (support both code and key)
      const keyPressed = e.key.toLowerCase();
      const codePressed = e.code;
      
      // Check if this key matches the expected next key
      const nextIndex = inputSequence.length;
      const expectedCode = KONAMI_CODE[nextIndex];
      const expectedKey = KONAMI_KEYS[nextIndex];
      
      const isMatch = codePressed === expectedCode || keyPressed === expectedKey;
      
      if (isMatch) {
        const newSequence = [...inputSequence, codePressed || keyPressed];
        setInputSequence(newSequence);
        
        // Check if complete
        if (newSequence.length === KONAMI_CODE.length) {
          triggerParty();
          setInputSequence([]);
        }
      } else {
        // Reset on wrong key
        setInputSequence([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputSequence, triggerParty]);

  // Clear sequence after timeout (user stopped typing)
  useEffect(() => {
    if (inputSequence.length === 0) return;
    
    const timeout = setTimeout(() => {
      setInputSequence([]);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [inputSequence]);

  // Render particles
  if (particles.length === 0 && !showRainbowBorder) return null;

  return (
    <>
      {/* Rainbow border overlay */}
      {showRainbowBorder && (
        <div 
          className="konami-rainbow-border"
          aria-hidden="true"
        />
      )}
      
      {/* Party particles */}
      {particles.length > 0 && (
        <div 
          className="konami-particles"
          aria-hidden="true"
        >
          {particles.map(p => (
            <ParticleShape key={p.id} particle={p} />
          ))}
        </div>
      )}

      <style jsx global>{`
        .konami-rainbow-border {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9998;
          border: 4px solid transparent;
          border-image: linear-gradient(
            90deg,
            #ff6b6b,
            #ffd93d,
            #6bcb77,
            #4d96ff,
            #9d4edd,
            #ff6b9d,
            #ff6b6b
          ) 1;
          animation: konami-rainbow 2s linear infinite, konami-border-pulse 0.5s ease-out;
          box-shadow: 
            inset 0 0 30px rgba(255, 107, 107, 0.2),
            inset 0 0 60px rgba(77, 150, 255, 0.1);
        }

        @keyframes konami-rainbow {
          0% {
            filter: hue-rotate(0deg);
          }
          100% {
            filter: hue-rotate(360deg);
          }
        }

        @keyframes konami-border-pulse {
          0% {
            opacity: 0;
            transform: scale(1.1);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .konami-particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }

        .konami-particle {
          position: absolute;
          transform-origin: center;
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .konami-rainbow-border {
            animation: none;
          }
          .konami-particles {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

// Render different particle shapes
function ParticleShape({ particle }: { particle: PartyParticle }) {
  const style: React.CSSProperties = {
    left: `${particle.x}%`,
    top: `${particle.y}%`,
    width: particle.size,
    height: particle.size,
    transform: `rotate(${particle.rotation}deg)`,
    opacity: particle.opacity,
  };

  switch (particle.shape) {
    case 'star':
      return (
        <svg 
          className="konami-particle"
          style={style}
          viewBox="0 0 24 24"
          fill={particle.color}
        >
          <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z" />
        </svg>
      );
    case 'heart':
      return (
        <svg 
          className="konami-particle"
          style={style}
          viewBox="0 0 24 24"
          fill={particle.color}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case 'diamond':
      return (
        <div 
          className="konami-particle"
          style={{
            ...style,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation + 45}deg)`,
            borderRadius: 2,
          }}
        />
      );
    case 'circle':
    default:
      return (
        <div 
          className="konami-particle"
          style={{
            ...style,
            backgroundColor: particle.color,
            borderRadius: '50%',
            boxShadow: `0 0 ${particle.size / 2}px ${particle.color}60`,
          }}
        />
      );
  }
}

export const KonamiEasterEgg = memo(KonamiEasterEggComponent);

/**
 * useKonamiCode - Hook version for custom triggers
 * 
 * @param onActivate - Callback when code is entered
 * @returns Progress info for UI hints (optional)
 */
export function useKonamiCode(onActivate: () => void) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let sequence: string[] = [];
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      clearTimeout(timeout);
      
      const keyPressed = e.key.toLowerCase();
      const codePressed = e.code;
      const nextIndex = sequence.length;
      const expectedCode = KONAMI_CODE[nextIndex];
      const expectedKey = KONAMI_KEYS[nextIndex];
      
      if (codePressed === expectedCode || keyPressed === expectedKey) {
        sequence.push(codePressed || keyPressed);
        setProgress(sequence.length / KONAMI_CODE.length);
        
        if (sequence.length === KONAMI_CODE.length) {
          onActivate();
          sequence = [];
          setProgress(0);
        }
      } else {
        sequence = [];
        setProgress(0);
      }

      timeout = setTimeout(() => {
        sequence = [];
        setProgress(0);
      }, 2000);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [onActivate]);

  return { progress };
}

export default KonamiEasterEgg;
