import React, { useState } from 'react';
import './OTRequestForm.css';

interface OTRequestFormProps {
  onClose: () => void;
  onSubmit: (request: {
    date: string;
    hours: number;
    reason: string;
  }) => void;
}

const OTRequestForm: React.FC<OTRequestFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: '',
    hours: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.hours.trim()) newErrors.hours = 'Hours are required';
    else {
      const h = Number(formData.hours);
      if (isNaN(h) || h <= 0) newErrors.hours = 'Hours must be a positive number';
      else if (h > 16) newErrors.hours = 'Hours cannot exceed 16';
      else if (h < 0.5) newErrors.hours = 'Hours must be at least 0.5';
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
    onSubmit({
      date: formData.date,
      hours: Number(formData.hours),
      reason: formData.reason,
    });
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Submit OT Request</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="request-form">
            <div className="form-group">
              <label htmlFor="ot-date">Date *</label>
              <input type="date" id="ot-date" name="date" value={formData.date} onChange={handleChange} />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="ot-hours">Hours *</label>
              <input type="number" id="ot-hours" name="hours" value={formData.hours} onChange={handleChange} min="0.5" step="0.5" />
              {errors.hours && <span className="error-message">{errors.hours}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="ot-reason">Reason *</label>
              <textarea id="ot-reason" name="reason" rows={3} value={formData.reason} onChange={handleChange} />
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

export default OTRequestForm;
