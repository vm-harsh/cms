import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Sparkles, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Badge from '../common/Badge';

export default function Navbar({ onOpenMobileNav }) {
  const { user, logout, login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      success('Logged out successfully');
      navigate('/login');
    } catch {
      toastError('Failed to logout cleanly');
    }
  };

  // Quick switch demo accounts
  const demoAccounts = [
    { label: 'Admin (System Admin)', email: 'admin@example.com', role: 'ADMIN', path: '/admin/dashboard' },
    { label: 'Faculty (Dr. Sarah Smith)', email: 'dr.smith@example.com', role: 'FACULTY', path: '/faculty/dashboard' },
    { label: 'Faculty (Prof. Michael Jones)', email: 'prof.jones@example.com', role: 'FACULTY', path: '/faculty/dashboard' },
    { label: 'Student (Alice Williams)', email: 'alice.student@example.com', role: 'STUDENT', path: '/student/dashboard' },
    { label: 'Student (Bob Davis)', email: 'bob.student@example.com', role: 'STUDENT', path: '/student/dashboard' },
  ];

  const handleSwitchAccount = async (account) => {
    try {
      setSwitching(true);
      setRoleMenuOpen(false);
      await login({ email: account.email, password: 'Password123!' });
      success(`Switched role to ${account.label}`);
      navigate(account.path);
    } catch (err) {
      toastError(err.message || 'Failed to switch user account');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Welcome */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </span>
          <span className="text-sm font-bold text-slate-200">
            {user?.role === 'ADMIN'
              ? 'Administrator Portal'
              : user?.role === 'FACULTY'
              ? 'Faculty Portal'
              : 'Student Learning Hub'}
          </span>
        </div>
      </div>

      {/* Right: Quick Switcher & User Profile & Logout */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen((prev) => !prev)}
            disabled={switching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 transition-all duration-200 shadow-sm"
            title="Quickly switch between Admin, Faculty, and Student accounts"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Switch Role</span>
            <ChevronDown className="w-3 h-3 text-indigo-400" />
          </button>

          {roleMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setRoleMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 animate-fade-in flex flex-col gap-1">
                <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick Role Switcher (Assessment Demo)
                </div>
                {demoAccounts.map((account) => {
                  const isCurrent = user?.email === account.email;
                  return (
                    <button
                      key={account.email}
                      onClick={() => handleSwitchAccount(account)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{account.label}</span>
                        <span className="text-[10px] text-slate-500">{account.email}</span>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-semibold text-slate-200 leading-tight">
              {user?.name}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">{user?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Log out of session"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
