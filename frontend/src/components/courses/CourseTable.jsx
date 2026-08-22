import React from 'react';
import { Eye, Edit, Trash2, Clock, User as UserIcon, Calendar } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function CourseTable({
  courses = [],
  onView,
  onEdit,
  onDelete,
  showFaculty = true,
  canEdit = () => false,
  canDelete = () => false,
  emptyTitle = 'No courses found',
  emptyDescription = 'No courses available in this view.',
  onEmptyAction,
  emptyActionLabel,
}) {
  if (courses.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900 border-b border-slate-800 text-xs uppercase font-semibold text-slate-400 tracking-wider">
            <tr>
              <th scope="col" className="py-4 px-6">Course Code</th>
              <th scope="col" className="py-4 px-6">Course Title</th>
              {showFaculty && <th scope="col" className="py-4 px-6">Faculty / Instructor</th>}
              <th scope="col" className="py-4 px-6">Duration</th>
              <th scope="col" className="py-4 px-6">Created Date</th>
              <th scope="col" className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {courses.map((course) => {
              const userCanEdit = typeof canEdit === 'function' ? canEdit(course) : canEdit;
              const userCanDelete = typeof canDelete === 'function' ? canDelete(course) : canDelete;

              return (
                <tr
                  key={course.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-4 px-6 font-medium whitespace-nowrap">
                    <Badge variant="code">{course.courseCode}</Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {course.title}
                      </span>
                      <span className="text-xs text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                        {course.description}
                      </span>
                    </div>
                  </td>
                  {showFaculty && (
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-300 text-xs font-semibold">
                          {course.faculty?.name ? course.faculty.name.charAt(0) : 'F'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-200 font-medium">
                            {course.faculty?.name || 'Unassigned'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {course.faculty?.email || ''}
                          </span>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{course.duration}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-400">
                    {formatDate(course.createdAt)}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {onView && (
                        <button
                          onClick={() => onView(course)}
                          title="View Course Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {userCanEdit && (
                        <button
                          onClick={() => onEdit && onEdit(course)}
                          title="Edit Course"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {userCanDelete && (
                        <button
                          onClick={() => onDelete && onDelete(course)}
                          title="Delete Course"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (Full Responsiveness on 320px-767px screens) */}
      <div className="md:hidden flex flex-col gap-4">
        {courses.map((course) => {
          const userCanEdit = typeof canEdit === 'function' ? canEdit(course) : canEdit;
          const userCanDelete = typeof canDelete === 'function' ? canDelete(course) : canDelete;

          return (
            <div
              key={course.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant="code">{course.courseCode}</Badge>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{course.duration}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-100 text-base">{course.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{course.description}</p>
              </div>

              {showFaculty && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-300 text-xs font-semibold">
                    {course.faculty?.name ? course.faculty.name.charAt(0) : 'F'}
                  </div>
                  <span className="text-xs text-slate-300 font-medium">
                    {course.faculty?.name || 'Unassigned'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-500">
                  {formatDate(course.createdAt)}
                </span>
                <div className="flex items-center gap-1.5">
                  {onView && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(course)}
                      className="text-xs px-2.5 py-1"
                    >
                      View
                    </Button>
                  )}
                  {userCanEdit && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit && onEdit(course)}
                      className="text-xs px-2.5 py-1 text-amber-300 hover:text-amber-200"
                    >
                      Edit
                    </Button>
                  )}
                  {userCanDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete && onDelete(course)}
                      className="text-xs px-2.5 py-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
