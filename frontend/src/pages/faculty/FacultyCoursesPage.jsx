import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import CourseTable from '../../components/courses/CourseTable';
import CourseFilter from '../../components/courses/CourseFilter';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { TableRowSkeleton } from '../../components/common/SkeletonLoader';
import ErrorState from '../../components/common/ErrorState';
import Badge from '../../components/common/Badge';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';

export default function FacultyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Faculty endpoint automatically scopes to faculty's own courses
      const data = await courseService.getAllCourses({
        search: search || undefined,
      });
      setCourses(data);
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCourses();
    }, 200);
    return () => clearTimeout(timeout);
  }, [fetchCourses]);

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    try {
      setDeleteLoading(true);
      await courseService.deleteCourse(courseToDelete.id);
      success(`Course '${courseToDelete.title}' deleted successfully`);
      setCourseToDelete(null);
      fetchCourses();
    } catch (err) {
      toastError(err.message || 'Failed to delete course');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            My Teaching Courses
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage course curriculum, duration, and descriptions for your assigned classes
          </p>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={() => navigate('/faculty/courses/create')}
        >
          Create Course
        </Button>
      </div>

      {/* Search Filter */}
      <CourseFilter
        search={search}
        onSearchChange={setSearch}
        showFacultyFilter={false}
        onReset={() => setSearch('')}
      />

      {/* Courses Content */}
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 overflow-hidden">
          <table className="w-full">
            <tbody>
              <TableRowSkeleton cols={5} />
              <TableRowSkeleton cols={5} />
              <TableRowSkeleton cols={5} />
            </tbody>
          </table>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCourses} />
      ) : (
        <CourseTable
          courses={courses}
          showFaculty={false}
          onView={(course) => setSelectedCourse(course)}
          onEdit={(course) => navigate(`/faculty/courses/${course.id}/edit`)}
          onDelete={(course) => setCourseToDelete(course)}
          canEdit={(c) => c.facultyId === user?.id}
          canDelete={(c) => c.facultyId === user?.id}
          emptyTitle={search ? 'No matching courses found' : 'No courses assigned'}
          emptyDescription={
            search
              ? 'Try modifying your search query.'
              : 'Create a new course or await assignment from an administrator.'
          }
          emptyActionLabel={search ? 'Clear Search' : 'Create Course'}
          onEmptyAction={
            search ? () => setSearch('') : () => navigate('/faculty/courses/create')
          }
        />
      )}

      {/* View Course Details Modal */}
      <Modal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.title}
        description={`Course Code: ${selectedCourse?.courseCode}`}
      >
        {selectedCourse && (
          <div className="flex flex-col gap-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="code">{selectedCourse.courseCode}</Badge>
              <Badge variant="default">{selectedCourse.duration}</Badge>
              <span className="text-xs text-slate-400 ml-auto">
                Created: {formatDate(selectedCourse.createdAt)}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Description & Syllabus
              </span>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedCourse.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCourse(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const id = selectedCourse.id;
                  setSelectedCourse(null);
                  navigate(`/faculty/courses/${id}/edit`);
                }}
              >
                Edit Course
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete '${courseToDelete?.title}'?`}
        message={`Are you sure you want to permanently delete course [${courseToDelete?.courseCode}]?`}
        confirmText="Delete Course"
        loading={deleteLoading}
      />
    </div>
  );
}
