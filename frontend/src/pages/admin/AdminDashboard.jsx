import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  UserCheck,
  GraduationCap,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
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
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Action States
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatsCardSkeleton />
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
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 border border-indigo-500/20 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Admin Overview & Metrics
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mt-1">
            Manage institutional courses, faculty assignments, and user privileges across the platform.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={() => navigate('/admin/courses/create')}
          >
            Create Course
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Courses */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Courses
            </span>
            <span className="text-3xl font-black text-slate-100 mt-2">
              {stats?.totalCourses || 0}
            </span>
            <span className="text-xs text-indigo-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> All active courses
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Total Faculty */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Faculty Instructors
            </span>
            <span className="text-3xl font-black text-slate-100 mt-2">
              {stats?.totalFaculty || 0}
            </span>
            <span className="text-xs text-blue-400 mt-1 flex items-center gap-1 font-medium">
              <UserCheck className="w-3.5 h-3.5" /> Teaching staff
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Enrolled Students
            </span>
            <span className="text-3xl font-black text-slate-100 mt-2">
              {stats?.totalStudents || 0}
            </span>
            <span className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <GraduationCap className="w-3.5 h-3.5" /> Platform learners
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Courses Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-100">Recent Courses</h2>
            <p className="text-xs text-slate-400">
              Recently created courses across all faculty and administrators
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/courses')}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <CourseTable
          courses={stats?.recentCourses || []}
          onView={(course) => setSelectedCourse(course)}
          onEdit={(course) => navigate(`/admin/courses/${course.id}/edit`)}
          onDelete={(course) => setCourseToDelete(course)}
          canEdit={() => true} // Admin can edit all
          canDelete={() => true} // Admin can delete all
          emptyTitle="No courses created yet"
          emptyDescription="Get started by creating the first curriculum course."
          emptyActionLabel="Create First Course"
          onEmptyAction={() => navigate('/admin/courses/create')}
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
