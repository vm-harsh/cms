import React from 'react';
import { cn } from '../../utils/cn';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const base =
    'inline-flex items-center font-medium rounded-lg transition-colors border select-none';

  const variants = {
    default: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
    primary: 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60',
    admin: 'bg-purple-950/70 text-purple-300 border-purple-800/60',
    faculty: 'bg-blue-950/70 text-blue-300 border-blue-800/60',
    student: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
    danger: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
    code: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50 font-mono font-semibold',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider uppercase',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
