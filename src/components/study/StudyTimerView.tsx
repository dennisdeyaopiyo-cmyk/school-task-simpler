import React, { useState } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  BookOpen,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
} from 'lucide-react';
import { useAcademic, TimerMode } from '../../context/AcademicContext';

export const StudyTimerView: React.FC = () => {
  const {
    state,
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    switchTimerMode,
    setTimerBinding,
  } = useAcademic();

  const [soundTested, setSoundTested] = useState(false);

  const formatTimerMinutes = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeCourse = state.courses.find((c) => c.id === timerState.activeCourseId);
  const activeTask = state.tasks.find((t) => t.id === timerState.activeTaskId);

  // Calculate total study minutes from state
  const totalStudyMinutes = state.studySessions.reduce(
    (sum, session) => sum + (session.durationMinutes || 0),
    0
  );

  const testAudioChime = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
      setSoundTested(true);
      setTimeout(() => setSoundTested(false), 2000);
    } catch (e) {
      console.warn('Audio test blocked:', e);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center border-b border-neutral-200 pb-5 dark:border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Focus &amp; Study Sessions
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Scientifically paced Pomodoro and Deep Work blocks to master coursework and assignments.
        </p>
      </div>

      {/* Main Focus Clock Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 sm:p-12 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 text-center">
        {/* Preset Tabs */}
        <div className="inline-flex rounded-xl bg-neutral-100 p-1 text-xs font-medium dark:bg-neutral-800 mb-8">
          {(
            [
              { id: 'pomodoro', label: '25m Pomodoro' },
              { id: 'deep_work', label: '50m Deep Work' },
              { id: 'short_break', label: '5m Short Break' },
              { id: 'long_break', label: '15m Long Break' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchTimerMode(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timerState.mode === tab.id
                  ? 'bg-white shadow-xs text-indigo-600 dark:bg-neutral-700 dark:text-indigo-400 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Big Tabular Numeric Clock Display */}
        <div className="my-6">
          <div className="text-7xl sm:text-8xl font-bold font-mono tracking-tighter tabular-nums text-neutral-900 dark:text-white select-none">
            {formatTimerMinutes(timerState.remainingSeconds)}
          </div>
          <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {timerState.mode.replace('_', ' ')}
          </div>
        </div>

        {/* Smooth Progress Indicator */}
        <div className="max-w-md mx-auto h-2 bg-neutral-100 rounded-full overflow-hidden dark:bg-neutral-800 mb-8">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{
              width: `${
                ((timerState.totalSeconds - timerState.remainingSeconds) /
                  timerState.totalSeconds) *
                100
              }%`,
            }}
          />
        </div>

        {/* Task & Subject Selector */}
        <div className="max-w-md mx-auto mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Active Course:
            </label>
            <select
              value={timerState.activeCourseId || ''}
              onChange={(e) => setTimerBinding(e.target.value, timerState.activeTaskId)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">General Study</option>
              {state.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Active Assignment:
            </label>
            <select
              value={timerState.activeTaskId || ''}
              onChange={(e) => setTimerBinding(timerState.activeCourseId, e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">No specific task</option>
              {state.tasks
                .filter((t) => !timerState.activeCourseId || t.courseId === timerState.activeCourseId)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={resetTimer}
            className="rounded-xl border border-neutral-200 p-3 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          {timerState.isRunning ? (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-amber-700 active:scale-98 transition-all"
            >
              <Pause className="h-5 w-5" />
              <span>Pause Focus</span>
            </button>
          ) : (
            <button
              onClick={startTimer}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-98 transition-all"
            >
              <Play className="h-5 w-5" />
              <span>Begin Session</span>
            </button>
          )}

          <button
            onClick={testAudioChime}
            className="rounded-xl border border-neutral-200 p-3 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 transition-colors"
            title="Test completion chime"
          >
            <Volume2 className={`h-5 w-5 ${soundTested ? 'text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Study Stats & History Log */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 text-center">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Completed Today
          </div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
            {timerState.sessionsCompletedToday}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Pomodoro cycles
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 text-center">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Total Logged
          </div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {(totalStudyMinutes / 60).toFixed(1)}h
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            {state.studySessions.length} logged sessions
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 text-center">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Target Pace
          </div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            100%
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            On track this week
          </div>
        </div>
      </div>

      {/* Recent Session Logs Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Recent Study Log
          </h3>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
          {state.studySessions.slice(0, 8).map((session) => {
            const course = state.courses.find((c) => c.id === session.courseId);
            const task = state.tasks.find((t) => t.id === session.taskId);
            const dateObj = new Date(session.timestamp);

            return (
              <div
                key={session.id}
                className="p-4 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: course?.color || '#a3a3a3' }}
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {course ? course.code : 'General Study'}
                    </span>
                    {task && (
                      <span className="text-neutral-500 dark:text-neutral-400 ml-2">
                        · {task.title}
                      </span>
                    )}
                    <span className="capitalize text-neutral-400 block text-[11px] mt-0.5">
                      {session.mode.replace('_', ' ')} · {dateObj.toLocaleDateString()} at{' '}
                      {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono tabular-nums font-semibold text-neutral-700 dark:text-neutral-300">
                  {session.durationMinutes} min
                </div>
              </div>
            );
          })}

          {state.studySessions.length === 0 && (
            <div className="p-8 text-center text-xs text-neutral-400">
              No completed sessions yet. Start the timer to record your first study block!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
