import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

export default function CourseFilter({
  search = '',
  onSearchChange,
  facultyId = '',
  onFacultyChange,
  facultyList = [],
  showFacultyFilter = true,
  onReset,
}) {
  const hasActiveFilters = search.trim() !== '' || facultyId !== '';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
        {/* Search Input */}
        <div className="w-full sm:w-72">
          <Input
            icon={Search}
            placeholder="Search by title, code, keyword..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="py-2 text-xs"
          />
        </div>

        {/* Optional Faculty Filter */}
        {showFacultyFilter && facultyList.length > 0 && (
          <div className="w-full sm:w-64">
            <Select
              placeholder="All Faculty Instructors"
              value={facultyId}
              onChange={(e) => onFacultyChange(e.target.value)}
              className="py-2 text-xs"
              options={facultyList.map((f) => ({
                value: f.id,
                label: `${f.name} (${f.email})`,
              }))}
            />
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && onReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          icon={X}
          className="text-xs shrink-0 self-end md:self-center"
        >
          Reset Filters
        </Button>
      )}
    </div>
  );
}
