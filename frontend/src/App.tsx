import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import EmployeeHome from './pages/EmployeeHome';
import ProtectedRoute from './components/ProtectedRoute';

const AppRouter = () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Login />;
  }

  if (user.type === 'admin') {
    return <Home />;
  }

  return <EmployeeHome />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppRouter />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute requiredType="admin">
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/home"
          element={
            <ProtectedRoute requiredType="employee">
              <EmployeeHome />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;