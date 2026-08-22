import React, { useState, useEffect } from 'react';
import {
  Receipt,
  DollarSign,
  Download,
  Eye,
  Edit,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Building,
  CheckCircle2,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Payslip, SalaryStructure } from '../types';
import { PayslipModal } from '../components/PayslipModal';
import { SalaryStructureModal } from '../components/SalaryStructureModal';
import { generatePayslipPDF } from '../services/pdfGenerator';
import confetti from 'canvas-confetti';

export const PayrollPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [currentStructure, setCurrentStructure] = useState<SalaryStructure | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [allEmployeesPayroll, setAllEmployeesPayroll] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [editingStructureFor, setEditingStructureFor] = useState<{ id: string; name: string; structure?: SalaryStructure } | null>(null);
  const [batchMonth, setBatchMonth] = useState('August 2026');
  const [generatingBatch, setGeneratingBatch] = useState(false);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const res = await api.payroll.getAll();
        if (res.success) {
          setAllEmployeesPayroll(res.employees);
          setSummaryStats(res.summary);
          setPayslips(res.history);
        }
      } else {
        const res = await api.payroll.getMy();
        if (res.success) {
          setCurrentStructure(res.currentStructure);
          setPayslips(res.payslips);
        }
      }
    } catch (err) {
      console.error('Fetch payroll error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [user]);

  const handleRunBatchPayroll = async () => {
    setGeneratingBatch(true);
    try {
      const res = await api.payroll.generateBatch({
        month: batchMonth,
        payPeriod: `01 ${batchMonth.split(' ')[0]} 2026 - 31 ${batchMonth.split(' ')[0]} 2026`
      });
      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        fetchPayroll();
      }
    } catch (err) {
      console.error('Batch error:', err);
    } finally {
      setGeneratingBatch(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              {isAdmin ? 'Corporate Payroll Administration' : 'Compensation & Benefits'}
            </span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white tracking-tight">
            {isAdmin ? 'Company Payroll & Salary Ledger' : 'My Salary & Pay Slips'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAdmin
              ? 'Manage salary structures, generate monthly payslip batches, and monitor disbursements'
              : 'Read-only itemized compensation breakdown and official monthly payslips'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunBatchPayroll}
              disabled={generatingBatch}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition active:scale-95 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>{generatingBatch ? 'Processing...' : `Disburse ${batchMonth}`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Admin Executive Summary Banner */}
      {isAdmin && summaryStats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <span className="text-xs font-semibold text-slate-400">Total Monthly Gross</span>
            <h3 className="text-2xl font-bold text-white font-mono mt-1">
              ${summaryStats.totalMonthlyGross?.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Company-wide base compensation</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <span className="text-xs font-semibold text-slate-400">Total Deductions & Tax</span>
            <h3 className="text-2xl font-bold text-rose-400 font-mono mt-1">
              -${summaryStats.totalMonthlyDeductions?.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">PF, PT, and Income Tax (TDS)</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 backdrop-blur-xl">
            <span className="text-xs font-semibold text-emerald-400">Net Monthly Disbursed</span>
            <h3 className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
              ${summaryStats.totalMonthlyNet?.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Direct Bank Transfers</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <span className="text-xs font-semibold text-slate-400">Average Net Salary</span>
            <h3 className="text-2xl font-bold text-indigo-400 font-mono mt-1">
              ${summaryStats.averageNetSalary?.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Per active employee</p>
          </div>
        </div>
      )}

      {/* Employee Salary Structure Card (If viewing as Employee) */}
      {!isAdmin && currentStructure && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Official Compensation Structure
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Itemized Monthly Breakdown</h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Direct Deposit</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Earnings Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Earnings Components
              </h3>
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Basic Salary</span>
                  <span className="font-mono font-semibold">${currentStructure.basic?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-mono font-semibold">${currentStructure.hra?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Special Allowance</span>
                  <span className="font-mono font-semibold">${currentStructure.specialAllowance?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Performance Bonus</span>
                  <span className="font-mono font-semibold">${currentStructure.bonus?.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-white">
                  <span>Gross Monthly Salary</span>
                  <span className="font-mono text-emerald-400">${currentStructure.grossSalary?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Statutory Deductions
              </h3>
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Provident Fund (PF)</span>
                  <span className="font-mono font-semibold">${currentStructure.pfDeduction?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Professional Tax</span>
                  <span className="font-mono font-semibold">${currentStructure.professionalTax?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Income Tax (TDS)</span>
                  <span className="font-mono font-semibold">${currentStructure.incomeTaxTDS?.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-white">
                  <span>Net Take-Home Salary</span>
                  <span className="font-mono text-emerald-400 text-sm">${currentStructure.netSalary?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin: Employee Salary Structures Master Table */}
      {isAdmin && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Employee Salary Structures</h2>
            <span className="text-xs text-slate-400">{allEmployeesPayroll.length} total staff</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Basic</th>
                  <th className="py-3 px-4">HRA + Special</th>
                  <th className="py-3 px-4">Gross</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Pay</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                {allEmployeesPayroll.map(emp => {
                  const s = emp.salaryStructure || {};
                  const totalDeduc = (s.pfDeduction || 0) + (s.professionalTax || 0) + (s.incomeTaxTDS || 0);
                  return (
                    <tr key={emp.employeeId} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                            alt={emp.name}
                            className="h-8 w-8 rounded-lg object-cover ring-1 ring-purple-500/20"
                          />
                          <div>
                            <p className="font-bold text-white">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{emp.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                        {emp.department}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold whitespace-nowrap">
                        ${s.basic?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                        ${((s.hra || 0) + (s.specialAllowance || 0))?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                        ${s.grossSalary?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-rose-400 whitespace-nowrap">
                        -${totalDeduc.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400 whitespace-nowrap">
                        ${s.netSalary?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditingStructureFor({ id: emp.employeeId, name: emp.name, structure: s })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition ml-auto"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Edit Structure</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Slips Historical Ledger */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Monthly Pay Slips History</h2>
            <p className="text-xs text-slate-400">View and download official computer-generated PDF slips</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Pay Month</th>
                {isAdmin && <th className="py-3 px-4">Employee</th>}
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Gross Pay</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
              {payslips.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-10 text-center text-slate-500">
                    No payslips found.
                  </td>
                </tr>
              ) : (
                payslips.map(slip => (
                  <tr key={slip.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {slip.month}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-white">{slip.employeeName}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{slip.employeeId}</span>
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {slip.payPeriod}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {slip.paymentDate}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{slip.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      ${slip.grossPay?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400 whitespace-nowrap">
                      ${slip.netPay?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPayslip(slip)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => generatePayslipPDF(slip)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 text-xs font-semibold transition"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <PayslipModal
        payslip={selectedPayslip}
        isOpen={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
      />

      {editingStructureFor && (
        <SalaryStructureModal
          employeeId={editingStructureFor.id}
          employeeName={editingStructureFor.name}
          initialStructure={editingStructureFor.structure}
          isOpen={!!editingStructureFor}
          onClose={() => setEditingStructureFor(null)}
          onSuccess={fetchPayroll}
        />
      )}
    </div>
  );
};
