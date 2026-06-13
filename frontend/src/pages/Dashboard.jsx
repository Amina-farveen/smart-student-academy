import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  FileText,
  Bell,
  CalendarDays,
  PartyPopper,
  BookOpen,
  Clock,
  Hand
} from 'lucide-react';

import Layout from '../components/Layout';
import DashboardCard from '../components/DashboardCard';
import Loader from '../components/Loader';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: res } = await dashboardAPI.getData();
        setData(res.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <Layout pageTitle="Dashboard"><Loader /></Layout>;

  return (
    <Layout pageTitle="Dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2 className="welcome-greeting">
            {getGreeting()},{' '}
            <span className="welcome-name">
              {user?.name?.split(' ')[0]}
            </span>
            <Hand
              size={20}
              style={{
                display: 'inline-block',
                marginLeft: '6px',
                verticalAlign: 'middle'
              }}
            />
          </h2>
          <p className="welcome-sub">Here's your academic overview for today</p>
        </div>
        <div className="welcome-date-badge">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4 mb-4" style={{ marginBottom: '28px' }}>
        <DashboardCard
          title="Pending Tasks"
          value={data?.pendingTodos ?? 0}
          subtitle={data?.overdueTodos ? `${data.overdueTodos} overdue` : 'All on track'}
          icon={<CheckSquare size={22} />}
          color={data?.overdueTodos > 0 ? 'rose' : 'amber'}
        />
        <DashboardCard
          title="Upcoming Exams"
          value={data?.upcomingExams ?? 0}
          subtitle="Next 30 days"
          icon={<FileText size={22} />}
          color="cyan"
        />
        <DashboardCard
          title="Saved Notes"
          value={data?.totalNotes ?? 0}
          subtitle="PDF documents"
          icon={<BookOpen size={22} />}
          color="emerald"
        />
        <DashboardCard
          title="Notifications"
          value={data?.unreadNotifications ?? 0}
          subtitle="Unread alerts"
          icon={<Bell size={22} />}
          color="violet"
        />
      </div>

      {/* Day Order + Timetable */}
      <div className="dashboard-grid">
        <div className="dashboard-main">
          {/* Today's Status */}
          <div className="card today-card">
            <div className="today-header">
              <h3 className="section-title">Today's Schedule</h3>
              {data?.isHoliday ? (
                <span className="badge badge-rose">Holiday</span>
              ) : data?.todayDayOrder ? (
                <span className="badge badge-amber">Day Order {data.todayDayOrder}</span>
              ) : (
                <span className="badge badge-cyan">No Day Set</span>
              )}
            </div>

            {data?.isHoliday ? (
              <div className="holiday-notice">
                <span className="holiday-icon">
                  <PartyPopper size={28} />
                </span>
                <div>
                  <div className="holiday-title">Today is a Holiday</div>
                  {data?.holidayReason && <div className="holiday-reason">{data.holidayReason}</div>}
                </div>
              </div>
            ) : data?.todayDayOrder && data?.todayTimetable?.length > 0 ? (
              <div className="timetable-list">
                {data.todayTimetable.map((entry) => (
                  <div key={entry._id} className="timetable-row">
                    <div className="period-badge">P{entry.period}</div>
                    <div className="timetable-info">
                      <div className="timetable-subject">{entry.subject}</div>
                      <div className="timetable-meta">
                        {entry.faculty && <span>{entry.faculty}</span>}
                        {entry.roomNo && <span>Room {entry.roomNo}</span>}
                      </div>
                    </div>
                    <div className="timetable-time">
                      {entry.startTime} – {entry.endTime}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <div className="empty-state-icon">
                  <CalendarDays size={36} />
                </div>
                <h3>No classes today</h3>
                <p>Set a day order in Timetable settings to see your schedule</p>
              </div>
            )}

            {data?.todayClasses > 0 && (
              <div className="today-footer">
                <span className="today-total">{data.todayClasses} classes today</span>
              </div>
            )}
          </div>

          {/* Upcoming Exams */}
          <div className="card" style={{ marginTop: '20px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Upcoming Exams</h3>
            {data?.upcomingExamsList?.length > 0 ? (
              <div className="exam-list">
                {data.upcomingExamsList.map((exam) => {
                  const days = exam.daysRemaining;
                  return (
                    <div key={exam._id} className="exam-row">
                      <div className="exam-info">
                        <div className="exam-subject">{exam.subject}</div>
                        <div className="exam-type-tag">{exam.examType}</div>
                      </div>
                      <div className="exam-countdown">
                        <div className={`countdown-days ${days <= 3 ? 'countdown-urgent' : days <= 7 ? 'countdown-soon' : ''}`}>
                          {days === 0 ? 'TODAY' : days === 1 ? '1 day' : `${days} days`}
                        </div>
                        <div className="exam-date-str">
                          {new Date(exam.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-state-icon">
                  <Clock size={36} />
                </div>
                <h3>No upcoming exams</h3>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="dashboard-side">
          <div className="card notif-panel">
            <div className="notif-panel-header">
              <h3 className="section-title">Recent Alerts</h3>
              {data?.unreadNotifications > 0 && (
                <span className="badge badge-rose">{data.unreadNotifications} new</span>
              )}
            </div>
            {data?.latestNotifications?.length > 0 ? (
              <div className="notif-mini-list">
                {data.latestNotifications.map((n) => (
                  <div key={n._id} className={`notif-mini ${!n.readStatus ? 'notif-mini--unread' : ''}`}>
                    <div className="notif-mini-title">{n.title}</div>
                    <div className="notif-mini-msg">{n.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-state-icon">
                  <Bell size={36} />
                </div>
                <h3>No notifications</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
