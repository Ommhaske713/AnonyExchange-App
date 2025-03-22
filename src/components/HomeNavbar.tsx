'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './HomeNavbar.module.css';
import { usePathname } from 'next/navigation';

function HomeNavbar() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); 
    };

    checkIfMobile();

    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  if (isMobile) return null;
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center p-4">
      <nav className={styles.nav}>
        <Link href="/" className={styles.link}>
          Home
        </Link>
        <Link href="#about" className={styles.link}>
          About
        </Link>
        
        {pathname === '/sign-in' ? (
          <Link href="/sign-up" className={styles.link}>
            Sign Up
          </Link>
        ) : pathname === '/sign-up' ? (
          <Link href="/sign-in" className={styles.link}>
            Sign In
          </Link>
        ) : (
          <Link href="/sign-in" className={styles.link}>
            Login
          </Link>
        )}
        
        <Link href="#contact" className={styles.link}>
          Contact
        </Link>
        <div className={styles.slidingDiv}></div>
      </nav>
    </header>
  );
}

export default HomeNavbar;