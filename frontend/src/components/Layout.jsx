import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children, pageTitle }) => {
  // sidebarOpen controls desktop collapsed/expanded state
  // mobileOpen controls mobile drawer open/closed state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect screen size on mount and on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
        setMobileOpen(false);
      } else {
        setSidebarOpen(true);
        setMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuToggle = () => {
    if (window.innerWidth <= 768) {
      // Mobile — toggle drawer
      setMobileOpen(prev => !prev);
    } else {
      // Desktop — toggle collapsed/expanded
      setSidebarOpen(prev => !prev);
    }
  };

  const handleMobileClose = () => setMobileOpen(false);

  return (
    <div className={`page-wrapper ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />
      <Navbar
        onMenuToggle={handleMenuToggle}
        pageTitle={pageTitle}
        sidebarOpen={sidebarOpen}
      />
      <main className={`main-content ${sidebarOpen ? 'main-content--expanded' : 'main-content--collapsed'}`}>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
