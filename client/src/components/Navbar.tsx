import React, { useState, useEffect } from 'react';
import { Bell, User, LogOut, Shield, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationDrawer } from './NotificationDrawer';

interface NavbarProps {
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfile }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Theme Mode (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('dayflow_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('dayflow_theme', theme);
  }, [theme]);

  const fetchUnread = async () => {
    try {
      const res = await api.notifications.getAll();
      if (res.success) {
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Branding & Tagline */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-lg shadow-purple-900/30 text-white font-bold text-lg">
              D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-extrabold tracking-tight text-white">
                  DAYFLOW<span className="text-purple-400">.</span>HRMS
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Odoo Ed.
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 font-medium -mt-1">
                Every workday, perfectly aligned.
              </p>
            </div>
          </div>

          {/* Right: Theme Toggle + Notifications + User Menu */}
          <div className="flex items-center gap-3">
            {/* Dark / Light Theme Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span className="hidden sm:inline text-amber-300">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span className="hidden sm:inline text-indigo-600 font-bold">Dark Mode</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifs(true)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-indigo-500/50 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition"
              >
                <img
                  src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
                  alt={user?.name}
                  className="h-8 w-8 rounded-lg object-cover ring-2 ring-purple-500/30"
                />
                <div className="hidden md:block text-left pr-1">
                  <p className="text-xs font-bold text-white leading-tight">{user?.name}</p>
                  <div className="flex items-center gap-1">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${user?.role === 'admin' ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {user?.role === 'admin' ? 'HR Admin' : 'Employee'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 pr-1 hidden md:block" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-50">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <p className="text-[10px] text-indigo-400 font-semibold mt-0.5">{user?.id} • {user?.department}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white rounded-lg transition mt-1"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span>My 360° Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification Drawer Modal */}
      <NotificationDrawer isOpen={showNotifs} onClose={() => setShowNotifs(false)} />
    </>
  );
};
