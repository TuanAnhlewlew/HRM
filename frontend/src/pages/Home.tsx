import React, { useState, useEffect } from 'react';
import './Home.css';
import EmployeeManagementView from '../components/employees/EmployeeManagementView';
import ChangePasswordModal from '../components/employee/ChangePasswordModal';
import UserProfilePopup from '../components/form/UserProfilePopup';
import { api } from '../api';

const Home: React.FC = () => {
  const [showEmployeesView, setShowEmployeesView] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [pendingPTO, setPendingPTO] = useState(0);
  const [pendingOT, setPendingOT] = useState(0);
  const currentUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');

  // Employee management state
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [departments, setDepartments] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const [emps, ptoReqs, otReqs] = await Promise.all([
        api('/employees'),
        api('/pto-requests'),
        api('/ot-requests'),
      ]);
      setTotalEmployees(emps.length);
      setPendingPTO(ptoReqs.filter((r: any) => r.status === 'Pending').length);
      setPendingOT(otReqs.filter((r: any) => r.status === 'Pending').length);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  // Full refresh employees (re-fetch from API)
  const refreshEmployees = async () => {
    setLoading(true);
    try {
      const [emps, depts] = await Promise.all([
        api('/employees'),
        api('/departments'),
      ]);
      setEmployees(emps);
      setDepartments(depts);
      setManagers(emps);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations via API
  const createEmployeeViaApi = async (employeeData: any) => {
    const newEmployee = await api('/employees', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(employeeData) });
    setEmployees([...employees, newEmployee]);
    return newEmployee;
  };

  const updateEmployeeViaApi = async (id: string, employeeData: any) => {
    const updated = await api(`/employees/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(employeeData) });
    setEmployees(employees.map((emp: any) => emp.id === id ? updated : emp));
    return updated;
  };

  const deleteEmployeeViaApi = async (id: string) => {
    await api(`/employees/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setEmployees(employees.filter((emp: any) => emp.id !== id));
  };

  // Fetch employee data when switching to Employees tab
  useEffect(() => {
    if (showEmployeesView) {
      refreshEmployees();
    }
  }, [showEmployeesView]);

  // Handle opening detail modal — fetch from API if not already loaded
  const handleViewEmployee = async (employeeId: string) => {
    try {
      const employee = await api(`/employees/${employeeId}`);
      setSelectedEmployee(employee);
    } catch (error) {
      console.error('Failed to fetch employee:', error);
    }
  };

  // Handle opening form modal
  const handleCreateEmployee = () => {
    setFormMode('create');
    setShowFormModal(true);
  };

  const handleEditEmployee = async (employeeId: string) => {
    try {
      const employee = await api(`/employees/${employeeId}`);
      setSelectedEmployee(employee);
      setFormMode('edit');
      setShowFormModal(true);
    } catch (error) {
      console.error('Failed to fetch employee:', error);
    }
  };

  // Handle form submission — refresh dashboard stats after create/update/delete
  const handleFormSubmit = async (employeeData: any) => {
    try {
      if (formMode === 'create') {
        await createEmployeeViaApi(employeeData);
      } else if (formMode === 'edit' && selectedEmployee) {
        await updateEmployeeViaApi(selectedEmployee.id, employeeData);
      }
      await Promise.all([fetchDashboardStats(), refreshEmployees()]);
    } catch (error) {
      console.error('Failed to save employee:', error);
    } finally {
      setShowFormModal(false);
      setSelectedEmployee(null);
    }
  };

  // Handle form cancellation
  const handleFormCancel = () => {
    setShowFormModal(false);
    setSelectedEmployee(null);
  };

  // Handle delete employee
  const handleDeleteEmployee = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployeeViaApi(employeeId);
        await fetchDashboardStats();
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-text">HRM</span>
            <span className="logo-subtext">Dashboard</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-actions">
            <button onClick={handleLogout} className="btn-icon" title="Logout">
              Logout
            </button>
            <UserProfilePopup user={currentUser} onChangePassword={() => {
              setShowChangePassword(true);
            }} />
            {showChangePassword && (
              <ChangePasswordModal
                onClose={() => setShowChangePassword(false)}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="dashboard">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <h3 className="nav-title">Navigation</h3>
            <ul className="nav-list">
              <li
                className={`nav-item ${!showEmployeesView ? 'active' : ''}`}
                onClick={() => setShowEmployeesView(false)}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Dashboard</span>
              </li>
              <li
                className={`nav-item ${showEmployeesView ? 'active' : ''}`}
                onClick={() => setShowEmployeesView(true)}
              >
                <span className="nav-icon">👥</span>
                <span className="nav-text">Employees</span>
              </li>
          </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="main-content">
          {showEmployeesView ? (
            <EmployeeManagementView
              employees={employees}
              loading={loading}
              selectedEmployee={selectedEmployee}
              showFormModal={showFormModal}
              formMode={formMode}
              departments={departments}
              managers={managers}
              onViewEmployee={handleViewEmployee}
              onCreateEmployee={handleCreateEmployee}
              onEditEmployee={handleEditEmployee}
              onFormSubmit={handleFormSubmit}
              onFormCancel={handleFormCancel}
              onDeleteEmployee={handleDeleteEmployee}
              onCloseDetailModal={() => setSelectedEmployee(null)}
              onViewReport={handleViewEmployee}
            />
          ) : (
            <>
              {/* Summary Tiles */}
              <div className="summary-tiles">
                <div className="tile">
                  <h4 className="tile-title">Total Employees</h4>
                  <p className="tile-value">{totalEmployees}</p>
                </div>
                <div className="tile">
                  <h4 className="tile-title">Pending PTO Requests</h4>
                  <p className="tile-value">{pendingPTO}</p>
                </div>
                <div className="tile">
                  <h4 className="tile-title">Pending OT Requests</h4>
                  <p className="tile-value">{pendingOT}</p>
                </div>
              </div>

              {/* Main Content Cards */}
              {/* <div className="content-cards">
                <div className="card">
                  <h3 className="card-title">Recent Activity</h3>
                  <div className="activity-list">
                    <div className="activity-item">
                      <span className="activity-icon">✅</span>
                      <div className="activity-text">
                        <strong>New employee added:</strong> Sarah Johnson
                      </div>
                      <span className="activity-time">2 hours ago</span>
                    </div>
                    <div className="activity-item">
                      <span className="activity-icon">📝</span>
                      <div className="activity-text">
                        <strong>Leave request approved:</strong> Michael Chen
                      </div>
                      <span className="activity-time">4 hours ago</span>
                    </div>
                    <div className="activity-item">
                      <span className="activity-icon">🔄</span>
                      <div className="activity-text">
                        <strong>Department updated:</strong> Sales Team
                      </div>
                      <span className="activity-time">6 hours ago</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="card-title">Quick Actions</h3>
                  <div className="action-buttons">
                    <button className="btn-action">
                      <span className="action-icon">➕</span>
                      <span>Add Employee</span>
                    </button>
                    <button className="btn-action">
                      <span className="action-icon">📄</span>
                      <span>Generate Report</span>
                    </button>
                    <button className="btn-action">
                      <span className="action-icon">📅</span>
                      <span>Schedule Meeting</span>
                    </button>
                    <button className="btn-action">
                      <span className="action-icon">💬</span>
                      <span>Send Announcement</span>
                    </button>
                  </div>
                </div>
              </div> */}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;