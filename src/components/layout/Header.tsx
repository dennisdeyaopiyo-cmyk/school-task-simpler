import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckSquare,
  GraduationCap,
  Timer,
  Plus,
  Sun,
  Moon,
  Download,
  Upload,
  RotateCcw,
  Search,
  LayoutDashboard,
} from 'lucide-react';
import { useAcademic, ActiveView } from '../../context/AcademicContext';

interface HeaderProps {
  onOpenNewTaskModal: () => void;
  onOpenNewCourseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewTaskModal, onOpenNewCourseModal }) => {
  const {
    activeView,
    setActiveView,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    timerState,
    exportDataJson,
    importDataJson,
    resetToSampleData,
  } = useAcademic();

  const [dataMenuOpen, setDataMenuOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const navItems: { id: ActiveView; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks & Deadlines', icon: CheckSquare },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'schedule', label: 'Weekly Schedule', icon: Calendar },
    { id: 'gpa', label: 'GPA Calculator', icon: GraduationCap },
    { id: 'timer', label: 'Focus Timer', icon: Timer },
  ];

  const handleExport = () => {
    const dataStr = exportDataJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scholar-academic-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setDataMenuOpen(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        alert('Academic data successfully restored from backup.');
      } else {
        alert('Invalid backup file. Please select a valid Scholar JSON backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setDataMenuOpen(false);
  };

  const formatTimerMinutes = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Brand Title (single text element wordmark) */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
            aria-label="Scholar Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-500/30 group-hover:bg-indigo-700 transition-colors">
              <span className="font-serif text-lg tracking-tighter">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Scholar
            </span>
          </button>

          {/* Quick Search */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search assignments or courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-1.5 pl-8 pr-3 text-xs text-neutral-800 placeholder-neutral-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-200 dark:focus:bg-neutral-800"
            />
          </div>
        </div>

        {/* Zone 2: Clean 4–6 text navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Timer Snippet if running or paused */}
          <button
            onClick={() => setActiveView('timer')}
            title="Focus Timer session"
            className={`hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono tabular-nums transition-colors ${
              timerState.isRunning
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 animate-pulse dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            <Timer className="h-3.5 w-3.5 text-indigo-500" />
            <span>{formatTimerMinutes(timerState.remainingSeconds)}</span>
          </button>

          {/* Quick Add Button */}
          <div className="flex items-center rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-colors">
            <button
              onClick={onOpenNewTaskModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap active:scale-98"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Task</span>
            </button>
            <button
              onClick={onOpenNewCourseModal}
              title="Add New Course"
              className="border-l border-indigo-500/60 px-2 py-2 text-xs hover:bg-indigo-700/80 rounded-r-lg transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Data Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDataMenuOpen(!dataMenuOpen)}
              className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
              title="Data backup & settings"
              aria-label="Settings and Data"
            >
              <Download className="h-4 w-4" />
            </button>

            {dataMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDataMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Academic Data
                  </div>
                  <button
                    onClick={handleExport}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Export JSON Backup</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Import JSON Backup</span>
                  </button>
                  <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all courses and tasks to the sample semester data?')) {
                        resetToSampleData();
                        setDataMenuOpen(false);
                      }
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Sample Data</span>
                  </button>
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="lg:hidden flex items-center overflow-x-auto border-t border-neutral-200 bg-neutral-50/80 px-2 py-1.5 scrollbar-none dark:border-neutral-800 dark:bg-neutral-900/80">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'text-indigo-600 bg-white shadow-xs dark:bg-neutral-800 dark:text-indigo-400 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
