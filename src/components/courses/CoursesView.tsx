import React from 'react';
import {
  BookOpen,
  Plus,
  Clock,
  MapPin,
  Mail,
  User,
  GraduationCap,
  Calendar,
  Edit,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { Course, Task } from '../../types/academic';

interface CoursesViewProps {
  onOpenCourseModal: (course?: Course) => void;
  onOpenTaskModal: (task?: Task) => void;
}

const DAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CoursesView: React.FC<CoursesViewProps> = ({
  onOpenCourseModal,
  onOpenTaskModal,
}) => {
  const { state, deleteCourse, setActiveView } = useAcademic();

  const formatMeetingTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m < 10 ? '0' : ''}${m} ${ampm}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Courses &amp; Syllabus
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            {state.courses.length} enrolled courses for {state.activeTerm} ·{' '}
            {state.courses.reduce((sum, c) => sum + (c.credits || 0), 0)} total credits
          </p>
        </div>

        <button
          onClick={() => onOpenCourseModal()}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-98 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {state.courses.map((course) => {
          const courseTasks = state.tasks.filter((t) => t.courseId === course.id);
          const completedTasks = courseTasks.filter((t) => t.status === 'completed');
          const completionPct = courseTasks.length > 0
            ? Math.round((completedTasks.length / courseTasks.length) * 100)
            : 0;

          // Calculate estimated grade from weighted categories if present
          let weightedSum = 0;
          let weightTotal = 0;
          if (course.gradeWeights && course.gradeWeights.length > 0) {
            for (const gw of course.gradeWeights) {
              if (gw.scorePercent !== undefined) {
                weightedSum += (gw.scorePercent * gw.weightPercent) / 100;
                weightTotal += gw.weightPercent;
              }
            }
          }

          return (
            <div
              key={course.id}
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between"
            >
              <div>
                {/* Course Header & Color Bar */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="h-10 w-2 rounded-full shrink-0 mt-0.5"
                      style={{ backgroundColor: course.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                          {course.code}
                        </span>
                        <span className="text-xs font-mono tabular-nums text-neutral-500">
                          ({course.credits} Credits)
                        </span>
                      </div>
                      <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {course.name}
                      </h2>
                    </div>
                  </div>

                  {/* Current Grade Badge / Display */}
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                      {course.currentGrade || '—'}
                    </div>
                    {course.targetGrade && (
                      <span className="text-[11px] text-neutral-400 block">
                        Target: {course.targetGrade}
                      </span>
                    )}
                  </div>
                </div>

                {/* Instructor & Location Info */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600 dark:text-neutral-400 border-y border-neutral-100 py-3 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                    <span>{course.instructor || 'TBD'}</span>
                  </div>
                  {course.room && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span>{course.room}</span>
                    </div>
                  )}
                  {course.instructorEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <a
                        href={`mailto:${course.instructorEmail}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                      >
                        {course.instructorEmail}
                      </a>
                    </div>
                  )}
                  {course.officeHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{course.officeHours}</span>
                    </div>
                  )}
                </div>

                {/* Meeting Schedule Timetable */}
                <div className="mt-4">
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Weekly Class Meetings
                  </div>
                  {course.schedule && course.schedule.length > 0 ? (
                    <div className="space-y-1.5">
                      {course.schedule.map((meet) => (
                        <div
                          key={meet.id}
                          className="flex items-center justify-between text-xs bg-neutral-50 px-2.5 py-1.5 rounded dark:bg-neutral-800/50"
                        >
                          <div className="flex items-center gap-2 font-mono tabular-nums">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                              {DAY_NAMES[meet.day]}
                            </span>
                            <span className="text-neutral-500">
                              {formatMeetingTime(meet.startTime)} – {formatMeetingTime(meet.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-400">
                            {meet.room && <span>{meet.room}</span>}
                            <span className="capitalize text-[11px]">({meet.type})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-400 italic">
                      No meeting times specified.
                    </div>
                  )}
                </div>

                {/* Grade Weight Breakdown if present */}
                {course.gradeWeights && course.gradeWeights.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                      <span>Grading Breakdown</span>
                      {weightTotal > 0 && (
                        <span className="text-neutral-600 dark:text-neutral-300 font-mono">
                          Calculated: {(weightedSum / (weightTotal / 100)).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {course.gradeWeights.map((gw) => (
                        <div
                          key={gw.id}
                          className="flex items-center justify-between p-1.5 rounded bg-neutral-50 dark:bg-neutral-800/40"
                        >
                          <span className="text-neutral-600 dark:text-neutral-400 truncate">
                            {gw.name}
                          </span>
                          <span className="font-mono tabular-nums font-semibold text-neutral-800 dark:text-neutral-200">
                            {gw.weightPercent}%
                            {gw.scorePercent !== undefined && ` (${gw.scorePercent}%)`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Syllabus / Notes */}
                {course.syllabusNotes && (
                  <div className="mt-4 text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50/60 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/30">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-0.5">
                      Syllabus Notes:
                    </span>
                    {course.syllabusNotes}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer: Tasks Status & Actions */}
              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="font-mono tabular-nums font-semibold text-neutral-800 dark:text-neutral-200">
                    {completedTasks.length}/{courseTasks.length}
                  </span>{' '}
                  assignments completed ({completionPct}%)
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenCourseModal(course)}
                    className="p-1.5 rounded text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                    title="Edit course"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete course "${course.code}: ${course.name}"? Tasks associated with this course will remain unassigned.`
                        )
                      ) {
                        deleteCourse(course.id);
                      }
                    }}
                    className="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                    title="Delete course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {state.courses.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-neutral-500 dark:text-neutral-400">
            <BookOpen className="h-8 w-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
            <div className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm">
              No courses enrolled
            </div>
            <p className="mt-1">
              Add your university courses with meeting times to populate your timetable and GPA tracker.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
