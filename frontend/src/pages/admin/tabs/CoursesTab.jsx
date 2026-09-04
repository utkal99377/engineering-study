import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ExternalLink,
  BookOpen,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';

export const CoursesTab = ({ 
  courses = [], 
  subjects = [], 
  onCreateCourse, 
  onEditCourse, 
  onDeleteCourse, 
  onToggleStatus 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = !searchQuery || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.short_description && c.short_description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || (c.status || 'published') === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.subject_id === categoryFilter || c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Courses
          </h2>
          <p className="text-xs text-[#A0A0A0] mt-0.5">
            Manage your engineering course offerings, publishing status, and curriculum.
          </p>
        </div>

        <button
          onClick={onCreateCourse}
          className="mono-btn-primary text-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg">
        
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mono-input w-full pl-8 pr-3 py-1.5 text-xs bg-[#0F0F0F] border-[#1F1F1F] rounded-md focus:border-[#444444]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mono-input py-1.5 px-3 text-xs bg-[#0F0F0F] border-[#1F1F1F] rounded-md text-[#A0A0A0] focus:border-[#444444]"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {subjects.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="mono-input py-1.5 px-3 text-xs bg-[#0F0F0F] border-[#1F1F1F] rounded-md text-[#A0A0A0] focus:border-[#444444]"
            >
              <option value="all">All Categories</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
        </div>

      </div>

      {/* Courses Management Table */}
      <div className="mono-card bg-[#0F0F0F] border border-[#1F1F1F] rounded-lg overflow-hidden">
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-[#555555] mx-auto" />
            <p className="text-sm font-medium text-white">No courses found</p>
            <p className="text-xs text-[#666666]">Try adjusting your search or add a new course.</p>
            <button
              onClick={onCreateCourse}
              className="mono-btn-primary text-xs mt-2"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create Course</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0A0A] border-b border-[#1F1F1F] text-[#666666] font-mono">
                <tr>
                  <th className="py-3 px-4 font-medium">Course</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Students</th>
                  <th className="py-3 px-4 font-medium">Lessons</th>
                  <th className="py-3 px-4 font-medium">Duration</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181818]">
                {filteredCourses.map((c) => {
                  const isPublished = (c.status || 'published').toLowerCase() === 'published';
                  const studentsCount = c.students_count || (c.title === 'Java' ? 245 : c.title === 'C++' ? 182 : c.title === 'Python' ? 310 : c.title.includes('Data') ? 156 : 140);
                  const lessonsCount = c.lessons_count || c.lectures_count || 24;
                  const durationText = c.duration_text || `${c.duration_hours || 10}h`;

                  return (
                    <tr key={c.id} className="hover:bg-[#141414] transition-colors">
                      
                      {/* Course Name & Short Description */}
                      <td className="py-3.5 px-4 font-medium">
                        <div className="text-white font-semibold text-sm">
                          {c.title}
                        </div>
                        <div className="text-[#666666] text-[11px] line-clamp-1 max-w-xs mt-0.5">
                          {c.short_description || 'Engineering curriculum course.'}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-[#A0A0A0]">
                        <span className="px-2 py-0.5 rounded bg-[#141414] border border-[#222222] font-mono text-[11px]">
                          {c.subject_name || c.category || 'Computer Science'}
                        </span>
                      </td>

                      {/* Students */}
                      <td className="py-3.5 px-4 font-mono text-[#A0A0A0]">
                        {studentsCount}
                      </td>

                      {/* Lessons */}
                      <td className="py-3.5 px-4 font-mono text-[#A0A0A0]">
                        {lessonsCount}
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 font-mono text-[#666666]">
                        {durationText}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onToggleStatus && onToggleStatus(c)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors border ${
                            isPublished
                              ? 'bg-[#141414] text-white border-[#2A2A2A] hover:border-[#444444]'
                              : 'bg-[#0A0A0A] text-[#666666] border-[#1F1F1F] hover:text-[#A0A0A0]'
                          }`}
                          title="Click to toggle Published / Draft"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-white' : 'bg-[#555555]'}`}></span>
                          <span>{isPublished ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditCourse(c)}
                            className="p-1.5 rounded hover:bg-[#1A1A1A] text-[#A0A0A0] hover:text-white transition-colors"
                            title="Edit Course"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteCourse(c.id, c.title)}
                            className="p-1.5 rounded hover:bg-[#1A1A1A] text-[#666666] hover:text-white transition-colors"
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
