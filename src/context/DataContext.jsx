import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_SUBJECTS,
  INITIAL_TEACHERS,
  INITIAL_PRACTICES,
  INITIAL_ASSIGNMENTS
} from '../data/initialData';
import {
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS
} from '../utils/localStorage';
import { api } from '../services/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // 1. Subjects State
  const [subjects, setSubjects] = useState(() => {
    return loadFromStorage(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  });

  // 2. Teachers State
  const [teachers, setTeachers] = useState(() => {
    return loadFromStorage(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
  });

  // 3. Practices State
  const [practices, setPractices] = useState(() => {
    return loadFromStorage(STORAGE_KEYS.PRACTICES, INITIAL_PRACTICES);
  });

  // 4. Assignments State
  const [assignments, setAssignments] = useState(() => {
    return loadFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Sync state changes with localStorage as backup
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SUBJECTS, subjects);
  }, [subjects]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TEACHERS, teachers);
  }, [teachers]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PRACTICES, practices);
  }, [practices]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
  }, [assignments]);

  // Initial fetch from Laravel backend
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [teaRes, subRes, pracRes, asgRes] = await Promise.allSettled([
        api.getTeachers(),
        api.getSubjects(),
        api.getPractices(),
        api.getAssignments()
      ]);

      let backendActive = false;

      if (teaRes.status === 'fulfilled' && teaRes.value?.data) {
        setTeachers(teaRes.value.data);
        backendActive = true;
      }
      if (subRes.status === 'fulfilled' && subRes.value?.data) {
        setSubjects(subRes.value.data);
        backendActive = true;
      }
      if (pracRes.status === 'fulfilled' && pracRes.value?.data) {
        setPractices(pracRes.value.data);
        backendActive = true;
      }
      if (asgRes.status === 'fulfilled' && asgRes.value?.data) {
        setAssignments(asgRes.value.data);
        backendActive = true;
      }

      setIsBackendConnected(backendActive);
    } catch (err) {
      console.warn('Backend connection notice:', err.message);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ==========================================
  // SUBJECT CRUD
  // ==========================================
  const addSubject = async (newSubject) => {
    const tempItem = {
      ...newSubject,
      id: `sub-${Date.now()}`,
      progress: Number(newSubject.progress) || 0
    };
    setSubjects((prev) => [tempItem, ...prev]);

    try {
      const res = await api.createSubject({
        name: newSubject.name,
        code: newSubject.code,
        teacher: newSubject.teacher,
        description: newSubject.description || '',
        progress: Number(newSubject.progress) || 0,
        status: newSubject.status || 'In Progress'
      });
      if (res?.data) {
        setSubjects((prev) => prev.map((s) => (s.id === tempItem.id ? res.data : s)));
        return res.data;
      }
    } catch (error) {
      console.warn('Saved subject locally (API notice:', error.message, ')');
    }
    return tempItem;
  };

  const updateSubject = async (id, updatedSubject) => {
    setSubjects((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? { ...sub, ...updatedSubject, progress: Number(updatedSubject.progress) || 0 }
          : sub
      )
    );

    try {
      if (typeof id === 'number' || !String(id).startsWith('sub-')) {
        await api.updateSubject(id, updatedSubject);
      }
    } catch (error) {
      console.warn('Updated subject locally (API notice:', error.message, ')');
    }
  };

  const deleteSubject = async (id) => {
    setSubjects((prev) => prev.filter((sub) => sub.id !== id));

    try {
      if (typeof id === 'number' || !String(id).startsWith('sub-')) {
        await api.deleteSubject(id);
      }
    } catch (error) {
      console.warn('Deleted subject locally (API notice:', error.message, ')');
    }
  };

  // ==========================================
  // TEACHER CRUD
  // ==========================================
  const addTeacher = async (newTeacher) => {
    const tempItem = {
      ...newTeacher,
      id: `tea-${Date.now()}`
    };
    setTeachers((prev) => [tempItem, ...prev]);

    try {
      const res = await api.createTeacher(newTeacher);
      if (res?.data) {
        setTeachers((prev) => prev.map((t) => (t.id === tempItem.id ? res.data : t)));
        return res.data;
      }
    } catch (error) {
      console.warn('Saved teacher locally (API notice:', error.message, ')');
    }
    return tempItem;
  };

  const updateTeacher = async (id, updatedTeacher) => {
    setTeachers((prev) =>
      prev.map((tea) => (tea.id === id ? { ...tea, ...updatedTeacher } : tea))
    );

    try {
      if (typeof id === 'number' || !String(id).startsWith('tea-')) {
        await api.updateTeacher(id, updatedTeacher);
      }
    } catch (error) {
      console.warn('Updated teacher locally (API notice:', error.message, ')');
    }
  };

  const deleteTeacher = async (id) => {
    setTeachers((prev) => prev.filter((tea) => tea.id !== id));

    try {
      if (typeof id === 'number' || !String(id).startsWith('tea-')) {
        await api.deleteTeacher(id);
      }
    } catch (error) {
      console.warn('Deleted teacher locally (API notice:', error.message, ')');
    }
  };

  // ==========================================
  // PRACTICE CRUD
  // ==========================================
  const addPractice = async (newPractice) => {
    const tempItem = {
      ...newPractice,
      id: `prac-${Date.now()}`,
      created_date: newPractice.createdDate || newPractice.created_date || new Date().toISOString().split('T')[0],
      createdDate: newPractice.createdDate || newPractice.created_date || new Date().toISOString().split('T')[0]
    };
    setPractices((prev) => [tempItem, ...prev]);

    try {
      const res = await api.createPractice({
        title: newPractice.title,
        subject: newPractice.subject,
        description: newPractice.description || '',
        created_date: tempItem.created_date,
        status: newPractice.status || 'In Progress'
      });
      if (res?.data) {
        setPractices((prev) => prev.map((p) => (p.id === tempItem.id ? res.data : p)));
        return res.data;
      }
    } catch (error) {
      console.warn('Saved practice locally (API notice:', error.message, ')');
    }
    return tempItem;
  };

  const updatePractice = async (id, updatedPractice) => {
    setPractices((prev) =>
      prev.map((prac) => (prac.id === id ? { ...prac, ...updatedPractice } : prac))
    );

    try {
      if (typeof id === 'number' || !String(id).startsWith('prac-')) {
        await api.updatePractice(id, updatedPractice);
      }
    } catch (error) {
      console.warn('Updated practice locally (API notice:', error.message, ')');
    }
  };

  const deletePractice = async (id) => {
    setPractices((prev) => prev.filter((prac) => prac.id !== id));

    try {
      if (typeof id === 'number' || !String(id).startsWith('prac-')) {
        await api.deletePractice(id);
      }
    } catch (error) {
      console.warn('Deleted practice locally (API notice:', error.message, ')');
    }
  };

  const togglePracticeComplete = async (id) => {
    setPractices((prev) =>
      prev.map((prac) => {
        if (prac.id === id) {
          const nextStatus = prac.status === 'Completed' ? 'In Progress' : 'Completed';
          return { ...prac, status: nextStatus };
        }
        return prac;
      })
    );

    try {
      if (typeof id === 'number' || !String(id).startsWith('prac-')) {
        await api.togglePracticeComplete(id);
      }
    } catch (error) {
      console.warn('Toggled practice locally (API notice:', error.message, ')');
    }
  };

  // ==========================================
  // ASSIGNMENT CRUD
  // ==========================================
  const addAssignment = async (newAssignment) => {
    const tempItem = {
      ...newAssignment,
      id: `asg-${Date.now()}`,
      due_date: newAssignment.dueDate || newAssignment.due_date,
      dueDate: newAssignment.dueDate || newAssignment.due_date
    };
    setAssignments((prev) => [tempItem, ...prev]);

    try {
      const res = await api.createAssignment({
        title: newAssignment.title,
        subject: newAssignment.subject,
        description: newAssignment.description || '',
        due_date: tempItem.due_date,
        priority: newAssignment.priority || 'Medium',
        status: newAssignment.status || 'Pending'
      });
      if (res?.data) {
        setAssignments((prev) => prev.map((a) => (a.id === tempItem.id ? res.data : a)));
        return res.data;
      }
    } catch (error) {
      console.warn('Saved assignment locally (API notice:', error.message, ')');
    }
    return tempItem;
  };

  const updateAssignment = async (id, updatedAssignment) => {
    setAssignments((prev) =>
      prev.map((asg) => (asg.id === id ? { ...asg, ...updatedAssignment } : asg))
    );

    try {
      if (typeof id === 'number' || !String(id).startsWith('asg-')) {
        await api.updateAssignment(id, updatedAssignment);
      }
    } catch (error) {
      console.warn('Updated assignment locally (API notice:', error.message, ')');
    }
  };

  const deleteAssignment = async (id) => {
    setAssignments((prev) => prev.filter((asg) => asg.id !== id));

    try {
      if (typeof id === 'number' || !String(id).startsWith('asg-')) {
        await api.deleteAssignment(id);
      }
    } catch (error) {
      console.warn('Deleted assignment locally (API notice:', error.message, ')');
    }
  };

  const toggleAssignmentComplete = async (id) => {
    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id === id) {
          const nextStatus = asg.status === 'Completed' ? 'Pending' : 'Completed';
          return { ...asg, status: nextStatus };
        }
        return asg;
      })
    );

    try {
      if (typeof id === 'number' || !String(id).startsWith('asg-')) {
        await api.toggleAssignmentComplete(id);
      }
    } catch (error) {
      console.warn('Toggled assignment locally (API notice:', error.message, ')');
    }
  };

  // ==========================================
  // RESET TO DEFAULT DEMO DATA
  // ==========================================
  const resetToDefaultData = async () => {
    try {
      await api.resetToDefaultDatabase();
      await fetchAllData();
    } catch (err) {
      console.warn('Resetting locally (API notice:', err.message, ')');
      setSubjects(INITIAL_SUBJECTS);
      setTeachers(INITIAL_TEACHERS);
      setPractices(INITIAL_PRACTICES);
      setAssignments(INITIAL_ASSIGNMENTS);
    }
  };

  // ==========================================
  // DYNAMIC CALCULATIONS & METRICS
  // ==========================================
  const calculateOverallProgress = () => {
    if (subjects.length === 0 && practices.length === 0 && assignments.length === 0) {
      return 0;
    }

    let subjectAvg = 0;
    if (subjects.length > 0) {
      const totalProgress = subjects.reduce((sum, s) => sum + (Number(s.progress) || 0), 0);
      subjectAvg = totalProgress / subjects.length;
    }

    let practiceRate = 0;
    if (practices.length > 0) {
      const completedPractices = practices.filter((p) => p.status === 'Completed').length;
      practiceRate = (completedPractices / practices.length) * 100;
    }

    let assignmentRate = 0;
    if (assignments.length > 0) {
      const completedAssignments = assignments.filter((a) => a.status === 'Completed').length;
      assignmentRate = (completedAssignments / assignments.length) * 100;
    }

    const overall = Math.round(subjectAvg * 0.4 + practiceRate * 0.3 + assignmentRate * 0.3);
    return Math.min(100, Math.max(0, overall));
  };

  return (
    <DataContext.Provider
      value={{
        // State
        subjects,
        teachers,
        practices,
        assignments,
        isLoading,
        isBackendConnected,
        // Refetch
        fetchAllData,
        // Subject Operations
        addSubject,
        updateSubject,
        deleteSubject,
        // Teacher Operations
        addTeacher,
        updateTeacher,
        deleteTeacher,
        // Practice Operations
        addPractice,
        updatePractice,
        deletePractice,
        togglePracticeComplete,
        // Assignment Operations
        addAssignment,
        updateAssignment,
        deleteAssignment,
        toggleAssignmentComplete,
        // Utility
        resetToDefaultData,
        calculateOverallProgress
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
