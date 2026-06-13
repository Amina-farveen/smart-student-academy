import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  CalendarX,
  NotebookPen,
  CheckSquare,
  FileText,
  Bell,
  User,
  LogOut
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    path: '/timetable',
    label: 'Timetable',
    icon: CalendarDays
  },
  {
    path: '/timetable/manage',
    label: 'Manage Classes',
    icon: GraduationCap
  },
  {
    path: '/timetable/holidays',
    label: 'Holidays',
    icon: CalendarX
  },
  {
    path: '/notes',
    label: 'Notes',
    icon: NotebookPen
  },
  {
    path: '/todo',
    label: 'Tasks & Assignments',
    icon: CheckSquare
  },
  {
    path: '/exams',
    label: 'Exam Schedule',
    icon: FileText
  },
  {
    path: '/notifications',
    label: 'Notifications',
    icon: Bell
  },
  {
    path: '/profile',
    label: 'My Profile',
    icon: User
  }
];

const Sidebar = ({
  sidebarOpen,
  mobileOpen,
  onMobileClose
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      onMobileClose();
    }
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${
          mobileOpen ? 'sidebar-overlay--visible' : ''
        }`}
        onClick={onMobileClose}
      />

      <aside
        className={`sidebar
          ${sidebarOpen ? 'sidebar--expanded' : 'sidebar--collapsed'}
          ${mobileOpen ? 'sidebar--mobile-open' : ''}
        `}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            <span>S</span>
          </div>

          <div
            className={`brand-text ${
              sidebarOpen ? '' : 'brand-text--hidden'
            }`}
          >
            <div className="brand-name">
              SmartAcademy
            </div>
            <div className="brand-tagline">
              Student Portal
            </div>
          </div>
        </div>

        {/* User */}
        <div className="sidebar-user">
          <div
            className="sidebar-avatar"
            title={user?.name}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div
            className={`sidebar-user-info ${
              sidebarOpen
                ? ''
                : 'sidebar-user-info--hidden'
            }`}
          >
            <div className="sidebar-user-name">
              {user?.name}
            </div>

            <div className="sidebar-user-email">
              {user?.email}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div
            className={`nav-section-label ${
              sidebarOpen
                ? ''
                : 'nav-section-label--hidden'
            }`}
          >
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${
                    isActive
                      ? 'nav-item--active'
                      : ''
                  } ${
                    !sidebarOpen
                      ? 'nav-item--icon-only'
                      : ''
                  }`
                }
                onClick={handleNavClick}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="nav-icon">
                  <Icon size={20} />
                </span>

                <span
                  className={`nav-label ${
                    sidebarOpen
                      ? ''
                      : 'nav-label--hidden'
                  }`}
                >
                  {item.label}
                </span>

                {!sidebarOpen && (
                  <span className="nav-tooltip">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button
            className={`logout-btn ${
              !sidebarOpen
                ? 'logout-btn--icon-only'
                : ''
            }`}
            onClick={handleLogout}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <span className="logout-icon">
              <LogOut size={20} />
            </span>

            <span
              className={`logout-label ${
                sidebarOpen
                  ? ''
                  : 'logout-label--hidden'
              }`}
            >
              Logout
            </span>

            {!sidebarOpen && (
              <span className="nav-tooltip">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;