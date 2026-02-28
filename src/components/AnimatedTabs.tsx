'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function AnimatedTabs({ tabs, activeTab, onTabChange, className = '' }: AnimatedTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

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

  return (
    <nav ref={containerRef} className={`relative flex gap-1 ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          ref={setTabRef(tab.id)}
          onClick={() => onTabChange(tab.id)}
          className={`tab-button px-5 py-4 text-sm font-medium transition-colors duration-200 ${
            activeTab === tab.id 
              ? 'text-white' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
      
      {/* Animated sliding indicator */}
      <div 
        className="animated-tab-indicator"
        style={{
          transform: `translateX(${indicatorStyle.left}px)`,
          width: `${indicatorStyle.width}px`,
          transition: isInitialized ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
    </nav>
  );
}
