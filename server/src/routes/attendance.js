import express from 'express';
import db from '../db/store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to get formatted current time (e.g. 09:15 AM)
const getFormattedTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Helper to get formatted date (YYYY-MM-DD)
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Get attendance logs for current logged-in employee (with daily/weekly stats)
router.get('/my', authenticateToken, (req, res) => {
  try {
    const attendance = db.getCollection('attendance');
    const userAttendance = attendance.filter(a => a.employeeId === req.user.id);
    
    // Sort descending by date
    userAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));

    const today = getTodayDate();
    const todayRecord = userAttendance.find(a => a.date === today) || null;

    // Compute basic stats
    const totalPresent = userAttendance.filter(a => a.status === 'Present').length;
    const totalHalfDay = userAttendance.filter(a => a.status === 'Half-day').length;
    const totalLeaves = userAttendance.filter(a => a.status === 'Leave').length;
    const totalAbsent = userAttendance.filter(a => a.status === 'Absent').length;
    const totalHours = userAttendance.reduce((acc, curr) => acc + (Number(curr.workingHours) || 0), 0);

    return res.json({
      success: true,
      todayRecord,
      stats: {
        totalPresent,
        totalHalfDay,
        totalLeaves,
        totalAbsent,
        totalHours: Number(totalHours.toFixed(1)),
        avgDailyHours: totalPresent > 0 ? Number((totalHours / (totalPresent + totalHalfDay)).toFixed(1)) : 8.0
      },
      records: userAttendance
    });
  } catch (error) {
    console.error('Fetch my attendance error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving attendance records.' });
  }
});

// Check-in (Employee)
router.post('/check-in', authenticateToken, (req, res) => {
  try {
    const today = getTodayDate();
    const currentTime = getFormattedTime();
    const attendance = db.getCollection('attendance');

    let record = attendance.find(a => a.employeeId === req.user.id && a.date === today);

    if (record && record.checkIn) {
      return res.status(400).json({ success: false, message: `You are already checked in today at ${record.checkIn}.` });
    }

    if (record) {
      record.checkIn = currentTime;
      record.status = 'Present';
      record.remarks = req.body.remarks || 'Checked in via Web Portal';
    } else {
      record = {
        id: `att-${Date.now()}`,
        employeeId: req.user.id,
        employeeName: req.user.name,
        date: today,
        checkIn: currentTime,
        checkOut: null,
        workingHours: 0,
        status: 'Present',
        remarks: req.body.remarks || 'Checked in via Web Portal'
      };
      attendance.unshift(record);
    }

    db.setCollection('attendance', attendance);

    return res.json({
      success: true,
      message: `Checked in successfully at ${currentTime}! Have a productive day.`,
      record
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({ success: false, message: 'Error checking in.' });
  }
});

// Check-out (Employee)
router.post('/check-out', authenticateToken, (req, res) => {
  try {
    const today = getTodayDate();
    const currentTime = getFormattedTime();
    const attendance = db.getCollection('attendance');

    const record = attendance.find(a => a.employeeId === req.user.id && a.date === today);

    if (!record || !record.checkIn) {
      return res.status(400).json({ success: false, message: 'No check-in record found for today. Please check in first.' });
    }

    if (record.checkOut) {
      return res.status(400).json({ success: false, message: `You already checked out today at ${record.checkOut}.` });
    }

    record.checkOut = currentTime;

    // Approximate hours calculation based on mock or real elapsed time
    const calcHours = Number(req.body.workingHours) || 8.25;
    record.workingHours = calcHours;

    if (calcHours < 5 && record.status === 'Present') {
      record.status = 'Half-day';
    }

    db.setCollection('attendance', attendance);

    return res.json({
      success: true,
      message: `Checked out successfully at ${currentTime}. Logged ${record.workingHours} hours.`,
      record
    });
  } catch (error) {
    console.error('Check-out error:', error);
    return res.status(500).json({ success: false, message: 'Error checking out.' });
  }
});

// Admin View: All attendance records with search & filters
router.get('/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const attendance = db.getCollection('attendance');
    const employees = db.getCollection('employees');
    const { date, department, status, search } = req.query;

    let results = attendance.map(att => {
      const emp = employees.find(e => e.id === att.employeeId);
      return {
        ...att,
        department: emp ? emp.department : 'Unknown',
        designation: emp ? emp.designation : '',
        profilePicture: emp ? emp.profilePicture : ''
      };
    });

    if (date && date !== 'all' && date !== 'undefined' && date !== '') {
      results = results.filter(a => a.date === date);
    }

    if (department && department !== 'all' && department !== 'undefined' && department !== '') {
      results = results.filter(a => a.department.toLowerCase() === department.toLowerCase());
    }

    if (status && status !== 'all' && status !== 'undefined' && status !== '') {
      results = results.filter(a => a.status.toLowerCase() === status.toLowerCase());
    }

    if (search && search !== 'undefined' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      results = results.filter(
        a => a.employeeName.toLowerCase().includes(q) ||
             a.employeeId.toLowerCase().includes(q) ||
             a.department.toLowerCase().includes(q)
      );
    }

    // Sort by date descending
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Admin Stats
    const today = getTodayDate();
    const todayLogs = attendance.filter(a => a.date === today);
    const presentToday = todayLogs.filter(a => a.status === 'Present').length;
    const halfDayToday = todayLogs.filter(a => a.status === 'Half-day').length;
    const leaveToday = todayLogs.filter(a => a.status === 'Leave').length;
    const absentToday = Math.max(0, employees.length - (presentToday + halfDayToday + leaveToday));

    return res.json({
      success: true,
      stats: {
        totalEmployees: employees.length,
        presentToday,
        halfDayToday,
        leaveToday,
        absentToday,
        attendanceRate: employees.length > 0 ? Math.round(((presentToday + halfDayToday * 0.5) / employees.length) * 100) : 0
      },
      records: results
    });
  } catch (error) {
    console.error('Fetch all attendance error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving company attendance.' });
  }
});

// Admin Manual Attendance Adjustment
router.post('/manual', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, workingHours, remarks } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({ success: false, message: 'Employee ID, date, and status are required.' });
    }

    const employees = db.getCollection('employees');
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const attendance = db.getCollection('attendance');
    const existingIndex = attendance.findIndex(a => a.employeeId === employeeId && a.date === date);

    const record = {
      id: existingIndex >= 0 ? attendance[existingIndex].id : `att-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      date,
      checkIn: checkIn || (status === 'Present' ? '09:00 AM' : null),
      checkOut: checkOut || (status === 'Present' ? '05:30 PM' : null),
      workingHours: Number(workingHours) || (status === 'Present' ? 8.5 : status === 'Half-day' ? 4.0 : 0),
      status,
      remarks: remarks || `Manual update by Admin (${req.user.name})`
    };

    if (existingIndex >= 0) {
      attendance[existingIndex] = record;
    } else {
      attendance.unshift(record);
    }

    db.setCollection('attendance', attendance);

    return res.json({ success: true, message: 'Attendance record saved successfully!', record });
  } catch (error) {
    console.error('Manual attendance error:', error);
    return res.status(500).json({ success: false, message: 'Error saving attendance record.' });
  }
});

export default router;
