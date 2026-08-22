import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Download,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AttendanceRecord } from '../types';
import { LiveClockWidget } from '../components/LiveClockWidget';
import { exportAttendanceCSV } from '../services/pdfGenerator';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('table');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const res = await api.attendance.getAll({
          date: filterDate || undefined,
          department: filterDept !== 'all' ? filterDept : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          search: search || undefined
        });
        if (res.success) {
          setRecords(res.records);
          setStats(res.stats);
        }

        // Also fetch user's own today record for check-in widget
        const myRes = await api.attendance.getMy();
        if (myRes.success) {
          setTodayRecord(myRes.todayRecord);
        }
      } else {
        const res = await api.attendance.getMy();
        if (res.success) {
          setRecords(res.records);
          setTodayRecord(res.todayRecord);
          setStats(res.stats);
        }
      }
    } catch (err) {
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [filterDate, filterDept, filterStatus, search]);

  const handleExportCSV = () => {
    exportAttendanceCSV(records);
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Present</span>
          </span>
        );
      case 'Half-day':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Half-day</span>
          </span>
        );
      case 'Leave':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span>On Leave</span>
          </span>
        );
      case 'Absent':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span>Absent</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              {isAdmin ? 'Corporate Attendance Log' : 'Personal Attendance Tracker'}
            </span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white tracking-tight">
            {isAdmin ? 'Company Attendance Management' : 'My Shift & Attendance History'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAdmin
              ? 'Real-time daily logs, check-in timestamps, and team compliance'
              : 'Track your daily check-in, check-out, and total working hours'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shadow transition active:scale-95"
        >
          <Download className="h-4 w-4 text-purple-400" />
          <span>Export Report (CSV)</span>
        </button>
      </div>

      {/* Live Check-In Widget */}
      <LiveClockWidget
        todayRecord={todayRecord}
        onAttendanceChange={fetchAttendance}
      />

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div className="sm:col-span-4 relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAdmin ? "Search employee name or ID..." : "Search remarks..."}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-3">
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
          />
        </div>

        {isAdmin && (
          <div className="sm:col-span-3">
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Departments</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Engineering">Engineering</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Sales & Growth">Sales & Growth</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        )}

        <div className={isAdmin ? 'sm:col-span-2' : 'sm:col-span-5'}>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Half-day">Half-day</option>
            <option value="Leave">On Leave</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                {isAdmin && <th className="py-3.5 px-4">Employee</th>}
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Check-In</th>
                <th className="py-3.5 px-4">Check-Out</th>
                <th className="py-3.5 px-4">Hours Logged</th>
                <th className="py-3.5 px-4">Remarks / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading attendance entries...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No attendance records found for the selected filters.
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-white whitespace-nowrap">
                      {record.date}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={record.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.employeeName}`}
                            alt={record.employeeName}
                            className="h-7 w-7 rounded-lg object-cover ring-1 ring-purple-500/20"
                          />
                          <div>
                            <p className="font-bold text-white">{record.employeeName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{record.employeeId}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {record.checkIn || '--:--'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {record.checkOut || '--:--'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400 whitespace-nowrap">
                      {record.workingHours ? `${record.workingHours} hrs` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {record.remarks || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
