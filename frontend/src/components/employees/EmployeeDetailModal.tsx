import React, { useState, useEffect } from 'react';
import './EmployeeDetailModal.css';

interface EmployeeDetailModalProps {
  employee: any;
  onClose: () => void;
  onEdit: (employeeId: number) => void;
  onViewReport?: (employeeId: number) => void;
}

// Mock data - will be replaced with API calls later
const getLeaveBalance = (employeeId: number) => {
  const mockData: Record<number, { totalPtoDays: number; usedPtoDays: number; balancePtoDays: number; loggedOtHours: number }> = {
    1: { totalPtoDays: 15, usedPtoDays: 4, balancePtoDays: 11, loggedOtHours: 12 },
    2: { totalPtoDays: 15, usedPtoDays: 8, balancePtoDays: 7, loggedOtHours: 6 },
    3: { totalPtoDays: 12, usedPtoDays: 3, balancePtoDays: 9, loggedOtHours: 18 },
    4: { totalPtoDays: 15, usedPtoDays: 5, balancePtoDays: 10, loggedOtHours: 24 },
    5: { totalPtoDays: 10, usedPtoDays: 2, balancePtoDays: 8, loggedOtHours: 8 },
  };
  return mockData[employeeId] || { totalPtoDays: 15, usedPtoDays: 0, balancePtoDays: 15, loggedOtHours: 0 };
};

const getPTORequests = (employeeId: number) => {
  const mockData: Record<number, Array<any>> = {
    1: [
      { id: 1, type: 'Annual Leave', startDate: '2024-01-15', endDate: '2024-01-17', days: 3, status: 'Approved' },
      { id: 2, type: 'Sick Leave', startDate: '2024-03-05', endDate: '2024-03-05', days: 1, status: 'Approved' },
      { id: 3, type: 'Personal Leave', startDate: '2024-06-20', endDate: '2024-06-21', days: 2, status: 'Pending' },
    ],
    2: [
      { id: 4, type: 'Annual Leave', startDate: '2024-02-10', endDate: '2024-02-14', days: 5, status: 'Approved' },
      { id: 5, type: 'Annual Leave', startDate: '2024-04-01', endDate: '2024-04-03', days: 3, status: 'Approved' },
    ],
  };
  return mockData[employeeId] || [];
};

const getOTRequests = (employeeId: number) => {
  const mockData: Record<number, Array<any>> = {
    1: [
      { id: 1, date: '2024-01-10', hours: 3, reason: 'Urgent deployment', status: 'Approved' },
      { id: 2, date: '2024-02-15', hours: 2, reason: 'Production fix', status: 'Approved' },
      { id: 3, date: '2024-03-20', hours: 4, reason: 'Weekend monitoring', status: 'Approved' },
      { id: 4, date: '2024-04-05', hours: 3, reason: 'Release support', status: 'Pending' },
    ],
    3: [
      { id: 5, date: '2024-01-20', hours: 4, reason: 'Design sprint', status: 'Approved' },
      { id: 6, date: '2024-02-28', hours: 3, reason: 'Prototype review', status: 'Approved' },
      { id: 7, date: '2024-03-15', hours: 5, reason: 'Client deadline', status: 'Approved' },
      { id: 8, date: '2024-04-10', hours: 6, reason: 'Workshop prep', status: 'Pending' },
    ],
  };
  return mockData[employeeId] || [];
};

const statusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved': return 'status-approved';
    case 'pending': return 'status-pending';
    case 'rejected': return 'status-rejected';
    default: return '';
  }
};

const LeaveBalance: React.FC<{ balance: any }> = ({ balance }) => (
  <div className="detail-section">
    <h3 className="section-title">Leave & OT Balance</h3>
    <div className="balance-grid">
      <div className="balance-item">
        <span className="balance-label">Total PTO Days</span>
        <span className="balance-value">{balance.totalPtoDays}</span>
      </div>
      <div className="balance-item">
        <span className="balance-label">Used PTO Days</span>
        <span className="balance-value">{balance.usedPtoDays}</span>
      </div>
      <div className="balance-item">
        <span className="balance-label">Balance PTO Days</span>
        <span className="balance-value balance-highlight">{balance.balancePtoDays}</span>
      </div>
      <div className="balance-item">
        <span className="balance-label">Logged OT Hours</span>
        <span className="balance-value">{balance.loggedOtHours}h</span>
      </div>
    </div>
  </div>
);

const RequestTable: React.FC<{ requests: Array<any>; columns: Array<{ key: string; label: string }> }> = ({ requests, columns }) => (
  <div className="detail-section">
    {requests.length > 0 ? (
      <table className="detail-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.key === 'status' ? (
                    <span className={`status-badge ${statusClass(req.status)}`}>{req.status}</span>
                  ) : (
                    req[col.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="empty-requests">No requests found</p>
    )}
  </div>
);

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  onClose,
  onEdit,
  onViewReport
}) => {
  const [balance, setBalance] = useState<any>({});
  const [ptoRequests, setPTORequests] = useState<Array<any>>([]);
  const [otRequests, setOTRequests] = useState<Array<any>>([]);
  const [directReports, setDirectReports] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee) {
      // Simulate API call delay
      setLoading(true);
      setTimeout(() => {
        setBalance(getLeaveBalance(employee.id));
        setPTORequests(getPTORequests(employee.id));
        setOTRequests(getOTRequests(employee.id));
        setDirectReports(employee.directReports || []);
        setLoading(false);
      }, 300);
    }
  }, [employee]);

  if (!employee) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {employee.first_name} {employee.last_name}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{employee.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">
                  {employee.phone_number || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="section-title">Employment Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Position:</span>
                <span className="detail-value">{employee.job_title}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Department:</span>
                <span className="detail-value">
                  {employee.department ? employee.department.name : 'Not assigned'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Hire Date:</span>
                <span className="detail-value">
                  {new Date(employee.hire_date).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Salary:</span>
                <span className="detail-value">
                  {employee.salary ? `$${employee.salary.toLocaleString()}` : 'Not specified'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Manager:</span>
                <span className="detail-value">
                  {employee.manager_name || 'None (Manager/Lead)'}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-divider" />

        {loading ? (
          <div className="loading-records">
            <div className="mini-spinner" />
            Loading employee records...
          </div>
        ) : (
          <>
            <div className="detail-section">
              <h3 className="section-title">
                Managed Employees ({directReports.length})
              </h3>
              {directReports.length > 0 ? (
                <table className="direct-reports-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Department</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {directReports.map((rpt: any) => (
                      <tr key={rpt.id} className="direct-report-row">
                        <td>
                          <span
                            className="report-name-link"
                            onClick={() => onViewReport?.(rpt.id)}
                          >
                            {rpt.first_name} {rpt.last_name}
                          </span>
                        </td>
                        <td>{rpt.job_title || '-'}</td>
                        <td>
                          {rpt.department
                            ? rpt.department.name
                            : rpt.department_name
                            || 'N/A'}
                        </td>
                        <td>
                          <button
                            className="table-action-btn btn-view-action"
                            title="View Details"
                            onClick={() => onViewReport?.(rpt.id)}
                          >
                            👁️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-requests">No direct reports</p>
              )}
            </div>

            <LeaveBalance balance={balance} />

              <div className="detail-subsection">
                <h4 className="subsection-title">PTO Requests</h4>
                <RequestTable
                  requests={ptoRequests}
                  columns={[
                    { key: 'type', label: 'Type' },
                    { key: 'startDate', label: 'Start Date' },
                    { key: 'endDate', label: 'End Date' },
                    { key: 'days', label: 'Days' },
                    { key: 'status', label: 'Status' },
                  ]}
                />
              </div>

              <div className="detail-subsection">
                <h4 className="subsection-title">OT Requests</h4>
                <RequestTable
                  requests={otRequests}
                  columns={[
                    { key: 'date', label: 'Date' },
                    { key: 'hours', label: 'Hours' },
                    { key: 'reason', label: 'Reason' },
                    { key: 'status', label: 'Status' },
                  ]}
                />
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="btn-primary"
            onClick={() => onEdit(employee.id)}
          >
            Edit Employee
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;