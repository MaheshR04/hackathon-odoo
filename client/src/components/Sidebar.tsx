import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Receipt,
  BarChart3,
  UserCircle,
  Shield,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'dashboard' | 'employees' | 'attendance' | 'leaves' | 'payroll' | 'analytics' | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  pendingLeavesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingLeavesCount = 0
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'employee']
    },
    {
      id: 'attendance' as NavTab,
      label: 'Attendance',
      icon: Clock,
      roles: ['admin', 'employee']
    },
    {
      id: 'leaves' as NavTab,
      label: 'Leaves & Time-Off',
      icon: CalendarDays,
      roles: ['admin', 'employee'],
      badge: isAdmin && pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'employees' as NavTab,
      label: isAdmin ? 'Employee Directory' : 'Colleague Directory',
      icon: Users,
      roles: ['admin', 'employee']
    },
    {
      id: 'payroll' as NavTab,
      label: isAdmin ? 'Payroll Management' : 'My Salary & Payslips',
      icon: Receipt,
      roles: ['admin', 'employee']
    },
    {
      id: 'analytics' as NavTab,
      label: 'Analytics & Reports',
      icon: BarChart3,
      roles: ['admin', 'employee']
    },
    {
      id: 'profile' as NavTab,
      label: 'My 360° Profile',
      icon: UserCircle,
      roles: ['admin', 'employee']
    }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(user?.role || 'employee'));

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950/60 p-4 backdrop-blur-xl flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* User Card Pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
          <img
            src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
            alt={user?.name}
            className="h-10 w-10 rounded-xl object-cover ring-2 ring-purple-500/20"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.designation}</p>
            <span
              className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                isAdmin
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isAdmin ? <Shield className="h-2.5 w-2.5" /> : <Briefcase className="h-2.5 w-2.5" />}
              {isAdmin ? 'Admin / HR' : 'Employee'}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Navigation
          </p>
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white shadow-lg shadow-purple-950/50'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold text-white ${item.badgeColor || 'bg-indigo-500'} animate-pulse`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Info */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="rounded-xl bg-gradient-to-br from-purple-950/30 to-indigo-950/20 border border-purple-500/10 p-3 text-center">
          <p className="text-[11px] font-bold text-slate-300">Dayflow HRMS v1.0</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Enterprise Edition</p>
        </div>
      </div>
    </aside>
  );
};
