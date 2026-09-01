import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';

// Authentication Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

// Application Pages
import { Dashboard } from './pages/Dashboard';
import { Subjects } from './pages/Subjects';
import { Teachers } from './pages/Teachers';
import { Practice } from './pages/Practice';
import { Assignments } from './pages/Assignments';

// Protected Main Layout Component
const MainLayout = () => {
  const { isLoggedIn } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If user is not logged in, redirect to Login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Header onToggleSidebar={toggleSidebar} />

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <ToastProvider>
      <LanguageProvider>
        <AuthProvider>
          <DataProvider>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Main Application */}
              <Route path="/*" element={<MainLayout />} />
            </Routes>

            {/* Global Toasts */}
            <ToastContainer />
          </DataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ToastProvider>
  );
};

export default App;
