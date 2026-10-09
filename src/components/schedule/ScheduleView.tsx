import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Download,
  Plus,
  MapPin,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { Course, CourseMeeting } from '../../types/academic';

interface ScheduleViewProps {
  onOpenCourseModal: (course?: Course) => void;
}

interface ScheduledBlock extends CourseMeeting {
  course: Course;
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  lane: number;
  totalLanes: number;
}

const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onOpenCourseModal }) => {
  const { state } = useAcademic();
  const [showWeekends, setShowWeekends] = useState(false);

  // Time grid range: 07:00 (420 min) to 21:00 (1260 min)
  const START_HOUR = 8;
  const END_HOUR = 20;
  const PIXELS_PER_HOUR = 60; // 1 pixel per minute

  const now = new Date();
  const todayDay = now.getDay() === 0 ? 7 : now.getDay(); // 1 = Mon ... 7 = Sun

  const displayedDays = showWeekends ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5];

  const parseTimeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h} ${ampm}`;
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const formatSingle = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour = h % 12 || 12;
      return `${hour}:${m < 10 ? '0' : ''}${m} ${ampm}`;
    };
    return `${formatSingle(startTime)} – ${formatSingle(endTime)}`;
  };

  // Group and assign collision lanes for overlapping classes
  const dayBlocks = useMemo(() => {
    const map = new Map<number, ScheduledBlock[]>();

    for (const d of [1, 2, 3, 4, 5, 6, 7]) {
      const rawList: ScheduledBlock[] = [];
      for (const course of state.courses) {
        for (const meet of course.schedule || []) {
          if (meet.day === d) {
            const startM = parseTimeToMinutes(meet.startTime);
            const endM = parseTimeToMinutes(meet.endTime);
            rawList.push({
              ...meet,
              course,
              startMinutes: startM,
              endMinutes: endM,
              durationMinutes: Math.max(20, endM - startM),
              lane: 0,
              totalLanes: 1,
            });
          }
        }
      }

      // Sort by start time
      rawList.sort((a, b) => a.startMinutes - b.startMinutes);

      // Collision detection & lane allocation
      const laneEndTimes: number[] = [];
      for (const item of rawList) {
        let placed = false;
        for (let i = 0; i < laneEndTimes.length; i++) {
          if (laneEndTimes[i] <= item.startMinutes) {
            laneEndTimes[i] = item.endMinutes;
            item.lane = i;
            placed = true;
            break;
          }
        }
        if (!placed) {
          item.lane = laneEndTimes.length;
          laneEndTimes.push(item.endMinutes);
        }
      }

      const totalLanes = Math.max(1, laneEndTimes.length);
      rawList.forEach((item) => {
        item.totalLanes = totalLanes;
      });

      map.set(d, rawList);
    }

    return map;
  }, [state.courses]);

  // Total weekly class hours
  const totalWeeklyMinutes = useMemo(() => {
    let sum = 0;
    for (const course of state.courses) {
      for (const meet of course.schedule || []) {
        const start = parseTimeToMinutes(meet.startTime);
        const end = parseTimeToMinutes(meet.endTime);
        if (end > start) sum += end - start;
      }
    }
    return sum;
  }, [state.courses]);

  // Export to standard iCalendar (.ics) format
  const handleExportICS = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Scholar//Academic Schedule 1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    const dayOffsets: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6 };

    for (const course of state.courses) {
      for (const meet of course.schedule || []) {
        const startClean = meet.startTime.replace(':', '') + '00';
        const endClean = meet.endTime.replace(':', '') + '00';
        const byDay = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'][meet.day - 1];

        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`SUMMARY:${course.code} - ${course.name}`);
        icsContent.push(`LOCATION:${meet.room || course.room || 'Campus'}`);
        icsContent.push(`DESCRIPTION:Instructor: ${course.instructor}\\nType: ${meet.type}`);
        icsContent.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDay}`);
        // Dummy standard date anchor
        icsContent.push(`DTSTART:20260907T${startClean}`);
        icsContent.push(`DTEND:20260907T${endClean}`);
        icsContent.push('END:VEVENT');
      }
    }

    icsContent.push('END:VCALENDAR');
    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `academic-schedule-${state.activeTerm.replace(/\s+/g, '-').toLowerCase()}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const hoursList: number[] = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    hoursList.push(h);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Weekly Schedule
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            {(totalWeeklyMinutes / 60).toFixed(1)} class hours/week across {state.courses.length} courses
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowWeekends(!showWeekends)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            {showWeekends ? 'Hide Weekends' : 'Show Full Week'}
          </button>

          <button
            onClick={handleExportICS}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            title="Download iCalendar (.ics) to sync with Apple Calendar or Google Calendar"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export .ICS</span>
          </button>
        </div>
      </div>

      {/* Timetable Grid Container */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900 overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Day Headers Row */}
          <div
            className="grid border-b border-neutral-200 bg-neutral-50/70 dark:border-neutral-800 dark:bg-neutral-900/90 text-xs font-semibold sticky top-0 z-10"
            style={{
              gridTemplateColumns: `60px repeat(${displayedDays.length}, 1fr)`,
            }}
          >
            <div className="py-3 px-2 text-center text-neutral-400 border-r border-neutral-200 dark:border-neutral-800">
              Time
            </div>
            {displayedDays.map((d) => {
              const isToday = d === todayDay;
              return (
                <div
                  key={d}
                  className={`py-3 px-3 text-center border-r last:border-r-0 border-neutral-200 dark:border-neutral-800 ${
                    isToday
                      ? 'bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold'
                      : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <span className="hidden sm:inline">{DAYS_FULL[d - 1]}</span>
                  <span className="sm:hidden">{DAYS_SHORT[d - 1]}</span>
                  {isToday && (
                    <span className="block text-[10px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      Today
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time Body Grid */}
          <div
            className="grid relative"
            style={{
              gridTemplateColumns: `60px repeat(${displayedDays.length}, 1fr)`,
              height: `${(END_HOUR - START_HOUR + 1) * PIXELS_PER_HOUR}px`,
            }}
          >
            {/* Time labels column */}
            <div className="border-r border-neutral-200 dark:border-neutral-800 text-[11px] font-mono tabular-nums text-neutral-400 select-none">
              {hoursList.map((hour) => (
                <div
                  key={hour}
                  className="border-b border-neutral-100 dark:border-neutral-800/80 pr-2 text-right flex items-center justify-end"
                  style={{ height: `${PIXELS_PER_HOUR}px` }}
                >
                  <span>{formatHour(hour)}</span>
                </div>
              ))}
            </div>

            {/* Day columns with event blocks */}
            {displayedDays.map((d) => {
              const blocks = dayBlocks.get(d) || [];
              const isToday = d === todayDay;

              return (
                <div
                  key={d}
                  className={`relative border-r last:border-r-0 border-neutral-100 dark:border-neutral-800/80 ${
                    isToday ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                  }`}
                >
                  {/* Subtle horizontal hour lines */}
                  {hoursList.map((hour) => (
                    <div
                      key={hour}
                      className="border-b border-neutral-100 dark:border-neutral-800/60 pointer-events-none"
                      style={{ height: `${PIXELS_PER_HOUR}px` }}
                    />
                  ))}

                  {/* Render class blocks */}
                  {blocks.map((block) => {
                    const topPixels =
                      ((block.startMinutes - START_HOUR * 60) / 60) * PIXELS_PER_HOUR;
                    const heightPixels = Math.max(
                      24,
                      (block.durationMinutes / 60) * PIXELS_PER_HOUR - 2
                    );
                    const widthPercent = 100 / block.totalLanes;
                    const leftPercent = block.lane * widthPercent;

                    return (
                      <div
                        key={block.id}
                        onClick={() => onOpenCourseModal(block.course)}
                        className="absolute rounded-lg p-2 overflow-hidden shadow-xs cursor-pointer transition-all hover:z-20 hover:shadow-md hover:scale-[1.01] active:scale-99 border"
                        style={{
                          top: `${topPixels}px`,
                          height: `${heightPixels}px`,
                          left: `calc(${leftPercent}% + 2px)`,
                          width: `calc(${widthPercent}% - 4px)`,
                          backgroundColor: `${block.course.color}18`,
                          borderColor: `${block.course.color}50`,
                          borderLeftWidth: '4px',
                          borderLeftColor: block.course.color,
                        }}
                        title={`${block.course.code}: ${block.course.name}\n${formatTimeRange(
                          block.startTime,
                          block.endTime
                        )}\nRoom: ${block.room || 'TBD'}`}
                      >
                        <div className="font-bold text-xs truncate" style={{ color: block.course.color }}>
                          {block.course.code}
                        </div>
                        <div className="text-[11px] text-neutral-800 dark:text-neutral-200 font-medium truncate">
                          {block.course.name}
                        </div>
                        {heightPixels >= 45 && (
                          <div className="flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                            <span>
                              {formatTimeRange(block.startTime, block.endTime)}
                            </span>
                            {block.room && <span>· {block.room}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
