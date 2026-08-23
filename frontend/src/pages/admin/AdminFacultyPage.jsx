import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, PlusCircle, Search, Mail, Lock, User, Calendar, BookOpen } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { TableRowSkeleton } from '../../components/common/SkeletonLoader';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchFaculty = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getFaculty();
      setFaculty(data);
    } catch (err) {
      setError(err.message || 'Failed to load faculty instructors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';

    if (!formData.email.trim()) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email address format';

    if (!formData.password) errs.password = 'Temporary password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters long';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const newFaculty = await adminService.createFaculty(formData);
      success(`Faculty member '${newFaculty.name}' created successfully`);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '' });
      fetchFaculty();
    } catch (err) {
      toastError(err.message || 'Failed to create faculty member');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaculty = faculty.filter((f) => {
    const term = search.toLowerCase();
    return f.name.toLowerCase().includes(term) || f.email.toLowerCase().includes(term);
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-blue-400" />
            Faculty Management
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            View active faculty instructors and provision new teaching accounts
          </p>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={() => {
            setFormData({ name: '', email: '', password: '' });
            setFormErrors({});
            setIsModalOpen(true);
          }}
        >
          Create Faculty
        </Button>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search faculty by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="py-2 text-xs"
          />
        </div>
      </div>

      {/* Faculty Table / List */}
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 overflow-hidden">
          <table className="w-full">
            <tbody>
              <TableRowSkeleton cols={4} />
              <TableRowSkeleton cols={4} />
              <TableRowSkeleton cols={4} />
            </tbody>
          </table>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchFaculty} />
      ) : filteredFaculty.length === 0 ? (
        <EmptyState
          title={search ? 'No faculty found' : 'No faculty accounts'}
          description={
            search
              ? 'No faculty members matched your search criteria.'
              : 'Provision the first faculty instructor to begin assigning courses.'
          }
          actionLabel={search ? 'Clear Search' : 'Create Faculty'}
          onAction={search ? () => setSearch('') : () => setIsModalOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-xs uppercase font-semibold text-slate-400 tracking-wider">
              <tr>
                <th scope="col" className="py-4 px-6">Faculty Instructor</th>
                <th scope="col" className="py-4 px-6">Email Address</th>
                <th scope="col" className="py-4 px-6">Assigned Courses</th>
                <th scope="col" className="py-4 px-6">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredFaculty.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-300 font-bold text-sm">
                        {item.name ? item.name.charAt(0) : 'F'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                          {item.name}
                        </span>
                        <div className="mt-0.5">
                          <Badge variant="faculty" size="sm">FACULTY</Badge>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-slate-300 font-mono">
                    {item.email}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 w-fit">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>{item._count?.assignedCourses || 0} Course(s)</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !submitting && setIsModalOpen(false)}
        title="Create Faculty Instructor"
        description="Provision a new Faculty teaching account with automatic role assignment."
      >
        <form onSubmit={handleCreateFaculty} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="e.g. Dr. Robert Martinez"
            icon={User}
            required
            value={formData.name}
            onChange={handleFormChange}
            error={formErrors.name}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="robert.martinez@institution.edu"
            icon={Mail}
            required
            value={formData.email}
            onChange={handleFormChange}
            error={formErrors.email}
          />

          <Input
            label="Temporary Password"
            name="password"
            type="password"
            placeholder="Minimum 6 characters"
            icon={Lock}
            required
            value={formData.password}
            onChange={handleFormChange}
            error={formErrors.password}
            helperText="The faculty member can use this credential to log in immediately."
          />

          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-300">
            Assigned Role: <strong>FACULTY</strong> (Automatic backend assignment)
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create Faculty Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
