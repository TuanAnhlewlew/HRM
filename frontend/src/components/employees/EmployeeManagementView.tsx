import React from 'react';
import EmployeeTable from './EmployeeTable';
import EmployeeDetailModal from './EmployeeDetailModal';
import EmployeeFormModal from './EmployeeFormModal';
import './EmployeeManagementView.css';

interface EmployeeManagementViewProps {
  employees: any[];
  loading: boolean;
  selectedEmployee: any | null;
  showFormModal: boolean;
  formMode: 'create' | 'edit';
  departments: any[];
  managers: any[];
  onViewEmployee: (employeeId: string) => void;
  onCreateEmployee: () => void;
  onEditEmployee: (employeeId: string) => void;
  onFormSubmit: (employeeData: any) => void;
  onFormCancel: () => void;
  onDeleteEmployee: (employeeId: string) => void;
  onCloseDetailModal: () => void;
  onViewReport?: (employeeId: string) => void;
}

const EmployeeManagementView: React.FC<EmployeeManagementViewProps> = ({
  employees,
  loading,
  selectedEmployee,
  showFormModal,
  formMode,
  departments,
  managers,
  onViewEmployee,
  onCreateEmployee,
  onEditEmployee,
  onFormSubmit,
  onFormCancel,
  onDeleteEmployee,
  onCloseDetailModal,
  onViewReport
}) => {
  return (
    <div className="employee-management-view">
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
          <button className="btn-primary btn-action" onClick={onCreateEmployee}>
            <span className="action-icon">➕</span>
            <span>Add Employee</span>
          </button>
        </div>
      </header>

      <main className="employees-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <h3>No employees found</h3>
            <p>Click "Add Employee" to get started</p>
            <button className="btn-primary" onClick={onCreateEmployee}>
              Add First Employee
            </button>
          </div>
        ) : (
          <EmployeeTable
            employees={employees}
            onViewEmployee={onViewEmployee}
            onEditEmployee={onEditEmployee}
            onDeleteEmployee={onDeleteEmployee}
          />
        )}
      </main>

      {/* Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={onCloseDetailModal}
          onEdit={onEditEmployee}
          onViewReport={onViewReport}
        />
      )}

      {/* Form Modal */}
      {showFormModal && (
        <EmployeeFormModal
          mode={formMode}
          employee={selectedEmployee}
          departments={departments}
          managers={managers}
          onClose={onFormCancel}
          onSubmit={onFormSubmit}
        />
      )}
    </div>
  );
};

export default EmployeeManagementView;