import React from 'react';
import './NotificationCard.css';

const typeConfig = {
  exam: { icon: '◷', color: 'cyan', label: 'Exam' },
  todo: { icon: '◻', color: 'amber', label: 'Task' },
  assignment: { icon: '✦', color: 'violet', label: 'Assignment' },
  timetable: { icon: '◫', color: 'emerald', label: 'Timetable' },
  holiday: { icon: '◈', color: 'rose', label: 'Holiday' },
  general: { icon: '◌', color: 'amber', label: 'General' }
};

const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
  const config = typeConfig[notification.type] || typeConfig.general;

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`notif-card ${!notification.readStatus ? 'notif-card--unread' : ''}`}>
      <div className={`notif-type-icon notif-type--${config.color}`}>{config.icon}</div>
      <div className="notif-body">
        <div className="notif-title-row">
          <span className="notif-title">{notification.title}</span>
          <span className={`badge badge-${config.color}`}>{config.label}</span>
        </div>
        <p className="notif-message">{notification.message}</p>
        <span className="notif-time">{timeAgo(notification.createdAt)}</span>
      </div>
      <div className="notif-actions">
        {!notification.readStatus && (
          <button className="btn-icon notif-action-btn" onClick={() => onMarkRead(notification._id)} title="Mark as read">
            ✓
          </button>
        )}
        <button className="btn-icon notif-action-btn notif-delete-btn" onClick={() => onDelete(notification._id)} title="Delete">
          ✕
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;
