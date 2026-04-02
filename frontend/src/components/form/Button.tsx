import React from 'react';
import './Button.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'submit' | 'button' | 'reset';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, type = 'button', variant = 'primary', disabled }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};

export default Button;