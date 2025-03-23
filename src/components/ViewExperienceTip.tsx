'use client';

import { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';

export default function ViewExperienceTip() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes colorCycleGlow {
        0% { box-shadow: 0 0 12px rgba(99, 102, 241, 0.8); border-color: rgba(99, 102, 241, 0.8); }
        25% { box-shadow: 0 0 12px rgba(139, 92, 246, 0.8); border-color: rgba(139, 92, 246, 0.8); }
        50% { box-shadow: 0 0 12px rgba(236, 72, 153, 0.8); border-color: rgba(236, 72, 153, 0.8); }
        75% { box-shadow: 0 0 12px rgba(59, 130, 246, 0.8); border-color: rgba(59, 130, 246, 0.8); }
        100% { box-shadow: 0 0 12px rgba(99, 102, 241, 0.8); border-color: rgba(99, 102, 241, 0.8); }
      }
    `;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const checkViewportSize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setIsLargeScreen(isDesktop);
      if (isDesktop) {
        setTimeout(() => setIsVisible(true), 2500);
      } else {
        setIsVisible(false);
      }
    };

    checkViewportSize();
    window.addEventListener('resize', checkViewportSize);
    return () => window.removeEventListener('resize', checkViewportSize);
  }, []);
  
  if (!isVisible || !isLargeScreen) return null;
  
  return (
    <div 
      className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 backdrop-blur-sm border rounded-lg shadow-lg px-4 py-3 text-sm text-zinc-200 flex items-center gap-3 max-w-md"
      style={{
        animation: 'colorCycleGlow 6s infinite linear',
        borderWidth: '1px',
      }}
    >
        <Zap className="h-4 w-4 text-indigo-400 flex-shrink-0" />
        <p>
            <span className="font-medium text-indigo-400">Pro tip:</span> For optimal viewing, use{' '}
            <kbd className="px-2 py-0.5 rounded bg-zinc-700 text-zinc-300 text-xs">Ctrl -</kbd> or{' '}
            <kbd className="px-2 py-0.5 rounded bg-zinc-700 text-zinc-300 text-xs">⌘ -</kbd> to adjust the zoom level
        </p>
        <button 
            onClick={() => setIsVisible(false)} 
            className="text-zinc-500 hover:text-zinc-300"
            aria-label="Close tip"
        >
            <X className="h-4 w-4" />
        </button>
    </div>
  );
}