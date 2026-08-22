import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  User as UserIcon,
  Calendar,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { courseService } from '../../services/courseService';
import { formatDate } from '../../utils/formatters';

export default function StudentCourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadCourse() {
      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getCourseById(id);
        setCourse(data);
      } catch (err) {
        setError(err.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading course curriculum details..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => navigate('/student/courses')} />;
  }

  if (!course) return null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Back Button */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/student/courses')}
        >
          Back to Course Catalog
        </Button>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-tr from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge variant="code" size="lg">
              {course.courseCode}
            </Badge>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{course.duration}</span>
            </div>
            <span className="text-xs text-slate-400 ml-auto">
              Added {formatDate(course.createdAt)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
            {course.title}
          </h1>
        </div>

        {/* Instructor Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 max-w-md">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {course.faculty?.name ? course.faculty.name.charAt(0) : 'F'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Course Instructor
            </span>
            <span className="text-base font-bold text-slate-100">
              {course.faculty?.name || 'Assigned Faculty Member'}
            </span>
            <span className="text-xs text-indigo-400">{course.faculty?.email}</span>
          </div>
        </div>
      </div>

      {/* Description & Syllabus Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-lg border-b border-slate-800 pb-3">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h2>Course Description & Syllabus</h2>
        </div>

        <p className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap">
          {course.description}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Comprehensive curriculum syllabus included</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Institutional accreditation certified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
