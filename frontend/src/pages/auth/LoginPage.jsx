import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, GraduationCap, ArrowRight, ShieldCheck, UserCheck, BookOpen } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleRedirect = (role) => {
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
    else if (role === 'FACULTY') navigate('/faculty/dashboard', { replace: true });
    else navigate('/student/dashboard', { replace: true });
  };

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email address format';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const user = await login({ email, password });
      success(`Welcome back, ${user.name}!`);
      handleRedirect(user.role);
    } catch (err) {
      toastError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts for instant 1-click login
  const demoAccounts = [
    {
      role: 'ADMIN',
      name: 'System Admin',
      email: 'admin@example.com',
      badge: 'Full CRUD & Assignment',
      icon: ShieldCheck,
      color: 'border-purple-500/40 hover:bg-purple-950/20 text-purple-300',
    },
    {
      role: 'FACULTY',
      name: 'Dr. Sarah Smith',
      email: 'dr.smith@example.com',
      badge: 'Instructor 1 (Own Courses)',
      icon: UserCheck,
      color: 'border-blue-500/40 hover:bg-blue-950/20 text-blue-300',
    },
    {
      role: 'FACULTY',
      name: 'Prof. Michael Jones',
      email: 'prof.jones@example.com',
      badge: 'Instructor 2 (Own Courses)',
      icon: UserCheck,
      color: 'border-blue-500/40 hover:bg-blue-950/20 text-blue-300',
    },
    {
      role: 'STUDENT',
      name: 'Alice Williams',
      email: 'alice.student@example.com',
      badge: 'Student (Read-Only)',
      icon: BookOpen,
      color: 'border-emerald-500/40 hover:bg-emerald-950/20 text-emerald-300',
    },
  ];

  const handleDemoLogin = async (demoEmail) => {
    try {
      setLoading(true);
      setEmail(demoEmail);
      setPassword('Password123!');
      const user = await login({ email: demoEmail, password: 'Password123!' });
      success(`Logged in as ${user.name} (${user.role})`);
      handleRedirect(user.role);
    } catch (err) {
      toastError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/30 mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Welcome to EduCore
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Course Management System with Role-Based Access Control
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4 sm:px-0">
        {/* Main Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@institution.edu"
              icon={Mail}
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              error={errors.email}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              error={errors.password}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* 1-Click Demo Evaluation Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                1-Click Demo Login
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Password: Password123!</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleDemoLogin(demo.email)}
                    disabled={loading}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border bg-slate-950/60 text-left transition-all duration-200 group ${demo.color}`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                        {demo.name}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {demo.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Registration Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
