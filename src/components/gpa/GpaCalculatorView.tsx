import React, { useState } from 'react';
import {
  GraduationCap,
  Calculator,
  Target,
  HelpCircle,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { GRADE_POINTS_STANDARD, GRADE_LIST } from '../../types/academic';

export const GpaCalculatorView: React.FC = () => {
  const {
    state,
    updateCourse,
    updateProfile,
    semesterGpa,
    cumulativeGpa,
    totalCredits,
    gradedCredits,
  } = useAcademic();

  const [targetGpaInput, setTargetGpaInput] = useState<string>(
    state.profile.targetCumulativeGpa.toString()
  );
  const [priorGpaInput, setPriorGpaInput] = useState<string>(
    state.profile.priorCumulativeGpa.toString()
  );
  const [priorCreditsInput, setPriorCreditsInput] = useState<string>(
    state.profile.priorEarnedCredits.toString()
  );

  const handleUpdateGrade = (courseId: string, newGrade: string) => {
    const course = state.courses.find((c) => c.id === courseId);
    if (!course) return;
    updateCourse({
      ...course,
      currentGrade: newGrade,
    });
  };

  const handleSaveProfileGpa = () => {
    const target = parseFloat(targetGpaInput) || 3.8;
    const priorGpa = parseFloat(priorGpaInput) || 0;
    const priorCredits = parseFloat(priorCreditsInput) || 0;

    updateProfile({
      targetCumulativeGpa: target,
      priorCumulativeGpa: priorGpa,
      priorEarnedCredits: priorCredits,
    });
  };

  // What-If Target Simulator calculations
  const targetNum = parseFloat(targetGpaInput) || 3.85;
  const priorGpaNum = parseFloat(priorGpaInput) || 0;
  const priorCreditsNum = parseFloat(priorCreditsInput) || 0;

  const currentTermCredits = totalCredits;
  const totalCombinedCredits = priorCreditsNum + currentTermCredits;
  const totalQualityPointsNeeded = targetNum * totalCombinedCredits;
  const priorQualityPoints = priorGpaNum * priorCreditsNum;
  const termPointsNeeded = totalQualityPointsNeeded - priorQualityPoints;
  const requiredTermGpa = currentTermCredits > 0 ? termPointsNeeded / currentTermCredits : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            GPA Calculator &amp; Goal Simulator
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Track your semester GPA, cumulative academic standing, and simulate target scenarios.
          </p>
        </div>
      </div>

      {/* Hero Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cumulative GPA */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
            Cumulative GPA
          </div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
            {cumulativeGpa ? cumulativeGpa.toFixed(2) : '3.80'}
          </div>
          <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Combined all semesters
          </div>
        </div>

        {/* Current Semester GPA */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
            {state.activeTerm} Term GPA
          </div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {semesterGpa ? semesterGpa.toFixed(2) : '—'}
          </div>
          <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {gradedCredits} of {totalCredits} credits graded
          </div>
        </div>

        {/* Total Earned Credits */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
            Total Credits
          </div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {(state.profile.priorEarnedCredits + totalCredits).toFixed(1)}
          </div>
          <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {state.profile.priorEarnedCredits} prior + {totalCredits} current
          </div>
        </div>

        {/* Academic Honors Standing */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
            Honor Standing
          </div>
          <div className="mt-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {(cumulativeGpa || 0) >= 3.8
              ? 'Summa Cum Laude'
              : (cumulativeGpa || 0) >= 3.65
              ? 'Magna Cum Laude'
              : (cumulativeGpa || 0) >= 3.5
              ? "Dean's List"
              : 'Good Standing'}
          </div>
          <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {(cumulativeGpa || 0) >= 3.5 ? 'Eligible for honors' : 'Standard progression'}
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Live Course Matrix & Goal Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Course Grade Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {state.activeTerm} Course Grade Matrix
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Update expected or posted grades below to see immediate GPA impacts.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/70 dark:border-neutral-800 dark:bg-neutral-900/80 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4">Current Grade</th>
                    <th className="py-3 px-4">Grade Points</th>
                    <th className="py-3 px-4 text-right">Quality Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {state.courses.map((course) => {
                    const gradePoint = course.currentGrade
                      ? GRADE_POINTS_STANDARD[course.currentGrade]
                      : undefined;
                    const qualityPts = gradePoint !== undefined
                      ? (gradePoint * course.credits).toFixed(1)
                      : '—';

                    return (
                      <tr
                        key={course.id}
                        className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: course.color }}
                            />
                            <div>
                              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {course.code}
                              </span>
                              <span className="text-neutral-400 block text-[11px]">
                                {course.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                          {course.credits.toFixed(1)}
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={course.currentGrade || ''}
                            onChange={(e) => handleUpdateGrade(course.id, e.target.value)}
                            className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="">— In Progress —</option>
                            {Object.keys(GRADE_POINTS_STANDARD).map((g) => (
                              <option key={g} value={g}>
                                {g} ({GRADE_POINTS_STANDARD[g].toFixed(1)})
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3 px-4 font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                          {gradePoint !== undefined ? gradePoint.toFixed(1) : '—'}
                        </td>

                        <td className="py-3 px-4 font-mono tabular-nums font-semibold text-right text-neutral-900 dark:text-neutral-100">
                          {qualityPts}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Standard 4.0 Scale Reference */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Standard 4.0 Academic Grade Scale
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center text-xs">
              {Object.entries(GRADE_POINTS_STANDARD).map(([letter, pts]) => (
                <div
                  key={letter}
                  className="p-1.5 rounded bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800"
                >
                  <div className="font-bold text-neutral-800 dark:text-neutral-200">
                    {letter}
                  </div>
                  <div className="text-[11px] font-mono tabular-nums text-neutral-500">
                    {pts.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Goal Simulator & Prior Standing Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Target GPA Goal Simulator */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <Target className="h-4 w-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Target GPA Goal Simulator
              </h2>
            </div>

            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
              Calculate the minimum semester performance required to reach your target cumulative GPA.
            </p>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Target Cumulative GPA Goal:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="4.0"
                    value={targetGpaInput}
                    onChange={(e) => setTargetGpaInput(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-900 font-mono tabular-nums focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                  <button
                    onClick={handleSaveProfileGpa}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Simulation Result Output */}
              <div className="mt-4 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/60 border border-neutral-150 dark:border-neutral-700">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Required Term GPA
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-bold font-mono tabular-nums ${
                      requiredTermGpa === null
                        ? 'text-neutral-400'
                        : requiredTermGpa > 4.0
                        ? 'text-red-600 dark:text-red-400'
                        : requiredTermGpa >= 3.7
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {requiredTermGpa !== null ? requiredTermGpa.toFixed(2) : '—'}
                  </span>
                  <span className="text-xs text-neutral-500">
                    / 4.00 needed this term
                  </span>
                </div>

                <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                  {requiredTermGpa === null ? (
                    'Add courses and credits to simulate.'
                  ) : requiredTermGpa > 4.0 ? (
                    <span className="text-red-600 dark:text-red-400">
                      Mathematically unreachable within {currentTermCredits} credits. Consider extending your credit horizon.
                    </span>
                  ) : requiredTermGpa > 3.7 ? (
                    'Challenging target: requires mostly A and A- grades across all enrolled subjects.'
                  ) : (
                    'Within comfortable reach with balanced B+ and A performance.'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Prior Academic Record Setup */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 pb-3 dark:border-neutral-800">
              Prior Academic Standing
            </h3>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Set your cumulative statistics prior to {state.activeTerm} (e.g. transfer credits, freshmen year).
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Prior GPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={priorGpaInput}
                  onChange={(e) => setPriorGpaInput(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-900 font-mono tabular-nums focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Prior Credits
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={priorCreditsInput}
                  onChange={(e) => setPriorCreditsInput(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-900 font-mono tabular-nums focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfileGpa}
              className="mt-4 w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Update Academic Baseline
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
