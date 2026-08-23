import React, { useState, useEffect, useCallback } from 'react';
import { GraduationCap, Search, Mail, Calendar } from 'lucide-react';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { TableRowSkeleton } from '../../components/common/SkeletonLoader';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getStudents();
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term);
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
          <GraduationCap className="w-7 h-7 text-emerald-400" />
          Student Directory
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          View all registered students accessing the course catalog
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search students by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="py-2 text-xs"
          />
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 overflow-hidden">
          <table className="w-full">
            <tbody>
              <TableRowSkeleton cols={3} />
              <TableRowSkeleton cols={3} />
              <TableRowSkeleton cols={3} />
            </tbody>
          </table>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStudents} />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          title={search ? 'No students found' : 'No registered students'}
          description={
            search
              ? 'No student accounts matched your search criteria.'
              : 'New learners will appear here upon registering through public signup.'
          }
          actionLabel={search ? 'Clear Search' : undefined}
          onAction={search ? () => setSearch('') : undefined}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-xs uppercase font-semibold text-slate-400 tracking-wider">
              <tr>
                <th scope="col" className="py-4 px-6">Student Name</th>
                <th scope="col" className="py-4 px-6">Email Address</th>
                <th scope="col" className="py-4 px-6">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredStudents.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-300 font-bold text-sm">
                        {item.name ? item.name.charAt(0) : 'S'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                          {item.name}
                        </span>
                        <div className="mt-0.5">
                          <Badge variant="student" size="sm">STUDENT</Badge>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-slate-300 font-mono">
                    {item.email}
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
    </div>
  );
}
