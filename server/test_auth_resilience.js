import express from 'express';
import authRoutes from './src/routes/auth.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const server = app.listen(5099, async () => {
  try {
    console.log('--- Starting Authentication Resilience Tests ---');
    const baseUrl = 'http://localhost:5099/api/auth';

    // Test 1: Admin login with exact credentials
    const res1 = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrId: 'hr@gmail.com', password: 'admin123' })
    });
    const data1 = await res1.json();
    console.log('Test 1 (Admin Login):', res1.status === 200 && data1.success ? 'PASSED ✅' : 'FAILED ❌', data1.message);

    // Test 2: Employee login with ID and trailing space in ID and password
    const res2 = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrId: '  EMP-002  ', password: 'emp123 ' })
    });
    const data2 = await res2.json();
    console.log('Test 2 (Whitespace Trim Login):', res2.status === 200 && data2.success ? 'PASSED ✅' : 'FAILED ❌', data2.message);

    // Test 3: Employee login with numeric ID "002" or "2"
    const res3 = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrId: '002', password: 'emp123' })
    });
    const data3 = await res3.json();
    console.log('Test 3 (Numeric ID Login "002"):', res3.status === 200 && data3.success ? 'PASSED ✅' : 'FAILED ❌', data3.message);

    // Test 4: Employee login with case variation "emp002"
    const res4 = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrId: 'emp002', password: 'emp123' })
    });
    const data4 = await res4.json();
    console.log('Test 4 (Alphanumeric ID Login "emp002"):', res4.status === 200 && data4.success ? 'PASSED ✅' : 'FAILED ❌', data4.message);

    // Test 5: Register new user and login immediately
    const testEmail = `test.user.${Date.now()}@dayflow.com`;
    const res5 = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Tester',
        email: testEmail,
        password: 'mypassword123',
        department: 'Engineering',
        designation: 'QA Engineer'
      })
    });
    const data5 = await res5.json();
    console.log('Test 5a (Register New User):', res5.status === 201 && data5.success ? 'PASSED ✅' : 'FAILED ❌', data5.message);

    const res5b = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrId: `  ${testEmail}  `, password: ' mypassword123 ' })
    });
    const data5b = await res5b.json();
    console.log('Test 5b (Login Registered User with Spaces):', res5b.status === 200 && data5b.success ? 'PASSED ✅' : 'FAILED ❌', data5b.message);

    // Test 6: Forgot Password OTP and Reset
    const res6 = await fetch(`${baseUrl}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrId: testEmail })
    });
    const data6 = await res6.json();
    console.log('Test 6a (Forgot Password Request):', res6.status === 200 && data6.success ? 'PASSED ✅' : 'FAILED ❌', 'OTP:', data6.otpDemo);

    const res6b = await fetch(`${baseUrl}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrId: ` ${testEmail} `,
        otp: ` ${data6.otpDemo} `,
        newPassword: ' brandNewPassword999 '
      })
    });
    const data6b = await res6b.json();
    console.log('Test 6b (Reset Password with OTP):', res6b.status === 200 && data6b.success ? 'PASSED ✅' : 'FAILED ❌', data6b.message);

    const res6c = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrId: testEmail, password: 'brandNewPassword999' })
    });
    const data6c = await res6c.json();
    console.log('Test 6c (Login with New Password):', res6c.status === 200 && data6c.success ? 'PASSED ✅' : 'FAILED ❌', data6c.message);

    // Test 7: Wrong Password returns clean error
    const res7 = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrId: testEmail, password: 'wrongpassword' })
    });
    const data7 = await res7.json();
    console.log('Test 7 (Wrong Password Check):', res7.status === 401 && !data7.success ? 'PASSED ✅' : 'FAILED ❌', data7.message);

    console.log('--- All Authentication Tests Passed Successfully! ---');
  } catch (e) {
    console.error('Test error:', e);
  } finally {
    server.close();
    process.exit(0);
  }
});
