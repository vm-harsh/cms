import React, { useState, useEffect, useCallback } from 'react';
import { Shield, PlusCircle, Search, Mail, Lock, User, Calendar, BookOpen } from 'lucide-react';
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

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAdmins();
      setAdmins(data);
    } catch (err) {
      setError(err.message || 'Failed to load administrators list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

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

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const newAdmin = await adminService.createAdmin(formData);
      success(`Administrator '${newAdmin.name}' created successfully`);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (err) {
      toastError(err.message || 'Failed to create administrator');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const term = search.toLowerCase();
    return a.name.toLowerCase().includes(term) || a.email.toLowerCase().includes(term);
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-purple-400" />
            Administrator Management
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage system administrators with full institutional CRUD privileges
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
          Create Admin
        </Button>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search administrators by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="py-2 text-xs"
          />
        </div>
      </div>

      {/* Admins Table / List */}
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 overflow-hidden">
          <table className="w-full">
            <tbody>
              <TableRowSkeleton cols={4} />
              <TableRowSkeleton cols={4} />
            </tbody>
          </table>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAdmins} />
      ) : filteredAdmins.length === 0 ? (
        <EmptyState
          title={search ? 'No administrators found' : 'No administrator accounts'}
          description={
            search
              ? 'No administrators matched your search criteria.'
              : 'Provision additional administrator accounts as needed.'
          }
          actionLabel={search ? 'Clear Search' : 'Create Admin'}
          onAction={search ? () => setSearch('') : () => setIsModalOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-xs uppercase font-semibold text-slate-400 tracking-wider">
              <tr>
                <th scope="col" className="py-4 px-6">Administrator</th>
                <th scope="col" className="py-4 px-6">Email Address</th>
                <th scope="col" className="py-4 px-6">Created Courses</th>
                <th scope="col" className="py-4 px-6">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredAdmins.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-300 font-bold text-sm">
                        {item.name ? item.name.charAt(0) : 'A'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-100 group-hover:text-purple-300 transition-colors">
                          {item.name}
                        </span>
                        <div className="mt-0.5">
                          <Badge variant="admin" size="sm">ADMIN</Badge>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-slate-300 font-mono">
                    {item.email}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 w-fit">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                      <span>{item._count?.createdCourses || 0} Course(s)</span>
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

      {/* Create Admin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !submitting && setIsModalOpen(false)}
        title="Create Administrator"
        description="Provision a new Administrator account with full system management privileges."
      >
        <form onSubmit={handleCreateAdmin} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="e.g. Jonathan Archer"
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
            placeholder="jonathan.archer@institution.edu"
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
            helperText="The new administrator can use this credential to log in immediately."
          />

          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-300">
            Assigned Role: <strong>ADMIN</strong> (Automatic backend assignment)
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
              Create Administrator
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
