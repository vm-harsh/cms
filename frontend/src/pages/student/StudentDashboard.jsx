import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, ArrowRight, Clock, Award, Compass } from 'lucide-react';
import Button from '../../components/common/Button';
import CourseCard from '../../components/courses/CourseCard';
import { CourseCardSkeleton, StatsCardSkeleton } from '../../components/common/SkeletonLoader';
import ErrorState from '../../components/common/ErrorState';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load student dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <StatsCardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchStats} />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Hero / Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/50 via-purple-900/40 to-slate-900/70 border border-indigo-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-xs font-semibold text-indigo-300 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Learning Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              Hello, {user?.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Explore available curriculum courses, discover instructors, and review comprehensive course syllabi.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="primary"
              size="lg"
              icon={Compass}
              onClick={() => navigate('/student/courses')}
              className="shadow-xl shadow-indigo-600/30"
            >
              Browse Catalog
            </Button>
          </div>
        </div>

        {/* Decorative Circle */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Overview Stat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Available Courses
            </span>
            <span className="text-3xl font-black text-slate-100 mt-2">
              {stats?.totalCourses || 0}
            </span>
            <span className="text-xs text-indigo-400 mt-1 font-medium">
              Open for review & exploration
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Access Privileges
            </span>
            <span className="text-xl font-bold text-slate-100 mt-2">
              Read-Only Access
            </span>
            <span className="text-xs text-emerald-400 mt-1 font-medium">
              Full Catalog Browsing
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Course Highlights Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Featured Courses</h2>
            <p className="text-xs text-slate-400">
              Explore active curriculum programs led by university faculty
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/student/courses')}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats?.recentCourses?.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onView={(c) => navigate(`/student/courses/${c.id}`)}
              canEdit={false}
              canDelete={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
