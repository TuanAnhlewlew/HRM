import React, { useState } from 'react';
import { eachDayOfInterval, isBefore, startOfDay } from 'date-fns';
import './PTORequestForm.css';

interface PTORequestFormProps {
  onClose: () => void;
  onSubmit: (request: {
    type: 'PTO' | 'Sick' | 'Personal';
    startDate: string;
    endDate: string;
    reason: string;
  }) => void;
}

const PTORequestForm: React.FC<PTORequestFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'PTO',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const computedDays = (() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = startOfDay(new Date(formData.startDate));
    const end = startOfDay(new Date(formData.endDate));
    if (isBefore(end, start)) return 0;
    return eachDayOfInterval({ start, end }).filter(
      d => d.getDay() !== 0 && d.getDay() !== 6
    ).length;
  })();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate) {
      const start = startOfDay(new Date(formData.startDate));
      const end = startOfDay(new Date(formData.endDate));
      if (isBefore(end, start)) newErrors.endDate = 'End date must be on or after start date';
    }
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    else if (formData.reason.trim().length < 5) newErrors.reason = 'Reason must be at least 5 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Submit PTO Request</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="request-form">
            <div className="form-group">
              <label htmlFor="pto-type">Type *</label>
              <select id="pto-type" name="type" value={formData.type} onChange={handleChange}>
                <option value="PTO">PTO</option>
                <option value="Sick">Sick</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="start-date">Start Date *</label>
              <input type="date" id="start-date" name="startDate" value={formData.startDate} onChange={handleChange} />
              {errors.startDate && <span className="error-message">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="end-date">End Date *</label>
              <input type="date" id="end-date" name="endDate" value={formData.endDate} onChange={handleChange} />
              {errors.endDate && <span className="error-message">{errors.endDate}</span>}
            </div>

            {computedDays > 0 && (
              <div className="days-hint">{computedDays} weekday{computedDays !== 1 ? 's' : ''} requested</div>
            )}

            <div className="form-group">
              <label htmlFor="reason">Reason *</label>
              <textarea id="reason" name="reason" rows={3} value={formData.reason} onChange={handleChange} />
              {errors.reason && <span className="error-message">{errors.reason}</span>}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PTORequestForm;
