import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  GraduationCap,
  Sparkles,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Badge from '../common/Badge';

export default function Sidebar({ className = '' }) {
  const { user, isAdmin, isFaculty, isStudent } = useAuth();

  const getLinks = () => {
    if (isAdmin) {
      return [
        { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
        { to: '/admin/courses', label: 'Courses', icon: BookOpen },
        { to: '/admin/faculty', label: 'Faculty', icon: UserCheck },
        { to: '/admin/students', label: 'Students', icon: GraduationCap },
        { to: '/admin/admins', label: 'Administrators', icon: Shield },
      ];
    }
    if (isFaculty) {
      return [
        { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/faculty/courses', label: 'My Courses', icon: BookOpen },
        { to: '/faculty/courses/create', label: 'Create Course', icon: PlusCircle },
      ];
    }
    return [
      { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/student/courses', label: 'Explore Courses', icon: BookOpen },
    ];
  };

  const navLinks = getLinks();

  return (
    <aside
      className={`w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between p-4 h-full select-none ${className}`}
    >
      <div className="flex flex-col gap-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-slate-100 tracking-tight flex items-center gap-1.5">
              EduCore <span className="text-indigo-400 text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60">CMS</span>
            </span>
            <span className="text-[11px] text-slate-400">Course Management</span>
          </div>
        </div>

        {/* User Role Card */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-300 font-bold text-sm">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-slate-200 truncate">
              {user?.name || 'User'}
            </span>
            <div className="mt-0.5">
              <Badge
                variant={
                  user?.role === 'ADMIN'
                    ? 'admin'
                    : user?.role === 'FACULTY'
                    ? 'faculty'
                    : 'student'
                }
                size="sm"
              >
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
            Main Menu
          </span>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-950/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer / System Status */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-slate-300 font-medium">RBAC Enforced</span>
            <span className="text-[10px] text-slate-400">Strict Backend Guard</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
