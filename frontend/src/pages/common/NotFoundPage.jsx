import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'FACULTY') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 rounded-3xl bg-indigo-950/50 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-6 shadow-xl shadow-indigo-950/30">
        <HelpCircle className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
        404 - Page Not Found
      </h1>
      <p className="mt-2 text-base text-slate-400 max-w-md">
        The page or route you are looking for does not exist or has been moved.
      </p>

      <div className="flex items-center gap-3 mt-8">
        <Button
          variant="secondary"
          icon={ArrowLeft}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          icon={Home}
          onClick={() => navigate(getDashboardPath())}
        >
          Home
        </Button>
      </div>
    </div>
  );
}
