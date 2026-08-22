import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'FACULTY') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 rounded-3xl bg-rose-950/50 border border-rose-800/60 flex items-center justify-center text-rose-400 mb-6 shadow-xl shadow-rose-950/30">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
        403 - Access Forbidden
      </h1>
      <p className="mt-2 text-base text-slate-400 max-w-md">
        You do not have the required permissions or role privileges to access this resource or perform this action.
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
          My Dashboard
        </Button>
      </div>
    </div>
  );
}
