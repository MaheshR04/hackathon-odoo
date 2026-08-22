import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/store.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user (Employee or HR)
router.post('/register', (req, res) => {
  try {
    const { employeeId, name, email, password, role, department, designation, phone, address } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();
    const cleanPassword = String(password);

    const employees = db.getCollection('employees');

    // Check if email already exists
    if (employees.some(e => e && e.email && String(e.email).toLowerCase() === cleanEmail)) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Auto-generate employee ID if not provided or clean provided ID
    let rawId = employeeId !== undefined && employeeId !== null ? String(employeeId).trim() : '';
    let id = rawId.length > 0 ? (rawId.toUpperCase().startsWith('EMP-') ? rawId : `EMP-${rawId}`) : `EMP-${String(employees.length + 1).padStart(3, '0')}`;

    if (employees.some(e => e && e.id && String(e.id).toLowerCase() === id.toLowerCase())) {
      // Auto-append timestamp suffix if custom ID collides
      id = `EMP-${Date.now().toString().slice(-4)}`;
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(cleanPassword, salt);

    const newEmployee = {
      id,
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'employee',
      designation: designation || (role === 'admin' ? 'HR Operations Officer' : 'Associate Specialist'),
      department: department || 'General Operations',
      phone: phone || '+1 (555) 000-0000',
      address: address || 'Remote / Corporate HQ',
      emergencyContact: 'Not specified',
      joiningDate: new Date().toISOString().split('T')[0],
      employmentStatus: 'Active',
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`,
      salaryStructure: {
        basic: 45000,
        hra: 18000,
        specialAllowance: 12000,
        bonus: 2000,
        pfDeduction: 5400,
        professionalTax: 2000,
        incomeTaxTDS: 5600,
        grossSalary: 77000,
        netSalary: 64000
      },
      leaveBalances: {
        paid: 18,
        usedPaid: 0,
        sick: 10,
        usedSick: 0,
        unpaid: 0
      },
      documents: [
        {
          id: `doc-${Date.now()}`,
          name: 'Welcome_Onboarding_Handbook.pdf',
          uploadedAt: new Date().toISOString().split('T')[0],
          type: 'PDF',
          size: '1.5 MB'
        }
      ]
    };

    employees.push(newEmployee);
    db.setCollection('employees', employees);

    // Create system notification
    const notifications = db.getCollection('notifications');
    notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientId: newEmployee.id,
      title: 'Welcome to Dayflow HRMS!',
      message: `Hi ${cleanName}, your account is active and verified. Complete your profile and check your dashboard.`,
      type: 'welcome',
      read: false,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
    db.setCollection('notifications', notifications);

    const token = generateToken(newEmployee);
    const { password: _, ...safeUser } = newEmployee;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration. Please try again.' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { emailOrId, password } = req.body;

    if (!emailOrId || !password) {
      return res.status(400).json({ success: false, message: 'Email/Employee ID and password are required.' });
    }

    const cleanQuery = String(emailOrId).trim().toLowerCase();
    const employees = db.getCollection('employees');
    const user = employees.find(
      e => (e && e.email && String(e.email).toLowerCase() === cleanQuery) ||
           (e && e.id && String(e.id).toLowerCase() === cleanQuery)
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = bcrypt.compareSync(String(password), user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Signed in successfully!',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login. Please try again.' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, (req, res) => {
  const employees = db.getCollection('employees');
  const user = employees.find(e => e.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  const { password: _, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

export default router;
