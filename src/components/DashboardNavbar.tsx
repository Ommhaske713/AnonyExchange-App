'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User, LogOut, Settings, Bell, Volume2, VolumeX, MessageCircle, Menu, X } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

function DashboardNavbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const { soundEnabled, toggleSound, unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-3 sm:px-4">
        {/* Logo & Branding */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-md flex items-center justify-center transform rotate-6">
            <MessageCircle className="w-4 h-4 text-white transform -rotate-6" />
          </div>
          <span className="font-bold text-lg text-white">
            Anony<span className="text-indigo-400">Exchange</span>
          </span>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md text-slate-400 hover:bg-slate-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4" style={{margin:" 1px -108px -6px 0px"}}>
          {/* Sound Toggle */}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white hover:bg-slate-800"
                  onClick={toggleSound}
                >
                  {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800 text-slate-200 border-slate-700">
                {soundEnabled ? "Mute notification sounds" : "Enable notification sounds"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Account */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-slate-300 text-white rounded-xl flex items-center gap-2"
                  variant="outline"
                >
                  <span className="max-w-[100px] truncate">{session.user?.username || 'Account'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800/90 backdrop-blur-lg border border-slate-700 rounded-md">
                <div className="px-2 py-1.5 text-sm font-medium text-slate-300">
                  My Account
                </div>
                <DropdownMenuSeparator className="bg-slate-600/50" />
                
                <DropdownMenuItem
                  className="text-slate-200 hover:bg-slate-700/50"
                  onClick={() => router.push('/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-slate-200 hover:bg-slate-700/50"
                  onClick={() => router.push('/settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-600/50" />
                <DropdownMenuItem
                  className="text-red-400 hover:bg-red-900/20 "
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => router.push('/sign-in')}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Login
            </Button>
          )}
        </div>
      </div>

      {/* Mobile menu - Fixed position instead of pushing content */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800">
          <div className="px-3 py-3 space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-200 hover:bg-slate-800"
              onClick={() => {
                router.push('/dashboard');
                setMobileMenuOpen(false);
              }}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-200 hover:bg-slate-800"
              onClick={() => {
                router.push('/profile');
                setMobileMenuOpen(false);
              }}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-200 hover:bg-slate-800"
              onClick={() => {
                router.push('/settings');
                setMobileMenuOpen(false);
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Button>
            <div className="flex items-center justify-between px-2 py-2">
              <span className="text-slate-400 text-sm">Notification sounds</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
                onClick={toggleSound}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </Button>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-400 hover:bg-red-900/20"
              onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export default DashboardNavbar;