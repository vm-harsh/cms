import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import Button from '../../components/common/Button';
import CourseTable from '../../components/courses/CourseTable';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { StatsCardSkeleton } from '../../components/common/SkeletonLoader';
import ErrorState from '../../components/common/ErrorState';
import Badge from '../../components/common/Badge';
import { userService } from '../../services/userService';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';

export default function FacultyDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load faculty dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    try {
      setDeleteLoading(true);
      await courseService.deleteCourse(courseToDelete.id);
      success(`Course '${courseToDelete.title}' deleted successfully`);
      setCourseToDelete(null);
      fetchStats();
    } catch (err) {
      toastError(err.message || 'Failed to delete course');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchStats} />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 border border-blue-500/20 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Faculty Teaching Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mt-1">
            Manage your assigned courses, create new syllabi, and monitor your teaching workload.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={() => navigate('/faculty/courses/create')}
          >
            Create Course
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              My Assigned Courses
            </span>
            <span className="text-3xl font-black text-slate-100 mt-2">
              {stats?.assignedCoursesCount || 0}
            </span>
            <span className="text-xs text-blue-400 mt-1 font-medium">
              Currently instructing
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Campus Catalog
            </span>
            <span className="text-3xl font-black text-slate-100 mt-2">
              {stats?.totalCourses || 0}
            </span>
            <span className="text-xs text-slate-400 mt-1 font-medium">
              Total institutional courses
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Courses List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-100">My Recent Courses</h2>
            <p className="text-xs text-slate-400">
              Courses assigned to your faculty profile
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/faculty/courses')}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            <span>View All My Courses</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <CourseTable
          courses={stats?.recentCourses || []}
          showFaculty={false}
          onView={(course) => setSelectedCourse(course)}
          onEdit={(course) => navigate(`/faculty/courses/${course.id}/edit`)}
          onDelete={(course) => setCourseToDelete(course)}
          canEdit={(c) => c.facultyId === user?.id}
          canDelete={(c) => c.facultyId === user?.id}
          emptyTitle="No courses assigned yet"
          emptyDescription="You have not created or been assigned any courses yet."
          emptyActionLabel="Create First Course"
          onEmptyAction={() => navigate('/faculty/courses/create')}
        />
      </div>

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
