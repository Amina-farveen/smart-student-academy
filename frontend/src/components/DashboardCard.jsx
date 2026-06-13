import React from 'react';
import './DashboardCard.css';

const DashboardCard = ({ title, value, subtitle, icon, color = 'amber', trend }) => {
  return (
    <div className={`dash-card dash-card--${color}`}>
      <div className="dash-card-header">
        <div className="dash-card-icon">{icon}</div>
        <div className={`dash-card-trend ${trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : ''}`}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
        </div>
      </div>
      <div className="dash-card-value">{value}</div>
      <div className="dash-card-title">{title}</div>
      {subtitle && <div className="dash-card-subtitle">{subtitle}</div>}
    </div>
  );
};

export default DashboardCard;
