'use client'
import React from 'react';
import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import styles from './DashboardNavbar.module.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, MessageSquare } from 'lucide-react';

function DashboardNavbar() {
  const { data: session } = useSession();
  const router = useRouter();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-transparent backdrop-blur-sm">
      <div className="w-full flex items-center">
        <nav className={styles.nav}>
          <Link href="/" className={styles.link}>
            Home
          </Link>
          <Link href="#about" className={styles.link}>
            About
          </Link>
          <Link href="#contact" className={styles.link}>
            Contact
          </Link>
          <div className={styles.slidingDiv}></div>
        </nav>
        <div className="ml-auto">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-2 transition-colors hover:text-white"
                style={{ margin: '0 20px' }}
                variant="outline"
                >
                {session.user?.username || 'Account'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-md shadow-lg mt-2 p-1 animate-in fade-in-80 slide-in-from-top-5">
                <DropdownMenuItem 
                  className="text-slate-200 hover:bg-slate-700/50 hover:text-white focus:bg-slate-700/50 focus:text-white cursor-pointer rounded-sm px-2 py-1.5 my-0.5 transition-colors duration-150"
                  onClick={() => router.push('/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-600/50 my-1" />
                <DropdownMenuItem
                  className="text-red-400 hover:bg-red-900/20 hover:text-red-300 focus:bg-red-900/20 focus:text-red-300 cursor-pointer rounded-sm px-2 py-1.5 my-0.5 transition-colors duration-150"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => signIn()}
              className="bg-white/15 text-white hover:bg-white/25 transition-colors duration-200 font-medium px-4 py-2 rounded-md"
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