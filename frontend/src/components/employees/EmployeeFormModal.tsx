import React, { useState } from 'react';
import './EmployeeFormModal.css';

interface EmployeeFormModalProps {
  mode: 'create' | 'edit';
  employee: any | null;
  departments: Array<any>;
  managers: Array<any>;
  onClose: () => void;
  onSubmit: (employeeData: any) => void;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  mode,
  employee,
  departments,
  managers,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    hire_date: '',
    job_title: '',
    department_id: '',
    manager_id: '',
    salary: '',
    gender: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Initialize form with employee data if editing
  React.useEffect(() => {
    if (mode === 'edit' && employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone_number: employee.phone_number || '',
        hire_date: employee.hire_date ?
          new Date(employee.hire_date).toISOString().split('T')[0] : '',
        job_title: employee.job_title || '',
        department_id: employee.department_id?.toString() || '',
        manager_id: employee.manager_id?.toString() || '',
        salary: employee.salary?.toString() || '',
        gender: employee.gender || ''
      });
    }
  }, [mode, employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }

    if (!formData.hire_date) {
      newErrors.hire_date = 'Hire date is required';
    }

    if (!formData.job_title.trim()) {
      newErrors.job_title = 'Job title is required';
    }

    if (!formData.department_id) {
      newErrors.department_id = 'Department is required';
    }

    if (formData.salary && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Salary must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true);
      try {
        // Prepare data for submission
        const submitData = {
          ...formData,
          department_id: formData.department_id || null,
          manager_id: formData.manager_id || null,
          salary: formData.salary ? parseFloat(formData.salary) : null
        };

        // Call submit callback
        await onSubmit(submitData);
        setLoading(false);
        onClose();
      } catch (error) {
        setLoading(false);
        console.error('Form submission error:', error);
        // In a real app, you'd show an error message to the user
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create' ? 'Add New Employee' : 'Edit Employee'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="employee-form">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className={errors.first_name ? 'error' : ''}
              />
              {errors.first_name && (
                <span className="error-message">{errors.first_name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className={errors.last_name ? 'error' : ''}
              />
              {errors.last_name && (
                <span className="error-message">{errors.last_name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={errors.phone_number ? 'error' : ''}
              />
              {errors.phone_number && (
                <span className="error-message">{errors.phone_number}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="hire_date">Hire Date *</label>
              <input
                type="date"
                id="hire_date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                required
                className={errors.hire_date ? 'error' : ''}
              />
              {errors.hire_date && (
                <span className="error-message">{errors.hire_date}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="job_title">Job Title *</label>
              <input
                type="text"
                id="job_title"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                required
                className={errors.job_title ? 'error' : ''}
              />
              {errors.job_title && (
                <span className="error-message">{errors.job_title}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="department_id">Department *</label>
              <select
                id="department_id"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                required
                className={errors.department_id ? 'error' : ''}
              >
                <option value="">Select Department</option>
                {departments.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <span className="error-message">{errors.department_id}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="manager_id">Reports To</label>
              <select
                id="manager_id"
                name="manager_id"
                value={formData.manager_id}
                onChange={handleChange}
                className={errors.manager_id ? 'error' : ''}
              >
                <option value="">No Manager (Individual Contributor)</option>
                {managers
                  .filter((mgr: any) => mgr.id !== employee?.id)
                  .map((mgr: any) => (
                    <option key={mgr.id} value={mgr.id}>
                      {mgr.first_name} {mgr.last_name}{mgr.job_title ? ` — ${mgr.job_title}` : ''}
                    </option>
                  ))}
              </select>
              <p className="form-helper">Select the employee who manages this person.</p>
              {errors.manager_id && (
                <span className="error-message">{errors.manager_id}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="salary">Salary ($)</label>
              <input
                type="number"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className={errors.salary ? 'error' : ''}
                min="0"
                step="0.01"
              />
              {errors.salary && (
                <span className="error-message">{errors.salary}</span>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (mode === 'create' ? 'Create Employee' : 'Update Employee')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFormModal;