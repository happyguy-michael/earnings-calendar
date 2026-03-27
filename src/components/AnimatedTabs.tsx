'use client';

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  /** Optional badge count to display */
  badge?: number;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  /** Unique ID for ARIA labeling (defaults to 'tabs') */
  ariaLabel?: string;
  /** Enable keyboard navigation (default: true) */
  enableKeyboardNav?: boolean;
  /** Show focus ring on keyboard navigation (default: true) */
  showFocusRing?: boolean;
}

/**
 * Accessible animated tabs component with:
 * - WAI-ARIA compliant tab pattern
 * - Arrow key navigation (left/right)
 * - Home/End key support
 * - Smooth sliding indicator animation
 * - Focus management
 */
export function AnimatedTabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = '',
  ariaLabel = 'Content tabs',
  enableKeyboardNav = true,
  showFocusRing = true,
}: AnimatedTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);

  const updateIndicator = useCallback(() => {
    const activeButton = tabRefs.current.get(activeTab);
    const container = containerRef.current;
    
    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
      
      // Enable transitions after first measurement
      if (!isInitialized) {
        requestAnimationFrame(() => setIsInitialized(true));
      }
    }
  }, [activeTab, isInitialized]);

  // Update indicator on mount and when active tab changes
  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  // Update on resize
  useEffect(() => {
    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateIndicator]);

  const setTabRef = useCallback((id: string) => (el: HTMLButtonElement | null) => {
    if (el) {
      tabRefs.current.set(id, el);
    } else {
      tabRefs.current.delete(id);
    }
  }, []);

  // Find current active index
  const activeIndex = tabs.findIndex(t => t.id === activeTab);

  // Focus a tab by index
  const focusTab = useCallback((index: number) => {
    const tab = tabs[index];
    if (tab) {
      const button = tabRefs.current.get(tab.id);
      button?.focus();
      setFocusedIndex(index);
    }
  }, [tabs]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (!enableKeyboardNav) return;
    
    const currentIndex = focusedIndex >= 0 ? focusedIndex : activeIndex;
    let newIndex = currentIndex;
    let handled = false;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        // Move to next tab (wrap around)
        newIndex = (currentIndex + 1) % tabs.length;
        handled = true;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        // Move to previous tab (wrap around)
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        handled = true;
        break;
      case 'Home':
        // Move to first tab
        newIndex = 0;
        handled = true;
        break;
      case 'End':
        // Move to last tab
        newIndex = tabs.length - 1;
        handled = true;
        break;
      case 'Enter':
      case ' ':
        // Activate focused tab
        if (focusedIndex >= 0 && focusedIndex !== activeIndex) {
          onTabChange(tabs[focusedIndex].id);
          handled = true;
        }
        break;
    }

    if (handled) {
      e.preventDefault();
      if (newIndex !== currentIndex) {
        focusTab(newIndex);
        setIsKeyboardFocused(true);
      }
    }
  }, [enableKeyboardNav, focusedIndex, activeIndex, tabs, focusTab, onTabChange]);

  // Handle tab focus
  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  // Handle blur - reset keyboard focus indicator
  const handleBlur = useCallback(() => {
    // Small delay to handle focus moving between tabs
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setFocusedIndex(-1);
        setIsKeyboardFocused(false);
      }
    }, 0);
  }, []);

  // Handle mouse interaction - disable keyboard focus styling
  const handleMouseDown = useCallback(() => {
    setIsKeyboardFocused(false);
  }, []);

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      className={`animated-tabs-container relative flex gap-1 ${className}`}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        const isFocused = focusedIndex === index && isKeyboardFocused;
        
        return (
          <button
            key={tab.id}
            ref={setTabRef(tab.id)}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => {
              onTabChange(tab.id);
              setIsKeyboardFocused(false);
            }}
            onFocus={() => handleFocus(index)}
            className={`tab-button relative px-5 py-4 text-sm font-medium transition-all duration-200 outline-none ${
              isActive 
                ? 'text-white' 
                : 'text-zinc-500 hover:text-zinc-300'
            } ${
              showFocusRing && isFocused
                ? 'ring-2 ring-blue-500/50 ring-offset-2 ring-offset-zinc-900 rounded-lg'
                : ''
            }`}
          >
            {tab.icon && <span className="mr-2" aria-hidden="true">{tab.icon}</span>}
            {tab.label}
            {/* Optional badge */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span 
                className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-blue-500/20 text-blue-400"
                aria-label={`${tab.badge} items`}
              >
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        );
      })}
      
      {/* Animated sliding indicator */}
      <div 
        className="animated-tab-indicator"
        aria-hidden="true"
        style={{
          transform: `translateX(${indicatorStyle.left}px)`,
          width: `${indicatorStyle.width}px`,
          transition: isInitialized 
            ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
            : 'none',
        }}
      />
      
      {/* Keyboard navigation hint (screen reader only) */}
      <span className="sr-only">
        Use arrow keys to navigate between tabs, Enter or Space to activate
      </span>
    </div>
  );
}

/**
 * Tab panel component for use with AnimatedTabs
 * Provides proper ARIA association with its tab
 */
interface TabPanelProps {
  tabId: string;
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ tabId, isActive, children, className = '' }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      hidden={!isActive}
      tabIndex={isActive ? 0 : -1}
      className={className}
    >
      {isActive && children}
    </div>
  );
}
