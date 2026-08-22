import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'dayflow_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default Seed Data
const getInitialSeed = () => {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const employeePasswordHash = bcrypt.hashSync('emp123', salt);

  const employees = [
    {
      id: 'EMP-001',
      name: 'Sarah Connor',
      email: 'sarah.admin@dayflow.com',
      password: adminPasswordHash,
      role: 'admin',
      designation: 'Head of People & HR Operations',
      department: 'Human Resources',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Suite 400, Springfield, OR',
      emergencyContact: 'John Connor (+1 555-876-5432)',
      joiningDate: '2022-01-15',
      employmentStatus: 'Active',
      profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      salaryStructure: {
        basic: 65000,
        hra: 26000,
        specialAllowance: 19000,
        bonus: 5000,
        pfDeduction: 7800,
        professionalTax: 2000,
        incomeTaxTDS: 10200,
        grossSalary: 115000,
        netSalary: 95000
      },
      leaveBalances: {
        paid: 18,
        usedPaid: 3,
        sick: 12,
        usedSick: 1,
        unpaid: 0
      },
      documents: [
        { id: 'doc-1', name: 'HR_Executive_Appointment_Letter.pdf', uploadedAt: '2022-01-15', type: 'PDF', size: '1.2 MB' },
        { id: 'doc-2', name: 'Identity_Verification_Passport.pdf', uploadedAt: '2022-01-16', type: 'PDF', size: '2.4 MB' },
        { id: 'doc-3', name: 'Tax_Declaration_Form_16.pdf', uploadedAt: '2025-04-10', type: 'PDF', size: '850 KB' }
      ]
    },
    {
      id: 'EMP-002',
      name: 'Alex Rivera',
      email: 'alex.rivera@dayflow.com',
      password: employeePasswordHash,
      role: 'employee',
      designation: 'Senior Full Stack Engineer',
      department: 'Engineering',
      phone: '+1 (555) 345-6789',
      address: '128 Innovation Way, Apt 3B, San Francisco, CA',
      emergencyContact: 'Maria Rivera (Spouse: +1 555-901-2345)',
      joiningDate: '2023-03-01',
      employmentStatus: 'Active',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      salaryStructure: {
        basic: 55000,
        hra: 22000,
        specialAllowance: 18000,
        bonus: 4000,
        pfDeduction: 6600,
        professionalTax: 2000,
        incomeTaxTDS: 8400,
        grossSalary: 99000,
        netSalary: 82000
      },
      leaveBalances: {
        paid: 18,
        usedPaid: 4,
        sick: 10,
        usedSick: 2,
        unpaid: 0
      },
      documents: [
        { id: 'doc-4', name: 'Offer_Letter_Signed_AlexRivera.pdf', uploadedAt: '2023-03-01', type: 'PDF', size: '1.1 MB' },
        { id: 'doc-5', name: 'Driving_License_ID.pdf', uploadedAt: '2023-03-02', type: 'PDF', size: '900 KB' },
        { id: 'doc-6', name: 'NDA_Confidentiality_Agreement.pdf', uploadedAt: '2023-03-05', type: 'PDF', size: '1.5 MB' }
      ]
    },
    {
      id: 'EMP-003',
      name: 'Elena Rostova',
      email: 'elena.rostova@dayflow.com',
      password: employeePasswordHash,
      role: 'employee',
      designation: 'Lead UI/UX Product Designer',
      department: 'Product & Design',
      phone: '+1 (555) 456-7890',
      address: '450 Design District, Floor 2, Austin, TX',
      emergencyContact: 'Viktor Rostov (Brother: +1 555-210-9876)',
      joiningDate: '2023-07-15',
      employmentStatus: 'Active',
      profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
      salaryStructure: {
        basic: 50000,
        hra: 20000,
        specialAllowance: 15000,
        bonus: 3000,
        pfDeduction: 6000,
        professionalTax: 2000,
        incomeTaxTDS: 7000,
        grossSalary: 88000,
        netSalary: 73000
      },
      leaveBalances: {
        paid: 18,
        usedPaid: 2,
        sick: 10,
        usedSick: 0,
        unpaid: 0
      },
      documents: [
        { id: 'doc-7', name: 'Offer_Letter_ElenaRostova.pdf', uploadedAt: '2023-07-15', type: 'PDF', size: '1.0 MB' },
        { id: 'doc-8', name: 'Design_Portfolio_Certificates.pdf', uploadedAt: '2023-07-16', type: 'PDF', size: '4.2 MB' }
      ]
    },
    {
      id: 'EMP-004',
      name: 'David Chen',
      email: 'david.chen@dayflow.com',
      password: employeePasswordHash,
      role: 'employee',
      designation: 'DevOps & Cloud Architect',
      department: 'Engineering',
      phone: '+1 (555) 567-8901',
      address: '88 Tech Boulevard, Seattle, WA',
      emergencyContact: 'Grace Chen (Sister: +1 555-321-6547)',
      joiningDate: '2022-11-10',
      employmentStatus: 'Active',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      salaryStructure: {
        basic: 60000,
        hra: 24000,
        specialAllowance: 16000,
        bonus: 5000,
        pfDeduction: 7200,
        professionalTax: 2000,
        incomeTaxTDS: 8800,
        grossSalary: 105000,
        netSalary: 87000
      },
      leaveBalances: {
        paid: 18,
        usedPaid: 5,
        sick: 10,
        usedSick: 3,
        unpaid: 0
      },
      documents: [
        { id: 'doc-9', name: 'Employment_Contract_DavidChen.pdf', uploadedAt: '2022-11-10', type: 'PDF', size: '1.4 MB' }
      ]
    },
    {
      id: 'EMP-005',
      name: 'Marcus Brody',
      email: 'marcus.brody@dayflow.com',
      password: employeePasswordHash,
      role: 'employee',
      designation: 'Enterprise Account Executive',
      department: 'Sales & Growth',
      phone: '+1 (555) 678-9012',
      address: '22 Wall Street, Apt 18A, New York, NY',
      emergencyContact: 'Amanda Brody (Spouse: +1 555-432-8765)',
      joiningDate: '2024-01-08',
      employmentStatus: 'Active',
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      salaryStructure: {
        basic: 48000,
        hra: 19200,
        specialAllowance: 12800,
        bonus: 10000,
        pfDeduction: 5760,
        professionalTax: 2000,
        incomeTaxTDS: 6240,
        grossSalary: 90000,
        netSalary: 76000
      },
      leaveBalances: {
        paid: 18,
        usedPaid: 1,
        sick: 10,
        usedSick: 0,
        unpaid: 0
      },
      documents: [
        { id: 'doc-10', name: 'Brody_Sales_Commission_Structure.pdf', uploadedAt: '2024-01-08', type: 'PDF', size: '1.2 MB' }
      ]
    },
    {
      id: 'EMP-006',
      name: 'Amina Al-Mansoor',
      email: 'amina.mansoor@dayflow.com',
      password: employeePasswordHash,
      role: 'employee',
      designation: 'Senior Financial Analyst',
      department: 'Finance',
      phone: '+1 (555) 789-0123',
      address: '500 Michigan Ave, Chicago, IL',
      emergencyContact: 'Tariq Al-Mansoor (Father: +1 555-543-9871)',
      joiningDate: '2023-05-20',
      employmentStatus: 'Active',
      profilePicture: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80',
      salaryStructure: {
        basic: 52000,
        hra: 20800,
        specialAllowance: 14200,
        bonus: 3000,
        pfDeduction: 6240,
        professionalTax: 2000,
        incomeTaxTDS: 7160,
        grossSalary: 90000,
        netSalary: 74600
      },
      leaveBalances: {
        paid: 18,
        usedPaid: 6,
        sick: 10,
        usedSick: 1,
        unpaid: 1
      },
      documents: [
        { id: 'doc-11', name: 'Finance_Charter_Certification.pdf', uploadedAt: '2023-05-20', type: 'PDF', size: '1.8 MB' }
      ]
    }
  ];

  // Helper for generating dates in recent past (August 2026 / current timeframe)
  const todayStr = '2026-08-22';
  const attendance = [
    // Alex Rivera attendance
    { id: 'att-101', employeeId: 'EMP-002', employeeName: 'Alex Rivera', date: '2026-08-22', checkIn: '09:05 AM', checkOut: null, workingHours: 2.6, status: 'Present', remarks: 'Checked in on time via Web' },
    { id: 'att-102', employeeId: 'EMP-002', employeeName: 'Alex Rivera', date: '2026-08-21', checkIn: '09:00 AM', checkOut: '05:30 PM', workingHours: 8.5, status: 'Present', remarks: 'Normal workday' },
    { id: 'att-103', employeeId: 'EMP-002', employeeName: 'Alex Rivera', date: '2026-08-20', checkIn: '09:15 AM', checkOut: '06:00 PM', workingHours: 8.75, status: 'Present', remarks: 'Release sprint deployment' },
    { id: 'att-104', employeeId: 'EMP-002', employeeName: 'Alex Rivera', date: '2026-08-19', checkIn: '09:10 AM', checkOut: '01:10 PM', workingHours: 4.0, status: 'Half-day', remarks: 'Medical appointment in afternoon' },
    { id: 'att-105', employeeId: 'EMP-002', employeeName: 'Alex Rivera', date: '2026-08-18', checkIn: '08:55 AM', checkOut: '05:15 PM', workingHours: 8.3, status: 'Present', remarks: 'Office attendance' },
    { id: 'att-106', employeeId: 'EMP-002', employeeName: 'Alex Rivera', date: '2026-08-17', checkIn: null, checkOut: null, workingHours: 0, status: 'Leave', remarks: 'Approved Sick Leave' },

    // Sarah Connor attendance
    { id: 'att-201', employeeId: 'EMP-001', employeeName: 'Sarah Connor', date: '2026-08-22', checkIn: '08:45 AM', checkOut: null, workingHours: 2.9, status: 'Present', remarks: 'HR Admin early check-in' },
    { id: 'att-202', employeeId: 'EMP-001', employeeName: 'Sarah Connor', date: '2026-08-21', checkIn: '08:50 AM', checkOut: '05:45 PM', workingHours: 8.9, status: 'Present', remarks: 'Interview schedules & evaluations' },
    { id: 'att-203', employeeId: 'EMP-001', employeeName: 'Sarah Connor', date: '2026-08-20', checkIn: '09:00 AM', checkOut: '05:30 PM', workingHours: 8.5, status: 'Present', remarks: 'Payroll preparation' },

    // Elena Rostova attendance
    { id: 'att-301', employeeId: 'EMP-003', employeeName: 'Elena Rostova', date: '2026-08-22', checkIn: '09:30 AM', checkOut: null, workingHours: 2.1, status: 'Present', remarks: 'Design sprint' },
    { id: 'att-302', employeeId: 'EMP-003', employeeName: 'Elena Rostova', date: '2026-08-21', checkIn: '09:15 AM', checkOut: '05:45 PM', workingHours: 8.5, status: 'Present', remarks: 'Figma review' },
    { id: 'att-303', employeeId: 'EMP-003', employeeName: 'Elena Rostova', date: '2026-08-20', checkIn: null, checkOut: null, workingHours: 0, status: 'Leave', remarks: 'Casual Paid Leave' },

    // David Chen attendance
    { id: 'att-401', employeeId: 'EMP-004', employeeName: 'David Chen', date: '2026-08-22', checkIn: null, checkOut: null, workingHours: 0, status: 'Absent', remarks: 'Unplanned absence (Awaiting intimation)' },
    { id: 'att-402', employeeId: 'EMP-004', employeeName: 'David Chen', date: '2026-08-21', checkIn: '09:00 AM', checkOut: '05:30 PM', workingHours: 8.5, status: 'Present', remarks: 'Cloud infrastructure maintenance' },

    // Brody attendance
    { id: 'att-501', employeeId: 'EMP-005', employeeName: 'Marcus Brody', date: '2026-08-22', checkIn: '09:12 AM', checkOut: null, workingHours: 2.4, status: 'Present', remarks: 'Client demo calls' },

    // Amina attendance
    { id: 'att-601', employeeId: 'EMP-006', employeeName: 'Amina Al-Mansoor', date: '2026-08-22', checkIn: '08:58 AM', checkOut: null, workingHours: 2.7, status: 'Present', remarks: 'Financial audits' }
  ];

  const leaves = [
    {
      id: 'leave-101',
      employeeId: 'EMP-002',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      leaveType: 'Paid',
      startDate: '2026-08-28',
      endDate: '2026-08-30',
      totalDays: 3,
      reason: 'Attending family reunion and personal travel out of town.',
      status: 'Pending',
      adminComments: '',
      appliedAt: '2026-08-21 14:30:00',
      reviewedAt: null
    },
    {
      id: 'leave-102',
      employeeId: 'EMP-002',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      leaveType: 'Sick',
      startDate: '2026-08-17',
      endDate: '2026-08-17',
      totalDays: 1,
      reason: 'Severe migraine headache and fever. Doctor advised rest.',
      status: 'Approved',
      adminComments: 'Approved. Hope you feel better soon!',
      appliedAt: '2026-08-16 19:10:00',
      reviewedAt: '2026-08-17 08:30:00'
    },
    {
      id: 'leave-103',
      employeeId: 'EMP-003',
      employeeName: 'Elena Rostova',
      department: 'Product & Design',
      leaveType: 'Paid',
      startDate: '2026-08-20',
      endDate: '2026-08-20',
      totalDays: 1,
      reason: 'Home renovation inspection and utility connection setup.',
      status: 'Approved',
      adminComments: 'Approved by HR.',
      appliedAt: '2026-08-15 11:20:00',
      reviewedAt: '2026-08-16 09:00:00'
    },
    {
      id: 'leave-104',
      employeeId: 'EMP-004',
      employeeName: 'David Chen',
      department: 'Engineering',
      leaveType: 'Unpaid',
      startDate: '2026-09-05',
      endDate: '2026-09-12',
      totalDays: 8,
      reason: 'Extended personal sabbatical for mountaineering expedition.',
      status: 'Pending',
      adminComments: '',
      appliedAt: '2026-08-20 16:45:00',
      reviewedAt: null
    },
    {
      id: 'leave-105',
      employeeId: 'EMP-005',
      employeeName: 'Marcus Brody',
      department: 'Sales & Growth',
      leaveType: 'Paid',
      startDate: '2026-08-10',
      endDate: '2026-08-11',
      totalDays: 2,
      reason: 'Weekend extension trip.',
      status: 'Rejected',
      adminComments: 'Critical enterprise deal closing on Aug 11; please reschedule for following week.',
      appliedAt: '2026-08-05 10:15:00',
      reviewedAt: '2026-08-06 14:00:00'
    }
  ];

  const payrollHistory = [
    {
      id: 'pay-2026-07-EMP-001',
      employeeId: 'EMP-001',
      employeeName: 'Sarah Connor',
      department: 'Human Resources',
      designation: 'Head of People & HR Operations',
      month: 'July 2026',
      payPeriod: '01 Jul 2026 - 31 Jul 2026',
      paymentDate: '2026-07-31',
      status: 'Paid',
      paymentMethod: 'Direct Bank Transfer',
      basic: 65000,
      hra: 26000,
      specialAllowance: 19000,
      bonus: 5000,
      grossPay: 115000,
      pf: 7800,
      professionalTax: 2000,
      tds: 10200,
      totalDeductions: 20000,
      netPay: 95000
    },
    {
      id: 'pay-2026-07-EMP-002',
      employeeId: 'EMP-002',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      month: 'July 2026',
      payPeriod: '01 Jul 2026 - 31 Jul 2026',
      paymentDate: '2026-07-31',
      status: 'Paid',
      paymentMethod: 'Direct Bank Transfer',
      basic: 55000,
      hra: 22000,
      specialAllowance: 18000,
      bonus: 4000,
      grossPay: 99000,
      pf: 6600,
      professionalTax: 2000,
      tds: 8400,
      totalDeductions: 17000,
      netPay: 82000
    },
    {
      id: 'pay-2026-07-EMP-003',
      employeeId: 'EMP-003',
      employeeName: 'Elena Rostova',
      department: 'Product & Design',
      designation: 'Lead UI/UX Product Designer',
      month: 'July 2026',
      payPeriod: '01 Jul 2026 - 31 Jul 2026',
      paymentDate: '2026-07-31',
      status: 'Paid',
      paymentMethod: 'Direct Bank Transfer',
      basic: 50000,
      hra: 20000,
      specialAllowance: 15000,
      bonus: 3000,
      grossPay: 88000,
      pf: 6000,
      professionalTax: 2000,
      tds: 7000,
      totalDeductions: 15000,
      netPay: 73000
    },
    {
      id: 'pay-2026-06-EMP-002',
      employeeId: 'EMP-002',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      month: 'June 2026',
      payPeriod: '01 Jun 2026 - 30 Jun 2026',
      paymentDate: '2026-06-30',
      status: 'Paid',
      paymentMethod: 'Direct Bank Transfer',
      basic: 55000,
      hra: 22000,
      specialAllowance: 18000,
      bonus: 3500,
      grossPay: 98500,
      pf: 6600,
      professionalTax: 2000,
      tds: 8400,
      totalDeductions: 17000,
      netPay: 81500
    }
  ];

  const notifications = [
    {
      id: 'notif-1',
      recipientId: 'EMP-001',
      title: 'New Leave Request Received',
      message: 'Alex Rivera applied for 3 days Paid Leave from Aug 28 to Aug 30.',
      type: 'leave_request',
      read: false,
      timestamp: '2026-08-21 14:30:00'
    },
    {
      id: 'notif-2',
      recipientId: 'EMP-002',
      title: 'Leave Approved',
      message: 'Your Sick Leave for Aug 17 has been approved by HR.',
      type: 'leave_approved',
      read: true,
      timestamp: '2026-08-17 08:30:00'
    },
    {
      id: 'notif-3',
      recipientId: 'EMP-002',
      title: 'July 2026 Salary Disbursed',
      message: 'Your salary for July 2026 ($82,000 net) has been credited to your bank account.',
      type: 'payroll',
      read: true,
      timestamp: '2026-07-31 18:00:00'
    },
    {
      id: 'notif-4',
      recipientId: 'all',
      title: 'Company All-Hands Meeting',
      message: 'Quarterly HR & Strategy sync is scheduled for Friday, Aug 28 at 3:00 PM EST.',
      type: 'announcement',
      read: false,
      timestamp: '2026-08-20 10:00:00'
    }
  ];

  return {
    employees,
    attendance,
    leaves,
    payrollHistory,
    notifications,
    departments: ['Human Resources', 'Engineering', 'Product & Design', 'Sales & Growth', 'Finance', 'Operations']
  };
};

// Database Store Class
class DataStore {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    if (!fs.existsSync(DB_PATH)) {
      this.data = getInitialSeed();
      this.save();
    } else {
      try {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, re-initializing seed:', err);
        this.data = getInitialSeed();
        this.save();
      }
    }
  }

  save() {
    fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // Generic helpers
  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
      this.save();
    }
    return this.data[name];
  }

  setCollection(name, items) {
    this.data[name] = items;
    this.save();
  }
}

export const db = new DataStore();
export default db;
