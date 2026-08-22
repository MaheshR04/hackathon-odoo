import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all employees (Admin gets all with sensitive metrics; Employee gets colleague directory)
router.get('/', authenticateToken, (req, res) => {
  try {
    const employees = db.getCollection('employees');
    const { department, search, role, status } = req.query;

    let results = employees.map(e => {
      const { password, ...safe } = e;
      // If regular employee is browsing colleagues, hide detailed salary unless it is themselves
      if (req.user.role !== 'admin' && e.id !== req.user.id) {
        return {
          id: safe.id,
          name: safe.name,
          email: safe.email,
          role: safe.role,
          designation: safe.designation,
          department: safe.department,
          phone: safe.phone,
          employmentStatus: safe.employmentStatus,
          profilePicture: safe.profilePicture,
          joiningDate: safe.joiningDate
        };
      }
      return safe;
    });

    if (department && department !== 'all') {
      results = results.filter(e => e.department.toLowerCase() === department.toLowerCase());
    }

    if (status && status !== 'all') {
      results = results.filter(e => e.employmentStatus.toLowerCase() === status.toLowerCase());
    }

    if (role && role !== 'all') {
      results = results.filter(e => e.role.toLowerCase() === role.toLowerCase());
    }

    if (search) {
      const query = search.toLowerCase();
      results = results.filter(
        e => e.name.toLowerCase().includes(query) ||
             e.email.toLowerCase().includes(query) ||
             e.id.toLowerCase().includes(query) ||
             e.designation.toLowerCase().includes(query) ||
             e.department.toLowerCase().includes(query)
      );
    }

    return res.json({ success: true, count: results.length, employees: results });
  } catch (error) {
    console.error('Fetch employees error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving employees.' });
  }
});

// Get single employee details
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const employees = db.getCollection('employees');
    const employee = employees.find(e => e.id === id || e.email.toLowerCase() === id.toLowerCase());

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const { password, ...safeEmployee } = employee;

    // If not admin and requesting someone else's profile, limit sensitive salary details
    if (req.user.role !== 'admin' && employee.id !== req.user.id) {
      delete safeEmployee.salaryStructure;
      delete safeEmployee.leaveBalances;
      delete safeEmployee.documents;
    }

    return res.json({ success: true, employee: safeEmployee });
  } catch (error) {
    console.error('Fetch employee error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving employee profile.' });
  }
});

// Create new employee (Admin Only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'employee',
      designation,
      department,
      phone,
      address,
      emergencyContact,
      joiningDate,
      salaryStructure
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Employee name and email are required.' });
    }

    const employees = db.getCollection('employees');

    if (employees.some(e => e.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'An employee with this email already exists.' });
    }

    const id = `EMP-${String(employees.length + 1).padStart(3, '0')}`;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password || 'Dayflow@123', salt);

    const baseBasic = Number(salaryStructure?.basic) || 50000;
    const baseHra = Number(salaryStructure?.hra) || Math.round(baseBasic * 0.4);
    const baseSpecial = Number(salaryStructure?.specialAllowance) || 15000;
    const baseBonus = Number(salaryStructure?.bonus) || 3000;
    const gross = baseBasic + baseHra + baseSpecial + baseBonus;
    const pf = Math.round(baseBasic * 0.12);
    const pt = 2000;
    const tds = Math.round(gross * 0.08);
    const net = gross - (pf + pt + tds);

    const newEmp = {
      id,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'employee',
      designation: designation || 'Associate Professional',
      department: department || 'Engineering',
      phone: phone || '+1 (555) 123-4567',
      address: address || 'Corporate Headquarters',
      emergencyContact: emergencyContact || 'Not provided',
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      employmentStatus: 'Active',
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      salaryStructure: {
        basic: baseBasic,
        hra: baseHra,
        specialAllowance: baseSpecial,
        bonus: baseBonus,
        pfDeduction: pf,
        professionalTax: pt,
        incomeTaxTDS: tds,
        grossSalary: gross,
        netSalary: net
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
          name: `Employment_Contract_${name.replace(/\s+/g, '')}.pdf`,
          uploadedAt: new Date().toISOString().split('T')[0],
          type: 'PDF',
          size: '1.2 MB'
        }
      ]
    };

    employees.push(newEmp);
    db.setCollection('employees', employees);

    const { password: _, ...safe } = newEmp;
    return res.status(201).json({ success: true, message: 'Employee added successfully!', employee: safe });
  } catch (error) {
    console.error('Create employee error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating employee.' });
  }
});

// Update Employee Profile
// Employees can edit limited fields (address, phone, emergencyContact, profilePicture)
// Admin can edit all employee details
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const employees = db.getCollection('employees');
    const index = employees.findIndex(e => e.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const currentEmp = employees[index];
    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user.id === currentEmp.id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this profile.' });
    }

    const updates = req.body;

    if (isAdmin) {
      // Admin has full modification powers
      if (updates.name) currentEmp.name = updates.name;
      if (updates.email) currentEmp.email = updates.email.toLowerCase();
      if (updates.designation) currentEmp.designation = updates.designation;
      if (updates.department) currentEmp.department = updates.department;
      if (updates.role) currentEmp.role = updates.role;
      if (updates.employmentStatus) currentEmp.employmentStatus = updates.employmentStatus;
      if (updates.phone) currentEmp.phone = updates.phone;
      if (updates.address) currentEmp.address = updates.address;
      if (updates.emergencyContact) currentEmp.emergencyContact = updates.emergencyContact;
      if (updates.profilePicture) currentEmp.profilePicture = updates.profilePicture;
      if (updates.joiningDate) currentEmp.joiningDate = updates.joiningDate;

      // Update Salary Structure if provided
      if (updates.salaryStructure) {
        const s = updates.salaryStructure;
        const basic = Number(s.basic) || currentEmp.salaryStructure.basic;
        const hra = Number(s.hra) || currentEmp.salaryStructure.hra;
        const specialAllowance = Number(s.specialAllowance) || currentEmp.salaryStructure.specialAllowance;
        const bonus = Number(s.bonus) || 0;
        const gross = basic + hra + specialAllowance + bonus;
        const pf = Number(s.pfDeduction) || Math.round(basic * 0.12);
        const pt = Number(s.professionalTax) || 2000;
        const tds = Number(s.incomeTaxTDS) || Math.round(gross * 0.08);
        const net = gross - (pf + pt + tds);

        currentEmp.salaryStructure = {
          basic,
          hra,
          specialAllowance,
          bonus,
          pfDeduction: pf,
          professionalTax: pt,
          incomeTaxTDS: tds,
          grossSalary: gross,
          netSalary: net
        };
      }

      if (updates.leaveBalances) {
        currentEmp.leaveBalances = { ...currentEmp.leaveBalances, ...updates.leaveBalances };
      }
    } else {
      // Regular employee: Limited field updates
      if (updates.phone) currentEmp.phone = updates.phone;
      if (updates.address) currentEmp.address = updates.address;
      if (updates.emergencyContact) currentEmp.emergencyContact = updates.emergencyContact;
      if (updates.profilePicture) currentEmp.profilePicture = updates.profilePicture;
    }

    employees[index] = currentEmp;
    db.setCollection('employees', employees);

    const { password, ...safe } = currentEmp;
    return res.json({ success: true, message: 'Profile updated successfully!', employee: safe });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

// Upload Document Mock / Add Document
router.post('/:id/documents', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { name, size, type } = req.body;
    const employees = db.getCollection('employees');
    const index = employees.findIndex(e => e.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const currentEmp = employees[index];
    const isSelf = req.user.id === currentEmp.id;
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to add documents for this employee.' });
    }

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: name || 'Uploaded_Document.pdf',
      uploadedAt: new Date().toISOString().split('T')[0],
      type: type || 'PDF',
      size: size || '1.4 MB'
    };

    currentEmp.documents = currentEmp.documents || [];
    currentEmp.documents.push(newDoc);

    employees[index] = currentEmp;
    db.setCollection('employees', employees);

    return res.status(201).json({ success: true, message: 'Document added successfully!', document: newDoc });
  } catch (error) {
    console.error('Document upload error:', error);
    return res.status(500).json({ success: false, message: 'Error adding document.' });
  }
});

// Delete Document
router.delete('/:id/documents/:docId', authenticateToken, (req, res) => {
  try {
    const { id, docId } = req.params;
    const employees = db.getCollection('employees');
    const index = employees.findIndex(e => e.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const currentEmp = employees[index];
    const isSelf = req.user.id === currentEmp.id;
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    currentEmp.documents = (currentEmp.documents || []).filter(d => d.id !== docId);
    employees[index] = currentEmp;
    db.setCollection('employees', employees);

    return res.json({ success: true, message: 'Document removed successfully!' });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({ success: false, message: 'Error deleting document.' });
  }
});

export default router;
