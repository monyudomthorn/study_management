import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage, removeFromStorage, STORAGE_KEYS } from '../utils/localStorage';

const DEFAULT_USER_PROFILE = {
  name: "Vibol Sok",
  role: "Computer Science Student",
  university: "SETEC Institute",
  studentId: "SET-2026-8899",
  telegram: "@vibol_sok",
  year: "Year 3, Semester 2",
  avatarText: "VS"
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Check if user is logged in (has completed first login / profile setup)
  const [currentUser, setCurrentUser] = useState(() => {
    return loadFromStorage(STORAGE_KEYS.USER, null);
  });

  const [isFirstLogin, setIsFirstLogin] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.USER, null);
    return stored === null;
  });

  useEffect(() => {
    if (currentUser) {
      saveToStorage(STORAGE_KEYS.USER, currentUser);
    }
  }, [currentUser]);

  // CRUD Operations for User Profile

  // 1. Create / Register user (First login input)
  const createUser = (userData) => {
    const avatar = userData.name
      ? userData.name
          .split(' ')
          .filter((_, i, arr) => i === 0 || i === arr.length - 1)
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'ST';

    let cleanTelegram = (userData.telegram || '').trim();
    if (cleanTelegram && !cleanTelegram.startsWith('@')) {
      cleanTelegram = `@${cleanTelegram}`;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name.trim(),
      role: (userData.role || 'Management Information System').trim(),
      university: (userData.university || 'SETEC Institute').trim(),
      studentId: (userData.studentId || 'M2425-0384').trim(),
      telegram: cleanTelegram,
      year: (userData.year || 'Year 3').trim(),
      avatarText: avatar,
      createdAt: new Date().toISOString()
    };

    setCurrentUser(newUser);
    saveToStorage(STORAGE_KEYS.USER, newUser);
    setIsFirstLogin(false);
    return newUser;
  };

  // 2. Read user
  const getUser = () => {
    return currentUser || DEFAULT_USER_PROFILE;
  };

  // 3. Update user profile
  const updateUser = (updatedData) => {
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
      : currentUser?.avatarText || 'VS';

    const updated = {
      ...currentUser,
      ...updatedData,
      telegram: cleanTelegram,
      avatarText: avatar,
      updatedAt: new Date().toISOString()
    };

    setCurrentUser(updated);
    saveToStorage(STORAGE_KEYS.USER, updated);
    return updated;
  };

  // 4. Delete user / Logout / Reset user profile (re-triggers first login)
  const deleteUser = () => {
    removeFromStorage(STORAGE_KEYS.USER);
    setCurrentUser(null);
    setIsFirstLogin(true);
  };

  // Quick helper to skip or load sample user profile
  const loadDemoUser = () => {
    return createUser(DEFAULT_USER_PROFILE);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser: currentUser || DEFAULT_USER_PROFILE,
        isLoggedIn: Boolean(currentUser),
        isFirstLogin,
        createUser,
        getUser,
        updateUser,
        deleteUser,
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
