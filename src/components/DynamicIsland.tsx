'use client';

/**
 * DynamicIsland — iOS-inspired morphing notification component
 * 
 * A premium notification system featuring:
 * - Elastic morphing animations between compact/expanded states
 * - Contextual content displays (progress, alerts, live activities)
 * - Spring physics for natural, satisfying transitions
 * - Backdrop blur and glass effects for depth
 * 
 * Inspired by Apple's Dynamic Island and modern web notification patterns.
 * 
 * Use cases:
 * - Live earnings report notifications
 * - Progress indicators for data fetching
 * - Quick action confirmations
 * - Real-time status updates
 */

import { 
  useState, 
  useEffect, 
  useCallback, 
  createContext, 
  useContext, 
  ReactNode,
  useRef,
  useMemo
} from 'react';

// ============================================================================
// TYPES
// ============================================================================

type IslandSize = 'compact' | 'minimal' | 'expanded' | 'long';

interface IslandContent {
  id: string;
  size: IslandSize;
  /** Left side content for compact/expanded modes */
  leftContent?: ReactNode;
  /** Center content (main) */
  centerContent?: ReactNode;
  /** Right side content for compact/expanded modes */
  rightContent?: ReactNode;
  /** Expanded content shown only in expanded mode */
  expandedContent?: ReactNode;
  /** Duration in ms (0 = persistent until dismissed) */
  duration?: number;
  /** Haptic feedback type */
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  /** Allow tap to expand */
  expandable?: boolean;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Callback when tapped */
  onTap?: () => void;
  /** Priority (higher = stays longer when queued) */
  priority?: number;
  /** Background blur intensity */
  blurIntensity?: number;
  /** Glow color for emphasis */
  glowColor?: string;
}

interface DynamicIslandContextType {
  show: (content: Omit<IslandContent, 'id'>) => string;
  update: (id: string, content: Partial<IslandContent>) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const DynamicIslandContext = createContext<DynamicIslandContextType | null>(null);

export function useDynamicIsland() {
  const context = useContext(DynamicIslandContext);
  if (!context) {
    throw new Error('useDynamicIsland must be used within a DynamicIslandProvider');
  }
  return context;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const sizeConfig: Record<IslandSize, { 
  width: string; 
  height: string; 
  padding: string;
  borderRadius: string;
}> = {
  minimal: {
    width: '120px',
    height: '36px',
    padding: '0 12px',
    borderRadius: '18px',
  },
  compact: {
    width: '200px',
    height: '40px',
    padding: '0 14px',
    borderRadius: '20px',
  },
  expanded: {
    width: '360px',
    height: '120px',
    padding: '16px',
    borderRadius: '40px',
  },
  long: {
    width: '360px',
    height: '180px',
    padding: '20px',
    borderRadius: '44px',
  },
};

// ============================================================================
// ISLAND COMPONENT (INTERNAL)
// ============================================================================

interface IslandProps {
  content: IslandContent;
  onDismiss: () => void;
  isActive: boolean;
}

function Island({ content, onDismiss, isActive }: IslandProps) {
  const [currentSize, setCurrentSize] = useState<IslandSize>(content.size);
  const [isExpanded, setIsExpanded] = useState(content.size === 'expanded' || content.size === 'long');
  const [isExiting, setIsExiting] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const islandRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate current size config
  const config = useMemo(() => sizeConfig[currentSize], [currentSize]);

  // Handle auto-dismiss
  useEffect(() => {
    if (content.duration && content.duration > 0 && isActive) {
      timeoutRef.current = setTimeout(() => {
        setIsExiting(true);
      }, content.duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content.duration, isActive]);

  // Handle exit animation completion
  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        onDismiss();
        content.onDismiss?.();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isExiting, onDismiss, content]);

  // Handle tap to expand
  const handleTap = useCallback(() => {
    content.onTap?.();
    
    if (content.expandable && !isExpanded) {
      setCurrentSize('expanded');
      setIsExpanded(true);
    } else if (isExpanded) {
      setCurrentSize(content.size);
      setIsExpanded(false);
    }
  }, [content, isExpanded]);

  // Handle dismiss gesture (swipe up or click close)
  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExiting(true);
  }, []);

  // Check reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Animation timing
  const transitionDuration = prefersReducedMotion ? '0ms' : '400ms';
  const transitionTiming = 'var(--spring-bouncy, cubic-bezier(0.34, 1.56, 0.64, 1))';

  return (
    <div
      ref={islandRef}
      className={`dynamic-island ${isExiting ? 'exiting' : ''} ${isHovering ? 'hovering' : ''}`}
      onClick={handleTap}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        // Size morphing
        width: config.width,
        height: config.height,
        padding: config.padding,
        borderRadius: config.borderRadius,
        
        // Transitions
        transition: `
          width ${transitionDuration} ${transitionTiming},
          height ${transitionDuration} ${transitionTiming},
          padding ${transitionDuration} ${transitionTiming},
          border-radius ${transitionDuration} ${transitionTiming},
          transform ${transitionDuration} ${transitionTiming},
          opacity 300ms ease-out,
          box-shadow 300ms ease-out
        `,
        
        // Positioning
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: isExiting 
          ? 'translateX(-50%) translateY(-100%) scale(0.8)' 
          : 'translateX(-50%) translateY(0) scale(1)',
        zIndex: 9999,
        
        // Appearance
        background: 'linear-gradient(180deg, rgba(30, 30, 35, 0.98) 0%, rgba(20, 20, 25, 0.98) 100%)',
        backdropFilter: `blur(${content.blurIntensity || 20}px)`,
        WebkitBackdropFilter: `blur(${content.blurIntensity || 20}px)`,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: content.glowColor 
          ? `0 4px 24px rgba(0, 0, 0, 0.4), 0 0 40px ${content.glowColor}40`
          : '0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2)',
        
        // Layout
        display: 'flex',
        alignItems: isExpanded ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: '12px',
        overflow: 'hidden',
        cursor: content.expandable ? 'pointer' : 'default',
        
        // Animation state
        opacity: isExiting ? 0 : 1,
      }}
      role="status"
      aria-live="polite"
    >
      {/* Inner glow effect */}
      <div
        className="island-inner-glow"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: content.glowColor 
            ? `radial-gradient(ellipse at 50% 0%, ${content.glowColor}20 0%, transparent 70%)`
            : 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Compact/Minimal Layout */}
      {!isExpanded && (
        <>
          {/* Left content */}
          {content.leftContent && (
            <div className="island-left" style={{ 
              display: 'flex', 
              alignItems: 'center',
              flexShrink: 0,
            }}>
              {content.leftContent}
            </div>
          )}
          
          {/* Center content */}
          <div className="island-center" style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            minWidth: 0,
            overflow: 'hidden',
          }}>
            {content.centerContent}
          </div>
          
          {/* Right content */}
          {content.rightContent && (
            <div className="island-right" style={{ 
              display: 'flex', 
              alignItems: 'center',
              flexShrink: 0,
            }}>
              {content.rightContent}
            </div>
          )}
        </>
      )}

      {/* Expanded Layout */}
      {isExpanded && (
        <div className="island-expanded" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          width: '100%',
          height: '100%',
          gap: '12px',
        }}>
          {/* Header row */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '12px',
          }}>
            {content.leftContent && (
              <div className="island-left">{content.leftContent}</div>
            )}
            <div className="island-center" style={{ flex: 1 }}>
              {content.centerContent}
            </div>
            {content.rightContent && (
              <div className="island-right">{content.rightContent}</div>
            )}
          </div>
          
          {/* Expanded content */}
          {content.expandedContent && (
            <div className="island-body" style={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}>
              {content.expandedContent}
            </div>
          )}
        </div>
      )}

      {/* Close button (visible on hover) */}
      <button
        className="island-close"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          opacity: isHovering ? 1 : 0,
          transform: isHovering ? 'scale(1)' : 'scale(0.8)',
          transition: 'all 200ms ease-out',
        }}
      >
        ✕
      </button>

      {/* Shine effect on hover */}
      <div
        className="island-shine"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.03) 50%, transparent 60%)',
          opacity: isHovering ? 1 : 0,
          transition: 'opacity 300ms ease-out',
          pointerEvents: 'none',
        }}
      />

      <style jsx>{`
        .dynamic-island {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
          color: white;
          font-size: 14px;
          font-weight: 500;
          -webkit-font-smoothing: antialiased;
        }
        
        .dynamic-island.hovering {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        /* Entry animation */
        @keyframes island-enter {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        
        .dynamic-island:not(.exiting) {
          animation: island-enter 400ms var(--spring-bouncy, cubic-bezier(0.34, 1.56, 0.64, 1)) forwards;
        }
        
        /* Pulse animation for persistent notifications */
        @keyframes island-pulse {
          0%, 100% {
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
          }
          50% {
            box-shadow: 0 4px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.2);
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .dynamic-island {
            animation: none !important;
            transition: opacity 200ms ease-out !important;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// PROVIDER
// ============================================================================

interface DynamicIslandProviderProps {
  children: ReactNode;
  /** Maximum number of queued notifications */
  maxQueue?: number;
}

export function DynamicIslandProvider({ 
  children, 
  maxQueue = 5 
}: DynamicIslandProviderProps) {
  const [queue, setQueue] = useState<IslandContent[]>([]);
  const idCounter = useRef(0);

  // Get current active notification
  const activeContent = queue[0] || null;

  const show = useCallback((content: Omit<IslandContent, 'id'>) => {
    const id = `island-${++idCounter.current}`;
    const newContent: IslandContent = {
      ...content,
      id,
      duration: content.duration ?? 4000, // Default 4s
      priority: content.priority ?? 0,
    };

    setQueue(prev => {
      const updated = [...prev, newContent];
      // Sort by priority (higher first) and trim to max
      return updated
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .slice(0, maxQueue);
    });

    return id;
  }, [maxQueue]);

  const update = useCallback((id: string, updates: Partial<IslandContent>) => {
    setQueue(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const dismiss = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setQueue([]);
  }, []);

  const handleDismiss = useCallback(() => {
    if (activeContent) {
      dismiss(activeContent.id);
    }
  }, [activeContent, dismiss]);

  const contextValue = useMemo(() => ({
    show,
    update,
    dismiss,
    dismissAll,
  }), [show, update, dismiss, dismissAll]);

  return (
    <DynamicIslandContext.Provider value={contextValue}>
      {children}
      {activeContent && (
        <Island
          key={activeContent.id}
          content={activeContent}
          onDismiss={handleDismiss}
          isActive={true}
        />
      )}
    </DynamicIslandContext.Provider>
  );
}

// ============================================================================
// PRESET HELPERS
// ============================================================================

/** Show a quick status message */
export function useIslandStatus() {
  const { show } = useDynamicIsland();

  return useCallback((
    message: string, 
    options?: { 
      icon?: ReactNode; 
      duration?: number;
      variant?: 'success' | 'error' | 'warning' | 'info';
    }
  ) => {
    const variants = {
      success: { icon: '✓', glow: 'rgba(34, 197, 94, 0.5)' },
      error: { icon: '✕', glow: 'rgba(239, 68, 68, 0.5)' },
      warning: { icon: '⚠', glow: 'rgba(245, 158, 11, 0.5)' },
      info: { icon: 'ℹ', glow: 'rgba(59, 130, 246, 0.5)' },
    };

    const variant = options?.variant ? variants[options.variant] : null;

    return show({
      size: 'compact',
      leftContent: variant ? (
        <span style={{ 
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: variant.glow,
        }}>
          {options?.icon || variant.icon}
        </span>
      ) : options?.icon,
      centerContent: (
        <span style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          color: 'rgba(255, 255, 255, 0.9)',
        }}>
          {message}
        </span>
      ),
      duration: options?.duration ?? 3000,
      glowColor: variant?.glow,
    });
  }, [show]);
}

/** Show a progress indicator */
export function useIslandProgress() {
  const { show, update, dismiss } = useDynamicIsland();

  return useCallback((
    label: string,
    options?: { icon?: ReactNode }
  ) => {
    const id = show({
      size: 'compact',
      leftContent: options?.icon || (
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderTopColor: '#3b82f6',
          animation: 'spin 1s linear infinite',
        }} />
      ),
      centerContent: (
        <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          {label}
        </span>
      ),
      duration: 0, // Persistent
    });

    return {
      id,
      update: (newLabel: string) => update(id, {
        centerContent: (
          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {newLabel}
          </span>
        ),
      }),
      complete: (message: string) => {
        update(id, {
          leftContent: (
            <span style={{ 
              fontSize: '16px',
              color: '#22c55e',
            }}>
              ✓
            </span>
          ),
          centerContent: (
            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {message}
            </span>
          ),
          glowColor: 'rgba(34, 197, 94, 0.5)',
          duration: 2000,
        });
      },
      error: (message: string) => {
        update(id, {
          leftContent: (
            <span style={{ 
              fontSize: '16px',
              color: '#ef4444',
            }}>
              ✕
            </span>
          ),
          centerContent: (
            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {message}
            </span>
          ),
          glowColor: 'rgba(239, 68, 68, 0.5)',
          duration: 3000,
        });
      },
      dismiss: () => dismiss(id),
    };
  }, [show, update, dismiss]);
}

/** Show an earnings result notification */
export function useIslandEarnings() {
  const { show } = useDynamicIsland();

  return useCallback((result: {
    ticker: string;
    company: string;
    result: 'beat' | 'miss' | 'meet';
    surprise: number;
  }) => {
    const resultConfig = {
      beat: { 
        icon: '📈', 
        color: '#22c55e', 
        glow: 'rgba(34, 197, 94, 0.4)',
        text: 'Beat',
      },
      miss: { 
        icon: '📉', 
        color: '#ef4444', 
        glow: 'rgba(239, 68, 68, 0.4)',
        text: 'Miss',
      },
      meet: { 
        icon: '➡️', 
        color: '#f59e0b', 
        glow: 'rgba(245, 158, 11, 0.3)',
        text: 'Met',
      },
    };

    const config = resultConfig[result.result];
    const surpriseText = result.surprise >= 0 
      ? `+${result.surprise.toFixed(1)}%` 
      : `${result.surprise.toFixed(1)}%`;

    return show({
      size: 'expanded',
      expandable: false,
      leftContent: (
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
        }}>
          {config.icon}
        </div>
      ),
      centerContent: (
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '15px',
            color: 'white',
          }}>
            {result.ticker}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.5)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {result.company}
          </div>
        </div>
      ),
      rightContent: (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: config.color,
          }}>
            {config.text}
          </span>
          <span style={{
            fontSize: '18px',
            fontWeight: 700,
            color: config.color,
          }}>
            {surpriseText}
          </span>
        </div>
      ),
      expandedContent: (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '12px',
        }}>
          Tap anywhere to view full report →
        </div>
      ),
      duration: 6000,
      glowColor: config.glow,
    });
  }, [show]);
}

// ============================================================================
// SHOWCASE
// ============================================================================

export function DynamicIslandShowcase() {
  const status = useIslandStatus();
  const progress = useIslandProgress();
  const earnings = useIslandEarnings();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
      <h3 style={{ color: '#fff', margin: 0 }}>Dynamic Island Showcase</h3>
      
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => status('Data refreshed', { variant: 'success' })}
          style={{
            padding: '8px 16px',
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Success Status
        </button>
        
        <button
          onClick={() => status('Connection lost', { variant: 'error' })}
          style={{
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Error Status
        </button>
        
        <button
          onClick={() => {
            const p = progress('Loading data...');
            setTimeout(() => p.update('Processing...'), 1500);
            setTimeout(() => p.complete('Done!'), 3000);
          }}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Progress Flow
        </button>
        
        <button
          onClick={() => earnings({
            ticker: 'AAPL',
            company: 'Apple Inc.',
            result: 'beat',
            surprise: 12.5,
          })}
          style={{
            padding: '8px 16px',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Earnings Beat
        </button>
        
        <button
          onClick={() => earnings({
            ticker: 'TSLA',
            company: 'Tesla Inc.',
            result: 'miss',
            surprise: -8.3,
          })}
          style={{
            padding: '8px 16px',
            background: '#ec4899',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Earnings Miss
        </button>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default DynamicIslandProvider;
