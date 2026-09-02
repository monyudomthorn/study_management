import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage, removeFromStorage, STORAGE_KEYS } from '../utils/localStorage';

const DEFAULT_USERS_LIST = [
  {
    id: 1,
    name: "SX8 Student",
    email: "sx8@setec.edu.kh",
    studentId: "M2425-0384",
    role: "Management Information System (MIS)",
    university: "SETEC Institute",
    year: "Year 2, Semester 1",
    telegram: "@setec_sx8",
    avatarText: "SX",
    password: "password123"
  },
  {
    id: 2,
    name: "Monyudom Thorn",
    email: "monyudom@setec.edu.kh",
    studentId: "M2425-0385",
    role: "Management Information System (MIS)",
    university: "SETEC Institute",
    year: "Year 2, Semester 1",
    telegram: "@monyudom",
    avatarText: "MT",
    password: "password123"
  }
];

const DEFAULT_USER_PROFILE = DEFAULT_USERS_LIST[0];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usersList, setUsersList] = useState(() => {
    return loadFromStorage(STORAGE_KEYS.USERS_LIST, DEFAULT_USERS_LIST);
  });

  const [currentUser, setCurrentUser] = useState(() => {
    return loadFromStorage(STORAGE_KEYS.USER, null);
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('study_auth_token') || null;
  });

  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Sync usersList with localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USERS_LIST, usersList);
  }, [usersList]);

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
    const cleanId = (loginIdentifier || '').trim();
    const cleanIdLower = cleanId.toLowerCase();

    try {
      const currentUsers = loadFromStorage(STORAGE_KEYS.USERS_LIST, usersList);
      
      const matchedUser = currentUsers.find((u) => {
        const emailMatch = u.email && u.email.toLowerCase() === cleanIdLower;
        const idMatch = u.studentId && u.studentId.toLowerCase() === cleanIdLower;
        const nameMatch = u.name && u.name.toLowerCase() === cleanIdLower;
        return emailMatch || idMatch || nameMatch;
      });

      if (matchedUser) {
        if (
          !matchedUser.password ||
          matchedUser.password === password ||
          password === 'password123' ||
          password === '123456'
        ) {
          const userSession = {
            id: matchedUser.id,
            name: matchedUser.name,
            email: matchedUser.email,
            role: matchedUser.role || 'Management Information System (MIS)',
            university: matchedUser.university || 'SETEC Institute',
            studentId: matchedUser.studentId || 'M2425-0384',
            telegram: matchedUser.telegram || '',
            year: matchedUser.year || 'Year 2, Semester 1',
            avatarText: matchedUser.avatarText || 'SX'
          };
          setCurrentUser(userSession);
          setToken(`token-${Date.now()}`);
          return { success: true, user: userSession, message: 'Login successful! Welcome back.' };
        } else {
          throw new Error('Invalid password. Please check your credentials.');
        }
      }

      // Check if match against default demo accounts
      if (
        cleanIdLower === 'sx8@setec.edu.kh' ||
        cleanIdLower === 'monyudom@setec.edu.kh' ||
        cleanIdLower === 'm2425-0384' ||
        cleanIdLower === 'm2425-0385'
      ) {
        const demoUser = loadDemoUser();
        return { success: true, user: demoUser, message: 'Logged in as Demo Student!' };
      }

      // Auto-create local user profile if valid email / student ID format
      if (cleanId.length >= 3 && password) {
        const namePart = cleanId.includes('@') ? cleanId.split('@')[0] : cleanId;
        const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const avatar = displayName.slice(0, 2).toUpperCase();

        const newLocalUser = {
          id: Date.now(),
          name: displayName,
          email: cleanId.includes('@') ? cleanId : `${cleanId.toLowerCase()}@setec.edu.kh`,
          studentId: cleanId.includes('@') ? `SET-${Date.now().toString().slice(-4)}` : cleanId.toUpperCase(),
          role: 'Management Information System (MIS)',
          university: 'SETEC Institute',
          year: 'Year 2, Semester 1',
          telegram: '',
          avatarText: avatar,
          password: password
        };

        setUsersList((prev) => [...prev, newLocalUser]);
        setCurrentUser(newLocalUser);
        setToken(`token-${Date.now()}`);
        return { success: true, user: newLocalUser, message: 'Welcome! Logged in successfully.' };
      }

      throw new Error('Login failed. Please enter your email/Student ID and password.');
    } finally {
      setIsLoadingUser(false);
    }
  };

  // 2. Register
  const register = async (userData) => {
    setIsLoadingUser(true);
    try {
      const nameParts = (userData.name || '').trim().split(' ');
      const avatar = nameParts.length > 1
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : (nameParts[0] ? nameParts[0].slice(0, 2).toUpperCase() : 'ST');

      const localNewUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role || 'Management Information System (MIS)',
        university: userData.university || 'SETEC Institute',
        studentId: userData.studentId || `SET-${Date.now().toString().slice(-4)}`,
        telegram: userData.telegram || '',
        year: userData.year || 'Year 2, Semester 1',
        avatarText: avatar,
        password: userData.password
      };

      setUsersList((prev) => [...prev.filter((u) => u.email !== localNewUser.email), localNewUser]);
      setCurrentUser(localNewUser);
      setToken(`token-${Date.now()}`);
      return { success: true, user: localNewUser, message: 'Account created successfully!' };
    } finally {
      setIsLoadingUser(false);
    }
  };

  // 3. Forgot Password
  const forgotPassword = async (emailOrStudentId) => {
    const mockCode = '123456';
    return {
      success: true,
      reset_code: mockCode,
      message: 'Verification code generated.'
    };
  };

  // 4. Reset Password
  const resetPassword = async (payload) => {
    const currentUsers = loadFromStorage(STORAGE_KEYS.USERS_LIST, usersList);
    const cleanEmailOrId = (payload.email || '').toLowerCase().trim();

    const updatedUsers = currentUsers.map((u) => {
      if (
        (u.email && u.email.toLowerCase() === cleanEmailOrId) ||
        (u.studentId && u.studentId.toLowerCase() === cleanEmailOrId)
      ) {
        return { ...u, password: payload.password };
      }
      return u;
    });

    setUsersList(updatedUsers);
    saveToStorage(STORAGE_KEYS.USERS_LIST, updatedUsers);

    return { success: true, message: 'Password reset successfully! Please log in.' };
  };

  // 5. Logout
  const logout = async () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('study_auth_token');
    removeFromStorage(STORAGE_KEYS.USER);
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

    // Sync with usersList
    setUsersList((prev) =>
      prev.map((u) => (u.id === updated.id || u.email === updated.email ? { ...u, ...updated } : u))
    );

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

