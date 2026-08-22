import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  CalendarCheck,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowRight,
  TrendingUp,
  Shield,
  Briefcase,
  Sparkles,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { LiveClockWidget } from '../components/LiveClockWidget';
import { LeaveApplyModal } from '../components/LeaveApplyModal';
import { LeaveReviewModal } from '../components/LeaveReviewModal';
import { AddEmployeeModal } from '../components/AddEmployeeModal';
import { NavTab } from '../components/Sidebar';
import { AttendanceRecord, LeaveRequest, Employee } from '../types';

interface DashboardPageProps {
  setActiveTab: (tab: NavTab) => void;
  onSelectEmployeeForDossier?: (empId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setActiveTab,
  onSelectEmployeeForDossier
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Data states
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [myAttendanceStats, setMyAttendanceStats] = useState<any>(null);
  const [leaveBalances, setLeaveBalances] = useState<any>(null);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showApplyLeave, setShowApplyLeave] = useState(false);
  const [selectedLeaveToReview, setSelectedLeaveToReview] = useState<LeaveRequest | null>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        // Fetch Admin Analytics & Pending Leaves & Attendance
        const [analyticsRes, leavesRes, empRes, attRes] = await Promise.all([
          api.analytics.getDashboard(),
          api.leaves.getAll({ status: 'Pending' }),
          api.employees.getAll(),
          api.attendance.getMy()
        ]);

        if (analyticsRes.success) setAdminStats(analyticsRes.data);
        if (leavesRes.success) setPendingLeaves(leavesRes.requests);
        if (empRes.success) setRecentEmployees(empRes.employees.slice(0, 5));
        if (attRes.success) {
          setTodayRecord(attRes.todayRecord);
          setMyAttendanceStats(attRes.stats);
        }
      } else {
        // Employee Dashboard Data
        const [attRes, leavesRes] = await Promise.all([
          api.attendance.getMy(),
          api.leaves.getMy()
        ]);

        if (attRes.success) {
          setTodayRecord(attRes.todayRecord);
          setMyAttendanceStats(attRes.stats);
        }
        if (leavesRes.success) {
          setLeaveBalances(leavesRes.balances);
          setPendingLeaves(leavesRes.requests.slice(0, 4));
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                {isAdmin ? 'HR Executive Command Center' : 'Employee Self-Service Portal'}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good day, {user?.name} 👋
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              {isAdmin
                ? `You have ${pendingLeaves.length} pending leave approvals requiring action today.`
                : `Your monthly attendance is in good standing. Log your shift or manage your time-off.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setShowAddEmployee(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition active:scale-95"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Onboard Employee</span>
                </button>
                <button
                  onClick={() => setActiveTab('leaves')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition"
                >
                  <CalendarCheck className="h-4 w-4 text-purple-400" />
                  <span>Review Leaves ({pendingLeaves.length})</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowApplyLeave(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition active:scale-95"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Apply for Time-Off</span>
                </button>
                <button
                  onClick={() => setActiveTab('payroll')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition"
                >
                  <Receipt className="h-4 w-4 text-emerald-400" />
                  <span>View Pay Slips</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Live Working Hours / Check-In Widget */}
      <LiveClockWidget
        todayRecord={todayRecord}
        onAttendanceChange={fetchDashboardData}
      />

      {/* KPI Metric Cards */}
      {isAdmin ? (
        /* Admin KPIs */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Headcount"
            value={adminStats?.summary?.totalEmployees || 6}
            subtitle={`${adminStats?.summary?.activeStaff || 6} Active Staff`}
            icon={Users}
            color="purple"
            onClick={() => setActiveTab('employees')}
          />
          <StatCard
            title="Present Today"
            value={adminStats?.summary?.presentToday || 5}
            subtitle={`${adminStats?.summary?.attendanceRate || 85}% Attendance Rate`}
            icon={Clock}
            color="emerald"
            onClick={() => setActiveTab('attendance')}
          />
          <StatCard
            title="Pending Leave Requests"
            value={pendingLeaves.length}
            subtitle="Requires HR Review"
            icon={CalendarCheck}
            color="amber"
            onClick={() => setActiveTab('leaves')}
          />
          <StatCard
            title="Monthly Payroll Spend"
            value={`$${(adminStats?.summary?.totalPayrollMonthly || 493000).toLocaleString()}`}
            subtitle="Disbursed & Verified"
            icon={Receipt}
            color="blue"
            onClick={() => setActiveTab('payroll')}
          />
        </div>
      ) : (
        /* Employee KPIs */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Paid Leave Balance"
            value={`${leaveBalances?.paidAvailable ?? 15} Days`}
            subtitle={`Total: ${leaveBalances?.paidTotal ?? 18} • Used: ${leaveBalances?.paidUsed ?? 3}`}
            icon={Calendar}
            color="purple"
            onClick={() => setShowApplyLeave(true)}
          />
          <StatCard
            title="Sick Leave Balance"
            value={`${leaveBalances?.sickAvailable ?? 8} Days`}
            subtitle={`Total: ${leaveBalances?.sickTotal ?? 10} • Used: ${leaveBalances?.sickUsed ?? 2}`}
            icon={CalendarCheck}
            color="emerald"
            onClick={() => setShowApplyLeave(true)}
          />
          <StatCard
            title="Total Working Hours"
            value={`${myAttendanceStats?.totalHours ?? 32.5} hrs`}
            subtitle={`Avg: ${myAttendanceStats?.avgDailyHours ?? 8.2} hrs/day`}
            icon={Clock}
            color="blue"
            onClick={() => setActiveTab('attendance')}
          />
          <StatCard
            title="Current Net Salary"
            value={`$${(user?.salaryStructure?.netSalary ?? 82000).toLocaleString()}`}
            subtitle="Direct Bank Transfer"
            icon={Receipt}
            color="amber"
            onClick={() => setActiveTab('payroll')}
          />
        </div>
      )}

      {/* Main Content Split (Recent Activity & Action Drawers) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Quick Access / Pending Actions */}
        <div className="lg:col-span-7 space-y-6">
          {isAdmin ? (
            /* Admin Pending Approvals Quick Hub */
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Pending Leave Approvals</h3>
                    <p className="text-xs text-slate-400">Immediate action required by HR</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('leaves')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {pendingLeaves.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500/40 mx-auto mb-2" />
                  <p>All employee leave requests have been reviewed!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingLeaves.map(req => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-800/50 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={req.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.employeeName}`}
                          alt={req.employeeName}
                          className="h-10 w-10 rounded-xl object-cover ring-2 ring-purple-500/20"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{req.employeeName}</p>
                          <p className="text-[11px] text-slate-400">
                            {req.leaveType} Leave • {req.totalDays}d ({req.startDate} to {req.endDate})
                          </p>
                          <p className="text-[11px] text-slate-300 italic mt-0.5 line-clamp-1">
                            "{req.reason}"
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedLeaveToReview(req)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Employee Recent Leaves & Applications */
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">My Recent Leave Requests</h3>
                    <p className="text-xs text-slate-400">Track status of your applications</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApplyLeave(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  <span>Apply New</span>
                  <PlusCircle className="h-3.5 w-3.5" />
                </button>
              </div>

              {pendingLeaves.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <p>No recent leave applications. Click Apply New to submit one.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingLeaves.map(req => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-800/40 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{req.leaveType} Leave</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              req.status === 'Approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : req.status === 'Rejected'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {req.totalDays} Days ({req.startDate} to {req.endDate})
                        </p>
                        {req.adminComments && (
                          <p className="text-[11px] text-indigo-300 mt-0.5">
                            HR Note: "{req.adminComments}"
                          </p>
                        )}
                      </div>

                      <div className="text-right text-[11px] text-slate-500">
                        <span>{req.appliedAt?.split(' ')[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 5 Cols: Quick Team Directory / Switcher */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Team Colleagues</h3>
                  <p className="text-xs text-slate-400">Quick view team members</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('employees')}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                View Directory
              </button>
            </div>

            <div className="space-y-3">
              {(recentEmployees.length > 0
                ? recentEmployees
                : [
                    { id: 'EMP-001', name: 'Sarah Connor', designation: 'Head of People & HR', department: 'Human Resources', role: 'admin' },
                    { id: 'EMP-002', name: 'Alex Rivera', designation: 'Senior Full Stack Engineer', department: 'Engineering', role: 'employee' },
                    { id: 'EMP-003', name: 'Elena Rostova', designation: 'Lead UI/UX Designer', department: 'Product & Design', role: 'employee' },
                    { id: 'EMP-004', name: 'David Chen', designation: 'DevOps Architect', department: 'Engineering', role: 'employee' }
                  ]
              ).map(emp => (
                <div
                  key={emp.id}
                  onClick={() => {
                    if (onSelectEmployeeForDossier) {
                      onSelectEmployeeForDossier(emp.id);
                    } else {
                      setActiveTab('employees');
                    }
                  }}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                      alt={emp.name}
                      className="h-9 w-9 rounded-xl object-cover ring-2 ring-purple-500/20"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{emp.name}</p>
                      <p className="text-[11px] text-slate-400">{emp.designation}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                    {emp.department}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LeaveApplyModal
        isOpen={showApplyLeave}
        onClose={() => setShowApplyLeave(false)}
        onSuccess={fetchDashboardData}
        balances={leaveBalances}
      />

      <LeaveReviewModal
        isOpen={!!selectedLeaveToReview}
        leave={selectedLeaveToReview}
        onClose={() => setSelectedLeaveToReview(null)}
        onSuccess={fetchDashboardData}
      />

      <AddEmployeeModal
        isOpen={showAddEmployee}
        onClose={() => setShowAddEmployee(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};
