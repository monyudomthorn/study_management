import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { FirstLoginModal } from './components/FirstLoginModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Subjects } from './pages/Subjects';
import { Teachers } from './pages/Teachers';
import { Practice } from './pages/Practice';
import { Assignments } from './pages/Assignments';

export const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <ToastProvider>
      <LanguageProvider>
        <AuthProvider>
          <DataProvider>
            <div className="app-container">
              {/* First Login User Setup Modal */}
              <FirstLoginModal />

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

              {/* Global Toasts */}
              <ToastContainer />
            </div>
          </DataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ToastProvider>
  );
};

export default App;
