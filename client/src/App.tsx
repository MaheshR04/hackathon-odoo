import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavesPage } from './pages/LeavesPage';
import { PayrollPage } from './pages/PayrollPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedDossierEmpId, setSelectedDossierEmpId] = useState<string | null>(null);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);

  const fetchPendingLeaves = async () => {
    if (user?.role === 'admin') {
      try {
        const res = await api.leaves.getAll({ status: 'Pending' });
        if (res.success) {
          setPendingLeavesCount(res.requests?.length || 0);
        }
      } catch (err) {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchPendingLeaves();
    }
  }, [user, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-xl animate-pulse">
            D
          </div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Loading Dayflow HRMS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            setActiveTab={setActiveTab}
            onSelectEmployeeForDossier={(empId) => {
              setSelectedDossierEmpId(empId);
              setActiveTab('employees');
            }}
          />
        );
      case 'employees':
        return (
          <EmployeesPage
            selectedEmployeeId={selectedDossierEmpId}
            onSelectEmployee={setSelectedDossierEmpId}
          />
        );
      case 'attendance':
        return <AttendancePage />;
      case 'leaves':
        return <LeavesPage />;
      case 'payroll':
        return <PayrollPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenProfile={() => setActiveTab('profile')} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingLeavesCount={pendingLeavesCount}
        />

        {/* Dynamic Center Stage Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl p-2 flex justify-around items-center">
        {[
          { id: 'dashboard' as NavTab, label: 'Home' },
          { id: 'attendance' as NavTab, label: 'Clock' },
          { id: 'leaves' as NavTab, label: 'Leaves' },
          { id: 'payroll' as NavTab, label: 'Salary' },
          { id: 'profile' as NavTab, label: 'Profile' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === item.id ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
