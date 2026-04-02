import React, { useState, useEffect } from 'react';
import EmployeeTable from '../components/employees/EmployeeTable';
import EmployeeDetailModal from '../components/employees/EmployeeDetailModal';
import EmployeeFormModal from '../components/employees/EmployeeFormModal';
import './Employees.css';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [departments, setDepartments] = useState<Array<any>>([]);
  const [managers, setManagers] = useState<Array<any>>([]);

  // Mock data functions - will be replaced with API calls later
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

  // Load initial data
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

  if (loading) {
    return (
      <div className="employees-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employees-page">
      <header className="employees-header">
        <h1>Employee Management</h1>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search employees..."
            className="search-input"
          />
          <select className="filter-select">
            <option value="all">All Departments</option>
            {departments.map((dept: any) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <button className="btn-primary btn-action" onClick={handleCreateEmployee}>
            <span className="action-icon">➕</span>
            <span>Add Employee</span>
          </button>
        </div>
      </header>

      <main className="employees-content">
        {employees.length === 0 ? (
          <div className="empty-state">
            <h3>No employees found</h3>
            <p>Click "Add Employee" to get started</p>
            <button className="btn-primary" onClick={handleCreateEmployee}>
              Add First Employee
            </button>
          </div>
        ) : (
          <EmployeeTable
            employees={employees}
            onViewEmployee={handleViewEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}
      </main>

      {/* Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onEdit={handleEditEmployee}
        />
      )}

      {/* Form Modal */}
      {showFormModal && (
        <EmployeeFormModal
          mode={formMode}
          employee={selectedEmployee}
          departments={departments}
          managers={managers}
          onClose={handleFormCancel}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default Employees;