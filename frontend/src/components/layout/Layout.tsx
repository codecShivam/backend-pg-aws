import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
}

const Layout = ({ children, isLoggedIn, logout }: LayoutProps) => {
  const [mounted, setMounted] = useState(false);

  // After mounting, add animation class
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`app-layout ${mounted ? 'animate-fade-in' : ''}`}>
      <Navbar isLoggedIn={isLoggedIn} logout={logout} />
      <main className={`main-content ${mounted ? 'animate-slide-up' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout; 