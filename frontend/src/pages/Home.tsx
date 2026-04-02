import React, { useState, useEffect } from 'react';
import './Home.css';
import EmployeeManagementView from '../components/employees/EmployeeManagementView';

const Home: React.FC = () => {
  const [showEmployeesView, setShowEmployeesView] = useState(false);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [pendingPTO, setPendingPTO] = useState(0);
  const [pendingOT, setPendingOT] = useState(0);

  // Mock data functions - will be replaced with API calls later
  const getTotalEmployees = () => {
    // Simulate API call delay
    return Math.floor(Math.random() * 100) + 100; // Random between 100-200
  };

  // Employee management state
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [departments, setDepartments] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  const getPendingPTORequests = () => {
    // Simulate API call delay
    return Math.floor(Math.random() * 20) + 5; // Random between 5-25
  };

  const getPendingOTRequests = () => {
    // Simulate API call delay
    return Math.floor(Math.random() * 12) + 3; // Random between 3-15
  };

  // Simulate data fetching on component mount
  useEffect(() => {
    setTotalEmployees(getTotalEmployees());
    setPendingPTO(getPendingPTORequests());
    setPendingOT(getPendingOTRequests());
  }, []);

  // Employee management mock data functions - will be replaced with API calls later
  const fetchEmployees = async () => {
    setLoading(true);
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockEmployees = [
          {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@company.com',
            phone_number: '555-0101',
            hire_date: '2023-01-15',
            job_title: 'Software Engineer',
            department_id: 1,
            department: { id: 1, name: 'Engineering' },
            salary: 75000,
            manager_id: null,
            manager_name: null
          },
          {
            id: 2,
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@company.com',
            phone_number: '555-0102',
            hire_date: '2022-03-22',
            job_title: 'Product Manager',
            department_id: 2,
            department: { id: 2, name: 'Product' },
            salary: 82000,
            manager_id: null,
            manager_name: null
          },
          {
            id: 3,
            first_name: 'Mike',
            last_name: 'Johnson',
            email: 'mike.johnson@company.com',
            phone_number: '555-0103',
            hire_date: '2023-06-10',
            job_title: 'UX Designer',
            department_id: 3,
            department: { id: 3, name: 'Design' },
            salary: 68000,
            manager_id: 2,
            manager_name: 'Jane Smith'
          },
          {
            id: 4,
            first_name: 'Sarah',
            last_name: 'Wilson',
            email: 'sarah.wilson@company.com',
            phone_number: '555-0104',
            hire_date: '2021-11-05',
            job_title: 'DevOps Engineer',
            department_id: 1,
            department: { id: 1, name: 'Engineering' },
            salary: 78000,
            manager_id: 1,
            manager_name: 'John Doe'
          },
          {
            id: 5,
            first_name: 'David',
            last_name: 'Brown',
            email: 'david.brown@company.com',
            phone_number: '555-0105',
            hire_date: '2023-02-18',
            job_title: 'QA Engineer',
            department_id: 1,
            department: { id: 1, name: 'Engineering' },
            salary: 65000,
            manager_id: 1,
            manager_name: 'John Doe'
          }
        ];
        resolve(mockEmployees);
      }, 800);
    });
  };

  const fetchEmployeeById = async (id: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const employee = employees.find((emp: any) => emp.id === id);
        if (!employee) {
          resolve(null);
          return;
        }
        const directReports = employees.filter((emp: any) => emp.manager_id === id);
        resolve({
          ...employee,
          directReports
        });
      }, 400);
    });
  };

  const fetchDepartments = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockDepartments = [
          { id: 1, name: 'Engineering' },
          { id: 2, name: 'Product' },
          { id: 3, name: 'Design' },
          { id: 4, name: 'Marketing' },
          { id: 5, name: 'Sales' },
          { id: 6, name: 'HR' },
          { id: 7, name: 'Finance' }
        ];
        resolve(mockDepartments);
      }, 300);
    });
  };

  const fetchManagers = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...employees]); // All employees can be potential managers
      }, 300);
    });
  };

  const createEmployee = async (employeeData: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newEmployee = {
          id: Math.max(...employees.map((e: any) => e.id)) + 1,
          ...employeeData
        };
        setEmployees([...employees, newEmployee]);
        resolve(newEmployee);
      }, 600);
    });
  };

  const updateEmployee = async (id: number, employeeData: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setEmployees(employees.map((emp: any) =>
          emp.id === id ? { ...emp, ...employeeData } : emp
        ));
        resolve(employeeData);
      }, 600);
    });
  };

  const deleteEmployee = async (id: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setEmployees(employees.filter((emp: any) => emp.id !== id));
        resolve(id);
      }, 400);
    });
  };

  // Load initial employee data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [emps, depts, mgrs] = await Promise.all([
          fetchEmployees(),
          fetchDepartments(),
          fetchManagers()
        ]) as [any[], any[], any[]];
        setEmployees(emps);
        setDepartments(depts);
        setManagers(mgrs);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle opening detail modal
  const handleViewEmployee = async (employeeId: number) => {
    const employee = await fetchEmployeeById(employeeId);
    setSelectedEmployee(employee);
  };

  // Handle opening form modal
  const handleCreateEmployee = () => {
    setFormMode('create');
    setShowFormModal(true);
  };

  const handleEditEmployee = async (employeeId: number) => {
    const employee = await fetchEmployeeById(employeeId);
    setSelectedEmployee(employee);
    setFormMode('edit');
    setShowFormModal(true);
  };

  // Handle form submission
  const handleFormSubmit = async (employeeData: any) => {
    if (formMode === 'create') {
      await createEmployee(employeeData);
    } else if (formMode === 'edit' && selectedEmployee) {
      await updateEmployee(selectedEmployee.id, employeeData);
    }
    setShowFormModal(false);
    setSelectedEmployee(null);
  };

  // Handle form cancellation
  const handleFormCancel = () => {
    setShowFormModal(false);
    setSelectedEmployee(null);
  };

  // Handle delete employee
  const handleDeleteEmployee = async (employeeId: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      await deleteEmployee(employeeId);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
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
            <div className="user-profile">
              <span className="user-initials">JD</span>
              <span className="user-name">John Doe</span>
            </div>
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