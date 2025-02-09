'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';
import { Button } from './ui/button';
import styles from './DashboardNavbar.module.css';

function DashboardNavbar() {
  const { data: session } = useSession();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-[10px] bg-[rgba(14, 24, 47, 0)] ">
      <div className="w-full flex items-center">
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

        <div className="ml-auto">
          {session ? (
            <Button
              onClick={() => signOut()}
              className="bg-slate-100 text-black hover:bg-[#8793ac] hover:text-white"
              style={{ margin: '2px 40px 2px 0px' }}
              variant="outline"
            >
              Logout
            </Button>
          ) : (
            <Button
              onClick={() => signIn()}
              className="bg-slate-100 text-black hover:bg-[#8793ac] hover:text-white"
              style={{ margin: '2px 40px 2px 0px' }}
              variant="outline"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardNavbar;