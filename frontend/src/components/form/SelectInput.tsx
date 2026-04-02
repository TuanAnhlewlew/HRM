import React from 'react';
import './SelectInput.css';

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, value, onChange, options, required }) => {
  return (
    <div className="form-group">
      <label htmlFor={label.toLowerCase().replace(' ', '-')}>
        {label} {required && '*'}
      </label>
      <select
        id={label.toLowerCase().replace(' ', '-')}
        value={value}
        onChange={onChange}
        required={required}
        className="form-select"
      >
        <option value="">-- Select {label} --</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;