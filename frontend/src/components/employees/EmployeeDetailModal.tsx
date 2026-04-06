import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import './EmployeeDetailModal.css';

interface EmployeeDetailModalProps {
  employee: any;
  onClose: () => void;
  onEdit: (employeeId: string) => void;
  onViewReport?: (employeeId: string) => void;
}

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
      setLoading(true);
      Promise.all([
        api(`/employees/${employee.id}`),
        api(`/pto-requests`),
        api(`/ot-requests`),
      ]).then(([detail, ptoReqs, otReqs]) => {
        setBalance({
          totalPtoDays: 12,
          usedPtoDays: ptoReqs.filter((r: any) => r.employee_id === employee.id && r.status === 'Approved').reduce((s: number, r: any) => s + r.days, 0),
          balancePtoDays: 12 - ptoReqs.filter((r: any) => r.employee_id === employee.id && r.status === 'Approved').reduce((s: number, r: any) => s + r.days, 0),
          loggedOtHours: otReqs.filter((r: any) => r.employee_id === employee.id && r.status === 'Approved').reduce((s: number, r: any) => s + r.hours, 0),
        });
        setPTORequests(
          ptoReqs
            .filter((r: any) => r.employee_id === employee.id)
            .map((r: any) => ({
              id: r.id,
              type: r.request_type,
              startDate: r.start_date,
              endDate: r.end_date,
              days: r.days,
              status: r.status,
            }))
        );
        setOTRequests(
          otReqs
            .filter((r: any) => r.employee_id === employee.id)
            .map((r: any) => ({
              id: r.id,
              date: r.date,
              hours: r.hours,
              reason: r.reason,
              status: r.status,
            }))
        );
        setDirectReports(detail.direct_reports || []);
        setLoading(false);
      }).catch((err) => {
        console.error('Failed to load employee records:', err);
        setLoading(false);
      });
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
          <button className="modal-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>
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
                            onClick={(e) => { e.stopPropagation(); onViewReport?.(rpt.id); }}
                          >
                            {rpt.first_name} {rpt.last_name}
                          </span>
                        </td>
                        <td>{rpt.job_title || '-'}</td>
                        <td>
                          {rpt.department_name || rpt.department?.name || 'N/A'}
                        </td>
                        <td>
                          <button
                            className="table-action-btn btn-view-action"
                            title="View Details"
                            onClick={(e) => { e.stopPropagation(); onViewReport?.(rpt.id); }}
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