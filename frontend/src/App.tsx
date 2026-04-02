import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import EmployeeHome from './pages/EmployeeHome';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/employee/home" element={<EmployeeHome />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;