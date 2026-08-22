export type Role = 'admin' | 'employee';

export interface SalaryStructure {
  basic: number;
  hra: number;
  specialAllowance: number;
  bonus: number;
  pfDeduction: number;
  professionalTax: number;
  incomeTaxTDS: number;
  grossSalary: number;
  netSalary: number;
}

export interface LeaveBalances {
  paid: number;
  usedPaid: number;
  sick: number;
  usedSick: number;
  unpaid: number;
}

export interface DocumentItem {
  id: string;
  name: string;
  uploadedAt: string;
  type: string;
  size: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  designation: string;
  department: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  joiningDate?: string;
  employmentStatus?: 'Active' | 'On Leave' | 'Terminated';
  profilePicture?: string;
  salaryStructure?: SalaryStructure;
  leaveBalances?: LeaveBalances;
  documents?: DocumentItem[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  status: 'Present' | 'Absent' | 'Half-day' | 'Leave';
  remarks?: string;
  department?: string;
  designation?: string;
  profilePicture?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: 'Paid' | 'Sick' | 'Unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminComments?: string;
  appliedAt: string;
  reviewedAt?: string | null;
  profilePicture?: string;
  employeeEmail?: string;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  month: string;
  payPeriod: string;
  paymentDate: string;
  status: 'Paid' | 'Processing' | 'Pending';
  paymentMethod: string;
  basic: number;
  hra: number;
  specialAllowance: number;
  bonus: number;
  grossPay: number;
  pf: number;
  professionalTax: number;
  tds: number;
  totalDeductions: number;
  netPay: number;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'welcome' | 'leave_request' | 'leave_approved' | 'leave_rejected' | 'payroll' | 'announcement';
  read: boolean;
  timestamp: string;
}

export interface AnalyticsData {
  summary: {
    totalEmployees: number;
    totalAdmins: number;
    activeStaff: number;
    presentToday: number;
    leaveToday: number;
    absentToday: number;
    pendingLeaves: number;
    totalPayrollMonthly: number;
    totalGrossMonthly: number;
    avgSalary: number;
    attendanceRate: number;
  };
  departmentDistribution: {
    name: string;
    count: number;
    percentage: number;
  }[];
  weeklyTrend: {
    date: string;
    day: string;
    present: number;
    leave: number;
    absent: number;
  }[];
  leaveAnalytics: {
    pendingLeaves: number;
    approvedLeaves: number;
    rejectedLeaves: number;
    leaveTypeCounts: {
      Paid: number;
      Sick: number;
      Unpaid: number;
    };
  };
  departmentSpend: {
    department: string;
    spend: number;
  }[];
}
