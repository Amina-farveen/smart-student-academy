import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import NotificationCard from '../components/NotificationCard';
import { notificationAPI } from '../services/api';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [clearing, setClearing] = useState(false);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll();
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch {}
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, readStatus: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleDelete = async (id) => {
    const wasUnread = notifications.find(n => n._id === id)?.readStatus === false;
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await notificationAPI.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
    finally { setClearing(false); }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.readStatus;
    if (filter !== 'all') return n.type === filter;
    return true;
  });

  const typeCount = (type) => notifications.filter(n => n.type === type).length;

  if (loading) return <Layout pageTitle="Notifications"><Loader /></Layout>;

  return (
    <Layout pageTitle="Notifications">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={handleMarkAllRead}>Mark All Read</button>
          )}
          {notifications.length > 0 && (
            <button className="btn btn-danger" onClick={handleClearAll} disabled={clearing}>
              {clearing ? 'Clearing...' : 'Clear All'}
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="notif-filters">
        <button className={`filter-chip ${filter === 'all' ? 'filter-chip--active' : ''}`} onClick={() => setFilter('all')}>
          All <span className="filter-count">{notifications.length}</span>
        </button>
        <button className={`filter-chip ${filter === 'unread' ? 'filter-chip--active' : ''}`} onClick={() => setFilter('unread')}>
          Unread <span className="filter-count">{unreadCount}</span>
        </button>
        {['exam', 'assignment', 'timetable', 'holiday', 'todo'].map(type => (
          typeCount(type) > 0 && (
            <button key={type} className={`filter-chip ${filter === type ? 'filter-chip--active' : ''}`} onClick={() => setFilter(type)}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
              <span className="filter-count">{typeCount(type)}</span>
            </button>
          )
        ))}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">◌</div>
            <h3>No notifications</h3>
            <p>{filter !== 'all' ? `No ${filter} notifications` : 'You\'ll see academic alerts here as you use the app'}</p>
          </div>
        </div>
      ) : (
        <div className="notif-page-list">
          {filtered.map(n => (
            <NotificationCard
              key={n._id}
              notification={n}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Notifications;
