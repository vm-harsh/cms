import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Badge from '../common/Badge';

export default function Navbar({ onOpenMobileNav }) {
  const { user, logout } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      success('Logged out successfully');
      navigate('/login');
    } catch {
      toastError('Failed to logout cleanly');
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

      {/* Right: User Profile & Logout */}
      <div className="flex items-center gap-3">
        {/* User Info */}
        <div className="flex items-center gap-3">
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
