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
    const stored = loadFromStorage(STORAGE_KEYS.SUBJECTS, null);
    return stored !== null ? stored : INITIAL_SUBJECTS;
  });

  // 2. Teachers State
  const [teachers, setTeachers] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.TEACHERS, null);
    return stored !== null ? stored : INITIAL_TEACHERS;
  });

  // 3. Practices State
  const [practices, setPractices] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.PRACTICES, null);
    return stored !== null ? stored : INITIAL_PRACTICES;
  });

  // 4. Assignments State
  const [assignments, setAssignments] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.ASSIGNMENTS, null);
    return stored !== null ? stored : INITIAL_ASSIGNMENTS;
  });

  const [isLoading, setIsLoading] = useState(false);

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

  // Refresh / Reload from localStorage
  const fetchAllData = () => {
    setIsLoading(true);
    setSubjects(loadFromStorage(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS));
    setTeachers(loadFromStorage(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS));
    setPractices(loadFromStorage(STORAGE_KEYS.PRACTICES, INITIAL_PRACTICES));
    setAssignments(loadFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS));
    setIsLoading(false);
  };

  // ==========================================
  // SUBJECT CRUD
  // ==========================================
  const addSubject = (newSubject) => {
    const newItem = {
      ...newSubject,
      id: Date.now(),
      progress: Number(newSubject.progress) || 0,
      status: newSubject.status || 'In Progress'
    };
    setSubjects((prev) => [newItem, ...prev]);
    return newItem;
  };

  const addSubjectsBatch = (newSubjectsList, replace = false) => {
    const formatted = newSubjectsList.map((s, idx) => {
      let progress = Number(s.progress);
      if (isNaN(progress)) progress = 0;
      progress = Math.min(100, Math.max(0, progress));

      let status = s.status || (progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started');

      return {
        id: Date.now() + idx,
        name: s.name || 'Untitled Subject',
        code: s.code || `SUB-${String(idx + 1).padStart(3, '0')}`,
        teacher: s.teacher || 'Assigned Instructor',
        progress: progress,
        status: status,
        description: s.description || ''
      };
    });

    if (replace) {
      setSubjects(formatted);
    } else {
      setSubjects((prev) => [...formatted, ...prev]);
    }
    return formatted;
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
    const nameParts = (newTeacher.name || '').trim().split(' ');
    const avatar = nameParts.length > 1
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : (nameParts[0] ? nameParts[0].slice(0, 2).toUpperCase() : 'TC');

    const newItem = {
      ...newTeacher,
      id: Date.now(),
      avatar: newTeacher.avatar || avatar
    };
    setTeachers((prev) => [newItem, ...prev]);
    return newItem;
  };

  const addTeachersBatch = (newTeachersList, replace = false) => {
    const formatted = newTeachersList.map((t, idx) => {
      const nameParts = (t.name || '').trim().split(' ');
      const avatar = nameParts.length > 1
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : (nameParts[0] ? nameParts[0].slice(0, 2).toUpperCase() : 'TC');

      let cleanTelegram = (t.telegram || '').trim();
      if (cleanTelegram && !cleanTelegram.startsWith('@')) {
        cleanTelegram = `@${cleanTelegram}`;
      }

      return {
        id: Date.now() + idx,
        name: t.name || 'Unknown Teacher',
        subject: t.subject || 'General Subject',
        telegram: cleanTelegram,
        description: t.description || '',
        avatar: t.avatar || avatar
      };
    });

    if (replace) {
      setTeachers(formatted);
    } else {
      setTeachers((prev) => [...formatted, ...prev]);
    }
    return formatted;
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
    const today = new Date().toISOString().split('T')[0];
    const newItem = {
      ...newPractice,
      id: Date.now(),
      created_date: newPractice.createdDate || newPractice.created_date || today,
      createdDate: newPractice.createdDate || newPractice.created_date || today,
      status: newPractice.status || 'In Progress'
    };
    setPractices((prev) => [newItem, ...prev]);
    return newItem;
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
    const newItem = {
      ...newAssignment,
      id: Date.now(),
      due_date: newAssignment.dueDate || newAssignment.due_date,
      dueDate: newAssignment.dueDate || newAssignment.due_date,
      priority: newAssignment.priority || 'Medium',
      status: newAssignment.status || 'Pending'
    };
    setAssignments((prev) => [newItem, ...prev]);
    return newItem;
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
  // RESET TO DEFAULT DATA
  // ==========================================
  const resetToDefaultData = () => {
    setSubjects(INITIAL_SUBJECTS);
    setTeachers(INITIAL_TEACHERS);
    setPractices(INITIAL_PRACTICES);
    setAssignments(INITIAL_ASSIGNMENTS);
    saveToStorage(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    saveToStorage(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    saveToStorage(STORAGE_KEYS.PRACTICES, INITIAL_PRACTICES);
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  };

  // ==========================================
  // EXPORT / IMPORT LOCAL STORAGE JSON
  // ==========================================
  const exportDataAsJSON = () => {
    const data = {
      subjects,
      teachers,
      practices,
      assignments,
      exportedAt: new Date().toISOString()
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `study_management_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
        isBackendConnected: false,
        // Refetch
        fetchAllData,
        // Subject Operations
        addSubject,
        addSubjectsBatch,
        updateSubject,
        deleteSubject,
        // Teacher Operations
        addTeacher,
        addTeachersBatch,
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
        exportDataAsJSON,
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

