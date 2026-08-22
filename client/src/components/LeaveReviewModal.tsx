import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, User, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { LeaveRequest } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface LeaveReviewModalProps {
  leave: LeaveRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  leave,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [adminComments, setAdminComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !leave) return null;

  const handleAction = async (decision: 'Approved' | 'Rejected') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.leaves.updateStatus(leave.id, {
        status: decision,
        adminComments: adminComments.trim() || (decision === 'Approved' ? 'Approved by HR Operations.' : 'Rejected by HR Operations.')
      });
      if (res.success) {
        if (decision === 'Approved') {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 p-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Review Leave Application</h3>
              <p className="text-xs text-slate-400">ID: {leave.id} • {leave.employeeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Employee Summary Card */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <img
              src={leave.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leave.employeeName}`}
              alt={leave.employeeName}
              className="h-11 w-11 rounded-xl object-cover ring-2 ring-purple-500/20"
            />
            <div>
              <p className="text-xs font-bold text-white">{leave.employeeName}</p>
              <p className="text-[11px] text-slate-400">{leave.employeeId} • {leave.department}</p>
              <p className="text-[11px] text-slate-400">Applied on: {leave.appliedAt}</p>
            </div>
          </div>

          {/* Leave Details Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Leave Type:</span>
              <p className="font-bold text-indigo-300 mt-0.5">{leave.leaveType} Leave</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Duration:</span>
              <p className="font-bold text-white mt-0.5">{leave.totalDays} Days ({leave.startDate} to {leave.endDate})</p>
            </div>
          </div>

          {/* Employee Reason */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-1">
              Employee's Reason / Note:
            </span>
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/50 text-xs text-slate-200 leading-relaxed italic">
              "{leave.reason}"
            </div>
          </div>

          {/* Admin Feedback Comments */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
              <span>HR / Admin Feedback Comments (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={adminComments}
              onChange={e => setAdminComments(e.target.value)}
              placeholder="e.g. Approved. Please ensure critical tasks are delegated."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Decision Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleAction('Rejected')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600/30 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              <span>Reject Request</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleAction('Approved')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/50 transition active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Approve Leave</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
