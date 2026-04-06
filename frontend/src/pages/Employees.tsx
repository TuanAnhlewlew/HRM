import React, { useState, useEffect } from 'react';
import EmployeeTable from '../components/employees/EmployeeTable';
import EmployeeDetailModal from '../components/employees/EmployeeDetailModal';
import EmployeeFormModal from '../components/employees/EmployeeFormModal';
import { api } from '../api';
import './Employees.css';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [departments, setDepartments] = useState<Array<any>>([]);
  const [managers, setManagers] = useState<Array<any>>([]);

  const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` };

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

  const handleCreateEmployee = () => {
    setFormMode('create');
    setShowFormModal(true);
  };

  const handleViewEmployee = async (employeeId: string) => {
    try {
      const employee = await api(`/employees/${employeeId}`);
      setSelectedEmployee(employee);
    } catch (error) {
      console.error('Failed to fetch employee:', error);
    }
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

  const handleFormSubmit = async (employeeData: any) => {
    try {
      if (formMode === 'create') {
        await api('/employees', { method: 'POST', headers: authHeaders, body: JSON.stringify(employeeData) });
      } else if (formMode === 'edit' && selectedEmployee) {
        await api(`/employees/${selectedEmployee.id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(employeeData) });
      }
      await refreshEmployees();
    } catch (error) {
      console.error('Failed to save employee:', error);
    } finally {
      setShowFormModal(false);
      setSelectedEmployee(null);
    }
  };

  const handleFormCancel = () => {
    setShowFormModal(false);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api(`/employees/${employeeId}`, { method: 'DELETE', headers: authHeaders });
        await refreshEmployees();
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  useEffect(() => {
    refreshEmployees();
  }, []);

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