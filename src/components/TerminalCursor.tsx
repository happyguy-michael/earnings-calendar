'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';

/**
 * TerminalCursor - Blinking terminal-style cursor animation
 * 
 * Inspired by: 2026 "raw aesthetics" trend (Tubik Studio), classic terminal UIs,
 * Bloomberg terminals, and the "neo-retro" design movement combining modern polish
 * with nostalgic command-line aesthetics.
 * 
 * Perfect for financial dashboards that want to evoke "serious data" atmosphere
 * while maintaining a modern feel.
 */

type CursorStyle = 'bar' | 'underscore' | 'block' | 'hollow';
type BlinkStyle = 'smooth' | 'step' | 'pulse';

interface TerminalCursorProps {
  /** Cursor style */
  style?: CursorStyle;
  /** Blink animation style */
  blinkStyle?: BlinkStyle;
  /** Blink interval in ms */
  interval?: number;
  /** Color (CSS color value) */
  color?: string;
  /** Height for bar cursor, width for underscore/block */
  size?: number;
  /** Show cursor */
  visible?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Standalone blinking cursor
 */
export const TerminalCursor = memo(function TerminalCursor({
  style = 'bar',
  blinkStyle = 'step',
  interval = 530,
  color = 'currentColor',
  size,
  visible = true,
  className = '',
}: TerminalCursorProps) {
  const [isOn, setIsOn] = useState(true);
  const prefersReducedMotion = useRef(false);
  
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  
  useEffect(() => {
    if (!visible || prefersReducedMotion.current) return;
    
    const timer = setInterval(() => {
      setIsOn(prev => !prev);
    }, interval);
    
    return () => clearInterval(timer);
  }, [visible, interval]);
  
  if (!visible) return null;
  
  const cursorSize = size || (style === 'bar' ? 2 : style === 'underscore' ? 2 : 10);
  
  const getAnimationStyle = () => {
    if (prefersReducedMotion.current) return {};
    
    switch (blinkStyle) {
      case 'smooth':
        return {
          animation: `terminal-cursor-smooth ${interval * 2}ms ease-in-out infinite`,
        };
      case 'pulse':
        return {
          animation: `terminal-cursor-pulse ${interval * 2}ms ease-in-out infinite`,
        };
      case 'step':
      default:
        return {
          opacity: isOn ? 1 : 0,
          transition: 'opacity 50ms',
        };
    }
  };
  
  const getCursorElement = () => {
    switch (style) {
      case 'bar':
        return (
          <span
            className={`terminal-cursor terminal-cursor-bar ${className}`}
            style={{
              display: 'inline-block',
              width: `${cursorSize}px`,
              height: '1em',
              backgroundColor: color,
              marginLeft: '2px',
              verticalAlign: 'text-bottom',
              ...getAnimationStyle(),
            }}
          />
        );
      case 'underscore':
        return (
          <span
            className={`terminal-cursor terminal-cursor-underscore ${className}`}
            style={{
              display: 'inline-block',
              width: '0.6em',
              height: `${cursorSize}px`,
              backgroundColor: color,
              marginLeft: '1px',
              verticalAlign: 'baseline',
              position: 'relative',
              top: '2px',
              ...getAnimationStyle(),
            }}
          />
        );
      case 'block':
        return (
          <span
            className={`terminal-cursor terminal-cursor-block ${className}`}
            style={{
              display: 'inline-block',
              width: '0.6em',
              height: '1em',
              backgroundColor: color,
              marginLeft: '1px',
              verticalAlign: 'text-bottom',
              ...getAnimationStyle(),
            }}
          />
        );
      case 'hollow':
        return (
          <span
            className={`terminal-cursor terminal-cursor-hollow ${className}`}
            style={{
              display: 'inline-block',
              width: '0.55em',
              height: '1em',
              border: `${cursorSize}px solid ${color}`,
              backgroundColor: 'transparent',
              marginLeft: '1px',
              verticalAlign: 'text-bottom',
              ...getAnimationStyle(),
            }}
          />
        );
    }
  };
  
  return (
    <>
      {getCursorElement()}
      <style jsx global>{`
        @keyframes terminal-cursor-smooth {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes terminal-cursor-pulse {
          0%, 100% { opacity: 1; transform: scaleX(1); }
          50% { opacity: 0.3; transform: scaleX(0.8); }
        }
      `}</style>
    </>
  );
});

interface TypewriterTextProps {
  /** Text to type */
  text: string;
  /** Typing speed in ms per character */
  speed?: number;
  /** Delay before starting in ms */
  delay?: number;
  /** Cursor style */
  cursorStyle?: CursorStyle;
  /** Cursor blink style */
  cursorBlinkStyle?: BlinkStyle;
  /** Cursor color */
  cursorColor?: string;
  /** Show cursor after typing completes */
  showCursorAfter?: boolean;
  /** Callback when typing completes */
  onComplete?: () => void;
  /** Start typing immediately */
  autoStart?: boolean;
  /** Custom className */
  className?: string;
  /** Children to render after typed text */
  children?: React.ReactNode;
}

/**
 * Text that types out character by character with a blinking cursor
 */
export const TypewriterText = memo(function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  cursorStyle = 'bar',
  cursorBlinkStyle = 'step',
  cursorColor = 'currentColor',
  showCursorAfter = true,
  onComplete,
  autoStart = true,
  className = '',
  children,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const prefersReducedMotion = useRef(false);
  
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  
  const startTyping = useCallback(() => {
    if (prefersReducedMotion.current) {
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
      return;
    }
    
    setIsTyping(true);
    indexRef.current = 0;
    setDisplayedText('');
    
    const typeNext = () => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
        setTimeout(typeNext, speed + Math.random() * (speed * 0.5)); // Slight randomness for natural feel
      } else {
        setIsTyping(false);
        setIsComplete(true);
        onComplete?.();
      }
    };
    
    setTimeout(typeNext, delay);
  }, [text, speed, delay, onComplete]);
  
  useEffect(() => {
    if (autoStart) {
      startTyping();
    }
  }, [autoStart, startTyping]);
  
  // Reset when text changes
  useEffect(() => {
    if (!autoStart) return;
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;
    startTyping();
  }, [text, autoStart, startTyping]);
  
  const showCursor = isTyping || (isComplete && showCursorAfter);
  
  return (
    <span className={`typewriter-text ${className}`}>
      <span className="typewriter-content">{displayedText}</span>
      {showCursor && (
        <TerminalCursor
          style={cursorStyle}
          blinkStyle={isTyping ? 'step' : cursorBlinkStyle}
          color={cursorColor}
        />
      )}
      {isComplete && children}
    </span>
  );
});

interface TerminalLineProps {
  /** Prompt character(s) */
  prompt?: string;
  /** Command text */
  command?: string;
  /** Output text (appears after command) */
  output?: string;
  /** Type the command */
  typeCommand?: boolean;
  /** Type speed */
  typeSpeed?: number;
  /** Delay before typing */
  typeDelay?: number;
  /** Cursor style */
  cursorStyle?: CursorStyle;
  /** Custom className */
  className?: string;
  /** Show cursor on output line */
  showOutputCursor?: boolean;
}

/**
 * Terminal-style line with prompt, command, and optional output
 */
export const TerminalLine = memo(function TerminalLine({
  prompt = '>',
  command = '',
  output,
  typeCommand = false,
  typeSpeed = 50,
  typeDelay = 500,
  cursorStyle = 'bar',
  className = '',
  showOutputCursor = false,
}: TerminalLineProps) {
  const [showOutput, setShowOutput] = useState(!typeCommand);
  
  return (
    <div className={`terminal-line ${className}`} style={{ fontFamily: 'monospace' }}>
      <div className="terminal-command-line" style={{ display: 'flex', gap: '0.5em' }}>
        <span className="terminal-prompt" style={{ opacity: 0.6, userSelect: 'none' }}>
          {prompt}
        </span>
        {typeCommand ? (
          <TypewriterText
            text={command}
            speed={typeSpeed}
            delay={typeDelay}
            cursorStyle={cursorStyle}
            showCursorAfter={!output}
            onComplete={() => setShowOutput(true)}
          />
        ) : (
          <span className="terminal-command">
            {command}
            {!output && <TerminalCursor style={cursorStyle} />}
          </span>
        )}
      </div>
      {output && showOutput && (
        <div className="terminal-output" style={{ marginTop: '0.25em', opacity: 0.8 }}>
          {output}
          {showOutputCursor && <TerminalCursor style={cursorStyle} />}
        </div>
      )}
    </div>
  );
});

interface TerminalBlockProps {
  /** Lines to display */
  lines: Array<{
    prompt?: string;
    command?: string;
    output?: string;
  }>;
  /** Type commands sequentially */
  typeSequentially?: boolean;
  /** Delay between lines */
  lineDelay?: number;
  /** Type speed */
  typeSpeed?: number;
  /** Custom className */
  className?: string;
}

/**
 * Multiple terminal lines displayed as a block
 */
export const TerminalBlock = memo(function TerminalBlock({
  lines,
  typeSequentially = false,
  lineDelay = 1000,
  typeSpeed = 50,
  className = '',
}: TerminalBlockProps) {
  const [visibleLines, setVisibleLines] = useState<number>(typeSequentially ? 1 : lines.length);
  const [completedLines, setCompletedLines] = useState<Set<number>>(new Set());
  
  const handleLineComplete = useCallback((index: number) => {
    setCompletedLines(prev => new Set([...prev, index]));
    if (typeSequentially && index < lines.length - 1) {
      setTimeout(() => {
        setVisibleLines(prev => prev + 1);
      }, lineDelay);
    }
  }, [typeSequentially, lines.length, lineDelay]);
  
  return (
    <div 
      className={`terminal-block ${className}`}
      style={{
        fontFamily: 'ui-monospace, "SF Mono", "Cascadia Code", "Segoe UI Mono", Menlo, Monaco, Consolas, monospace',
        fontSize: '0.875em',
        lineHeight: 1.6,
        padding: '1em',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {lines.slice(0, visibleLines).map((line, index) => (
        <TerminalLine
          key={index}
          prompt={line.prompt}
          command={line.command}
          output={line.output}
          typeCommand={typeSequentially}
          typeSpeed={typeSpeed}
          typeDelay={index === 0 ? 500 : 0}
          cursorStyle="bar"
          showOutputCursor={index === visibleLines - 1 && !line.output}
        />
      ))}
    </div>
  );
});

interface LiveStatusProps {
  /** Status text */
  status: string;
  /** Prefix (e.g., ">" or "$") */
  prefix?: string;
  /** Whether system is "thinking" / processing */
  isProcessing?: boolean;
  /** Cursor style */
  cursorStyle?: CursorStyle;
  /** Custom className */
  className?: string;
}

/**
 * Live status indicator with terminal aesthetic
 * Great for showing "Fetching data...", "Processing...", etc.
 */
export const LiveStatus = memo(function LiveStatus({
  status,
  prefix = '>',
  isProcessing = false,
  cursorStyle = 'bar',
  className = '',
}: LiveStatusProps) {
  const [dots, setDots] = useState('');
  const prefersReducedMotion = useRef(false);
  
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  
  useEffect(() => {
    if (!isProcessing || prefersReducedMotion.current) {
      setDots('');
      return;
    }
    
    const timer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    
    return () => clearInterval(timer);
  }, [isProcessing]);
  
  return (
    <span
      className={`live-status ${className}`}
      style={{
        fontFamily: 'ui-monospace, "SF Mono", "Cascadia Code", "Segoe UI Mono", Menlo, Monaco, Consolas, monospace',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5em',
      }}
    >
      <span style={{ opacity: 0.5 }}>{prefix}</span>
      <span>
        {status}
        {isProcessing && <span style={{ width: '1.5em', display: 'inline-block' }}>{dots}</span>}
      </span>
      <TerminalCursor 
        style={cursorStyle} 
        blinkStyle={isProcessing ? 'pulse' : 'step'}
        visible={!isProcessing || prefersReducedMotion.current}
      />
    </span>
  );
});

// Convenience exports with preset styles

/** Green terminal cursor (classic terminal) */
export const GreenTerminalCursor = memo(function GreenTerminalCursor(
  props: Omit<TerminalCursorProps, 'color'>
) {
  return <TerminalCursor {...props} color="#00ff00" />;
});

/** Amber terminal cursor (vintage) */
export const AmberTerminalCursor = memo(function AmberTerminalCursor(
  props: Omit<TerminalCursorProps, 'color'>
) {
  return <TerminalCursor {...props} color="#ffb000" />;
});

/** Financial terminal style (cyan/teal) */
export const FinancialCursor = memo(function FinancialCursor(
  props: Omit<TerminalCursorProps, 'color'>
) {
  return <TerminalCursor {...props} color="#00d4ff" />;
});

export default TerminalCursor;
