import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  MoreVertical,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { Task, TaskPriority, TaskType, TaskStatus } from '../../types/academic';

interface TasksViewProps {
  onOpenTaskModal: (task?: Task) => void;
}

type FilterBucket = 'all' | 'pending' | 'today' | 'week' | 'overdue' | 'completed';

export const TasksView: React.FC<TasksViewProps> = ({ onOpenTaskModal }) => {
  const {
    state,
    addTask,
    deleteTask,
    toggleTaskStatus,
    toggleCheckItem,
  } = useAcademic();

  const [search, setSearch] = useState('');
  const [selectedBucket, setSelectedBucket] = useState<FilterBucket>('pending');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

  const todayStr = new Date().toISOString().split('T')[0];

  const getDaysDiff = (dateStr: string) => {
    const target = new Date(dateStr + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const filteredTasks = useMemo(() => {
    return state.tasks.filter((task) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const course = state.courses.find((c) => c.id === task.courseId);
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchCourse = course ? (course.code + ' ' + course.name).toLowerCase().includes(query) : false;
        const matchNotes = task.notes ? task.notes.toLowerCase().includes(query) : false;
        if (!matchTitle && !matchCourse && !matchNotes) return false;
      }

      // Course filter
      if (selectedCourseId !== 'all' && task.courseId !== selectedCourseId) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && task.type !== selectedType) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      // Bucket filter
      const daysDiff = getDaysDiff(task.dueDate);
      if (selectedBucket === 'pending' && task.status === 'completed') return false;
      if (selectedBucket === 'completed' && task.status !== 'completed') return false;
      if (selectedBucket === 'today') {
        if (task.status === 'completed' || task.dueDate !== todayStr) return false;
      }
      if (selectedBucket === 'week') {
        if (task.status === 'completed' || daysDiff < 0 || daysDiff > 7) return false;
      }
      if (selectedBucket === 'overdue') {
        if (task.status === 'completed' || daysDiff >= 0) return false;
      }

      return true;
    }).sort((a, b) => {
      // Completed at bottom
      if ((a.status === 'completed') !== (b.status === 'completed')) {
        return a.status === 'completed' ? 1 : -1;
      }
      // Overdue first
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [state.tasks, state.courses, search, selectedBucket, selectedCourseId, selectedType, selectedPriority, todayStr]);

  const bucketCounts = useMemo(() => {
    const pending = state.tasks.filter((t) => t.status !== 'completed');
    const overdue = pending.filter((t) => getDaysDiff(t.dueDate) < 0);
    const today = pending.filter((t) => t.dueDate === todayStr);
    const week = pending.filter((t) => {
      const d = getDaysDiff(t.dueDate);
      return d >= 0 && d <= 7;
    });
    const completed = state.tasks.filter((t) => t.status === 'completed');

    return {
      all: state.tasks.length,
      pending: pending.length,
      today: today.length,
      week: week.length,
      overdue: overdue.length,
      completed: completed.length,
    };
  }, [state.tasks, todayStr]);

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Tasks &amp; Assignments
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Keep track of problem sets, lab reports, exams, and readings with checklists.
          </p>
        </div>

        <button
          onClick={() => onOpenTaskModal()}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-98 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="space-y-3">
        {/* Bucket Segmented Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              { id: 'pending', label: 'Open', count: bucketCounts.pending },
              { id: 'today', label: 'Due Today', count: bucketCounts.today },
              { id: 'week', label: 'This Week', count: bucketCounts.week },
              { id: 'overdue', label: 'Overdue', count: bucketCounts.overdue },
              { id: 'completed', label: 'Completed', count: bucketCounts.completed },
              { id: 'all', label: 'All Tasks', count: bucketCounts.all },
            ] as const
          ).map((tab) => {
            const isActive = selectedBucket === tab.id;
            const isAlert = tab.id === 'overdue' && tab.count > 0;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedBucket(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full ${
                    isAlert
                      ? 'bg-red-500 text-white'
                      : isActive
                      ? 'bg-neutral-800 text-neutral-300 dark:bg-neutral-200 dark:text-neutral-700'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Granular Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter by title or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pl-8 pr-3 text-xs text-neutral-800 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
            />
          </div>

          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-800 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <option value="all">All Courses</option>
            {state.courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-800 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <option value="all">All Item Types</option>
            <option value="assignment">Assignment</option>
            <option value="exam">Exam</option>
            <option value="quiz">Quiz</option>
            <option value="project">Project</option>
            <option value="lab_report">Lab Report</option>
            <option value="reading">Reading</option>
            <option value="paper">Essay / Paper</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-800 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task List Table / Cards */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
        {filteredTasks.length > 0 ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredTasks.map((task) => {
              const course = state.courses.find((c) => c.id === task.courseId);
              const daysDiff = getDaysDiff(task.dueDate);
              const isOverdue = daysDiff < 0 && task.status !== 'completed';
              const isToday = daysDiff === 0 && task.status !== 'completed';
              const isExpanded = expandedTaskIds.has(task.id);
              const hasChecklist = task.checklist && task.checklist.length > 0;
              const completedChecklistCount = task.checklist?.filter((c) => c.done).length || 0;

              return (
                <div
                  key={task.id}
                  className={`p-4 transition-colors ${
                    task.status === 'completed'
                      ? 'bg-neutral-50/40 dark:bg-neutral-900/40 opacity-75'
                      : 'hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`mt-0.5 shrink-0 transition-colors ${
                          task.status === 'completed'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-neutral-300 hover:text-emerald-500 dark:text-neutral-600'
                        }`}
                        title={task.status === 'completed' ? 'Mark incomplete' : 'Mark completed'}
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        ) : (
                          <Circle className="h-4.5 w-4.5" />
                        )}
                      </button>

                      {/* Title & Metadata */}
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold ${
                              task.status === 'completed'
                                ? 'line-through text-neutral-400 dark:text-neutral-500'
                                : 'text-neutral-900 dark:text-neutral-100'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>

                        {/* Unboxed Metadata with Typographic Separator Discipline */}
                        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
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

                          {task.priority === 'high' && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-red-600 dark:text-red-400">
                                High Priority
                              </span>
                            </>
                          )}

                          {task.estimatedMinutes && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">
                                ~{task.estimatedMinutes}m est.
                              </span>
                            </>
                          )}

                          {task.scoreEarned !== undefined && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                                Score: {task.scoreEarned}/{task.scoreMax || 100}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Notes snippet if present */}
                        {task.notes && (
                          <p className="mt-1 text-xs text-neutral-500 line-clamp-1 dark:text-neutral-400">
                            {task.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right side: Due Date and Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div
                          className={`text-xs font-mono tabular-nums font-semibold ${
                            isOverdue
                              ? 'text-red-600 dark:text-red-400'
                              : isToday
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {task.dueDate}
                        </div>
                        {task.dueTime && (
                          <div className="text-[11px] text-neutral-400 font-mono">
                            {task.dueTime}
                          </div>
                        )}
                      </div>

                      {/* Subtasks Accordion Button */}
                      {hasChecklist && (
                        <button
                          onClick={() => toggleExpand(task.id)}
                          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 transition-colors"
                          title="Toggle checklist"
                        >
                          <ListTodo className="h-3.5 w-3.5" />
                          <span className="font-mono tabular-nums">
                            {completedChecklistCount}/{task.checklist!.length}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </button>
                      )}

                      {/* Action buttons */}
                      <button
                        onClick={() => onOpenTaskModal(task)}
                        className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                        title="Edit task"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete task "${task.title}"?`)) {
                            deleteTask(task.id);
                          }
                        }}
                        className="rounded p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Checklist Sub-drawer if expanded */}
                  {isExpanded && hasChecklist && (
                    <div className="mt-3 pl-8 pr-4 py-2 border-t border-neutral-100 dark:border-neutral-800/80 space-y-1.5 bg-neutral-50/50 dark:bg-neutral-950/40 rounded-lg">
                      <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                        Subtasks Breakdown
                      </div>
                      {task.checklist!.map((ci) => (
                        <div
                          key={ci.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={ci.done}
                            onChange={() => toggleCheckItem(task.id, ci.id)}
                            className="h-3.5 w-3.5 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span
                            className={ci.done ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-200'}
                          >
                            {ci.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-neutral-500 dark:text-neutral-400">
            <CheckSquare className="h-8 w-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
            <div className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm">
              No tasks found
            </div>
            <p className="mt-1">
              Try adjusting your search terms or filters above, or create a new task.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
