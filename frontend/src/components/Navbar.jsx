import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import './Navbar.css';

const Navbar = ({ onMenuToggle, pageTitle, sidebarOpen }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await notificationAPI.getAll();
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUnread();

    const interval = setInterval(fetchUnread, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`navbar ${
        sidebarOpen ? 'navbar--expanded' : 'navbar--collapsed'
      }`}
    >
      <div className="navbar-left">

        <button
          className="menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <span className="menu-toggle-bar"></span>
          <span className="menu-toggle-bar"></span>
          <span className="menu-toggle-bar"></span>
        </button>

        <h1 className="navbar-title">{pageTitle}</h1>
      </div>

      <div className="navbar-right">
        <div className="navbar-date">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </div>

        <Link
          to="/notifications"
          className="notif-btn"
          aria-label="Notifications"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {unreadCount > 0 && (
            <span className="notif-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <Link to="/profile" className="nav-profile-btn">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Profile
        </Link>
      </div>
    </header>
  );
};

export default Navbar;