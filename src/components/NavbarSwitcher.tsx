'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import DashboardNavbar from './DashboardNavbar';
import HomeNavbar from './HomeNavbar';

const NavbarSwitcher = () => {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');
  const isSignin = pathname.startsWith('/sign-in');

  const isHome = pathname === '/';

  if (isHome) {
    return <HomeNavbar />;
  }

  if (isSignin) {
    return <HomeNavbar />;
  }

  return isDashboard ? <DashboardNavbar /> : <Navbar />;
};

export default NavbarSwitcher;