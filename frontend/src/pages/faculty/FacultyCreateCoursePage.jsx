import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import CourseForm from '../../components/courses/CourseForm';
import { courseService } from '../../services/courseService';
import { useToast } from '../../hooks/useToast';

export default function FacultyCreateCoursePage() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const newCourse = await courseService.createCourse(formData);
      success(`Course '${newCourse.title}' created and assigned to your profile`);
      navigate('/faculty/courses');
    } catch (err) {
      toastError(err.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/faculty/courses')}
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Create Faculty Course
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Design a new course syllabus and syllabus outline for your classes
          </p>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <CourseForm
          isAdmin={false}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/faculty/courses')}
          loading={submitting}
        />
      </div>
    </div>
  );
}
