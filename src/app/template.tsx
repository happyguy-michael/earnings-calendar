'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<'idle' | 'exit' | 'enter'>('idle');
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // If pathname changed, trigger exit animation
    if (previousPathname.current !== pathname) {
      setTransitionStage('exit');
      
      // After exit animation, swap content and trigger enter
      const exitTimer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage('enter');
        previousPathname.current = pathname;
        
        // Reset to idle after enter animation
        const enterTimer = setTimeout(() => {
          setTransitionStage('idle');
        }, 300);
        
        return () => clearTimeout(enterTimer);
      }, 150);
      
      return () => clearTimeout(exitTimer);
    } else {
      // Initial render or same pathname
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <div 
      className={`page-transition ${
        transitionStage === 'exit' ? 'page-exit' : 
        transitionStage === 'enter' ? 'page-enter' : ''
      }`}
    >
      {displayChildren}
    </div>
  );
}
