import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CalendarCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  MessageSquare,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LeaveRequest } from '../types';
import { LeaveApplyModal } from '../components/LeaveApplyModal';
import { LeaveReviewModal } from '../components/LeaveReviewModal';

export const LeavesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRequest | null>(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const res = await api.leaves.getAll({
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          leaveType: selectedType !== 'all' ? selectedType : undefined,
          search: search || undefined
        });
        if (res.success) {
          setRequests(res.requests);
        }
      } else {
        const res = await api.leaves.getMy();
        if (res.success) {
          setRequests(res.requests);
          setBalances(res.balances);
        }
      }
    } catch (err) {
      console.error('Fetch leaves error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [selectedStatus, selectedType, search]);

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" />
            <span>Approved</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="h-3 w-3" />
            <span>Rejected</span>
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
            <Clock className="h-3 w-3" />
            <span>Pending Review</span>
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
              {isAdmin ? 'Time-Off Approvals & Governance' : 'Leave Balance & History'}
            </span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white tracking-tight">
            {isAdmin ? 'Company Leave Approvals Center' : 'My Leave Applications'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAdmin
              ? 'Review pending time-off requests, approve or reject with comments'
              : 'Apply for paid/sick leave and monitor approval status in real time'}
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balances Cards (For Employee or Admin) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-slate-900/80 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Paid Leave</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-white font-mono mt-2">
            {balances?.paidAvailable ?? 15} <span className="text-xs font-normal text-slate-400">Days Available</span>
          </h3>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Total: {balances?.paidTotal ?? 18}d</span>
            <span>Used: {balances?.paidUsed ?? 3}d</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-slate-900/80 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Sick Leave</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-white font-mono mt-2">
            {balances?.sickAvailable ?? 8} <span className="text-xs font-normal text-slate-400">Days Available</span>
          </h3>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Total: {balances?.sickTotal ?? 10}d</span>
            <span>Used: {balances?.sickUsed ?? 2}d</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-slate-900/80 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Unpaid / Casual</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-white font-mono mt-2">
            {balances?.unpaidUsed ?? 0} <span className="text-xs font-normal text-slate-400">Days Taken</span>
          </h3>
          <div className="mt-3 text-xs text-slate-400">
            <span>Special leaves approval required</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAdmin ? "Search by employee name or reason..." : "Search in reasons..."}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending Only</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Leave Types</option>
            <option value="Paid">Paid Leave</option>
            <option value="Sick">Sick Leave</option>
            <option value="Unpaid">Unpaid Leave</option>
          </select>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                {isAdmin && <th className="py-3.5 px-4">Employee</th>}
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Dates</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">HR Comments</th>
                {isAdmin && <th className="py-3.5 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-500">
                    Loading leave requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-500">
                    No leave requests found matching filters.
                  </td>
                </tr>
              ) : (
                requests.map(leave => (
                  <tr key={leave.id} className="hover:bg-slate-800/40 transition">
                    {isAdmin && (
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={leave.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leave.employeeName}`}
                            alt={leave.employeeName}
                            className="h-7 w-7 rounded-lg object-cover ring-1 ring-purple-500/20"
                          />
                          <div>
                            <p className="font-bold text-white">{leave.employeeName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{leave.employeeId}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-indigo-300">{leave.leaveType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                      {leave.totalDays} {leave.totalDays === 1 ? 'Day' : 'Days'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {leave.startDate} → {leave.endDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                      {leave.reason}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 italic max-w-xs truncate">
                      {leave.adminComments || '-'}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {leave.status === 'Pending' ? (
                          <button
                            onClick={() => setReviewingLeave(leave)}
                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            onClick={() => setReviewingLeave(leave)}
                            className="px-2.5 py-1 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] transition"
                          >
                            Re-evaluate
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <LeaveApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={fetchLeaves}
        balances={balances}
      />

      <LeaveReviewModal
        isOpen={!!reviewingLeave}
        leave={reviewingLeave}
        onClose={() => setReviewingLeave(null)}
        onSuccess={fetchLeaves}
      />
    </div>
  );
};
