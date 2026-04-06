import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { api } from '../../api';
import './EmployeeProfileModal.css';

interface EmployeeProfileModalProps {
  onClose: () => void;
}

const statusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved': return 'status-approved';
    case 'pending': return 'status-pending';
    case 'rejected': return 'status-rejected';
    default: return '';
  }
};

const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({ onClose }) => {
  const [profile, setProfile] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [ptoRequests, setPtoRequests] = useState<any[]>([]);
  const [otRequests, setOtRequests] = useState<any[]>([]);
  const [directReports, setDirectReports] = useState<any[]>([]);
  const [managerName, setManagerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api('/me').catch(() => null),
      api('/me/balance').catch(() => null),
      api('/pto-requests').catch(() => []),
      api('/ot-requests').catch(() => []),
    ]).then(([profileData, balanceData, myPto, myOt]) => {
      setProfile(profileData);
      setBalance(balanceData);

      // Filter to only own requests
      if (profileData?.id) {
        setPtoRequests((myPto as any[]).filter((r: any) => r.employee_id === profileData.id));
        setOtRequests((myOt as any[]).filter((r: any) => r.employee_id === profileData.id));
      }

      // Find manager info
      if (profileData?.manager_id) {
        api(`/employees`)
          .then((emps) => {
            const mgr = (emps as any[]).find((e: any) => e.id === profileData.manager_id);
            setManagerName(mgr ? `${mgr.first_name} ${mgr.last_name} — ${mgr.job_title || ''}` : null);
          })
          .catch(() => {});
      }
    }).finally(() => setLoading(false));
  }, []);

  // After profile loads, look up direct reports from the employee detail
  useEffect(() => {
    if (profile?.id) {
      api(`/employees/${profile.id}`)
        .then((emp: any) => {
          setDirectReports(emp.direct_reports || []);
        })
        .catch(() => {});
    }
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="epm-backdrop" onClick={onClose}>
        <div className="epm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="epm-content">
            <div className="epm-spinner">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="epm-backdrop" onClick={onClose}>
        <div className="epm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="epm-content">
            <p className="epm-error">Failed to load profile</p>
          </div>
        </div>
      </div>
    );
  }

  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="epm-backdrop" onClick={onClose}>
      <div className="epm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="epm-content">
          <div className="epm-header">
            <div className="epm-header-left">
              <div className="epm-avatar">{initials}</div>
              <div>
                <h2 className="epm-name">{profile.first_name} {profile.last_name}</h2>
                <span className="epm-title">{profile.job_title || 'Employee'}</span>
              </div>
            </div>
            <button className="epm-close" onClick={onClose}>✕</button>
          </div>

          <div className="epm-body">
            {/* Personal Information */}
            <div className="epm-section">
              <h3 className="epm-section-title">Personal Information</h3>
              <div className="epm-grid">
                <div className="epm-row">
                  <span className="epm-label">Email</span>
                  <span className="epm-value">{profile.email || '—'}</span>
                </div>
                <div className="epm-row">
                  <span className="epm-label">Phone</span>
                  <span className="epm-value">{profile.phone_number || '—'}</span>
                </div>
                <div className="epm-row">
                  <span className="epm-label">Gender</span>
                  <span className="epm-value">{profile.gender || '—'}</span>
                </div>
                <div className="epm-row">
                  <span className="epm-label">Hire Date</span>
                  <span className="epm-value">
                    {profile.hire_date ? format(new Date(profile.hire_date), 'MMM d, yyyy') : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="epm-section">
              <h3 className="epm-section-title">Employment Details</h3>
              <div className="epm-grid">
                <div className="epm-row">
                  <span className="epm-label">Department</span>
                  <span className="epm-value">{profile.department_name || '—'}</span>
                </div>
                <div className="epm-row">
                  <span className="epm-label">Manager</span>
                  <span className="epm-value">{managerName || 'None'}</span>
                </div>
                <div className="epm-row">
                  <span className="epm-label">Salary</span>
                  <span className="epm-value">
                    {profile.salary ? `$${Number(profile.salary).toLocaleString()}` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Managed Employees */}
            {directReports.length > 0 && (
              <div className="epm-section">
                <h3 className="epm-section-title">Managed Employees</h3>
                <table className="epm-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {directReports.map((r: any) => (
                      <tr key={r.id}>
                        <td>{r.first_name} {r.last_name}</td>
                        <td>{r.job_title || '—'}</td>
                        <td>{r.department_name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Leave & OT Balance */}
            {balance && (
              <div className="epm-section">
                <h3 className="epm-section-title">Leave & OT Balance</h3>
                <div className="epm-balance-grid">
                  <div className="epm-balance-tile">
                    <span className="epm-bt-label">Annual Leave</span>
                    <span className="epm-bt-number">{balance.remaining} / {balance.total_annual} days</span>
                  </div>
                  <div className="epm-balance-tile">
                    <span className="epm-bt-label">Sick Leave</span>
                    <span className="epm-bt-number">{balance.sick_max} days</span>
                  </div>
                  <div className="epm-balance-tile">
                    <span className="epm-bt-label">Pending PTO</span>
                    <span className="epm-bt-number">{balance.pending} days</span>
                  </div>
                  <div className="epm-balance-tile">
                    <span className="epm-bt-label">Approved OT</span>
                    <span className="epm-bt-number">{balance.ot_hours} hours</span>
                  </div>
                </div>
              </div>
            )}

            {/* PTO Requests */}
            {ptoRequests.length > 0 && (
              <div className="epm-section">
                <h3 className="epm-section-title">PTO Requests</h3>
                <div className="epm-table-wrap">
                  <table className="epm-table">
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
                      {ptoRequests.map((r: any) => (
                        <tr key={r.id}>
                          <td>{r.request_type || r.type}</td>
                          <td>{format(new Date(r.start_date), 'MMM d, yyyy')}</td>
                          <td>{format(new Date(r.end_date), 'MMM d, yyyy')}</td>
                          <td>{r.days}</td>
                          <td className="epm-reason">{r.reason}</td>
                          <td>
                            <span className={`status-badge ${statusClass(r.status)}`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* OT Requests */}
            {otRequests.length > 0 && (
              <div className="epm-section">
                <h3 className="epm-section-title">OT Requests</h3>
                <div className="epm-table-wrap">
                  <table className="epm-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Hours</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otRequests.map((r: any) => (
                        <tr key={r.id}>
                          <td>{format(new Date(r.date), 'MMM d, yyyy')}</td>
                          <td>{r.hours}h</td>
                          <td className="epm-reason">{r.reason}</td>
                          <td>
                            <span className={`status-badge ${statusClass(r.status)}`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {ptoRequests.length === 0 && otRequests.length === 0 && (
              <p className="epm-empty">No PTO or OT requests found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileModal;
