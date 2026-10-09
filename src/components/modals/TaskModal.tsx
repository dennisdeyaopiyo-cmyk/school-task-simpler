import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckSquare } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { Task, TaskType, TaskPriority, TaskStatus, CheckItem } from '../../types/academic';

interface TaskModalProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose }) => {
  const { state, addTask, updateTask } = useAcademic();

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [type, setType] = useState<TaskType>('assignment');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState<CheckItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [scoreEarned, setScoreEarned] = useState<number | ''>('');
  const [scoreMax, setScoreMax] = useState<number | ''>('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setCourseId(task.courseId || '');
      setType(task.type);
      setDueDate(task.dueDate);
      setDueTime(task.dueTime || '23:59');
      setPriority(task.priority);
      setStatus(task.status);
      setEstimatedMinutes(task.estimatedMinutes ?? '');
      setNotes(task.notes || '');
      setChecklist(task.checklist || []);
      setScoreEarned(task.scoreEarned ?? '');
      setScoreMax(task.scoreMax ?? '');
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTitle('');
      setCourseId(state.courses[0]?.id || '');
      setType('assignment');
      setDueDate(tomorrow.toISOString().split('T')[0]);
      setDueTime('23:59');
      setPriority('medium');
      setStatus('not_started');
      setEstimatedMinutes(60);
      setNotes('');
      setChecklist([]);
      setScoreEarned('');
      setScoreMax('');
    }
  }, [task, state.courses, isOpen]);

  if (!isOpen) return null;

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklist([
      ...checklist,
      {
        id: 'ci-' + Date.now().toString(36),
        text: newChecklistText.trim(),
        done: false,
      },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklist(checklist.filter((c) => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const taskPayload = {
      title: title.trim(),
      courseId,
      type,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      status,
      estimatedMinutes: typeof estimatedMinutes === 'number' ? estimatedMinutes : undefined,
      notes: notes.trim() || undefined,
      checklist,
      scoreEarned: typeof scoreEarned === 'number' ? scoreEarned : undefined,
      scoreMax: typeof scoreMax === 'number' ? scoreMax : undefined,
    };

    if (task) {
      updateTask({
        ...task,
        ...taskPayload,
      });
    } else {
      addTask(taskPayload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900 max-h-[90vh] flex flex-col"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 p-5 dark:border-neutral-800">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {task ? 'Edit Task' : 'New Academic Task'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Problem Set 5: Dynamic Programming"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Course & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Course
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="">No Course (General)</option>
                {state.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="lab_report">Lab Report</option>
                <option value="reading">Reading</option>
                <option value="paper">Paper / Essay</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Est. Minutes
              </label>
              <input
                type="number"
                min="0"
                step="15"
                placeholder="60"
                value={estimatedMinutes}
                onChange={(e) =>
                  setEstimatedMinutes(e.target.value ? parseInt(e.target.value, 10) : '')
                }
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 font-mono tabular-nums focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Checklist Subtasks */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Subtasks / Checklist
            </label>
            <div className="space-y-1.5 mb-2">
              {checklist.map((ci) => (
                <div
                  key={ci.id}
                  className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-neutral-800 text-xs"
                >
                  <span className="truncate">{ci.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklist(ci.id)}
                    className="text-neutral-400 hover:text-red-500 ml-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add subtask step..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklist(e);
                  }
                }}
                className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Notes &amp; Details
            </label>
            <textarea
              rows={3}
              placeholder="Instructions, textbook problem numbers, rubric expectations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 resize-none"
            />
          </div>

          {/* Optional Scores */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Score Earned (Optional)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 94"
                value={scoreEarned}
                onChange={(e) =>
                  setScoreEarned(e.target.value ? parseFloat(e.target.value) : '')
                }
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-mono tabular-nums text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Max Score (Optional)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 100"
                value={scoreMax}
                onChange={(e) =>
                  setScoreMax(e.target.value ? parseFloat(e.target.value) : '')
                }
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-mono tabular-nums text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-98 transition-colors"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
