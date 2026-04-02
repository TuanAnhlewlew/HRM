import React from 'react';
import './PasswordInput.css';

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ label, value, onChange, placeholder, required }) => {
  return (
    <div className="form-group">
      <label htmlFor={label.toLowerCase().replace(' ', '-')}>
        {label} {required && '*'}
      </label>
      <input
        id={label.toLowerCase().replace(' ', '-')}
        type="password"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="form-input"
      />
    </div>
  );
};

export default PasswordInput;