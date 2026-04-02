import React, { useState } from 'react';
import { format } from 'date-fns';
import type { PTORequest, OTRequest } from '../../types/employee';
import './EmployeesRequests.css';

type ViewToggle = 'PTO' | 'OT';

interface EmployeesRequestsProps {
  ptoRequests: PTORequest[];
  otRequests: OTRequest[];
  onUpdatePTOStatus: (requestId: string, status: 'Approved' | 'Rejected') => void;
  onUpdateOTStatus: (requestId: string, status: 'Approved' | 'Rejected') => void;
}

const statusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved': return 'status-approved';
    case 'pending': return 'status-pending';
    case 'rejected': return 'status-rejected';
    default: return '';
  }
};

const EmployeesRequests: React.FC<EmployeesRequestsProps> = ({
  ptoRequests,
  otRequests,
  onUpdatePTOStatus,
  onUpdateOTStatus,
}) => {
  const [activeView, setActiveView] = useState<ViewToggle>('PTO');

  return (
    <div className="employees-requests">
      <div className="view-toggle">
        <button className={activeView === 'PTO' ? 'active' : ''} onClick={() => setActiveView('PTO')}>PTO</button>
        <button className={activeView === 'OT' ? 'active' : ''} onClick={() => setActiveView('OT')}>OT</button>
      </div>

      {activeView === 'PTO' ? (
        <div className="request-list">
          <div className="list-header">
            <h3>My Team's PTO Requests</h3>
          </div>
          {ptoRequests.length > 0 ? (
            <div className="table-scroll">
              <table className="request-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ptoRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="emp-name">{req.employeeName || 'N/A'}</td>
                      <td>{req.type}</td>
                      <td>{format(new Date(req.startDate), 'MMM d, yyyy')}</td>
                      <td>{format(new Date(req.endDate), 'MMM d, yyyy')}</td>
                      <td>{req.days}</td>
                      <td className="reason-col">{req.reason}</td>
                      <td><span className={`status-badge ${statusClass(req.status)}`}>{req.status}</span></td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="act-btn approve-btn"
                            title="Approve"
                            onClick={() => onUpdatePTOStatus(req.id, 'Approved')}
                            disabled={req.status !== 'Pending'}
                          >
                            ✓
                          </button>
                          <button
                            className="act-btn reject-btn"
                            title="Reject"
                            onClick={() => onUpdatePTOStatus(req.id, 'Rejected')}
                            disabled={req.status !== 'Pending'}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-msg">No pending requests</p>
          )}
        </div>
      ) : (
        <div className="request-list">
          <div className="list-header">
            <h3>My Team's OT Requests</h3>
          </div>
          {otRequests.length > 0 ? (
            <div className="table-scroll">
              <table className="request-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Hours</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {otRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="emp-name">{req.employeeName || 'N/A'}</td>
                      <td>{format(new Date(req.date), 'MMM d, yyyy')}</td>
                      <td>{req.hours}h</td>
                      <td className="reason-col">{req.reason}</td>
                      <td><span className={`status-badge ${statusClass(req.status)}`}>{req.status}</span></td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="act-btn approve-btn"
                            title="Approve"
                            onClick={() => onUpdateOTStatus(req.id, 'Approved')}
                            disabled={req.status !== 'Pending'}
                          >
                            ✓
                          </button>
                          <button
                            className="act-btn reject-btn"
                            title="Reject"
                            onClick={() => onUpdateOTStatus(req.id, 'Rejected')}
                            disabled={req.status !== 'Pending'}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-msg">No pending requests</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeesRequests;
