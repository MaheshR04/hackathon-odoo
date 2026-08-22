import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Calendar,
  Users,
  DollarSign,
  Download,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { api } from '../services/api';
import { AnalyticsData } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.analytics.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Fetch analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

  const leavePieData = data
    ? [
        { name: 'Paid Leaves', value: data.leaveAnalytics.leaveTypeCounts.Paid || 1 },
        { name: 'Sick Leaves', value: data.leaveAnalytics.leaveTypeCounts.Sick || 1 },
        { name: 'Unpaid Leaves', value: data.leaveAnalytics.leaveTypeCounts.Unpaid || 1 }
      ]
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Executive Business Intelligence
            </span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white tracking-tight">
            Workforce Analytics & Insights
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time visual telemetry across attendance trends, department payroll, and leave utilization
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shadow transition active:scale-95"
        >
          <Download className="h-4 w-4 text-purple-400" />
          <span>Print Intelligence Brief</span>
        </button>
      </div>

      {/* KPI Highlights Grid */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <span className="text-xs font-semibold text-slate-400">Overall Attendance Rate</span>
            <h3 className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
              {data.summary.attendanceRate}%
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Active workforce adherence</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <span className="text-xs font-semibold text-slate-400">Total Monthly Payroll</span>
            <h3 className="text-2xl font-extrabold text-white font-mono mt-1">
              ${data.summary.totalPayrollMonthly?.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Net monthly disbursed</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <span className="text-xs font-semibold text-slate-400">Pending Leave Requests</span>
            <h3 className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
              {data.summary.pendingLeaves}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Awaiting review in queue</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <span className="text-xs font-semibold text-slate-400">Average Compensation</span>
            <h3 className="text-2xl font-extrabold text-indigo-400 font-mono mt-1">
              ${data.summary.avgSalary?.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Per active full-time staff</p>
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 7-Day Attendance Trend Area Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">7-Day Attendance Trajectory</h3>
              <p className="text-xs text-slate-400">Daily check-in volume and active working staff</p>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="h-64 w-full">
            {data && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weeklyTrend}>
                  <defs>
                    <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="present" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#presentGrad)" name="Present Staff" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Department Payroll Expenditure Bar Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Department Payroll Expenditure</h3>
              <p className="text-xs text-slate-400">Gross monthly salary investment per business unit</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          <div className="h-64 w-full">
            {data && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.departmentSpend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="department" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={40} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `$${v/1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Monthly Spend']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="spend" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Spend ($)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Department Headcount Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Headcount by Department</h3>
              <p className="text-xs text-slate-400">Organizational staffing distribution</p>
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-3">
            {data?.departmentDistribution.map((item, idx) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>{item.name}</span>
                  <span className="font-mono">{item.count} Staff ({item.percentage}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Leave Distribution Pie Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Leave Categories Distribution</h3>
              <p className="text-xs text-slate-400">Breakdown of approved and requested leaves</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <PieIcon className="h-5 w-5" />
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {data && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leavePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leavePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
