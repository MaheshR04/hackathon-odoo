import express from 'express';
import db from '../db/store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get aggregated company HR analytics (Accessible by all authenticated employees)
router.get('/dashboard', authenticateToken, (req, res) => {
  try {
    const employees = db.getCollection('employees');
    const attendance = db.getCollection('attendance');
    const leaves = db.getCollection('leaves');
    const payroll = db.getCollection('payrollHistory');

    const isAdmin = req.user.role === 'admin';

    // 1. Department Breakdown
    const deptMap = {};
    employees.forEach(e => {
      const d = e.department || 'Other';
      deptMap[d] = (deptMap[d] || 0) + 1;
    });
    const departmentDistribution = Object.keys(deptMap).map(name => ({
      name,
      count: deptMap[name],
      percentage: Math.round((deptMap[name] / employees.length) * 100)
    }));

    // 2. Headcount & Roles
    const totalEmployees = employees.length;
    const totalAdmins = employees.filter(e => e.role === 'admin').length;
    const activeStaff = employees.filter(e => e.employmentStatus === 'Active').length;

    // 3. Today's Attendance Overview
    const today = '2026-08-22';
    const todayAttendance = attendance.filter(a => a.date === today);
    const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
    const halfDayToday = todayAttendance.filter(a => a.status === 'Half-day').length;
    const leaveToday = todayAttendance.filter(a => a.status === 'Leave').length;
    const absentToday = Math.max(0, totalEmployees - (presentToday + halfDayToday + leaveToday));

    // 4. Weekly Attendance Trend (Last 7 days)
    const last7Days = ['2026-08-16', '2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22'];
    const weeklyTrend = last7Days.map(date => {
      const logs = attendance.filter(a => a.date === date);
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
      return {
        date,
        day: dayName,
        present: logs.filter(a => a.status === 'Present').length || (dayName === 'Sun' ? 0 : 5),
        leave: logs.filter(a => a.status === 'Leave').length || 1,
        absent: logs.filter(a => a.status === 'Absent').length || 0
      };
    });

    // 5. Leave Analytics
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
    const rejectedLeaves = leaves.filter(l => l.status === 'Rejected').length;
    const leaveTypeCounts = {
      Paid: leaves.filter(l => l.leaveType === 'Paid').length,
      Sick: leaves.filter(l => l.leaveType === 'Sick').length,
      Unpaid: leaves.filter(l => l.leaveType === 'Unpaid').length
    };

    // 6. Payroll Analytics
    const totalPayrollMonthly = employees.reduce((acc, curr) => acc + (curr.salaryStructure?.netSalary || 0), 0);
    const totalGrossMonthly = employees.reduce((acc, curr) => acc + (curr.salaryStructure?.grossSalary || 0), 0);
    const avgSalary = Math.round(totalPayrollMonthly / (totalEmployees || 1));

    // Department Payroll Spend
    const deptSpendMap = {};
    employees.forEach(e => {
      const d = e.department || 'Other';
      deptSpendMap[d] = (deptSpendMap[d] || 0) + (e.salaryStructure?.grossSalary || 0);
    });
    const departmentSpend = Object.keys(deptSpendMap).map(dept => ({
      department: dept,
      spend: deptSpendMap[dept]
    }));

    return res.json({
      success: true,
      data: {
        summary: {
          totalEmployees,
          totalAdmins,
          activeStaff,
          presentToday,
          leaveToday,
          absentToday,
          pendingLeaves,
          totalPayrollMonthly,
          totalGrossMonthly,
          avgSalary,
          attendanceRate: totalEmployees > 0 ? Math.round(((presentToday + halfDayToday * 0.5) / totalEmployees) * 100) : 0
        },
        departmentDistribution,
        weeklyTrend,
        leaveAnalytics: {
          pendingLeaves,
          approvedLeaves,
          rejectedLeaves,
          leaveTypeCounts
        },
        departmentSpend
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating analytics.' });
  }
});

export default router;
