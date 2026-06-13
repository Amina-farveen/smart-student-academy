import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { timetableAPI, holidayAPI } from '../services/api';
import './Timetable.css';

const DAY_ORDERS = [1, 2, 3, 4, 5, 6];

const Timetable = () => {
  const [selectedDay, setSelectedDay]     = useState(1);
  const [timetable, setTimetable]         = useState([]);
  const [todayInfo, setTodayInfo]         = useState(null);
  const [weekPreview, setWeekPreview]     = useState([]);
  const [holidays, setHolidays]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [msg, setMsg]                     = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    fetchTimetableForDay(selectedDay);
  }, [selectedDay]);

  const fetchAll = async () => {
    try {
      const [todayRes, weekRes, holRes] = await Promise.all([
        timetableAPI.getDayOrderForDate(),
        timetableAPI.getWeekPreview(),
        holidayAPI.getAll()
      ]);

      setTodayInfo(todayRes.data.data);
      setWeekPreview(weekRes.data.data);
      setHolidays(holRes.data.data);

      // Auto-select today's day order tab if available
      if (todayRes.data.data?.dayOrder) {
        setSelectedDay(todayRes.data.data.dayOrder);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetableForDay = async (day) => {
    try {
      const { data } = await timetableAPI.getAll(day);
      setTimetable(data.data);
    } catch {}
  };

  const isToday = (holidayDate) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const hDate = new Date(holidayDate); hDate.setHours(0,0,0,0);
    return today.getTime() === hDate.getTime();
  };

  if (loading) return <Layout pageTitle="Timetable"><Loader /></Layout>;

  const hasConfig = todayInfo !== null && todayInfo?.reason !== 'no_config';

  return (
    <Layout pageTitle="Timetable">
      <div className="page-header">
        <h1 className="page-title">Timetable</h1>
        <p className="page-subtitle">
          Day orders are calculated automatically based on your semester start date
        </p>
      </div>

      {/* No config warning */}
      {!hasConfig && (
        <div className="alert alert-info" style={{ marginBottom: '24px' }}>
          ⚙ Semester not configured yet. Go to{' '}
          <a href="/timetable/manage" style={{ color: 'var(--amber-400)', fontWeight: 600 }}>
            Manage Classes
          </a>{' '}
          and set your semester start date to enable automatic day order calculation.
        </div>
      )}

      {/* Today's auto-calculated status */}
      {hasConfig && (
        <div className="today-status-bar">
          <div className="today-status-info">
            {todayInfo?.isHoliday ? (
              <>
                <span className="status-dot status-dot--holiday" />
                <span className="status-label">
                  Today is a <strong>Holiday</strong>
                  {todayInfo.holidayReason ? ` — ${todayInfo.holidayReason}` : ''}
                </span>
              </>
            ) : todayInfo?.reason === 'saturday' || todayInfo?.reason === 'sunday' ? (
              <>
                <span className="status-dot status-dot--inactive" />
                <span className="status-label">
                  Today is a <strong>Weekend</strong> — No classes
                </span>
              </>
            ) : todayInfo?.dayOrder ? (
              <>
                <span className="status-dot status-dot--active" />
                <span className="status-label">
                  Today is automatically <strong>Day Order {todayInfo.dayOrder}</strong>
                </span>
              </>
            ) : (
              <>
                <span className="status-dot status-dot--inactive" />
                <span className="status-label">Could not calculate today's day order</span>
              </>
            )}
          </div>
          <div className="auto-badge">⚡ Auto-calculated</div>
        </div>
      )}

      {msg && <div className="alert alert-success">{msg}</div>}

      {/* Week preview */}
      {hasConfig && weekPreview.length > 0 && (
        <div className="card week-preview-card">
          <h3 className="section-title" style={{ marginBottom: '16px' }}>
            7-Day Preview
          </h3>
          <div className="week-grid">
            {weekPreview.map((day, i) => (
              <div
                key={day.date}
                className={`week-day-card
                  ${i === 0 ? 'week-day-card--today' : ''}
                  ${day.isHoliday ? 'week-day-card--holiday' : ''}
                  ${!day.dayOrder && !day.isHoliday ? 'week-day-card--weekend' : ''}
                `}
              >
                <div className="wdc-name">{i === 0 ? 'Today' : day.dayName.slice(0,3)}</div>
                <div className="wdc-date">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                {day.isHoliday ? (
                  <div className="wdc-status wdc-status--holiday">Holiday</div>
                ) : day.dayOrder ? (
                  <div className="wdc-do">DO {day.dayOrder}</div>
                ) : (
                  <div className="wdc-status wdc-status--weekend">—</div>
                )}
                {day.dayOrder && (
                  <div className="wdc-count">{day.classCount} class{day.classCount !== 1 ? 'es' : ''}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Order Tabs */}
      <div className="day-tabs">
        {DAY_ORDERS.map(d => (
          <button
            key={d}
            className={`day-tab
              ${selectedDay === d ? 'day-tab--active' : ''}
              ${todayInfo?.dayOrder === d ? 'day-tab--today' : ''}
            `}
            onClick={() => setSelectedDay(d)}
          >
            <span className="day-tab-label">Day Order</span>
            <span className="day-tab-num">{d}</span>
            {todayInfo?.dayOrder === d && <span className="today-dot" />}
          </button>
        ))}
      </div>

      {/* Timetable for selected day */}
      <div className="card">
        <div className="tt-header">
          <h3 className="section-title">Day Order {selectedDay} Schedule</h3>
          <span className="badge badge-amber">
            {timetable.length} {timetable.length === 1 ? 'class' : 'classes'}
          </span>
        </div>

        {timetable.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Subject</th>
                  <th>Faculty</th>
                  <th>Room</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((entry) => (
                  <tr key={entry._id}>
                    <td><div className="period-chip">P{entry.period}</div></td>
                    <td className="subject-cell">{entry.subject}</td>
                    <td className="text-muted">{entry.faculty || '—'}</td>
                    <td className="text-muted">{entry.roomNo || '—'}</td>
                    <td>
                      <span className="time-chip">
                        {entry.startTime} – {entry.endTime}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">◫</div>
            <h3>No classes for Day Order {selectedDay}</h3>
            <p>Go to Manage Classes to add your timetable entries</p>
          </div>
        )}
      </div>

      {/* Holidays list */}
      {holidays.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 className="section-title" style={{ marginBottom: '16px' }}>
            Holidays — These days are automatically skipped
          </h3>
          <div className="holidays-grid">
            {holidays.map(h => (
              <div
                key={h._id}
                className={`holiday-chip ${isToday(h.holidayDate) ? 'holiday-chip--today' : ''}`}
              >
                <span className="holiday-chip-date">
                  {new Date(h.holidayDate).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </span>
                <span className="holiday-chip-reason">{h.reason}</span>
                {isToday(h.holidayDate) && (
                  <span className="badge badge-rose" style={{ marginLeft: 'auto' }}>Today</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Timetable;