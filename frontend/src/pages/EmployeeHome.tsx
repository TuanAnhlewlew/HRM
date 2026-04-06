import React, { useState, useEffect, useCallback } from 'react';
import './Home.css';
import EmployeeDashboard from '../components/employee/EmployeeDashboard';
import PersonalRequests from '../components/employee/PersonalRequests';
import EmployeesRequests from '../components/employee/EmployeesRequests';
import PTORequestForm from '../components/employee/PTORequestForm';
import OTRequestForm from '../components/employee/OTRequestForm';
import EmployeeProfileModal from '../components/employee/EmployeeProfileModal';
import ChangePasswordModal from '../components/employee/ChangePasswordModal';
import UserProfilePopup from '../components/form/UserProfilePopup';
import { api } from '../api';
import type { PTOBalance, PTORequest, OTRequest, LeaveType } from '../types/employee';

type Tab = 'dashboard' | 'personal' | 'employee-requests';

// Map backend response to frontend interfaces
const mapPTO = (r: any): PTORequest => ({
  id: String(r.id),
  type: r.request_type as LeaveType,
  startDate: r.start_date,
  endDate: r.end_date,
  days: r.days,
  reason: r.reason,
  status: r.status,
  employeeName: r.employee_name,
});

const mapOT = (r: any): OTRequest => ({
  id: String(r.id),
  date: r.date,
  hours: r.hours,
  reason: r.reason,
  status: r.status,
  employeeName: r.employee_name,
});

const EmployeeHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [userInfo, setUserInfo] = useState<{ username: string; userType: string }>({
    username: '',
    userType: 'employee'
  });

  // Modal visibility
  const [showPTOForm, setShowPTOForm] = useState(false);
  const [showOTForm, setShowOTForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // PTO balance
  const [ptoBalance, setPtoBalance] = useState<PTOBalance>({
    totalAnnual: 0,
    remaining: 0,
    taken: 0,
  });

  // OT hours
  const [otHours, setOtHours] = useState(0);

  // Personal PTO requests
  const [personalPTORequests, setPersonalPTORequests] = useState<PTORequest[]>([]);

  // Personal OT requests
  const [personalOTRequests, setPersonalOTRequests] = useState<OTRequest[]>([]);

  // Direct reports' PTO requests (manager view)
  const [directReportsPTORequests, setDirectReportsPTORequests] = useState<PTORequest[]>([]);

  // Direct reports' OT requests
  const [directReportsOTRequests, setDirectReportsOTRequests] = useState<OTRequest[]>([]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    const user = localStorage.getItem('loggedInUser');
    let employeeId: number | undefined;
    if (user) {
      employeeId = JSON.parse(user).id;
    }
    try {
      const [balanceRes, ptoRes, otRes] = await Promise.all([
        api('/me/balance').catch(() => ({ total_annual: 0, remaining: 0, taken: 0, pending: 0, ot_hours: 0 })),
        api('/pto-requests').catch(() => []),
        api('/ot-requests').catch(() => []),
      ]);

      setPtoBalance({
        totalAnnual: balanceRes.total_annual,
        remaining: balanceRes.remaining,
        taken: balanceRes.taken,
      });
      setOtHours(balanceRes.ot_hours);

      // Personal requests: only my own
      const myPto = ptoRes
        .filter((r: any) => r.employee_id === employeeId)
        .map((r: any) => mapPTO(r));
      setPersonalPTORequests(myPto);

      const myOt = otRes
        .filter((r: any) => r.employee_id === employeeId)
        .map(mapOT);
      setPersonalOTRequests(myOt);

      // Manager view: direct reports' requests (exclude own)
      const managerPto = ptoRes
        .filter((r: any) => r.employee_id !== employeeId)
        .map((r: any) => mapPTO(r));
      setDirectReportsPTORequests(managerPto);

      const managerOt = otRes
        .filter((r: any) => r.employee_id !== employeeId)
        .map(mapOT);
      setDirectReportsOTRequests(managerOt);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      setUserInfo(JSON.parse(stored));
    }
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // Submit handlers
  const handleSubmitPTORequest = async (data: {
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    try {
      await api('/pto-requests', {
        method: 'POST',
        body: JSON.stringify({
          start_date: data.startDate,
          end_date: data.endDate,
          reason: data.reason,
          request_type: data.type,
        }),
      });
      await fetchData();
      setShowPTOForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to submit PTO request');
    }
  };

  const handleSubmitOTRequest = async (data: { date: string; hours: number; reason: string }) => {
    try {
      await api('/ot-requests', {
        method: 'POST',
        body: JSON.stringify({
          date: data.date,
          hours: data.hours,
          reason: data.reason,
        }),
      });
      await fetchData();
      setShowOTForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to submit OT request');
    }
  };

  // Approve / Reject handlers
  const handleUpdatePTOStatus = async (requestId: string, status: 'Approved' | 'Rejected') => {
    const endpoint = status === 'Approved' ? 'approve' : 'reject';
    try {
      await api(`/pto-requests/${requestId}/${endpoint}`, { method: 'PUT' });
      setDirectReportsPTORequests(prev =>
        prev.map(r => r.id === requestId ? { ...r, status } : r)
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update request');
    }
  };

  const handleUpdateOTStatus = async (requestId: string, status: 'Approved' | 'Rejected') => {
    const endpoint = status === 'Approved' ? 'approve' : 'reject';
    try {
      await api(`/ot-requests/${requestId}/${endpoint}`, { method: 'PUT' });
      setDirectReportsOTRequests(prev =>
        prev.map(r => r.id === requestId ? { ...r, status } : r)
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update request');
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-text">HRM</span>
            <span className="logo-subtext">Employee Portal</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-actions">
            <button onClick={handleLogout} className="btn-icon" title="Logout">
              Logout
            </button>
            <UserProfilePopup user={userInfo} onEmployeeDetails={() => {
              setShowProfileModal(true);
            }} onChangePassword={() => {
              setShowChangePassword(true);
            }} />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="dashboard">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <h3 className="nav-title">Navigation</h3>
            <ul className="nav-list">
              <li
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Dashboard</span>
              </li>
              <li
                className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <span className="nav-icon">📋</span>
                <span className="nav-text">Personal Requests</span>
              </li>
              <li
                className={`nav-item ${activeTab === 'employee-requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('employee-requests')}
              >
                <span className="nav-icon">👥</span>
                <span className="nav-text">Employees' Requests</span>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="main-content">
          {activeTab === 'dashboard' && (
            <EmployeeDashboard
              ptoBalance={ptoBalance}
              otHours={otHours}
              ptoRequests={personalPTORequests}
              otRequests={personalOTRequests}
              onOpenPTORequest={() => setShowPTOForm(true)}
              onOpenOTRequest={() => setShowOTForm(true)}
            />
          )}
          {activeTab === 'personal' && (
            <PersonalRequests
              ptoRequests={personalPTORequests}
              otRequests={personalOTRequests}
              onOpenPTOForm={() => setShowPTOForm(true)}
              onOpenOTForm={() => setShowOTForm(true)}
            />
          )}
          {activeTab === 'employee-requests' && (
            <EmployeesRequests
              ptoRequests={directReportsPTORequests}
              otRequests={directReportsOTRequests}
              onUpdatePTOStatus={handleUpdatePTOStatus}
              onUpdateOTStatus={handleUpdateOTStatus}
            />
          )}
        </section>
      </div>

      {/* Modal forms */}
      {showPTOForm && (
        <PTORequestForm
          onClose={() => setShowPTOForm(false)}
          onSubmit={handleSubmitPTORequest}
        />
      )}
      {showOTForm && (
        <OTRequestForm
          onClose={() => setShowOTForm(false)}
          onSubmit={handleSubmitOTRequest}
        />
      )}
      {showProfileModal && (
        <EmployeeProfileModal
          onClose={() => setShowProfileModal(false)}
        />
      )}
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  );
};

export default EmployeeHome;
