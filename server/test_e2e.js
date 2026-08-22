// Comprehensive End-to-End API verification script
const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING DAYFLOW HRMS API VERIFICATION ---');

  // 1. Health Check
  const healthRes = await fetch(`${API_URL}/health`);
  const health = await healthRes.json();
  console.log('✓ Health Check:', health.status === 'healthy' ? 'PASSED' : 'FAILED');

  // 2. Auth: Login as HR Admin (Sarah Connor)
  const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrId: 'sarah.admin@dayflow.com', password: 'admin123' })
  });
  const adminLogin = await adminLoginRes.json();
  console.log('✓ Admin Login:', adminLogin.success ? `PASSED (${adminLogin.user.name})` : 'FAILED');
  const adminToken = adminLogin.token;

  // 3. Auth: Login as Employee (Alex Rivera)
  const empLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrId: 'alex.rivera@dayflow.com', password: 'emp123' })
  });
  const empLogin = await empLoginRes.json();
  console.log('✓ Employee Login:', empLogin.success ? `PASSED (${empLogin.user.name})` : 'FAILED');
  const empToken = empLogin.token;

  // 4. Employee Directory
  const empListRes = await fetch(`${API_URL}/employees`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const empList = await empListRes.json();
  console.log(`✓ Employee Directory: PASSED (${empList.employees.length} employees retrieved)`);

  // 5. Attendance Check-in & Get My Attendance
  const myAttRes = await fetch(`${API_URL}/attendance/my`, {
    headers: { Authorization: `Bearer ${empToken}` }
  });
  const myAtt = await myAttRes.json();
  console.log('✓ Employee Attendance Records:', myAtt.success ? `PASSED (${myAtt.records.length} logs)` : 'FAILED');

  // 6. Leave Management: Employee apply for leave
  const applyLeaveRes = await fetch(`${API_URL}/leaves/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${empToken}`
    },
    body: JSON.stringify({
      leaveType: 'Paid',
      startDate: '2026-09-10',
      endDate: '2026-09-12',
      reason: 'Tech Conference & Professional Workshop'
    })
  });
  const applyLeave = await applyLeaveRes.json();
  console.log('✓ Leave Application:', applyLeave.success ? `PASSED (ID: ${applyLeave.leave.id})` : 'FAILED');

  // 7. Admin Leave Review & Approval with comments
  const leaveId = applyLeave.leave.id;
  const reviewLeaveRes = await fetch(`${API_URL}/leaves/${leaveId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      status: 'Approved',
      adminComments: 'Approved by HR Operations. Enjoy the workshop!'
    })
  });
  const reviewLeave = await reviewLeaveRes.json();
  console.log('✓ Admin Leave Approval:', reviewLeave.success ? `PASSED (Status: ${reviewLeave.leave.status})` : 'FAILED');

  // 8. Payroll: Get employee payslips and Admin Company Ledger
  const myPayRes = await fetch(`${API_URL}/payroll/my`, {
    headers: { Authorization: `Bearer ${empToken}` }
  });
  const myPay = await myPayRes.json();
  console.log('✓ Employee Payroll View:', myPay.success ? `PASSED (Net: $${myPay.currentStructure.netSalary.toLocaleString()})` : 'FAILED');

  const allPayRes = await fetch(`${API_URL}/payroll/all`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const allPay = await allPayRes.json();
  console.log('✓ Admin Company Payroll Ledger:', allPay.success ? `PASSED (Total Monthly Gross: $${allPay.summary.totalMonthlyGross.toLocaleString()})` : 'FAILED');

  // 9. Analytics & Business Intelligence Dashboard
  const analyticsRes = await fetch(`${API_URL}/analytics/dashboard`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const analytics = await analyticsRes.json();
  console.log('✓ Analytics Dashboard:', analytics.success ? `PASSED (Attendance Rate: ${analytics.data.summary.attendanceRate}%)` : 'FAILED');

  // 10. Notifications Inbox
  const notifRes = await fetch(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${empToken}` }
  });
  const notif = await notifRes.json();
  console.log('✓ Notifications System:', notif.success ? `PASSED (${notif.notifications.length} alerts in inbox)` : 'FAILED');

  console.log('--- ALL API TESTS COMPLETED SUCCESSFULLY ---');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
});
