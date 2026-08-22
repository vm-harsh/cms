import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import CourseForm from '../../components/courses/CourseForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import { useToast } from '../../hooks/useToast';

export default function AdminEditCoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [courseData, facultyData] = await Promise.all([
          courseService.getCourseById(id),
          userService.getFacultyList(),
        ]);
        setCourse(courseData);
        setFacultyList(facultyData);
      } catch (err) {
        setError(err.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const updated = await courseService.updateCourse(id, formData);
      success(`Course '${updated.title}' updated successfully`);
      navigate('/admin/courses');
    } catch (err) {
      toastError(err.message || 'Failed to update course');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading course information..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/admin/courses')}
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Edit Course: {course?.courseCode}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Update course syllabus, metadata, and assigned faculty instructor
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <CourseForm
          initialData={course}
          facultyList={facultyList}
          isAdmin={true}
          isEdit={true}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/courses')}
          loading={submitting}
        />
      </div>
    </div>
  );
}
