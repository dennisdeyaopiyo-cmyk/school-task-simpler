import React from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  GraduationCap,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Flame,
  CheckCircle2,
  Circle,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { Task, Course } from '../../types/academic';

interface DashboardViewProps {
  onOpenTaskModal: (task?: Task) => void;
  onOpenCourseModal: (course?: Course) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenTaskModal,
  onOpenCourseModal,
}) => {
  const {
    state,
    setActiveView,
    toggleTaskStatus,
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    switchTimerMode,
    setTimerBinding,
    semesterGpa,
    cumulativeGpa,
    totalCredits,
  } = useAcademic();

  const now = new Date();
  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1 = Mon ... 7 = Sun
  const todayStr = now.toISOString().split('T')[0];

  // Calculate Days difference
  const getDaysDiff = (dateStr: string) => {
    const target = new Date(dateStr + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Filter tasks
  const openTasks = state.tasks.filter((t) => t.status !== 'completed');
  const overdueTasks = openTasks.filter((t) => getDaysDiff(t.dueDate) < 0);
  const dueTodayTasks = openTasks.filter((t) => t.dueDate === todayStr);
  const dueSoonTasks = openTasks
    .filter((t) => getDaysDiff(t.dueDate) >= 0 && getDaysDiff(t.dueDate) <= 7)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Today's classes
  const todaysClasses = state.courses
    .flatMap((c) =>
      c.schedule
        .filter((s) => s.day === currentDayOfWeek)
        .map((s) => ({ ...s, course: c }))
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Upcoming Exams
  const upcomingExams = state.tasks
    .filter((t) => t.type === 'exam' && t.status !== 'completed')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m < 10 ? '0' : ''}${m} ${ampm}`;
  };

  const formatTimerMinutes = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getGreeting = () => {
    const hours = now.getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
            <span>{state.profile.university}</span>
            <span aria-hidden="true">·</span>
            <span>{state.activeTerm}</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {getGreeting()}, {state.profile.studentName}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            {now.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Quick Academic Profile Summary */}
        <div className="flex items-center gap-3 sm:gap-6 text-xs text-neutral-600 dark:text-neutral-300">
          <div>
            <span className="block text-[11px] text-neutral-400 uppercase font-medium">Enrolled</span>
            <span className="font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              {state.courses.length} Courses ({totalCredits} Credits)
            </span>
          </div>
          <div className="h-7 w-px bg-neutral-200 dark:bg-neutral-800" />
          <div>
            <span className="block text-[11px] text-neutral-400 uppercase font-medium">Cum. GPA</span>
            <span className="font-mono tabular-nums font-semibold text-indigo-600 dark:text-indigo-400 text-sm">
              {cumulativeGpa ? cumulativeGpa.toFixed(2) : '3.80'} / 4.00
            </span>
          </div>
        </div>
      </div>

      {/* Quantitative Summary Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Overdue */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
              Overdue
            </span>
            <AlertTriangle className={`h-4 w-4 ${overdueTasks.length > 0 ? 'text-red-500' : 'text-neutral-400'}`} />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {overdueTasks.length}
          </div>
          <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {overdueTasks.length > 0 ? 'Requires immediate action' : 'Zero overdue work'}
          </div>
        </div>

        {/* Due Today */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
              Due Today
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {dueTodayTasks.length}
          </div>
          <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {todaysClasses.length} lectures scheduled today
          </div>
        </div>

        {/* Due Next 7 Days */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
              This Week
            </span>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {dueSoonTasks.length}
          </div>
          <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Assignments & readings
          </div>
        </div>

        {/* Semester Standing */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
              Term GPA
            </span>
            <GraduationCap className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {semesterGpa ? semesterGpa.toFixed(2) : '—'}
          </div>
          <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Based on current grades
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Today's Classes & Urgent Deadlines (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Today's Schedule Section */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Today's Schedule
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {todaysClasses.length} course meeting{todaysClasses.length === 1 ? '' : 's'} today
                </p>
              </div>
              <button
                onClick={() => setActiveView('schedule')}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
              >
                <span>Full timetable</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
              {todaysClasses.length > 0 ? (
                todaysClasses.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-start justify-between py-3.5 first:pt-1 last:pb-1 group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-1.5 h-11 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: meeting.course.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                            {meeting.course.code}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            · {meeting.course.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          <span className="flex items-center gap-1 font-mono tabular-nums">
                            <Clock className="h-3 w-3" />
                            {formatTime(meeting.startTime)} – {formatTime(meeting.endTime)}
                          </span>
                          {meeting.room && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {meeting.room}
                            </span>
                          )}
                          <span className="capitalize text-neutral-400">
                            ({meeting.type})
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenCourseModal(meeting.course)}
                      className="opacity-0 group-hover:opacity-100 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 px-2 py-1 rounded transition-opacity"
                    >
                      Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-neutral-400">
                  No classes scheduled for today. Great time for deep focus study!
                </div>
              )}
            </div>
          </div>

          {/* Actionable Deadlines Queue */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Priority Tasks & Deadlines
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Ordered by upcoming submission date
                </p>
              </div>
              <button
                onClick={() => setActiveView('tasks')}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
              >
                <span>All {state.tasks.length} tasks</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {openTasks.slice(0, 5).map((task) => {
                const course = state.courses.find((c) => c.id === task.courseId);
                const daysDiff = getDaysDiff(task.dueDate);
                const isOverdue = daysDiff < 0;
                const isToday = daysDiff === 0;

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-neutral-150 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="text-neutral-400 hover:text-emerald-600 transition-colors shrink-0"
                        title="Mark completed"
                      >
                        <Circle className="h-4 w-4" />
                      </button>

                      <div className="min-w-0">
                        <button
                          onClick={() => onOpenTaskModal(task)}
                          className="text-left font-medium text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors"
                        >
                          {task.title}
                        </button>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {course && (
                            <span
                              className="font-semibold"
                              style={{ color: course.color }}
                            >
                              {course.code}
                            </span>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{task.type.replace('_', ' ')}</span>
                          {task.checklist && task.checklist.length > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>
                                {task.checklist.filter((c) => c.done).length}/{task.checklist.length} subtasks
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <span
                        className={`text-xs font-mono tabular-nums font-semibold block ${
                          isOverdue
                            ? 'text-red-600 dark:text-red-400'
                            : isToday
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {isOverdue
                          ? `${Math.abs(daysDiff)}d overdue`
                          : isToday
                          ? 'Today'
                          : daysDiff === 1
                          ? 'Tomorrow'
                          : `in ${daysDiff} days`}
                      </span>
                      {task.dueTime && (
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {formatTime(task.dueTime)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {openTasks.length === 0 && (
                <div className="py-8 text-center text-xs text-neutral-400">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                  All caught up! No pending deadlines.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Focus Timer & Exam Countdown & Courses Overview (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Integrated Study Focus Timer Widget */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Focus Session
                </h3>
              </div>
              <span className="text-xs font-mono tabular-nums text-neutral-500">
                {timerState.sessionsCompletedToday} completed today
              </span>
            </div>

            <div className="mt-4 text-center">
              {/* Mode Selector Tabs */}
              <div className="inline-flex rounded-lg bg-neutral-100 p-0.5 text-xs font-medium dark:bg-neutral-800 mb-4">
                <button
                  onClick={() => switchTimerMode('pomodoro')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    timerState.mode === 'pomodoro'
                      ? 'bg-white shadow-xs text-indigo-600 dark:bg-neutral-700 dark:text-indigo-400'
                      : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  25m Pomodoro
                </button>
                <button
                  onClick={() => switchTimerMode('deep_work')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    timerState.mode === 'deep_work'
                      ? 'bg-white shadow-xs text-indigo-600 dark:bg-neutral-700 dark:text-indigo-400'
                      : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  50m Deep Work
                </button>
                <button
                  onClick={() => switchTimerMode('short_break')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    timerState.mode === 'short_break'
                      ? 'bg-white shadow-xs text-emerald-600 dark:bg-neutral-700 dark:text-emerald-400'
                      : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  5m Break
                </button>
              </div>

              {/* Big Clock Display with Tabular Figures */}
              <div className="text-5xl font-bold font-mono tracking-tighter tabular-nums text-neutral-900 dark:text-white my-3">
                {formatTimerMinutes(timerState.remainingSeconds)}
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden dark:bg-neutral-800 mb-4">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${((timerState.totalSeconds - timerState.remainingSeconds) / timerState.totalSeconds) * 100}%`,
                  }}
                />
              </div>

              {/* Linked Subject */}
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 mb-4">
                <span>Studying:</span>
                <select
                  value={timerState.activeCourseId || ''}
                  onChange={(e) => setTimerBinding(e.target.value, timerState.activeTaskId)}
                  className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  <option value="">General Study</option>
                  {state.courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                {timerState.isRunning ? (
                  <button
                    onClick={pauseTimer}
                    className="flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 active:scale-98 transition-colors"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    onClick={startTimer}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-98 transition-colors"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Start Session</span>
                  </button>
                )}
                <button
                  onClick={resetTimer}
                  className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 transition-colors"
                  title="Reset timer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Exam Countdown & Key Milestones */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Exam Milestones
              </h3>
              <span className="text-xs text-neutral-400">Target countdown</span>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam) => {
                  const course = state.courses.find((c) => c.id === exam.courseId);
                  const daysLeft = getDaysDiff(exam.dueDate);

                  return (
                    <div
                      key={exam.id}
                      className="p-3 rounded-lg border border-neutral-150 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                            {exam.title}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {course?.code} · {exam.dueDate}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-sm font-mono tabular-nums font-bold ${
                              daysLeft <= 3 ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            {daysLeft === 0 ? 'Today!' : `${daysLeft} days`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-xs text-neutral-400">
                  No upcoming exams on schedule.
                </div>
              )}
            </div>
          </div>

          {/* Course Summary & Academic standing */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Active Courses
              </h3>
              <button
                onClick={() => setActiveView('courses')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="mt-3 divide-y divide-neutral-100 dark:divide-neutral-800">
              {state.courses.map((c) => {
                const courseTasks = state.tasks.filter((t) => t.courseId === c.id);
                const doneCount = courseTasks.filter((t) => t.status === 'completed').length;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between py-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <div>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {c.code}
                        </span>
                        <span className="text-neutral-400 ml-1.5">
                          ({doneCount}/{courseTasks.length} done)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono tabular-nums font-semibold text-neutral-700 dark:text-neutral-300">
                        {c.currentGrade || 'In Prog.'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
