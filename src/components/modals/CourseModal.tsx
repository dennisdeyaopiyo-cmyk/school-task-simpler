import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import {
  Course,
  CourseMeeting,
  GradeCategoryWeight,
  COURSE_COLOR_PALETTE,
  GRADE_POINTS_STANDARD,
} from '../../types/academic';

interface CourseModalProps {
  course?: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

const DAY_OPTIONS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

export const CourseModal: React.FC<CourseModalProps> = ({ course, isOpen, onClose }) => {
  const { addCourse, updateCourse, state } = useAcademic();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [instructorEmail, setInstructorEmail] = useState('');
  const [officeHours, setOfficeHours] = useState('');
  const [room, setRoom] = useState('');
  const [credits, setCredits] = useState<number>(3.0);
  const [color, setColor] = useState(COURSE_COLOR_PALETTE[0]);
  const [currentGrade, setCurrentGrade] = useState('');
  const [targetGrade, setTargetGrade] = useState('A');
  const [term, setTerm] = useState(state.activeTerm || 'Fall 2026');
  const [syllabusNotes, setSyllabusNotes] = useState('');
  const [schedule, setSchedule] = useState<CourseMeeting[]>([]);
  const [gradeWeights, setGradeWeights] = useState<GradeCategoryWeight[]>([]);

  useEffect(() => {
    if (course) {
      setCode(course.code);
      setName(course.name);
      setInstructor(course.instructor || '');
      setInstructorEmail(course.instructorEmail || '');
      setOfficeHours(course.officeHours || '');
      setRoom(course.room || '');
      setCredits(course.credits);
      setColor(course.color || COURSE_COLOR_PALETTE[0]);
      setCurrentGrade(course.currentGrade || '');
      setTargetGrade(course.targetGrade || 'A');
      setTerm(course.term || state.activeTerm);
      setSyllabusNotes(course.syllabusNotes || '');
      setSchedule(course.schedule || []);
      setGradeWeights(course.gradeWeights || []);
    } else {
      setCode('');
      setName('');
      setInstructor('');
      setInstructorEmail('');
      setOfficeHours('');
      setRoom('');
      setCredits(3.0);
      setColor(
        COURSE_COLOR_PALETTE[Math.floor(Math.random() * COURSE_COLOR_PALETTE.length)]
      );
      setCurrentGrade('');
      setTargetGrade('A');
      setTerm(state.activeTerm);
      setSyllabusNotes('');
      setSchedule([
        {
          id: 'meet-' + Date.now(),
          day: 1,
          startTime: '10:00',
          endTime: '11:15',
          room: '',
          type: 'lecture',
        },
      ]);
      setGradeWeights([]);
    }
  }, [course, state.activeTerm, isOpen]);

  if (!isOpen) return null;

  const handleAddMeeting = () => {
    setSchedule([
      ...schedule,
      {
        id: 'meet-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        day: 1,
        startTime: '10:00',
        endTime: '11:15',
        room: room || '',
        type: 'lecture',
      },
    ]);
  };

  const handleUpdateMeeting = (index: number, updates: Partial<CourseMeeting>) => {
    setSchedule(schedule.map((m, i) => (i === index ? { ...m, ...updates } : m)));
  };

  const handleRemoveMeeting = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleAddWeight = () => {
    setGradeWeights([
      ...gradeWeights,
      {
        id: 'gw-' + Date.now(),
        name: 'New Assessment',
        weightPercent: 20,
        scorePercent: 90,
      },
    ]);
  };

  const handleUpdateWeight = (index: number, updates: Partial<GradeCategoryWeight>) => {
    setGradeWeights(gradeWeights.map((w, i) => (i === index ? { ...w, ...updates } : w)));
  };

  const handleRemoveWeight = (index: number) => {
    setGradeWeights(gradeWeights.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    const coursePayload = {
      code: code.trim(),
      name: name.trim(),
      instructor: instructor.trim(),
      instructorEmail: instructorEmail.trim() || undefined,
      officeHours: officeHours.trim() || undefined,
      room: room.trim() || undefined,
      credits: Number(credits) || 0,
      color,
      currentGrade,
      targetGrade,
      term,
      syllabusNotes: syllabusNotes.trim() || undefined,
      schedule,
      gradeWeights,
    };

    if (course) {
      updateCourse({
        ...course,
        ...coursePayload,
      });
    } else {
      addCourse(coursePayload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900 max-h-[90vh] flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 p-5 dark:border-neutral-800">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {course ? 'Edit Course Details' : 'Enroll New Course'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Code & Name */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CS 3110"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Data Structures & Functional Programming"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Credits, Color Swatch & Term */}
          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Credits Load
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="12"
                required
                value={credits}
                onChange={(e) => setCredits(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-mono tabular-nums text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Current Grade
              </label>
              <select
                value={currentGrade}
                onChange={(e) => setCurrentGrade(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-2 text-xs font-semibold text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="">— In Progress —</option>
                {Object.keys(GRADE_POINTS_STANDARD).map((g) => (
                  <option key={g} value={g}>
                    {g} ({GRADE_POINTS_STANDARD[g].toFixed(1)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Color Tag
              </label>
              <div className="flex items-center gap-1.5 py-1">
                {COURSE_COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-5 w-5 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-offset-2 ring-neutral-900 dark:ring-white scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Instructor & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Instructor Name
              </label>
              <input
                type="text"
                placeholder="Prof. Michael Clarkson"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Classroom / Room
              </label>
              <input
                type="text"
                placeholder="Gates Hall 114"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Instructor Email
              </label>
              <input
                type="email"
                placeholder="instructor@university.edu"
                value={instructorEmail}
                onChange={(e) => setInstructorEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Office Hours
              </label>
              <input
                type="text"
                placeholder="Tue & Thu 2:00 PM – 4:00 PM"
                value={officeHours}
                onChange={(e) => setOfficeHours(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Weekly Class Meetings (Timetable Schedule) */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Weekly Meeting Timetable
              </label>
              <button
                type="button"
                onClick={handleAddMeeting}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus className="h-3 w-3" />
                <span>Add Meeting Time</span>
              </button>
            </div>

            <div className="space-y-2">
              {schedule.map((meeting, idx) => (
                <div
                  key={meeting.id || idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
                >
                  <select
                    value={meeting.day}
                    onChange={(e) =>
                      handleUpdateMeeting(idx, { day: parseInt(e.target.value, 10) })
                    }
                    className="rounded border border-neutral-200 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                  >
                    {DAY_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="time"
                    value={meeting.startTime}
                    onChange={(e) => handleUpdateMeeting(idx, { startTime: e.target.value })}
                    className="rounded border border-neutral-200 bg-white px-1.5 py-1 font-mono dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={meeting.endTime}
                    onChange={(e) => handleUpdateMeeting(idx, { endTime: e.target.value })}
                    className="rounded border border-neutral-200 bg-white px-1.5 py-1 font-mono dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                  />

                  <select
                    value={meeting.type}
                    onChange={(e) =>
                      handleUpdateMeeting(idx, {
                        type: e.target.value as CourseMeeting['type'],
                      })
                    }
                    className="rounded border border-neutral-200 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100 capitalize"
                  >
                    <option value="lecture">Lecture</option>
                    <option value="lab">Lab</option>
                    <option value="discussion">Discussion</option>
                    <option value="seminar">Seminar</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemoveMeeting(idx)}
                    className="text-neutral-400 hover:text-red-500 p-1 ml-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Weights Breakdown */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Grading Weights (% Breakdown)
              </label>
              <button
                type="button"
                onClick={handleAddWeight}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus className="h-3 w-3" />
                <span>Add Weight Category</span>
              </button>
            </div>

            <div className="space-y-2">
              {gradeWeights.map((gw, idx) => (
                <div
                  key={gw.id || idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
                >
                  <input
                    type="text"
                    placeholder="e.g. Midterm Exams"
                    value={gw.name}
                    onChange={(e) => handleUpdateWeight(idx, { name: e.target.value })}
                    className="flex-1 rounded border border-neutral-200 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-neutral-400">Weight:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gw.weightPercent}
                      onChange={(e) =>
                        handleUpdateWeight(idx, {
                          weightPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-16 rounded border border-neutral-200 bg-white px-1.5 py-1 font-mono dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                    />
                    <span>%</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-neutral-400">Score:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gw.scorePercent ?? ''}
                      placeholder="90"
                      onChange={(e) =>
                        handleUpdateWeight(idx, {
                          scorePercent: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      className="w-16 rounded border border-neutral-200 bg-white px-1.5 py-1 font-mono dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                    />
                    <span>%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveWeight(idx)}
                    className="text-neutral-400 hover:text-red-500 p-1 ml-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Syllabus Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Syllabus Summary &amp; Textbook Notes
            </label>
            <textarea
              rows={2}
              placeholder="Key policies, required textbook ISBN, exam dates from syllabus..."
              value={syllabusNotes}
              onChange={(e) => setSyllabusNotes(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 resize-none"
            />
          </div>

          {/* Footer */}
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
              {course ? 'Save Course' : 'Enroll Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
