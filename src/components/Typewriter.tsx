'use client';

import { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
  cursorChar?: string;
}

export function Typewriter({
  text,
  speed = 20,
  delay = 0,
  onComplete,
  className = '',
  showCursor = true,
  cursorChar = '▋',
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      
      const typeChar = () => {
        if (indexRef.current < text.length) {
          // Add multiple characters at once for faster typing
          const charsToAdd = Math.min(3, text.length - indexRef.current);
          const nextChars = text.slice(indexRef.current, indexRef.current + charsToAdd);
          setDisplayedText(prev => prev + nextChars);
          indexRef.current += charsToAdd;
          
          // Vary speed slightly for natural feel
          const variance = Math.random() * 10 - 5;
          setTimeout(typeChar, speed + variance);
        } else {
          setIsTyping(false);
          setIsComplete(true);
          onComplete?.();
        }
      };
      
      typeChar();
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && !isComplete && (
        <span 
          className="typewriter-cursor"
          style={{
            animation: isTyping ? 'none' : 'cursor-blink 1s step-end infinite',
            opacity: isTyping ? 1 : undefined,
          }}
        >
          {cursorChar}
        </span>
      )}
      <style jsx>{`
        @keyframes cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .typewriter-cursor {
          color: #818cf8;
          margin-left: 1px;
          font-weight: normal;
        }
      `}</style>
    </span>
  );
}

// Multi-paragraph typewriter that types each paragraph sequentially
interface TypewriterParagraphsProps {
  paragraphs: string[];
  speed?: number;
  paragraphDelay?: number;
  className?: string;
  paragraphClassName?: string;
}

export function TypewriterParagraphs({
  paragraphs,
  speed = 15,
  paragraphDelay = 200,
  className = '',
  paragraphClassName = '',
}: TypewriterParagraphsProps) {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [completedParagraphs, setCompletedParagraphs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleParagraphComplete = () => {
    setCompletedParagraphs(prev => [...prev, paragraphs[currentParagraph]]);
    
    if (currentParagraph < paragraphs.length - 1) {
      setTimeout(() => {
        setCurrentParagraph(prev => prev + 1);
      }, paragraphDelay);
    } else {
      setIsComplete(true);
    }
  };

  return (
    <div className={className}>
      {/* Completed paragraphs */}
      {completedParagraphs.map((p, i) => (
        <p key={i} className={paragraphClassName}>
          {p}
        </p>
      ))}
      
      {/* Currently typing paragraph */}
      {currentParagraph < paragraphs.length && !isComplete && (
        <p className={paragraphClassName}>
          <Typewriter
            text={paragraphs[currentParagraph]}
            speed={speed}
            onComplete={handleParagraphComplete}
            showCursor={true}
          />
        </p>
      )}
    </div>
  );
}

// Animated typing indicator (three bouncing dots)
export function TypingIndicator({ className = '' }: { className?: string }) {
  return (
    <div className={`typing-indicator ${className}`}>
      <span className="typing-dot" style={{ animationDelay: '0ms' }} />
      <span className="typing-dot" style={{ animationDelay: '150ms' }} />
      <span className="typing-dot" style={{ animationDelay: '300ms' }} />
      <style jsx>{`
        .typing-indicator {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          background: #818cf8;
          border-radius: 50%;
          animation: typing-bounce 1.4s ease-in-out infinite;
        }
        @keyframes typing-bounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// Skip button for typewriter effect
interface SkipButtonProps {
  onSkip: () => void;
  visible: boolean;
}

export function SkipButton({ onSkip, visible }: SkipButtonProps) {
  if (!visible) return null;
  
  return (
    <button
      onClick={onSkip}
      className="skip-typewriter-btn"
      aria-label="Skip to full text"
    >
      Skip
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>
      <style jsx>{`
        .skip-typewriter-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary, #71717a);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .skip-typewriter-btn:hover {
          color: var(--text-primary, #fff);
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </button>
  );
}
