import * as React from "react"

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('xs');
  
  React.useEffect(() => {
    const determineBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints['2xl']) return '2xl';
      if (width >= breakpoints.xl) return 'xl';
      if (width >= breakpoints.lg) return 'lg';
      if (width >= breakpoints.md) return 'md';
      if (width >= breakpoints.sm) return 'sm';
      return 'xs';
    };
    
    const updateBreakpoint = () => {
      setBreakpoint(determineBreakpoint());
    };
    
    window.addEventListener('resize', updateBreakpoint);
    updateBreakpoint();
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return {
    breakpoint,
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2Xl: breakpoint === '2xl',
    isSmDown: ['xs', 'sm'].includes(breakpoint),
    isMdDown: ['xs', 'sm', 'md'].includes(breakpoint),
    isLgDown: ['xs', 'sm', 'md', 'lg'].includes(breakpoint),
    isSmUp: ['sm', 'md', 'lg', 'xl', '2xl'].includes(breakpoint),
    isMdUp: ['md', 'lg', 'xl', '2xl'].includes(breakpoint),
    isLgUp: ['lg', 'xl', '2xl'].includes(breakpoint),
  };
}