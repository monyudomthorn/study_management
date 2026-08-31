import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Sync state changes with localStorage
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

  // ==========================================
  // SUBJECT CRUD
  // ==========================================
  const addSubject = (newSubject) => {
    const item = {
      ...newSubject,
      id: `sub-${Date.now()}`,
      progress: Number(newSubject.progress) || 0
    };
    setSubjects((prev) => [item, ...prev]);
    return item;
  };

  const updateSubject = (id, updatedSubject) => {
    setSubjects((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? { ...sub, ...updatedSubject, progress: Number(updatedSubject.progress) || 0 }
          : sub
      )
    );
  };

  const deleteSubject = (id) => {
    setSubjects((prev) => prev.filter((sub) => sub.id !== id));
  };

  // ==========================================
  // TEACHER CRUD
  // ==========================================
  const addTeacher = (newTeacher) => {
    const item = {
      ...newTeacher,
      id: `tea-${Date.now()}`
    };
    setTeachers((prev) => [item, ...prev]);
    return item;
  };

  const updateTeacher = (id, updatedTeacher) => {
    setTeachers((prev) =>
      prev.map((tea) => (tea.id === id ? { ...tea, ...updatedTeacher } : tea))
    );
  };

  const deleteTeacher = (id) => {
    setTeachers((prev) => prev.filter((tea) => tea.id !== id));
  };

  // ==========================================
  // PRACTICE CRUD
  // ==========================================
  const addPractice = (newPractice) => {
    const item = {
      ...newPractice,
      id: `prac-${Date.now()}`,
      createdDate: newPractice.createdDate || new Date().toISOString().split('T')[0]
    };
    setPractices((prev) => [item, ...prev]);
    return item;
  };

  const updatePractice = (id, updatedPractice) => {
    setPractices((prev) =>
      prev.map((prac) => (prac.id === id ? { ...prac, ...updatedPractice } : prac))
    );
  };

  const deletePractice = (id) => {
    setPractices((prev) => prev.filter((prac) => prac.id !== id));
  };

  const togglePracticeComplete = (id) => {
    setPractices((prev) =>
      prev.map((prac) => {
        if (prac.id === id) {
          const nextStatus = prac.status === 'Completed' ? 'In Progress' : 'Completed';
          return { ...prac, status: nextStatus };
        }
        return prac;
      })
    );
  };

  // ==========================================
  // ASSIGNMENT CRUD
  // ==========================================
  const addAssignment = (newAssignment) => {
    const item = {
      ...newAssignment,
      id: `asg-${Date.now()}`
    };
    setAssignments((prev) => [item, ...prev]);
    return item;
  };

  const updateAssignment = (id, updatedAssignment) => {
    setAssignments((prev) =>
      prev.map((asg) => (asg.id === id ? { ...asg, ...updatedAssignment } : asg))
    );
  };

  const deleteAssignment = (id) => {
    setAssignments((prev) => prev.filter((asg) => asg.id !== id));
  };

  const toggleAssignmentComplete = (id) => {
    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id === id) {
          const nextStatus = asg.status === 'Completed' ? 'Pending' : 'Completed';
          return { ...asg, status: nextStatus };
        }
        return asg;
      })
    );
  };

  // ==========================================
  // RESET TO DEFAULT DEMO DATA
  // ==========================================
  const resetToDefaultData = () => {
    setSubjects(INITIAL_SUBJECTS);
    setTeachers(INITIAL_TEACHERS);
    setPractices(INITIAL_PRACTICES);
    setAssignments(INITIAL_ASSIGNMENTS);
  };

  // ==========================================
  // DYNAMIC CALCULATIONS & METRICS
  // ==========================================
  // Calculate dynamic overall study progress
  const calculateOverallProgress = () => {
    if (subjects.length === 0 && practices.length === 0 && assignments.length === 0) {
      return 0;
    }

    // Weight: Subjects (40%), Practice Tasks (30%), Assignments (30%)
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

    // Weighted formula:
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
