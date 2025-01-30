'use client';

import React from 'react';
import Link from 'next/link';
import styles from './HomeNavbar.module.css';

function HomeNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center p-4">
      <nav className={styles.nav}>
        <Link href="/" className={styles.link}>
          Home
        </Link>
        <Link href="#about" className={styles.link}>
          About
        </Link>
        <Link href="/sign-in" className={styles.link}>
          Login
        </Link>
        <Link href="#contact" className={styles.link}>
          Contact
        </Link>
        <div className={styles.slidingDiv}></div>
      </nav>
    </header>
  );
}

export default HomeNavbar;