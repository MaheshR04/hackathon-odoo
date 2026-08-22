import React, { useState } from 'react';
import { X, Calendar, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface LeaveApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  balances?: {
    paidAvailable: number;
    sickAvailable: number;
  };
}

export const LeaveApplyModal: React.FC<LeaveApplyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  balances
}) => {
  const [leaveType, setLeaveType] = useState<'Paid' | 'Sick' | 'Unpaid'>('Paid');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    if (d1 > d2) return 0;
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1;
    return Math.max(1, diff);
  };

  const totalDays = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalDays <= 0) {
      setErrorMsg('End date must be the same or after start date.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Please enter the reason for your leave request.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.leaves.apply({
        leaveType,
        startDate,
        endDate,
        reason
      });
      if (res.success) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit leave request');
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
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Apply for Leave / Time-Off</h3>
              <p className="text-xs text-slate-400">Submit time-off request for HR approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Leave Type Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Leave Category
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setLeaveType('Paid')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                  leaveType === 'Paid'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span>Paid Leave</span>
                {balances && (
                  <span className="text-[10px] text-purple-400 font-normal mt-0.5">
                    {balances.paidAvailable}d left
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setLeaveType('Sick')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                  leaveType === 'Sick'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span>Sick Leave</span>
                {balances && (
                  <span className="text-[10px] text-emerald-400 font-normal mt-0.5">
                    {balances.sickAvailable}d left
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setLeaveType('Unpaid')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                  leaveType === 'Unpaid'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span>Unpaid Leave</span>
                <span className="text-[10px] text-amber-400 font-normal mt-0.5">Casual/Special</span>
              </button>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Computed Duration Chip */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-xs text-slate-300">Requested Duration:</span>
            <span className="text-xs font-bold text-indigo-400 font-mono">
              {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          {/* Reason / Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reason / Remarks
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Attending family function / Doctor consultation & rest"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-950/50 transition disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
