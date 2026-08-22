import express from 'express';
import db from '../db/store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate days between two date strings (inclusive)
const calculateDays = (start, end) => {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
};

// Get leave history & balances for logged-in employee
router.get('/my', authenticateToken, (req, res) => {
  try {
    const leaves = db.getCollection('leaves');
    const employees = db.getCollection('employees');
    
    const userLeaves = leaves.filter(l => l.employeeId === req.user.id);
    userLeaves.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    const emp = employees.find(e => e.id === req.user.id);
    const balances = emp ? emp.leaveBalances : { paid: 18, usedPaid: 0, sick: 10, usedSick: 0, unpaid: 0 };

    return res.json({
      success: true,
      balances: {
        paidAvailable: Math.max(0, balances.paid - balances.usedPaid),
        paidTotal: balances.paid,
        paidUsed: balances.usedPaid,
        sickAvailable: Math.max(0, balances.sick - balances.usedSick),
        sickTotal: balances.sick,
        sickUsed: balances.usedSick,
        unpaidUsed: balances.unpaid || 0
      },
      requests: userLeaves
    });
  } catch (error) {
    console.error('Fetch my leaves error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving leave requests.' });
  }
});

// Apply for Leave (Employee)
router.post('/apply', authenticateToken, (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Leave type, start date, end date, and reason are required.' });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ success: false, message: 'Start date cannot be later than end date.' });
    }

    const totalDays = calculateDays(startDate, endDate);
    const leaves = db.getCollection('leaves');
    const employees = db.getCollection('employees');
    const emp = employees.find(e => e.id === req.user.id);

    // Create new leave request
    const newLeave = {
      id: `leave-${Date.now()}`,
      employeeId: req.user.id,
      employeeName: req.user.name,
      department: req.user.department || (emp ? emp.department : 'General'),
      leaveType, // 'Paid', 'Sick', 'Unpaid'
      startDate,
      endDate,
      totalDays,
      reason,
      status: 'Pending',
      adminComments: '',
      appliedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      reviewedAt: null
    };

    leaves.unshift(newLeave);
    db.setCollection('leaves', leaves);

    // Notify HR Admins
    const notifications = db.getCollection('notifications');
    const adminUsers = employees.filter(e => e.role === 'admin');
    
    adminUsers.forEach(admin => {
      notifications.unshift({
        id: `notif-${Date.now()}-${admin.id}`,
        recipientId: admin.id,
        title: 'New Leave Application',
        message: `${req.user.name} submitted a ${totalDays}-day ${leaveType} Leave request for ${startDate}.`,
        type: 'leave_request',
        read: false,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
    });
    db.setCollection('notifications', notifications);

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully! Awaiting HR approval.',
      leave: newLeave
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    return res.status(500).json({ success: false, message: 'Error submitting leave application.' });
  }
});

// Admin View: Get all leave requests with filters
router.get('/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const leaves = db.getCollection('leaves');
    const employees = db.getCollection('employees');
    const { status, leaveType, department, search } = req.query;

    let results = leaves.map(l => {
      const emp = employees.find(e => e.id === l.employeeId);
      return {
        ...l,
        profilePicture: emp ? emp.profilePicture : '',
        employeeEmail: emp ? emp.email : ''
      };
    });

    if (status && status !== 'all') {
      results = results.filter(l => l.status.toLowerCase() === status.toLowerCase());
    }

    if (leaveType && leaveType !== 'all') {
      results = results.filter(l => l.leaveType.toLowerCase() === leaveType.toLowerCase());
    }

    if (department && department !== 'all') {
      results = results.filter(l => l.department.toLowerCase() === department.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        l => l.employeeName.toLowerCase().includes(q) ||
             l.employeeId.toLowerCase().includes(q) ||
             l.reason.toLowerCase().includes(q)
      );
    }

    // Sort by appliedAt descending
    results.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    const pendingCount = leaves.filter(l => l.status === 'Pending').length;
    const approvedCount = leaves.filter(l => l.status === 'Approved').length;
    const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

    return res.json({
      success: true,
      stats: {
        totalRequests: leaves.length,
        pendingCount,
        approvedCount,
        rejectedCount
      },
      requests: results
    });
  } catch (error) {
    console.error('Fetch all leaves error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving leave requests.' });
  }
});

// Admin Approve / Reject Leave Request (with comments)
router.put('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComments } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be either Approved or Rejected.' });
    }

    const leaves = db.getCollection('leaves');
    const index = leaves.findIndex(l => l.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    const leave = leaves[index];
    const previousStatus = leave.status;
    leave.status = status;
    leave.adminComments = adminComments || (status === 'Approved' ? 'Approved by HR.' : 'Rejected by HR.');
    leave.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Update Employee balance if Approved
    const employees = db.getCollection('employees');
    const empIndex = employees.findIndex(e => e.id === leave.employeeId);

    if (empIndex >= 0 && status === 'Approved' && previousStatus !== 'Approved') {
      const emp = employees[empIndex];
      if (leave.leaveType === 'Paid') {
        emp.leaveBalances.usedPaid += leave.totalDays;
      } else if (leave.leaveType === 'Sick') {
        emp.leaveBalances.usedSick += leave.totalDays;
      } else {
        emp.leaveBalances.unpaid = (emp.leaveBalances.unpaid || 0) + leave.totalDays;
      }
      employees[empIndex] = emp;
      db.setCollection('employees', employees);

      // Also add attendance "Leave" entries for the approved dates if applicable
      const attendance = db.getCollection('attendance');
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const existingAtt = attendance.find(a => a.employeeId === leave.employeeId && a.date === dateStr);
        if (!existingAtt) {
          attendance.unshift({
            id: `att-leave-${Date.now()}-${dateStr}`,
            employeeId: leave.employeeId,
            employeeName: leave.employeeName,
            date: dateStr,
            checkIn: null,
            checkOut: null,
            workingHours: 0,
            status: 'Leave',
            remarks: `Approved ${leave.leaveType} Leave: ${leave.reason}`
          });
        } else {
          existingAtt.status = 'Leave';
          existingAtt.remarks = `Approved ${leave.leaveType} Leave`;
        }
      }
      db.setCollection('attendance', attendance);
    }

    leaves[index] = leave;
    db.setCollection('leaves', leaves);

    // Notify employee of decision
    const notifications = db.getCollection('notifications');
    notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientId: leave.employeeId,
      title: `Leave Request ${status}`,
      message: `Your ${leave.leaveType} Leave (${leave.startDate} to ${leave.endDate}) has been ${status.toLowerCase()} by HR. Remarks: "${leave.adminComments}"`,
      type: status === 'Approved' ? 'leave_approved' : 'leave_rejected',
      read: false,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
    db.setCollection('notifications', notifications);

    return res.json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()} successfully.`,
      leave
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating leave status.' });
  }
});

export default router;
