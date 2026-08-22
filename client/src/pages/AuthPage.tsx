import React, { useState } from 'react';
import { Shield, Sparkles, User, Lock, Mail, ArrowRight, CheckCircle2, Building, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { login, register, quickLoginDemo } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login form state
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regData, setRegData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Specialist'
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await login(emailOrId, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await register(regData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#090d16] relative overflow-hidden">
      {/* Dynamic Background Lighting */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 h-72 w-72 rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side: Brand Experience & Showcase */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-purple-950/50 via-slate-900/80 to-slate-950/90 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-lg shadow-purple-900/40 text-white font-bold text-xl">
                D
              </div>
              <div>
                <h1 className="font-display text-xl font-extrabold text-white tracking-tight">
                  DAYFLOW<span className="text-purple-400">.</span>HRMS
                </h1>
                <p className="text-xs text-slate-400 font-medium">Every workday, perfectly aligned.</p>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Modern HR Operations <br />
                <span className="gradient-text">Engineered for Velocity.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Streamline employee onboarding, profile tracking, live shift clocking, leave approvals, and instant payroll disbursement.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="mt-8 space-y-3">
              {[
                'Role-Based Access Control (Admin vs Employee)',
                'Live Working Hours & Attendance Clocking',
                '1-Click Leave Applications & HR Review Center',
                'Itemized Salary Structures & PDF Payslips'
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800 max-w-xs mb-8">
            <button
              onClick={() => {
                setIsLogin(true);
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                !isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {errorMsg && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isLogin ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>Email Address or Employee ID</span>
                </label>
                <input
                  type="text"
                  value={emailOrId}
                  onChange={e => setEmailOrId(e.target.value)}
                  placeholder="Enter email or Employee ID"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-900 text-white text-xs placeholder-slate-500 focus:border-purple-500 focus:outline-none transition shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Account Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your secure password"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-900 text-white text-xs placeholder-slate-500 focus:border-purple-500 focus:outline-none transition shadow-inner pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 text-purple-600 focus:ring-purple-500" />
                  <span>Remember my session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition active:scale-[0.99] disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={regData.name}
                    onChange={e => setRegData({ ...regData, name: e.target.value })}
                    placeholder="e.g. Liam Anderson"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Employee ID (Optional)</label>
                  <input
                    type="text"
                    value={regData.employeeId}
                    onChange={e => setRegData({ ...regData, employeeId: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:border-purple-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email Address</label>
                <input
                  type="email"
                  value={regData.email}
                  onChange={e => setRegData({ ...regData, email: e.target.value })}
                  placeholder="liam.anderson@dayflow.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role Type</label>
                  <select
                    value={regData.role}
                    onChange={e => setRegData({ ...regData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-purple-300 font-bold text-xs focus:border-purple-500 focus:outline-none"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin / HR Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={regData.department}
                    onChange={e => setRegData({ ...regData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales & Growth">Sales & Growth</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={regData.password}
                  onChange={e => setRegData({ ...regData, password: e.target.value })}
                  placeholder="Create secure password (min 6 characters)"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition active:scale-[0.99] disabled:opacity-50"
              >
                <span>{loading ? 'Registering...' : 'Create Verified Account'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
