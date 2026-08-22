import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import CourseForm from '../../components/courses/CourseForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import { useToast } from '../../hooks/useToast';

export default function AdminCreateCoursePage() {
  const [facultyList, setFacultyList] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    async function loadFaculty() {
      try {
        setLoadingFaculty(true);
        const data = await userService.getFacultyList();
        setFacultyList(data);
      } catch (err) {
        setError(err.message || 'Failed to load faculty instructors list');
      } finally {
        setLoadingFaculty(false);
      }
    }
    loadFaculty();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const newCourse = await courseService.createCourse(formData);
      success(`Course '${newCourse.title}' created successfully`);
      navigate('/admin/courses');
    } catch (err) {
      toastError(err.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingFaculty) {
    return <LoadingSpinner fullPage message="Loading faculty members..." />;
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
            Create New Course
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Add a new curriculum course and assign it to a faculty member
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <CourseForm
          facultyList={facultyList}
          isAdmin={true}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/courses')}
          loading={submitting}
        />
      </div>
    </div>
  );
}
