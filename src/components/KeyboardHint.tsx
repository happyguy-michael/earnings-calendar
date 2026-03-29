'use client';

import { useState, useEffect, useCallback, ReactNode, CSSProperties } from 'react';

interface KeyboardHintProps {
  /** The keyboard shortcut key(s) to display */
  shortcut: string;
  /** Position relative to the parent element */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'inline-right' | 'inline-left';
  /** Only show on hover (default: true) */
  showOnHover?: boolean;
  /** Always visible (overrides showOnHover) */
  alwaysVisible?: boolean;
  /** Delay before showing (ms) */
  showDelay?: number;
  /** Animation duration (ms) */
  animationDuration?: number;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Visual variant */
  variant?: 'default' | 'minimal' | 'glass' | 'solid';
  /** Custom className */
  className?: string;
  /** Whether the shortcut uses modifier keys (shows platform-specific symbols) */
  modifiers?: ('cmd' | 'ctrl' | 'alt' | 'shift')[];
  /** Disable the hint entirely */
  disabled?: boolean;
  /** Called when shortcut key is pressed */
  onShortcutPress?: () => void;
}

/**
 * KeyboardHint - Inline keyboard shortcut indicator
 * 
 * Shows keyboard shortcuts directly on interactive elements,
 * similar to Linear, Notion, and Figma.
 * 
 * Features:
 * - Platform-aware modifier symbols (⌘ on Mac, Ctrl on Windows)
 * - Multiple positioning options
 * - Smooth entrance/exit animations
 * - Respects reduced motion preferences
 * - Optional global shortcut listener
 */
export function KeyboardHint({
  shortcut,
  position = 'inline-right',
  showOnHover = true,
  alwaysVisible = false,
  showDelay = 300,
  animationDuration = 200,
  size = 'sm',
  variant = 'default',
  className = '',
  modifiers = [],
  disabled = false,
  onShortcutPress,
}: KeyboardHintProps) {
  const [isVisible, setIsVisible] = useState(alwaysVisible);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMac, setIsMac] = useState(true);

  // Detect platform for modifier symbols
  useEffect(() => {
    setIsMac(navigator.platform?.toLowerCase().includes('mac') ?? true);
  }, []);

  // Global shortcut listener
  useEffect(() => {
    if (!onShortcutPress || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Check modifiers
      const modifierMatch = 
        (!modifiers.includes('cmd') || (isMac ? e.metaKey : e.ctrlKey)) &&
        (!modifiers.includes('ctrl') || e.ctrlKey) &&
        (!modifiers.includes('alt') || e.altKey) &&
        (!modifiers.includes('shift') || e.shiftKey);

      if (modifierMatch && e.key.toLowerCase() === shortcut.toLowerCase()) {
        e.preventDefault();
        onShortcutPress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, modifiers, onShortcutPress, disabled, isMac]);

  // Format modifiers with platform-specific symbols
  const formatModifiers = useCallback((): string => {
    return modifiers.map(mod => {
      switch (mod) {
        case 'cmd': return isMac ? '⌘' : 'Ctrl';
        case 'ctrl': return isMac ? '⌃' : 'Ctrl';
        case 'alt': return isMac ? '⌥' : 'Alt';
        case 'shift': return '⇧';
        default: return '';
      }
    }).join('');
  }, [modifiers, isMac]);

  if (disabled) return null;

  const formattedShortcut = `${formatModifiers()}${shortcut.toUpperCase()}`;

  // Size classes
  const sizeClasses = {
    xs: 'keyboard-hint-xs',
    sm: 'keyboard-hint-sm',
    md: 'keyboard-hint-md',
  };

  // Variant classes
  const variantClasses = {
    default: 'keyboard-hint-default',
    minimal: 'keyboard-hint-minimal',
    glass: 'keyboard-hint-glass',
    solid: 'keyboard-hint-solid',
  };

  // Position classes
  const positionClasses = {
    top: 'keyboard-hint-top',
    bottom: 'keyboard-hint-bottom',
    left: 'keyboard-hint-left',
    right: 'keyboard-hint-right',
    'inline-right': 'keyboard-hint-inline-right',
    'inline-left': 'keyboard-hint-inline-left',
  };

  return (
    <span
      className={`
        keyboard-hint
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${positionClasses[position]}
        ${alwaysVisible || !showOnHover ? 'always-visible' : 'hover-reveal'}
        ${isVisible ? 'visible' : ''}
        ${isAnimating ? 'animating' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{
        '--animation-duration': `${animationDuration}ms`,
        '--show-delay': `${showDelay}ms`,
      } as CSSProperties}
      aria-hidden="true"
    >
      <kbd className="keyboard-hint-key">{formattedShortcut}</kbd>
    </span>
  );
}

/**
 * KeyboardHintWrapper - Wraps an element to show keyboard hint on hover
 * 
 * Usage:
 * <KeyboardHintWrapper shortcut="T" position="right">
 *   <button>Today</button>
 * </KeyboardHintWrapper>
 */
interface KeyboardHintWrapperProps extends Omit<KeyboardHintProps, 'showOnHover'> {
  children: ReactNode;
  /** Additional wrapper className */
  wrapperClassName?: string;
}

export function KeyboardHintWrapper({
  children,
  shortcut,
  position = 'inline-right',
  wrapperClassName = '',
  ...hintProps
}: KeyboardHintWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (isHovered) {
      const delay = prefersReducedMotion ? 0 : (hintProps.showDelay ?? 300);
      const timer = setTimeout(() => setShowHint(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShowHint(false);
    }
  }, [isHovered, hintProps.showDelay, prefersReducedMotion]);

  return (
    <span
      className={`keyboard-hint-wrapper ${wrapperClassName}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {children}
      <KeyboardHint
        shortcut={shortcut}
        position={position}
        alwaysVisible={showHint}
        showOnHover={false}
        {...hintProps}
      />
    </span>
  );
}

/**
 * KeyboardHintGroup - Shows multiple shortcuts with separators
 */
interface KeyboardHintGroupProps {
  shortcuts: Array<{
    key: string;
    label?: string;
    modifiers?: ('cmd' | 'ctrl' | 'alt' | 'shift')[];
  }>;
  separator?: 'or' | 'then' | 'plus' | 'comma';
  size?: 'xs' | 'sm' | 'md';
  variant?: 'default' | 'minimal' | 'glass' | 'solid';
  className?: string;
}

export function KeyboardHintGroup({
  shortcuts,
  separator = 'or',
  size = 'sm',
  variant = 'default',
  className = '',
}: KeyboardHintGroupProps) {
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(navigator.platform?.toLowerCase().includes('mac') ?? true);
  }, []);

  const formatKey = (shortcut: KeyboardHintGroupProps['shortcuts'][0]): string => {
    const modSymbols = (shortcut.modifiers ?? []).map(mod => {
      switch (mod) {
        case 'cmd': return isMac ? '⌘' : 'Ctrl+';
        case 'ctrl': return isMac ? '⌃' : 'Ctrl+';
        case 'alt': return isMac ? '⌥' : 'Alt+';
        case 'shift': return '⇧';
        default: return '';
      }
    }).join('');
    return `${modSymbols}${shortcut.key.toUpperCase()}`;
  };

  const separatorText = {
    or: 'or',
    then: '→',
    plus: '+',
    comma: ',',
  };

  // Size classes
  const sizeClasses = {
    xs: 'keyboard-hint-xs',
    sm: 'keyboard-hint-sm',
    md: 'keyboard-hint-md',
  };

  // Variant classes
  const variantClasses = {
    default: 'keyboard-hint-default',
    minimal: 'keyboard-hint-minimal',
    glass: 'keyboard-hint-glass',
    solid: 'keyboard-hint-solid',
  };

  return (
    <span 
      className={`
        keyboard-hint-group
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      aria-hidden="true"
    >
      {shortcuts.map((shortcut, index) => (
        <span key={index} className="keyboard-hint-group-item">
          {index > 0 && (
            <span className="keyboard-hint-separator">{separatorText[separator]}</span>
          )}
          <kbd className="keyboard-hint-key">{formatKey(shortcut)}</kbd>
          {shortcut.label && (
            <span className="keyboard-hint-label">{shortcut.label}</span>
          )}
        </span>
      ))}
    </span>
  );
}

export default KeyboardHint;
