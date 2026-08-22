import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, List, BookOpen } from 'lucide-react';
import CourseCard from '../../components/courses/CourseCard';
import CourseTable from '../../components/courses/CourseTable';
import CourseFilter from '../../components/courses/CourseFilter';
import { CourseCardSkeleton, TableRowSkeleton } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & View Mode
  const [search, setSearch] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const navigate = useNavigate();

  const fetchFaculty = async () => {
    try {
      const data = await userService.getFacultyList();
      setFacultyList(data);
    } catch {
      // Non-critical
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
      setError(err.message || 'Failed to load courses catalog');
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Explore Course Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Discover and review curriculum details, prerequisites, and instructors
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
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

      {/* Courses Display */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 overflow-hidden">
            <table className="w-full">
              <tbody>
                <TableRowSkeleton cols={5} />
                <TableRowSkeleton cols={5} />
                <TableRowSkeleton cols={5} />
              </tbody>
            </table>
          </div>
        )
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCourses} />
      ) : courses.length === 0 ? (
        <EmptyState
          title={search || facultyId ? 'No matching courses found' : 'Catalog empty'}
          description={
            search || facultyId
              ? 'Try modifying your search or clearing instructor filters.'
              : 'No courses are currently available in the catalog.'
          }
          actionLabel={search || facultyId ? 'Reset Filters' : undefined}
          onAction={
            search || facultyId
              ? () => {
                  setSearch('');
                  setFacultyId('');
                }
              : undefined
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onView={(c) => navigate(`/student/courses/${c.id}`)}
              canEdit={false}
              canDelete={false}
            />
          ))}
        </div>
      ) : (
        <div className="animate-fade-in">
          <CourseTable
            courses={courses}
            showFaculty={true}
            onView={(course) => navigate(`/student/courses/${course.id}`)}
            canEdit={() => false} // Students cannot edit
            canDelete={() => false} // Students cannot delete
          />
        </div>
      )}
    </div>
  );
}
