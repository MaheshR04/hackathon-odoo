import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, CheckCircle2, Coffee, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { AttendanceRecord } from '../types';

interface LiveClockWidgetProps {
  todayRecord: AttendanceRecord | null;
  onAttendanceChange: () => void;
}

export const LiveClockWidget: React.FC<LiveClockWidgetProps> = ({ todayRecord, onAttendanceChange }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live real clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate elapsed time if checked in
  useEffect(() => {
    if (todayRecord && todayRecord.checkIn && !todayRecord.checkOut) {
      const interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [todayRecord]);

  const handleCheckIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const clientTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const clientDate = new Date().toLocaleDateString('en-CA'); // Local YYYY-MM-DD
      const res = await api.attendance.checkIn(remarks || 'Web Portal Check-in', clientTime, clientDate);
      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setRemarks('');
        onAttendanceChange();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const clientTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const clientDate = new Date().toLocaleDateString('en-CA');
      const res = await api.attendance.checkOut(clientTime, clientDate);
      if (res.success) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 }
        });
        onAttendanceChange();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = !!(todayRecord && todayRecord.checkIn);
  const isCheckedOut = !!(todayRecord && todayRecord.checkOut);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 p-6 backdrop-blur-xl shadow-xl">
      {/* Decorative ambient background */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left: Clock Display & Date */}
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-inner">
            <Clock className="h-8 w-8 animate-pulse-subtle" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Attendance Ticker</span>
            </div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-white mt-1">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Center: Shift Status & Timing */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-800/60 rounded-xl p-3 px-5 border border-slate-700/50">
          <div className="text-center sm:text-left">
            <p className="text-xs text-slate-400 font-medium">Today's Status</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isCheckedOut
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : isCheckedIn
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                }`}
              >
                {isCheckedOut ? 'Shift Completed' : isCheckedIn ? 'Currently Active' : 'Not Checked In'}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700 hidden sm:block" />

          <div>
            <p className="text-xs text-slate-400 font-medium">Check-In Time</p>
            <p className="text-sm font-semibold text-white mt-0.5">
              {todayRecord?.checkIn || '--:--'}
            </p>
          </div>

          <div className="h-8 w-px bg-slate-700 hidden sm:block" />

          <div>
            <p className="text-xs text-slate-400 font-medium">Check-Out Time</p>
            <p className="text-sm font-semibold text-white mt-0.5">
              {todayRecord?.checkOut || '--:--'}
            </p>
          </div>

          {isCheckedIn && (
            <>
              <div className="h-8 w-px bg-slate-700 hidden sm:block" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Hours Logged</p>
                <p className="text-sm font-semibold font-mono text-indigo-400 mt-0.5">
                  {todayRecord.workingHours ? `${todayRecord.workingHours} hrs` : 'In Progress'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {!isCheckedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full lg:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>{loading ? 'Clocking In...' : 'Check In Now'}</span>
            </button>
          ) : !isCheckedOut ? (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="w-full lg:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-semibold shadow-lg shadow-rose-900/30 hover:shadow-rose-900/50 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              <Square className="h-4 w-4 fill-white" />
              <span>{loading ? 'Clocking Out...' : 'Check Out Shift'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Shift logged for today</span>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
