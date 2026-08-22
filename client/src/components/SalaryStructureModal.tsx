import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calculator, Save, AlertCircle, Sparkles } from 'lucide-react';
import { SalaryStructure } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface SalaryStructureModalProps {
  employeeId: string;
  employeeName: string;
  initialStructure?: SalaryStructure;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SalaryStructureModal: React.FC<SalaryStructureModalProps> = ({
  employeeId,
  employeeName,
  initialStructure,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [basic, setBasic] = useState(50000);
  const [hra, setHra] = useState(20000);
  const [specialAllowance, setSpecialAllowance] = useState(15000);
  const [bonus, setBonus] = useState(3000);
  const [pfDeduction, setPfDeduction] = useState(6000);
  const [professionalTax, setProfessionalTax] = useState(2000);
  const [incomeTaxTDS, setIncomeTaxTDS] = useState(7000);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialStructure) {
      setBasic(initialStructure.basic || 50000);
      setHra(initialStructure.hra || 20000);
      setSpecialAllowance(initialStructure.specialAllowance || 15000);
      setBonus(initialStructure.bonus || 0);
      setPfDeduction(initialStructure.pfDeduction || 6000);
      setProfessionalTax(initialStructure.professionalTax || 2000);
      setIncomeTaxTDS(initialStructure.incomeTaxTDS || 7000);
    }
  }, [initialStructure]);

  if (!isOpen) return null;

  // Real-time calculations
  const gross = Number(basic) + Number(hra) + Number(specialAllowance) + Number(bonus);
  const totalDeductions = Number(pfDeduction) + Number(professionalTax) + Number(incomeTaxTDS);
  const net = Math.max(0, gross - totalDeductions);

  const handleAutoCompute = () => {
    const b = Number(basic) || 50000;
    const h = Math.round(b * 0.4);
    const sa = Math.round(b * 0.3);
    const g = b + h + sa + Number(bonus);
    const pf = Math.round(b * 0.12);
    const pt = 2000;
    const tds = Math.round(g * 0.08);

    setHra(h);
    setSpecialAllowance(sa);
    setPfDeduction(pf);
    setProfessionalTax(pt);
    setIncomeTaxTDS(tds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.payroll.updateStructure(employeeId, {
        basic,
        hra,
        specialAllowance,
        bonus,
        pfDeduction,
        professionalTax,
        incomeTaxTDS
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
      setErrorMsg(err.message || 'Failed to update salary structure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 p-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configure Salary Structure</h3>
              <p className="text-xs text-slate-400">{employeeName} ({employeeId})</p>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Auto Formula Helper */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
            <div className="text-xs text-indigo-300">
              <p className="font-semibold">Auto-Benchmark Formulas</p>
              <p className="text-[11px] text-slate-400">HRA = 40% Basic • PF = 12% Basic • TDS = 8% Gross</p>
            </div>
            <button
              type="button"
              onClick={handleAutoCompute}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Auto-Fill</span>
            </button>
          </div>

          {/* Section: Earnings */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2.5">
              Monthly Earnings (Credits)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Basic Salary ($)</label>
                <input
                  type="number"
                  value={basic}
                  onChange={e => setBasic(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">House Rent Allowance - HRA ($)</label>
                <input
                  type="number"
                  value={hra}
                  onChange={e => setHra(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Special Allowance ($)</label>
                <input
                  type="number"
                  value={specialAllowance}
                  onChange={e => setSpecialAllowance(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Performance Bonus ($)</label>
                <input
                  type="number"
                  value={bonus}
                  onChange={e => setBonus(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Deductions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2.5">
              Monthly Deductions (Debits)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Provident Fund ($)</label>
                <input
                  type="number"
                  value={pfDeduction}
                  onChange={e => setPfDeduction(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Professional Tax ($)</label>
                <input
                  type="number"
                  value={professionalTax}
                  onChange={e => setProfessionalTax(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Income Tax / TDS ($)</label>
                <input
                  type="number"
                  value={incomeTaxTDS}
                  onChange={e => setIncomeTaxTDS(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Live Summary Calculation Box */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[11px] text-slate-400">Gross Monthly</p>
              <p className="text-sm font-bold text-white font-mono mt-0.5">${gross.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[11px] text-rose-400">Total Deductions</p>
              <p className="text-sm font-bold text-rose-400 font-mono mt-0.5">-${totalDeductions.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[11px] text-emerald-400 font-semibold">Net Take-Home</p>
              <p className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">${net.toLocaleString()}</p>
            </div>
          </div>

          {/* Footer Actions */}
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/50 transition disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{loading ? 'Updating...' : 'Save Salary Structure'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
