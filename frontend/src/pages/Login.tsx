import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextInput from '../components/form/TextInput';
import PasswordInput from '../components/form/PasswordInput';
import SelectInput from '../components/form/SelectInput';
import Button from '../components/form/Button';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation
    if (!username || !password || !userType) {
      setError('Please fill in all fields');
      return;
    }

    // Simulate login (no actual API call)
    // In a real app, you would call the backend API here
    // For now, we'll just redirect to home
    setError('');
    // You can store user info in localStorage or context if needed
    localStorage.setItem('loggedInUser', JSON.stringify({ username, userType }));
    if (userType === 'employee') {
      navigate('/employee/home');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>HRM Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
          />
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
          <SelectInput
            label="User Type"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            required
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'employee', label: 'Employee' },
            ]}
          />
          <Button type="submit" variant="primary">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;