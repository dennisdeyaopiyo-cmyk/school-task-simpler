export type TaskType = 
  | 'assignment' 
  | 'exam' 
  | 'quiz' 
  | 'project' 
  | 'reading' 
  | 'lab_report' 
  | 'paper' 
  | 'other';

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed';

export interface CheckItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  courseId: string;
  title: string;
  type: TaskType;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  priority: TaskPriority;
  status: TaskStatus;
  estimatedMinutes?: number;
  notes?: string;
  scoreEarned?: number;
  scoreMax?: number;
  checklist?: CheckItem[];
  completedAt?: string;
}

export type MeetingType = 'lecture' | 'lab' | 'discussion' | 'seminar' | 'office_hours';

export interface CourseMeeting {
  id: string;
  day: number; // 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
  startTime: string; // "09:00"
  endTime: string; // "10:15"
  room?: string;
  type: MeetingType;
}

export interface GradeCategoryWeight {
  id: string;
  name: string;
  weightPercent: number; // e.g. 25
  scorePercent?: number; // e.g. 92
}

export interface Course {
  id: string;
  code: string; // e.g. "CS 3110"
  name: string; // e.g. "Data Structures & Functional Programming"
  instructor: string;
  instructorEmail?: string;
  officeHours?: string;
  room?: string;
  credits: number;
  color: string; // Hex color or Tailwind accent
  currentGrade: string; // e.g. "A-", "B+", or ""
  targetGrade?: string;
  term: string; // e.g. "Fall 2026"
  schedule: CourseMeeting[];
  syllabusNotes?: string;
  gradeWeights?: GradeCategoryWeight[];
}

export interface StudySession {
  id: string;
  courseId?: string;
  taskId?: string;
  durationMinutes: number;
  timestamp: string;
  mode: 'pomodoro' | 'deep_work' | 'review';
}

export interface UserAcademicProfile {
  studentName: string;
  university: string;
  major: string;
  currentTerm: string;
  priorCumulativeGpa: number;
  priorEarnedCredits: number;
  targetCumulativeGpa: number;
}

export interface AcademicState {
  profile: UserAcademicProfile;
  courses: Course[];
  tasks: Task[];
  studySessions: StudySession[];
  activeTerm: string;
}

export const GRADE_POINTS_STANDARD: Record<string, number> = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'D-': 0.7,
  'F': 0.0,
};

export const GRADE_LIST = ['', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];

export const COURSE_COLOR_PALETTE = [
  '#4f46e5', // Indigo
  '#0891b2', // Cyan
  '#059669', // Emerald
  '#d97706', // Amber
  '#e11d48', // Rose
  '#7c3aed', // Violet
  '#2563eb', // Blue
  '#0d9488', // Teal
];
