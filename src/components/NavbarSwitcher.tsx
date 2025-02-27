'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import DashboardNavbar from './DashboardNavbar';
import HomeNavbar from './HomeNavbar';
import UserModel from '@/model/User';
import { verify } from 'crypto';

const NavbarSwitcher = () => {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');
  const isSignin = pathname.startsWith('/sign-in');
  const isSignup = pathname.startsWith('/sign-up');
  const isVerify = pathname.startsWith('/verify');
  const isOnProfile = pathname.startsWith('/profile');
  const IsSendMessage = pathname.startsWith('/u');
  const isQuestion = pathname.startsWith('/questions');


  
  const isHome = pathname === '/';

  if (isHome) {
    return <HomeNavbar />;
  }

  if (isSignin) {
    return <HomeNavbar />;
  }

  if (isSignup) {
    return <HomeNavbar />;
  }

  if (isVerify) {
    return null
  }

  if (isOnProfile) {
    return null;
  }

  if (IsSendMessage) {
    return null;
  }

  if(isQuestion){
    return null;
  }

  return isDashboard ? <DashboardNavbar /> : <Navbar />;
};

export default NavbarSwitcher;