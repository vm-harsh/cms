import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, BookOpen } from 'lucide-react';
import Button from '../../components/common/Button';
import CourseTable from '../../components/courses/CourseTable';
import CourseFilter from '../../components/courses/CourseFilter';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { TableRowSkeleton } from '../../components/common/SkeletonLoader';
import ErrorState from '../../components/common/ErrorState';
import Badge from '../../components/common/Badge';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [facultyId, setFacultyId] = useState('');

  // Modals & Action States
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const fetchFaculty = async () => {
    try {
      const data = await userService.getFacultyList();
      setFacultyList(data);
    } catch {
      // Non-critical, continue
    }
  };

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getAllCourses({
        search: search || undefined,
        facultyId: facultyId || undefined,
      });
      setCourses(data);
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [search, facultyId]);

  useEffect(() => {
    fetchFaculty();
  }, []);

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
            Course Management
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Create, view, update, and manage all courses across the institution
          </p>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={() => navigate('/admin/courses/create')}
        >
          Create Course
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <CourseFilter
        search={search}
        onSearchChange={setSearch}
        facultyId={facultyId}
        onFacultyChange={setFacultyId}
        facultyList={facultyList}
        showFacultyFilter={true}
        onReset={() => {
          setSearch('');
          setFacultyId('');
        }}
      />

      {/* Courses Content */}
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 overflow-hidden">
          <table className="w-full">
            <tbody>
              <TableRowSkeleton cols={6} />
              <TableRowSkeleton cols={6} />
              <TableRowSkeleton cols={6} />
              <TableRowSkeleton cols={6} />
            </tbody>
          </table>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCourses} />
      ) : (
        <CourseTable
          courses={courses}
          onView={(course) => setSelectedCourse(course)}
          onEdit={(course) => navigate(`/admin/courses/${course.id}/edit`)}
          onDelete={(course) => setCourseToDelete(course)}
          canEdit={() => true}
          canDelete={() => true}
          emptyTitle={
            search || facultyId ? 'No matching courses' : 'No courses found'
          }
          emptyDescription={
            search || facultyId
              ? 'Try adjusting your search criteria or resetting filters.'
              : 'Get started by creating your first course.'
          }
          emptyActionLabel={search || facultyId ? 'Reset Filters' : 'Create Course'}
          onEmptyAction={
            search || facultyId
              ? () => {
                  setSearch('');
                  setFacultyId('');
                }
              : () => navigate('/admin/courses/create')
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

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Assigned Instructor
              </span>
              <div className="flex items-center gap-2 text-slate-200">
                <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-800/60 flex items-center justify-center font-bold text-indigo-300">
                  {selectedCourse.faculty?.name?.charAt(0) || 'F'}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{selectedCourse.faculty?.name}</span>
                  <span className="text-xs text-slate-400">{selectedCourse.faculty?.email}</span>
                </div>
              </div>
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
                  navigate(`/admin/courses/${id}/edit`);
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
        message={`Are you sure you want to permanently delete course [${courseToDelete?.courseCode}]? This action cannot be undone.`}
        confirmText="Delete Course"
        loading={deleteLoading}
      />
    </div>
  );
}
