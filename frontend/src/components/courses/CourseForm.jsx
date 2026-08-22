import React, { useState, useEffect } from 'react';
import { BookOpen, Hash, Clock, FileText, UserCheck } from 'lucide-react';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Button from '../common/Button';

export default function CourseForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  facultyList = [],
  isAdmin = false,
  isEdit = false,
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    courseCode: initialData.courseCode || '',
    description: initialData.description || '',
    duration: initialData.duration || '',
    facultyId: initialData.facultyId || (facultyList[0]?.id || ''),
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData.id) {
      setFormData({
        title: initialData.title || '',
        courseCode: initialData.courseCode || '',
        description: initialData.description || '',
        duration: initialData.duration || '',
        facultyId: initialData.facultyId || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'courseCode' ? value.toUpperCase() : value,
    }));
    // Clear error for edited field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Course title must be at least 3 characters long';
    }

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required';
    } else if (formData.courseCode.trim().length < 2) {
      newErrors.courseCode = 'Course code must be at least 2 characters long';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Course duration is required (e.g. 12 Weeks)';
    }

    if (isAdmin && !formData.facultyId) {
      newErrors.facultyId = 'Please select a faculty member for this course';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Title & Code in 2 columns on tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Course Title"
            name="title"
            placeholder="e.g. Distributed Cloud Computing"
            icon={BookOpen}
            required
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
          />
        </div>

        <div>
          <Input
            label="Course Code"
            name="courseCode"
            placeholder="e.g. CS401"
            icon={Hash}
            required
            value={formData.courseCode}
            onChange={handleChange}
            error={errors.courseCode}
            helperText="Unique uppercase identifier"
          />
        </div>
      </div>

      {/* Duration and Faculty Assignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Duration"
            name="duration"
            placeholder="e.g. 12 Weeks (48 Hours)"
            icon={Clock}
            required
            value={formData.duration}
            onChange={handleChange}
            error={errors.duration}
          />
        </div>

        {isAdmin ? (
          <div>
            <Select
              label="Assigned Faculty Member"
              name="facultyId"
              required
              value={formData.facultyId}
              onChange={handleChange}
              error={errors.facultyId}
              placeholder="Select an instructor"
              options={facultyList.map((f) => ({
                value: f.id,
                label: `${f.name} (${f.email})`,
              }))}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 justify-center p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              Instructor Assignment
            </span>
            <p className="text-sm font-medium text-slate-200">
              Automatically assigned to your faculty profile
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <Textarea
          label="Course Description & Syllabus Summary"
          name="description"
          placeholder="Provide a comprehensive summary of course outcomes, prerequisites, and syllabus..."
          rows={5}
          required
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? 'Save Changes' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
}
