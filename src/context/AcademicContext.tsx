import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  AcademicState,
  Course,
  Task,
  StudySession,
  UserAcademicProfile,
  GRADE_POINTS_STANDARD,
} from '../types/academic';
import { INITIAL_ACADEMIC_DATA } from '../data/sampleAcademicData';

export type ActiveView = 'dashboard' | 'tasks' | 'courses' | 'schedule' | 'gpa' | 'timer';
export type TimerMode = 'pomodoro' | 'short_break' | 'long_break' | 'deep_work';

const TIMER_DURATIONS: Record<TimerMode, number> = {
  pomodoro: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
  deep_work: 50 * 60,
};

interface TimerState {
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  activeCourseId?: string;
  activeTaskId?: string;
  sessionsCompletedToday: number;
}

interface AcademicContextType {
  state: AcademicState;
  theme: 'light' | 'dark';
  activeView: ActiveView;
  searchQuery: string;
  timerState: TimerState;
  toggleTheme: () => void;
  setActiveView: (view: ActiveView) => void;
  setSearchQuery: (q: string) => void;
  updateProfile: (profile: Partial<UserAcademicProfile>) => void;
  // Course actions
  addCourse: (course: Omit<Course, 'id'>) => string;
  updateCourse: (course: Course) => void;
  deleteCourse: (courseId: string) => void;
  // Task actions
  addTask: (task: Omit<Task, 'id'>) => string;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskStatus: (taskId: string) => void;
  toggleCheckItem: (taskId: string, checkItemId: string) => void;
  // Timer actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  switchTimerMode: (mode: TimerMode) => void;
  setTimerBinding: (courseId?: string, taskId?: string) => void;
  // GPA calculations
  semesterGpa: number | null;
  cumulativeGpa: number | null;
  totalCredits: number;
  gradedCredits: number;
  // Data actions
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
  resetToSampleData: () => void;
  clearAllData: () => void;
}

const STORAGE_KEY = 'scholar_academic_v2';
const THEME_KEY = 'scholar_theme';

const AcademicContext = createContext<AcademicContextType | null>(null);

// Web Audio synthesizer chime for zero-dependency study notifications
const playChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Soft two-tone chime (E5 -> G#5)
    playTone(659.25, 0, 0.4);
    playTone(830.61, 0.25, 0.6);
  } catch (e) {
    console.warn('Audio chime unsupported or blocked:', e);
  }
};

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load State
  const [state, setState] = useState<AcademicState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.courses) && Array.isArray(parsed.tasks)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored academic data:', e);
    }
    return INITIAL_ACADEMIC_DATA;
  });

  // Load Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Study Timer State
  const [timerState, setTimerState] = useState<TimerState>({
    mode: 'pomodoro',
    remainingSeconds: TIMER_DURATIONS.pomodoro,
    totalSeconds: TIMER_DURATIONS.pomodoro,
    isRunning: false,
    activeCourseId: 'course-cs3110',
    activeTaskId: 'task-1',
    sessionsCompletedToday: 2,
  });

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [state]);

  // Sync theme
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Timer Tick Mechanism
  useEffect(() => {
    if (timerState.isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerState(prev => {
          if (prev.remainingSeconds <= 1) {
            playChime();
            const wasWorkSession = prev.mode === 'pomodoro' || prev.mode === 'deep_work';
            const nextMode: TimerMode = wasWorkSession ? 'short_break' : 'pomodoro';
            const nextDuration = TIMER_DURATIONS[nextMode];

            // If work session completed, record study session
            if (wasWorkSession) {
              const minutesSpent = Math.round(prev.totalSeconds / 60);
              const newSession: StudySession = {
                id: 'session-' + Date.now(),
                courseId: prev.activeCourseId,
                taskId: prev.activeTaskId,
                durationMinutes: minutesSpent,
                timestamp: new Date().toISOString(),
                mode: prev.mode === 'deep_work' ? 'deep_work' : 'pomodoro',
              };
              setState(curr => ({
                ...curr,
                studySessions: [newSession, ...curr.studySessions],
              }));
            }

            return {
              ...prev,
              isRunning: false,
              mode: nextMode,
              remainingSeconds: nextDuration,
              totalSeconds: nextDuration,
              sessionsCompletedToday: wasWorkSession
                ? prev.sessionsCompletedToday + 1
                : prev.sessionsCompletedToday,
            };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerState.isRunning]);

  const startTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resetTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      remainingSeconds: prev.totalSeconds,
    }));
  }, []);

  const switchTimerMode = useCallback((mode: TimerMode) => {
    const duration = TIMER_DURATIONS[mode];
    setTimerState(prev => ({
      ...prev,
      mode,
      remainingSeconds: duration,
      totalSeconds: duration,
      isRunning: false,
    }));
  }, []);

  const setTimerBinding = useCallback((courseId?: string, taskId?: string) => {
    setTimerState(prev => ({
      ...prev,
      activeCourseId: courseId,
      activeTaskId: taskId,
    }));
  }, []);

  // Profile actions
  const updateProfile = useCallback((updates: Partial<UserAcademicProfile>) => {
    setState(prev => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
  }, []);

  // Course actions
  const addCourse = useCallback((courseData: Omit<Course, 'id'>): string => {
    const newId = 'course-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newCourse: Course = { ...courseData, id: newId };
    setState(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse],
    }));
    return newId;
  }, []);

  const updateCourse = useCallback((updated: Course) => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.map(c => (c.id === updated.id ? updated : c)),
    }));
  }, []);

  const deleteCourse = useCallback((courseId: string) => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== courseId),
      // Clean up course assignment from tasks or remove
      tasks: prev.tasks.map(t => (t.courseId === courseId ? { ...t, courseId: '' } : t)),
    }));
  }, []);

  // Task actions
  const addTask = useCallback((taskData: Omit<Task, 'id'>): string => {
    const newId = 'task-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newTask: Task = { ...taskData, id: newId };
    setState(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    return newId;
  }, []);

  const updateTask = useCallback((updated: Task) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === updated.id ? updated : t)),
    }));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId),
    }));
  }, []);

  const toggleTaskStatus = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== taskId) return t;
        const newStatus = t.status === 'completed' ? 'not_started' : 'completed';
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
        };
      }),
    }));
  }, []);

  const toggleCheckItem = useCallback((taskId: string, checkItemId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== taskId || !t.checklist) return t;
        return {
          ...t,
          checklist: t.checklist.map(ci =>
            ci.id === checkItemId ? { ...ci, done: !ci.done } : ci
          ),
        };
      }),
    }));
  }, []);

  // GPA Calculations
  const { semesterGpa, cumulativeGpa, totalCredits, gradedCredits } = React.useMemo(() => {
    let termQualityPoints = 0;
    let termGradedCredits = 0;
    let termTotalCredits = 0;

    for (const course of state.courses) {
      const cr = Number(course.credits) || 0;
      termTotalCredits += cr;
      if (course.currentGrade && GRADE_POINTS_STANDARD[course.currentGrade] !== undefined) {
        termQualityPoints += GRADE_POINTS_STANDARD[course.currentGrade] * cr;
        termGradedCredits += cr;
      }
    }

    const calculatedSemesterGpa = termGradedCredits > 0 ? termQualityPoints / termGradedCredits : null;

    const priorPts = (state.profile.priorCumulativeGpa || 0) * (state.profile.priorEarnedCredits || 0);
    const totalAllPts = priorPts + termQualityPoints;
    const totalAllCredits = (state.profile.priorEarnedCredits || 0) + termGradedCredits;

    const calculatedCumulativeGpa = totalAllCredits > 0 ? totalAllPts / totalAllCredits : calculatedSemesterGpa;

    return {
      semesterGpa: calculatedSemesterGpa,
      cumulativeGpa: calculatedCumulativeGpa,
      totalCredits: termTotalCredits,
      gradedCredits: termGradedCredits,
    };
  }, [state.courses, state.profile]);

  // Data management
  const exportDataJson = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importDataJson = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.courses) && Array.isArray(parsed.tasks)) {
        setState({
          profile: parsed.profile || INITIAL_ACADEMIC_DATA.profile,
          courses: parsed.courses,
          tasks: parsed.tasks,
          studySessions: Array.isArray(parsed.studySessions) ? parsed.studySessions : [],
          activeTerm: parsed.activeTerm || 'Fall 2026',
        });
        return true;
      }
    } catch (e) {
      console.error('Failed to import JSON backup:', e);
    }
    return false;
  }, []);

  const resetToSampleData = useCallback(() => {
    setState(INITIAL_ACADEMIC_DATA);
  }, []);

  const clearAllData = useCallback(() => {
    setState({
      profile: {
        studentName: 'Student',
        university: 'University',
        major: 'Undeclared',
        currentTerm: 'Fall 2026',
        priorCumulativeGpa: 0,
        priorEarnedCredits: 0,
        targetCumulativeGpa: 3.8,
      },
      courses: [],
      tasks: [],
      studySessions: [],
      activeTerm: 'Fall 2026',
    });
  }, []);

  return (
    <AcademicContext.Provider
      value={{
        state,
        theme,
        activeView,
        searchQuery,
        timerState,
        toggleTheme,
        setActiveView,
        setSearchQuery,
        updateProfile,
        addCourse,
        updateCourse,
        deleteCourse,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        toggleCheckItem,
        startTimer,
        pauseTimer,
        resetTimer,
        switchTimerMode,
        setTimerBinding,
        semesterGpa,
        cumulativeGpa,
        totalCredits,
        gradedCredits,
        exportDataJson,
        importDataJson,
        resetToSampleData,
        clearAllData,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = (): AcademicContextType => {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
};
