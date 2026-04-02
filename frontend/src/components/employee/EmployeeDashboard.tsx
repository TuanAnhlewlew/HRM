import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  addMonths,
  subMonths,
} from 'date-fns';
import type { PTOBalance, PTORequest, OTRequest } from '../../types/employee';
import './EmployeeDashboard.css';

interface DayDetailPopupContent {
  ptoRequests: PTORequest[];
  otRequests: OTRequest[];
}

interface EmployeeDashboardProps {
  ptoBalance: PTOBalance;
  otHours: number;
  ptoRequests: PTORequest[];
  otRequests: OTRequest[];
  onOpenPTORequest: () => void;
  onOpenOTRequest: () => void;
}

const statusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved': return 'status-approved';
    case 'pending': return 'status-pending';
    case 'rejected': return 'status-rejected';
    default: return '';
  }
};

const DayDetailPopup: React.FC<{
  date: string;
  content: DayDetailPopupContent;
  onClose: () => void;
}> = ({ date, content, onClose }) => (
  <div className="day-popup-backdrop" onClick={onClose}>
    <div className="day-popup-content" onClick={(e) => e.stopPropagation()}>
      <div className="popup-header">
        <h4>{date}</h4>
        <button className="popup-close" onClick={onClose}>✕</button>
      </div>
      <div className="popup-body">
        {content.ptoRequests.length > 0 && (
          <div className="popup-section">
            <h5>PTO Requests</h5>
            {content.ptoRequests.map((req) => (
              <div key={req.id} className="popup-detail-row">
                <span className="popup-label">Type:</span>
                <span>{req.type}</span>
                <span className="popup-label">Period:</span>
                <span>{req.startDate} — {req.endDate} ({req.days}d)</span>
                <span className="popup-label">Reason:</span>
                <span>{req.reason}</span>
                <span className="popup-label">Status:</span>
                <span className={`status-badge ${statusClass(req.status)}`}>{req.status}</span>
              </div>
            ))}
          </div>
        )}
        {content.otRequests.length > 0 && (
          <div className="popup-section">
            <h5>OT Requests</h5>
            {content.otRequests.map((req) => (
              <div key={req.id} className="popup-detail-row">
                <span className="popup-label">Hours:</span>
                <span>{req.hours}h</span>
                <span className="popup-label">Reason:</span>
                <span>{req.reason}</span>
                <span className="popup-label">Status:</span>
                <span className={`status-badge ${statusClass(req.status)}`}>{req.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  ptoBalance,
  otHours,
  ptoRequests,
  otRequests,
  onOpenPTORequest,
  onOpenOTRequest,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [popup, setPopup] = useState<{ date: string; content: DayDetailPopupContent } | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getPTOForDay = (day: Date) =>
    ptoRequests.filter((req) => {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      return isWithinInterval(day, { start, end });
    });

  const getOTForDay = (day: Date) =>
    otRequests.filter((req) => isSameDay(new Date(req.date), day));

  const handleDayClick = (day: Date) => {
    const pto = getPTOForDay(day);
    const ot = getOTForDay(day);
    if (pto.length > 0 || ot.length > 0) {
      setPopup({
        date: format(day, 'EEEE, MMMM d, yyyy'),
        content: { ptoRequests: pto, otRequests: ot },
      });
    }
  };

  return (
    <div className="employee-dashboard">
      {/* Summary Tiles */}
      <div className="summary-grid">
        <div className="summary-tile">
          <span className="tile-label">Total Annual PTO</span>
          <span className="tile-number">{ptoBalance.totalAnnual}</span>
        </div>
        <div className="summary-tile">
          <span className="tile-label">Remaining PTO</span>
          <span className="tile-number highlight">{ptoBalance.remaining}</span>
        </div>
        <div className="summary-tile">
          <span className="tile-label">Taken PTO</span>
          <span className="tile-number">{ptoBalance.taken}</span>
        </div>
        <div className="summary-tile">
          <span className="tile-label">OT Hours</span>
          <span className="tile-number">{otHours}h</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="dashboard-actions">
        <button className="action-btn pto-btn" onClick={onOpenPTORequest}>
          📋 Submit PTO Request
        </button>
        <button className="action-btn ot-btn" onClick={onOpenOTRequest}>
          ⏱️ Submit OT Request
        </button>
      </div>

      {/* Calendar */}
      <div className="calendar-container">
        <div className="calendar-header">
          <button className="cal-nav-btn" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
            ◀
          </button>
          <h3 className="cal-month-label">{format(currentMonth, 'MMMM yyyy')}</h3>
          <button className="cal-nav-btn" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
            ▶
          </button>
        </div>
        <div className="calendar-body">
          {/* Weekday headers */}
          <div className="cal-weekday-row">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="cal-weekday">{d}</div>
            ))}
          </div>
          {/* Day grid */}
          <div className="cal-grid">
            {allDays.map((day, i) => {
              const isCurrentMonth = isSameMonth(day, monthStart);
              const pto = getPTOForDay(day);
              const ot = getOTForDay(day);
              const hasPTO = pto.length > 0;
              const hasOT = ot.length > 0;
              const isClickable = hasPTO || hasOT;
              return (
                <div
                  key={i}
                  className={`cal-cell${!isCurrentMonth ? ' other-month' : ''}${isClickable ? ' clickable' : ''}`}
                  onClick={() => isClickable && handleDayClick(day)}
                >
                  <span className="cal-day-number">{format(day, 'd')}</span>
                  {(hasPTO || hasOT) && (
                    <div className="day-dots">
                      {hasPTO && <span className="cal-dot pto-dot" title="PTO" />}
                      {hasOT && <span className="cal-dot ot-dot" title="OT" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="cal-legend">
          <span className="legend-item"><span className="cal-dot pto-dot" />PTO</span>
          <span className="legend-item"><span className="cal-dot ot-dot" />OT</span>
        </div>
      </div>

      {/* Day detail popup */}
      {popup && (
        <DayDetailPopup
          date={popup.date}
          content={popup.content}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;
