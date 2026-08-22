import React from 'react';
import { Clock, User as UserIcon, Calendar, ArrowRight, Edit, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

export default function CourseCard({
  course,
  onView,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}) {
  return (
    <div className="group bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 transition-all duration-300 shadow-lg hover:shadow-indigo-950/20 flex flex-col justify-between gap-5 relative overflow-hidden">
      {/* Top Accent Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header Info */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge variant="code">{course.courseCode}</Badge>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>{course.duration}</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-200 transition-colors line-clamp-1">
          {course.title}
        </h3>

        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
          {course.description}
        </p>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-300 font-semibold">
              {course.faculty?.name ? course.faculty.name.charAt(0) : 'F'}
            </div>
            <div className="flex flex-col">
              <span className="text-slate-200 font-medium text-xs">
                {course.faculty?.name || 'Assigned Faculty'}
              </span>
              <span className="text-[10px] text-slate-500">Instructor</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(course.createdAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={() => onEdit && onEdit(course)}
              className="text-xs"
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => onDelete && onDelete(course)}
              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
            >
              Delete
            </Button>
          )}
          {onView && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onView(course)}
              className="text-xs ml-auto"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
