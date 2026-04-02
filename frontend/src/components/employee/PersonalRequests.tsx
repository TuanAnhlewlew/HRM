import React, { useState } from 'react';
import { format } from 'date-fns';
import type { PTORequest, OTRequest } from '../../types/employee';
import './PersonalRequests.css';

type ViewToggle = 'PTO' | 'OT';

interface PersonalRequestsProps {
  ptoRequests: PTORequest[];
  otRequests: OTRequest[];
  onOpenPTOForm: () => void;
  onOpenOTForm: () => void;
}

const statusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved': return 'status-approved';
    case 'pending': return 'status-pending';
    case 'rejected': return 'status-rejected';
    default: return '';
  }
};

const PersonalRequests: React.FC<PersonalRequestsProps> = ({
  ptoRequests,
  otRequests,
  onOpenPTOForm,
  onOpenOTForm,
}) => {
  const [activeView, setActiveView] = useState<ViewToggle>('PTO');

  return (
    <div className="personal-requests">
      <div className="view-toggle">
        <button className={activeView === 'PTO' ? 'active' : ''} onClick={() => setActiveView('PTO')}>PTO</button>
        <button className={activeView === 'OT' ? 'active' : ''} onClick={() => setActiveView('OT')}>OT</button>
      </div>

      {activeView === 'PTO' ? (
        <div className="request-list">
          <div className="list-header">
            <h3>My PTO Requests</h3>
            <button className="btn-primary" onClick={onOpenPTOForm}>New PTO Request</button>
          </div>
          {ptoRequests.length > 0 ? (
            <div className="table-scroll">
              <table className="request-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ptoRequests.map((req) => (
                    <tr key={req.id}>
                      <td>{req.type}</td>
                      <td>{format(new Date(req.startDate), 'MMM d, yyyy')}</td>
                      <td>{format(new Date(req.endDate), 'MMM d, yyyy')}</td>
                      <td>{req.days}</td>
                      <td className="reason-col">{req.reason}</td>
                      <td><span className={`status-badge ${statusClass(req.status)}`}>{req.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-msg">No PTO requests found</p>
          )}
        </div>
      ) : (
        <div className="request-list">
          <div className="list-header">
            <h3>My OT Requests</h3>
            <button className="btn-primary" onClick={onOpenOTForm}>New OT Request</button>
          </div>
          {otRequests.length > 0 ? (
            <div className="table-scroll">
              <table className="request-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Hours</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {otRequests.map((req) => (
                    <tr key={req.id}>
                      <td>{format(new Date(req.date), 'MMM d, yyyy')}</td>
                      <td>{req.hours}h</td>
                      <td className="reason-col">{req.reason}</td>
                      <td><span className={`status-badge ${statusClass(req.status)}`}>{req.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-msg">No OT requests found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalRequests;
