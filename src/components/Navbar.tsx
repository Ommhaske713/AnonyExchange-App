'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';
import { Button } from './ui/button';
import styles from './Navbar.module.css';

function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="flex justify-between items-center p-[10px] bg-[#212838]">
      <div className="w-full flex items-center">
        {/* Navigation Links */}
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

        {/* Login/Logout Button */}
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

export default Navbar;
