import React, { useState } from 'react';
import TextInput from '../components/form/TextInput';
import PasswordInput from '../components/form/PasswordInput';
import Button from '../components/form/Button';
import { api } from '../api';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const endpoint = userType === 'admin' ? '/login/admin' : '/login/employee';
      const body = userType === 'admin'
        ? { username, password }
        : { email: username, password };

      const data = await api(endpoint, { method: 'POST', body: JSON.stringify(body) });

      localStorage.setItem('token', data.token);
      localStorage.setItem('loggedInUser', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>HRM Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="user-type-radio">
            <input
              type="radio"
              name="userType"
              value="employee"
              checked={userType === 'employee'}
              onChange={(e) => {
                setUserType(e.target.value);
                setUsername('');
              }}
            />
            Employee
          </label>
          <label className="user-type-radio">
            <input
              type="radio"
              name="userType"
              value="admin"
              checked={userType === 'admin'}
              onChange={(e) => {
                setUserType(e.target.value);
                setUsername('');
              }}
            />
            Admin
          </label>
          <TextInput
            label={userType === 'employee' ? 'Email' : 'Username'}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder={userType === 'employee' ? 'Enter your email' : 'Enter your username'}
          />
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;