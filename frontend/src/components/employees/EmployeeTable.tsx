import React from 'react';
import './EmployeeTable.css';

interface EmployeeTableProps {
  employees: Array<any>;
  onViewEmployee: (employeeId: string) => void;
  onEditEmployee: (employeeId: string) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee
}) => {
  const sortConfig = {
    key: 'hire_date',
    direction: 'desc' as const
  };

  // Sort employees
  const sortedEmployees = [...employees].sort((a, b) => {
    if (sortConfig.direction !== 'desc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    } else {
      return b[sortConfig.key] > a[sortConfig.key] ? 1 : -1;
    }
  });

  const requestSort = (_key: string) => {
    // Sorting logic to be implemented later with state management
  };

  return (
    <div className="employee-table-container">
      <table className="employee-table">
        <thead>
          <tr>
            <th>
              <button className="sort-header" onClick={() => requestSort('first_name')}>
                Name
                {sortConfig.key === 'first_name' && (
                  sortConfig.direction !== 'desc' ? ' ↑' : ' ↓'
                )}
              </button>
            </th>
            <th>
              <button className="sort-header" onClick={() => requestSort('email')}>
                Email
                {sortConfig.key === 'email' && (
                  sortConfig.direction !== 'desc' ? ' ↑' : ' ↓'
                )}
              </button>
            </th>
            <th>
              <button className="sort-header" onClick={() => requestSort('job_title')}>
                Position
                {sortConfig.key === 'job_title' && (
                  sortConfig.direction !== 'desc' ? ' ↑' : ' ↓'
                )}
              </button>
            </th>
            <th>
              <button className="sort-header" onClick={() => requestSort('department.name')}>
                Department
                {sortConfig.key === 'department.name' && (
                  sortConfig.direction !== 'desc' ? ' ↑' : ' ↓'
                )}
              </button>
            </th>
            <th>
              <button className="sort-header" onClick={() => requestSort('hire_date')}>
                Hire Date
                {sortConfig.key === 'hire_date' && (
                  sortConfig.direction !== 'desc' ? ' ↑' : ' ↓'
                )}
              </button>
            </th>
            <th className="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedEmployees.map((employee: any) => (
            <tr key={employee.id} className="employee-row">
              <td className="name-col">
                <span className="employee-name" onClick={() => onViewEmployee(employee.id)}>
                  {employee.first_name} {employee.last_name}
                </span>
              </td>
              <td className="email-col">{employee.email}</td>
              <td className="position-col">{employee.job_title}</td>
              <td className="department-col">
                {employee.department ? employee.department.name : 'N/A'}
              </td>
              <td className="hire-date-col">
                {new Date(employee.hire_date).toLocaleDateString()}
              </td>
              <td className="actions-col">
                <div className="table-action-btns">
                  <button
                    className="btn-icon btn-view"
                    title="View Details"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewEmployee(employee.id);
                    }}
                  >
                    👁️
                  </button>
                  <button
                    className="btn-icon btn-edit"
                    title="Edit Employee"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEmployee(employee.id);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    title="Delete Employee"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEmployee(employee.id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button className="btn-page" disabled>Previous</button>
        <span className="page-info">1 of 1</span>
        <button className="btn-page" disabled>Next</button>
      </div>
    </div>
  );
};

export default EmployeeTable;