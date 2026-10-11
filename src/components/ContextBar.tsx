import React from 'react';
import { useCanteen } from '../context/CanteenContext';
import { SCHOOL_EVENTS } from '../data/initialData';
import { DayOfWeek, RecessPeriod, WeatherCondition } from '../types';
import { CloudSun, Calendar, Clock, RefreshCw } from 'lucide-react';

export const ContextBar: React.FC = () => {
  const {
    currentUser,
    simulationContext,
    setSimulationContext,
    loginAs,
  } = useCanteen();

  const isStaff = currentUser?.role === 'staff';

  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const recesses: RecessPeriod[] = [
    'Morning Recess (09:30–10:15)',
    'Upper Sec Recess (10:30–11:15)',
    'Lunch Break (12:15–13:30)',
  ];
  const weathers: WeatherCondition[] = [
    'Sunny (31°C)',
    'Cloudy (28°C)',
    'Rainy (25°C)',
  ];

  return (
    <div
      className={`border-b px-4 sm:px-6 py-2.5 text-xs ${
        isStaff
          ? 'bg-purple-50/70 border-purple-200 text-slate-800'
          : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-900">
            Campus Forecast Context:
          </span>

          {/* Day Selector */}
          <label className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              aria-label="Select School Day"
              value={simulationContext.selectedDay}
              onChange={(e) =>
                setSimulationContext((prev) => ({
                  ...prev,
                  selectedDay: e.target.value as DayOfWeek,
                }))
              }
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          {/* Recess Period Selector */}
          <label className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <select
              aria-label="Select Recess Period"
              value={simulationContext.selectedRecess}
              onChange={(e) =>
                setSimulationContext((prev) => ({
                  ...prev,
                  selectedRecess: e.target.value as RecessPeriod,
                }))
              }
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {recesses.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          {/* Weather Selector */}
          <label className="inline-flex items-center gap-1.5">
            <CloudSun className="w-3.5 h-3.5 text-slate-500" />
            <select
              aria-label="Select Weather Condition"
              value={simulationContext.weather}
              onChange={(e) =>
                setSimulationContext((prev) => ({
                  ...prev,
                  weather: e.target.value as WeatherCondition,
                }))
              }
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {weathers.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </label>

          {/* School Event Selector */}
          <label className="inline-flex items-center gap-1.5">
            <span className="text-slate-500 hidden sm:inline">Event:</span>
            <select
              aria-label="Select School Event"
              value={simulationContext.activeEventId}
              onChange={(e) =>
                setSimulationContext((prev) => ({
                  ...prev,
                  activeEventId: e.target.value,
                }))
              }
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-medium text-slate-900 max-w-[220px] truncate focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {SCHOOL_EVENTS.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Role Quick Switcher for Prototype Testing */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 hidden md:inline">
            Signed in: <strong className="text-slate-900">{currentUser?.name}</strong> ({currentUser?.subRole})
          </span>
          <button
            type="button"
            onClick={() =>
              loginAs(isStaff ? 'usr-student-1' : 'usr-staff-1')
            }
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 ${
              isStaff
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-purple-700 text-white hover:bg-purple-800'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            <span>
              Switch to {isStaff ? 'Student View' : 'Staff Console'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
