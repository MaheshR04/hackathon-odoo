import React from 'react';
import { X, Download, Printer, Receipt, CheckCircle, Building, ShieldCheck } from 'lucide-react';
import { Payslip } from '../types';
import { generatePayslipPDF } from '../services/pdfGenerator';

interface PayslipModalProps {
  payslip: Payslip | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ payslip, isOpen, onClose }) => {
  if (!isOpen || !payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generatePayslipPDF(payslip);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/85 backdrop-blur-md" />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl z-10 max-h-[90vh] flex flex-col">
        {/* Header Bar with Action Buttons */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 p-4 px-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Receipt className="h-4 w-4 text-purple-400" />
            <span>Official Salary Slip Voucher</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Payslip Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-950 text-slate-100 font-sans">
          {/* Slip Top Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-sm">
                  D
                </div>
                <h2 className="text-xl font-extrabold font-display tracking-tight text-white">
                  DAYFLOW<span className="text-purple-400">.</span>HRMS
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Dayflow Corporate Systems Inc. • HR & Payroll Operations
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="h-3 w-3" />
                <span>{payslip.status}</span>
              </span>
              <p className="text-xs font-bold text-white mt-1.5">{payslip.month}</p>
              <p className="text-[11px] text-slate-400">Period: {payslip.payPeriod}</p>
            </div>
          </div>

          {/* Employee Metadata Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[11px]">Employee Name</span>
              <p className="font-bold text-white mt-0.5">{payslip.employeeName}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Employee ID</span>
              <p className="font-mono font-bold text-purple-300 mt-0.5">{payslip.employeeId}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Department</span>
              <p className="font-semibold text-slate-200 mt-0.5">{payslip.department}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Payment Date</span>
              <p className="font-semibold text-slate-200 mt-0.5">{payslip.paymentDate}</p>
            </div>
          </div>

          {/* Earnings and Deductions 2-Column Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Earnings */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <div className="p-3 bg-purple-950/30 border-b border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Earnings</span>
                <span className="text-xs font-bold text-purple-300">Amount</span>
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Basic Salary</span>
                  <span className="font-mono">${payslip.basic.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-mono">${payslip.hra.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Special Allowance</span>
                  <span className="font-mono">${payslip.specialAllowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Performance Bonus</span>
                  <span className="font-mono">${payslip.bonus.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
                  <span>Gross Earnings</span>
                  <span className="font-mono text-emerald-400">${payslip.grossPay.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <div className="p-3 bg-rose-950/30 border-b border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Deductions</span>
                <span className="text-xs font-bold text-rose-300">Amount</span>
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Provident Fund (PF)</span>
                  <span className="font-mono">${payslip.pf.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Professional Tax</span>
                  <span className="font-mono">${payslip.professionalTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Income Tax (TDS)</span>
                  <span className="font-mono">${payslip.tds.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Other Withholdings</span>
                  <span className="font-mono">$0</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-400">-${payslip.totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Total Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Net Take-Home Salary Transferred</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Processed via {payslip.paymentMethod}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl font-extrabold font-mono text-emerald-400">
                ${payslip.netPay.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Verification Sign-off */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
            <span>Ref: TXN-PAYSLIP-{payslip.id.toUpperCase()}</span>
            <span>Digitally verified by Dayflow HR System</span>
          </div>
        </div>
      </div>
    </div>
  );
};
