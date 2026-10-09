import React, { useState, useEffect } from 'react';
import { AcademicProvider, useAcademic } from './context/AcademicContext';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { CoursesView } from './components/courses/CoursesView';
import { ScheduleView } from './components/schedule/ScheduleView';
import { GpaCalculatorView } from './components/gpa/GpaCalculatorView';
import { StudyTimerView } from './components/study/StudyTimerView';
import { TaskModal } from './components/modals/TaskModal';
import { CourseModal } from './components/modals/CourseModal';
import { Task, Course } from './types/academic';

const AppContent: React.FC = () => {
  const { activeView, setActiveView } = useAcademic();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleOpenTaskModal = (task?: Task) => {
    setSelectedTask(task || null);
    setTaskModalOpen(true);
  };

  const handleOpenCourseModal = (course?: Course) => {
    setSelectedCourse(course || null);
    setCourseModalOpen(true);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in form inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'Escape') {
        setTaskModalOpen(false);
        setCourseModalOpen(false);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleOpenTaskModal();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleOpenCourseModal();
      } else if (e.key === '1') {
        setActiveView('dashboard');
      } else if (e.key === '2') {
        setActiveView('tasks');
      } else if (e.key === '3') {
        setActiveView('courses');
      } else if (e.key === '4') {
        setActiveView('schedule');
      } else if (e.key === '5') {
        setActiveView('gpa');
      } else if (e.key === '6') {
        setActiveView('timer');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/60 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
      <Header
        onOpenNewTaskModal={() => handleOpenTaskModal()}
        onOpenNewCourseModal={() => handleOpenCourseModal()}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeView === 'dashboard' && (
          <DashboardView
            onOpenTaskModal={handleOpenTaskModal}
            onOpenCourseModal={handleOpenCourseModal}
          />
        )}
        {activeView === 'tasks' && (
          <TasksView onOpenTaskModal={handleOpenTaskModal} />
        )}
        {activeView === 'courses' && (
          <CoursesView
            onOpenCourseModal={handleOpenCourseModal}
            onOpenTaskModal={handleOpenTaskModal}
          />
        )}
        {activeView === 'schedule' && (
          <ScheduleView onOpenCourseModal={handleOpenCourseModal} />
        )}
        {activeView === 'gpa' && <GpaCalculatorView />}
        {activeView === 'timer' && <StudyTimerView />}
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        task={selectedTask}
        onClose={() => {
          setTaskModalOpen(false);
          setSelectedTask(null);
        }}
      />

      <CourseModal
        isOpen={courseModalOpen}
        course={selectedCourse}
        onClose={() => {
          setCourseModalOpen(false);
          setSelectedCourse(null);
        }}
      />

      {/* Quiet Academic Footer */}
      <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Scholar Academic Manager · All data saved locally</span>
          <div className="flex items-center gap-3">
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-[10px] font-mono">
              N: New Task
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-[10px] font-mono">
              C: New Course
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-[10px] font-mono">
              1-6: Switch Views
            </kbd>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AcademicProvider>
      <AppContent />
    </AcademicProvider>
  );
}
