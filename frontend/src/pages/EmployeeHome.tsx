import React, { useState, useEffect } from 'react';
import './Home.css';
import EmployeeDashboard from '../components/employee/EmployeeDashboard';
import PersonalRequests from '../components/employee/PersonalRequests';
import EmployeesRequests from '../components/employee/EmployeesRequests';
import PTORequestForm from '../components/employee/PTORequestForm';
import OTRequestForm from '../components/employee/OTRequestForm';
import type { PTOBalance, PTORequest, OTRequest } from '../types/employee';

type Tab = 'dashboard' | 'personal' | 'employee-requests';

const EmployeeHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [userInfo, setUserInfo] = useState<{ username: string; userType: string }>({
    username: '',
    userType: 'employee'
  });

  // Modal visibility
  const [showPTOForm, setShowPTOForm] = useState(false);
  const [showOTForm, setShowOTForm] = useState(false);

  // PTO balance
  const [ptoBalance] = useState<PTOBalance>({
    totalAnnual: 15,
    remaining: 11,
    taken: 4,
  });

  // OT hours
  const [otHours] = useState(12);

  // Personal PTO requests
  const [personalPTORequests, setPersonalPTORequests] = useState<PTORequest[]>([
    { id: 'pto-1', type: 'PTO', startDate: '2026-03-15', endDate: '2026-03-17', days: 3, reason: 'Family vacation', status: 'Approved' },
    { id: 'pto-2', type: 'Sick', startDate: '2026-04-01', endDate: '2026-04-01', days: 1, reason: 'Doctor appointment', status: 'Approved' },
    { id: 'pto-3', type: 'PTO', startDate: '2026-05-20', endDate: '2026-05-22', days: 3, reason: 'Spring break travel', status: 'Pending' },
  ]);

  // Personal OT requests
  const [personalOTRequests, setPersonalOTRequests] = useState<OTRequest[]>([
    { id: 'ot-1', date: '2026-03-20', hours: 3, reason: 'Weekend deployment support', status: 'Approved' },
    { id: 'ot-2', date: '2026-04-10', hours: 2, reason: 'Production bug fix', status: 'Pending' },
  ]);

  // Direct reports' PTO requests (manager view)
  const [directReportsPTORequests, setDirectReportsPTORequests] = useState<PTORequest[]>([
    { id: 'dr-pt-1', type: 'PTO', startDate: '2026-04-15', endDate: '2026-04-18', days: 4, reason: 'Wedding', status: 'Pending', employeeName: 'Mike Johnson' },
    { id: 'dr-pt-2', type: 'Sick', startDate: '2026-04-02', endDate: '2026-04-02', days: 1, reason: 'Flu', status: 'Pending', employeeName: 'Sarah Wilson' },
  ]);

  // Direct reports' OT requests
  const [directReportsOTRequests, setDirectReportsOTRequests] = useState<OTRequest[]>([
    { id: 'dr-ot-1', date: '2026-04-08', hours: 4, reason: 'Weekend migration', status: 'Pending', employeeName: 'Mike Johnson' },
  ]);

  useEffect(() => {
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      setUserInfo(JSON.parse(stored));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = '/';
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'E';

  // Submit handlers
  const handleSubmitPTORequest = (data: {
    type: 'PTO' | 'Sick' | 'Personal';
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newRequest: PTORequest = {
      ...data,
      id: `pto-${Date.now()}`,
      days,
      status: 'Pending',
    };
    setPersonalPTORequests(prev => [newRequest, ...prev]);
    setShowPTOForm(false);
  };

  const handleSubmitOTRequest = (data: { date: string; hours: number; reason: string }) => {
    const newRequest: OTRequest = {
      ...data,
      id: `ot-${Date.now()}`,
      status: 'Pending',
    };
    setPersonalOTRequests(prev => [newRequest, ...prev]);
    setShowOTForm(false);
  };

  // Approve / Reject handlers
  const handleUpdatePTOStatus = (requestId: string, status: 'Approved' | 'Rejected') => {
    setDirectReportsPTORequests(prev =>
      prev.map(r => r.id === requestId ? { ...r, status } : r)
    );
  };

  const handleUpdateOTStatus = (requestId: string, status: 'Approved' | 'Rejected') => {
    setDirectReportsOTRequests(prev =>
      prev.map(r => r.id === requestId ? { ...r, status } : r)
    );
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
            <div className="user-profile">
              <span className="user-initials">{getInitials(userInfo.username)}</span>
              <span className="user-name">{userInfo.username}</span>
            </div>
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
    </div>
  );
};

export default EmployeeHome;
