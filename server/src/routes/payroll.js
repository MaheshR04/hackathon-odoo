import express from 'express';
import db from '../db/store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to convert number to words for Payslip
function inWords(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString()).length > 9) return 'overflow';
  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Dollars Only' : 'Dollars Only';
  return str.trim();
}

// Get logged-in employee's own payroll & payslip history (Read-only)
router.get('/my', authenticateToken, (req, res) => {
  try {
    const employees = db.getCollection('employees');
    const payrollHistory = db.getCollection('payrollHistory');
    const emp = employees.find(e => e.id === req.user.id);

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    const myPayslips = payrollHistory.filter(p => p.employeeId === req.user.id);
    myPayslips.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    return res.json({
      success: true,
      currentStructure: emp.salaryStructure,
      payslips: myPayslips
    });
  } catch (error) {
    console.error('Fetch my payroll error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving payroll records.' });
  }
});

// Admin View: Company-wide payroll list and totals
router.get('/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const employees = db.getCollection('employees');
    const payrollHistory = db.getCollection('payrollHistory');
    const { department, search, month } = req.query;

    let employeePayrolls = employees.map(emp => {
      return {
        employeeId: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        employmentStatus: emp.employmentStatus,
        profilePicture: emp.profilePicture,
        salaryStructure: emp.salaryStructure
      };
    });

    if (department && department !== 'all' && department !== 'undefined' && department !== '') {
      employeePayrolls = employeePayrolls.filter(e => e.department.toLowerCase() === department.toLowerCase());
    }

    if (search && search !== 'undefined' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      employeePayrolls = employeePayrolls.filter(
        e => e.name.toLowerCase().includes(q) ||
             e.employeeId.toLowerCase().includes(q) ||
             e.department.toLowerCase().includes(q)
      );
    }

    // Aggregates
    const totalGross = employees.reduce((acc, curr) => acc + (curr.salaryStructure?.grossSalary || 0), 0);
    const totalNet = employees.reduce((acc, curr) => acc + (curr.salaryStructure?.netSalary || 0), 0);
    const totalDeductions = totalGross - totalNet;

    return res.json({
      success: true,
      summary: {
        totalEmployees: employees.length,
        totalMonthlyGross: totalGross,
        totalMonthlyNet: totalNet,
        totalMonthlyDeductions: totalDeductions,
        averageNetSalary: employees.length > 0 ? Math.round(totalNet / employees.length) : 0
      },
      employees: employeePayrolls,
      history: payrollHistory
    });
  } catch (error) {
    console.error('Fetch all payroll error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving company payroll.' });
  }
});

// Admin: Update Employee Salary Structure
router.put('/structure/:employeeId', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { employeeId } = req.params;
    const { basic, hra, specialAllowance, bonus, pfDeduction, professionalTax, incomeTaxTDS } = req.body;

    const employees = db.getCollection('employees');
    const index = employees.findIndex(e => e.id === employeeId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const b = Number(basic) || 0;
    const h = Number(hra) || 0;
    const sa = Number(specialAllowance) || 0;
    const bon = Number(bonus) || 0;
    const gross = b + h + sa + bon;

    const pf = pfDeduction !== undefined ? Number(pfDeduction) : Math.round(b * 0.12);
    const pt = professionalTax !== undefined ? Number(professionalTax) : 2000;
    const tds = incomeTaxTDS !== undefined ? Number(incomeTaxTDS) : Math.round(gross * 0.08);
    const net = Math.max(0, gross - (pf + pt + tds));

    const updatedStructure = {
      basic: b,
      hra: h,
      specialAllowance: sa,
      bonus: bon,
      pfDeduction: pf,
      professionalTax: pt,
      incomeTaxTDS: tds,
      grossSalary: gross,
      netSalary: net
    };

    employees[index].salaryStructure = updatedStructure;
    db.setCollection('employees', employees);

    // Notify employee of salary structure revision
    const notifications = db.getCollection('notifications');
    notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientId: employeeId,
      title: 'Salary Structure Updated',
      message: `Your revised salary structure has been updated by HR. New Net Pay: $${net.toLocaleString()}.`,
      type: 'payroll',
      read: false,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
    db.setCollection('notifications', notifications);

    return res.json({
      success: true,
      message: `Salary structure for ${employees[index].name} updated successfully!`,
      salaryStructure: updatedStructure
    });
  } catch (error) {
    console.error('Update salary structure error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating salary structure.' });
  }
});

// Admin: Generate Monthly Batch Payroll
router.post('/generate-batch', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { month = 'August 2026', payPeriod = '01 Aug 2026 - 31 Aug 2026' } = req.body;
    const employees = db.getCollection('employees');
    const payrollHistory = db.getCollection('payrollHistory');
    const notifications = db.getCollection('notifications');

    let generatedCount = 0;
    const paymentDate = new Date().toISOString().split('T')[0];

    employees.forEach(emp => {
      const s = emp.salaryStructure || { basic: 45000, hra: 18000, specialAllowance: 12000, bonus: 0, grossSalary: 75000, pfDeduction: 5400, professionalTax: 2000, incomeTaxTDS: 5600, netSalary: 62000 };
      const slipId = `pay-${month.replace(/\s+/g, '-').toLowerCase()}-${emp.id}`;

      // Check if slip for this month already exists
      const exists = payrollHistory.find(p => p.id === slipId);
      if (!exists) {
        payrollHistory.unshift({
          id: slipId,
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          designation: emp.designation,
          month,
          payPeriod,
          paymentDate,
          status: 'Paid',
          paymentMethod: 'Direct Bank Transfer',
          basic: s.basic,
          hra: s.hra,
          specialAllowance: s.specialAllowance,
          bonus: s.bonus,
          grossPay: s.grossSalary,
          pf: s.pfDeduction,
          professionalTax: s.professionalTax,
          tds: s.incomeTaxTDS,
          totalDeductions: s.pfDeduction + s.professionalTax + s.incomeTaxTDS,
          netPay: s.netSalary
        });

        // Add notification for employee
        notifications.unshift({
          id: `notif-pay-${Date.now()}-${emp.id}`,
          recipientId: emp.id,
          title: `Payslip Issued: ${month}`,
          message: `Your payslip for ${month} ($${s.netSalary.toLocaleString()} Net) is ready to view & download.`,
          type: 'payroll',
          read: false,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
        });

        generatedCount++;
      }
    });

    db.setCollection('payrollHistory', payrollHistory);
    db.setCollection('notifications', notifications);

    return res.json({
      success: true,
      message: `Batch payroll generated successfully for ${generatedCount} employees for ${month}!`,
      generatedCount
    });
  } catch (error) {
    console.error('Batch payroll error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating batch payroll.' });
  }
});

export default router;
