import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Payslip } from '../types';

export const generatePayslipPDF = (payslip: Payslip) => {
  const doc = new jsPDF();

  // Document Colors
  const primaryColor: [number, number, number] = [113, 75, 103]; // Odoo plum #714B67
  const darkSlate: [number, number, number] = [30, 41, 59];
  const emeraldGreen: [number, number, number] = [5, 150, 105];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 38, 'F');

  // Company Branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('DAYFLOW HRMS', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Every workday, perfectly aligned.', 14, 28);
  doc.text('PAYSLIP CONFIDENTIAL', 150, 20);
  doc.text(`Period: ${payslip.payPeriod}`, 150, 28);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);

  // Employee Details Card Header
  doc.setTextColor(...darkSlate);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', 14, 50);

  // 2-column Employee Metadata
  const empDetails = [
    ['Employee Name:', payslip.employeeName, 'Pay Month:', payslip.month],
    ['Employee ID:', payslip.employeeId, 'Payment Date:', payslip.paymentDate],
    ['Department:', payslip.department, 'Payment Status:', payslip.status.toUpperCase()],
    ['Designation:', payslip.designation, 'Payment Mode:', payslip.paymentMethod]
  ];

  autoTable(doc, {
    startY: 55,
    body: empDetails,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35, textColor: [30, 41, 59] },
      1: { cellWidth: 65 },
      2: { fontStyle: 'bold', cellWidth: 35, textColor: [30, 41, 59] },
      3: { cellWidth: 55, fontStyle: 'bold', textColor: [5, 150, 105] }
    }
  });

  // Salary Itemization Tables (Earnings vs Deductions)
  const finalY1 = (doc as any).lastAutoTable.finalY + 8;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Earnings Breakdown', 14, finalY1);
  doc.text('Deductions Breakdown', 110, finalY1);

  const earningsData = [
    ['Basic Salary', `$${payslip.basic.toLocaleString()}`],
    ['House Rent Allowance (HRA)', `$${payslip.hra.toLocaleString()}`],
    ['Special Allowance', `$${payslip.specialAllowance.toLocaleString()}`],
    ['Performance Bonus', `$${payslip.bonus.toLocaleString()}`],
    ['Gross Earnings', `$${payslip.grossPay.toLocaleString()}`]
  ];

  const deductionsData = [
    ['Provident Fund (PF)', `$${payslip.pf.toLocaleString()}`],
    ['Professional Tax', `$${payslip.professionalTax.toLocaleString()}`],
    ['Income Tax (TDS)', `$${payslip.tds.toLocaleString()}`],
    ['Other Withholdings', '$0'],
    ['Total Deductions', `$${payslip.totalDeductions.toLocaleString()}`]
  ];

  // Earnings Table (Left)
  autoTable(doc, {
    startY: finalY1 + 4,
    margin: { left: 14, right: 110 },
    head: [['Earnings Component', 'Amount']],
    body: earningsData,
    theme: 'striped',
    headStyles: { fillColor: [113, 75, 103], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, cellPadding: 3 },
    foot: [['Gross Earnings', `$${payslip.grossPay.toLocaleString()}`]],
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
  });

  // Deductions Table (Right)
  autoTable(doc, {
    startY: finalY1 + 4,
    margin: { left: 110, right: 14 },
    head: [['Deductions Component', 'Amount']],
    body: deductionsData,
    theme: 'striped',
    headStyles: { fillColor: [225, 29, 72], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, cellPadding: 3 },
    foot: [['Total Deductions', `$${payslip.totalDeductions.toLocaleString()}`]],
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
  });

  // Net Pay Highlight Box
  const finalY2 = Math.max((doc as any).lastAutoTable.finalY, 185);

  doc.setFillColor(240, 253, 244); // light emerald
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(1);
  doc.roundedRect(14, finalY2 + 10, 182, 30, 3, 3, 'FD');

  doc.setTextColor(...emeraldGreen);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('NET SALARY TRANSFERRED', 20, finalY2 + 22);

  doc.setFontSize(18);
  doc.text(`$${payslip.netPay.toLocaleString()}`, 20, finalY2 + 33);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Ref ID: TXN-${payslip.id.toUpperCase()}`, 130, finalY2 + 22);
  doc.text('Verified & Credited by Dayflow HRMS', 130, finalY2 + 30);

  // Footer Signatures & Disclaimer
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 260, 75, 260);
  doc.line(135, 260, 196, 260);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Employee Signature', 30, 265);
  doc.text('Authorized HR Signatory', 145, 265);

  doc.text('This is a computer-generated official payslip and does not require physical stamp if verified digitally.', 14, 280);

  // Trigger Save
  doc.save(`Payslip_${payslip.employeeName.replace(/\s+/g, '_')}_${payslip.month.replace(/\s+/g, '_')}.pdf`);
};

export const exportAttendanceCSV = (records: any[]) => {
  const headers = ['Date', 'Employee ID', 'Employee Name', 'Department', 'Status', 'Check In', 'Check Out', 'Hours', 'Remarks'];
  const rows = records.map(r => [
    r.date,
    r.employeeId,
    r.employeeName,
    r.department || 'N/A',
    r.status,
    r.checkIn || '-',
    r.checkOut || '-',
    r.workingHours || '0',
    `"${(r.remarks || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Dayflow_Attendance_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
