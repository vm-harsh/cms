import React from 'react';
import { BookOpen, FolderSearch } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'No courses found',
  description = 'There are no courses matching your criteria or currently available in the system.',
  icon: Icon = FolderSearch,
  actionLabel,
  onAction,
  actionIcon,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl max-w-lg mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-950/20">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      <p className="text-sm text-slate-400 mt-1.5 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} icon={actionIcon}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
