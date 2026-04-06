import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredType?: 'admin' | 'employee';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredType }) => {
  const user = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (requiredType && user.type !== requiredType) {
    // Redirect to the correct page based on their role
    const redirectPath = user.type === 'admin' ? '/home' : '/employee/home';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
