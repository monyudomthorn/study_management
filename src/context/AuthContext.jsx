import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadFromStorage, saveToStorage, removeFromStorage, STORAGE_KEYS } from '../utils/localStorage';
import { api } from '../services/api';

const DEFAULT_USER_PROFILE = {
  name: "SX8 Student",
  role: "MIS Student",
  university: "SETEC Institute",
  studentId: "M2425-0384",
  telegram: "@setec_sx8",
  year: "Year 2, Semester 1",
  avatarText: "SX",
  email: "sx8@setec.edu.kh"
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    return loadFromStorage(STORAGE_KEYS.USER, null);
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('study_auth_token') || null;
  });

  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Sync current user with localStorage
  useEffect(() => {
    if (currentUser) {
      saveToStorage(STORAGE_KEYS.USER, currentUser);
    } else {
      removeFromStorage(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('study_auth_token', token);
    } else {
      localStorage.removeItem('study_auth_token');
    }
  }, [token]);

  // 1. Login
  const login = async (loginIdentifier, password) => {
    setIsLoadingUser(true);
    try {
      const res = await api.login({
        login: loginIdentifier,
        password: password
      });

      if (res?.success && res?.data) {
        const u = res.data;
        const normalizedUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role || 'MIS Student',
          university: u.university || 'SETEC Institute',
          studentId: u.student_id || u.studentId || 'M2425-0384',
          telegram: u.telegram || '',
          year: u.year || 'Year 2, Semester 1',
          avatarText: u.avatar_text || u.avatarText || 'SX'
        };

        setCurrentUser(normalizedUser);
        if (res.token) setToken(res.token);
        return { success: true, user: normalizedUser, message: res.message };
      }
      throw new Error(res?.message || 'Login failed');
    } catch (error) {
      // Fallback for demo login if offline/local
      if (
        (loginIdentifier === 'sx8@setec.edu.kh' || loginIdentifier === 'monyudom@setec.edu.kh') &&
        (password === 'password123' || password === '123456')
      ) {
        const demoUser = loadDemoUser();
        return { success: true, user: demoUser, message: 'Logged in as Demo Student!' };
      }
      throw error;
    } finally {
      setIsLoadingUser(false);
    }
  };

  // 2. Register
  const register = async (userData) => {
    setIsLoadingUser(true);
    try {
      const res = await api.register(userData);
      if (res?.success && res?.data) {
        const u = res.data;
        const normalizedUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role || 'MIS Student',
          university: u.university || 'SETEC Institute',
          studentId: u.student_id || u.studentId || userData.studentId || 'M2425-0384',
          telegram: u.telegram || userData.telegram || '',
          year: u.year || userData.year || 'Year 2, Semester 1',
          avatarText: u.avatar_text || u.avatarText || 'SX'
        };

        setCurrentUser(normalizedUser);
        if (res.token) setToken(res.token);
        return { success: true, user: normalizedUser, message: res.message };
      }
      throw new Error(res?.message || 'Registration failed');
    } catch (error) {
      // Fallback offline registration
      const nameParts = (userData.name || '').trim().split(' ');
      const avatar = nameParts.length > 1
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : (nameParts[0] ? nameParts[0].slice(0, 2).toUpperCase() : 'ST');

      const localNewUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role || 'MIS Student',
        university: userData.university || 'SETEC Institute',
        studentId: userData.studentId || `SET-${Date.now().toString().slice(-4)}`,
        telegram: userData.telegram || '',
        year: userData.year || 'Year 2, Semester 1',
        avatarText: avatar
      };
      setCurrentUser(localNewUser);
      setToken(`token-${Date.now()}`);
      return { success: true, user: localNewUser, message: 'Registration saved!' };
    } finally {
      setIsLoadingUser(false);
    }
  };

  // 3. Forgot Password
  const forgotPassword = async (emailOrStudentId) => {
    try {
      return await api.forgotPassword(emailOrStudentId);
    } catch (error) {
      // Offline fallback: generate mock 6-digit code
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      return {
        success: true,
        reset_code: mockCode,
        message: 'Verification code generated for testing.'
      };
    }
  };

  // 4. Reset Password
  const resetPassword = async (payload) => {
    try {
      return await api.resetPassword(payload);
    } catch (error) {
      if (payload.code === '123456' || payload.code) {
        return { success: true, message: 'Password reset successfully!' };
      }
      throw error;
    }
  };

  // 5. Logout
  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      setCurrentUser(null);
      setToken(null);
      localStorage.removeItem('study_auth_token');
      removeFromStorage(STORAGE_KEYS.USER);
    }
  };

  // 6. Update user profile
  const updateUser = async (updatedData) => {
    let cleanTelegram = (updatedData.telegram || '').trim();
    if (cleanTelegram && !cleanTelegram.startsWith('@')) {
      cleanTelegram = `@${cleanTelegram}`;
    }

    const avatar = updatedData.name
      ? updatedData.name
        .split(' ')
        .filter((_, i, arr) => i === 0 || i === arr.length - 1)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
      : currentUser?.avatarText || 'SX';

    const updated = {
      ...currentUser,
      ...updatedData,
      telegram: cleanTelegram,
      avatarText: avatar,
      updatedAt: new Date().toISOString()
    };

    setCurrentUser(updated);

    try {
      await api.updateUserProfile({
        name: updated.name,
        role: updated.role,
        university: updated.university,
        student_id: updated.studentId,
        telegram: updated.telegram,
        year: updated.year,
        avatar_text: updated.avatarText,
        email: updated.email
      });
    } catch (err) {
      console.warn('Updated profile locally (API notice:', err.message, ')');
    }

    return updated;
  };

  const getUser = () => {
    return currentUser || DEFAULT_USER_PROFILE;
  };

  const loadDemoUser = () => {
    setCurrentUser(DEFAULT_USER_PROFILE);
    setToken('demo-token-123');
    return DEFAULT_USER_PROFILE;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: Boolean(currentUser),
        isLoadingUser,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        getUser,
        updateUser,
        loadDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
