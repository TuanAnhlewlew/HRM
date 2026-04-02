import React from 'react';
import './TextInput.css';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder, required }) => {
  return (
    <div className="form-group">
      <label htmlFor={label.toLowerCase().replace(' ', '-')}>
        {label} {required && '*'}
      </label>
      <input
        id={label.toLowerCase().replace(' ', '-')}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="form-input"
      />
    </div>
  );
};

export default TextInput;