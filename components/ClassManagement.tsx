'use client';

import { useState } from 'react';

interface Class {
  id: string;
  name: string;
  grade: string;
  subject?: string;
  student_count?: number;
  created_at?: string;
}

interface ClassManagementProps {
  teacherPhone: string;
  schoolId?: string;
  onClassSelect?: (classItem: Class) => void;
}

export function ClassManagement({ teacherPhone, schoolId, onClassSelect }: ClassManagementProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    subject: '',
  });

  // Load classes from backend
  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/demo/api/classes?teacher_phone=${encodeURIComponent(teacherPhone)}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new class
  const handleAddClass = async () => {
    if (!formData.name.trim() || !formData.grade.trim()) {
      alert('Please fill in class name and grade');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/demo/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_phone: teacherPhone,
          school_id: schoolId,
          name: formData.name,
          grade: formData.grade,
          subject: formData.subject || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setClasses([...classes, data.class]);
        resetForm();
        setIsAddingClass(false);
      } else {
        alert('Failed to add class');
      }
    } catch (error) {
      console.error('Error adding class:', error);
      alert('Failed to add class');
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing class
  const handleUpdateClass = async () => {
    if (!editingClass || !formData.name.trim() || !formData.grade.trim()) {
      alert('Please fill in class name and grade');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/demo/api/classes/${editingClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_phone: teacherPhone,
          name: formData.name,
          grade: formData.grade,
          subject: formData.subject || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(classes.map(c => c.id === editingClass.id ? data.class : c));
        resetForm();
        setEditingClass(null);
      } else {
        alert('Failed to update class');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      alert('Failed to update class');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete class
  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class? Students will not be deleted.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/demo/api/classes/${classId}?teacher_phone=${encodeURIComponent(teacherPhone)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setClasses(classes.filter(c => c.id !== classId));
      } else {
        alert('Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class');
    } finally {
      setIsLoading(false);
    }
  };

  // Edit class - populate form
  const startEditClass = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      grade: classItem.grade,
      subject: classItem.subject || '',
    });
    setIsAddingClass(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      grade: '',
      subject: '',
    });
    setEditingClass(null);
  };

  // Cancel form
  const cancelForm = () => {
    resetForm();
    setIsAddingClass(false);
  };

  // Filter classes by search
  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (classItem.subject && classItem.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Class Management</h2>
            <p className="text-blue-100 text-sm">Create and manage your classes</p>
          </div>
          <button
            onClick={() => loadClasses()}
            disabled={isLoading}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? '⟳' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {/* Search and Add */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search classes by name, grade, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsAddingClass(true);
            }}
            disabled={isAddingClass}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            ➕ Add Class
          </button>
        </div>
      </div>

      {/* Add/Edit Class Form */}
      {isAddingClass && (
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingClass ? '✏️ Edit Class' : '➕ Add New Class'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Class Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., JHS 1A, Grade 4 Mathematics"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Grade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., JHS 1, Primary 4"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Subject (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Mathematics, English, Science"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={editingClass ? handleUpdateClass : handleAddClass}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : editingClass ? 'Update Class' : 'Add Class'}
            </button>
            <button
              onClick={cancelForm}
              disabled={isLoading}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Classes List */}
      <div className="p-6">
        {isLoading && classes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">⟳</div>
            <p className="text-slate-600">Loading classes...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-3">🏫</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {searchQuery ? 'No classes found' : 'No classes yet'}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchQuery
                ? 'Try a different search term'
                : 'Click "Add Class" to create your first class'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="border border-slate-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{classItem.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded">
                        {classItem.grade}
                      </span>
                      {classItem.subject && (
                        <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-sm font-semibold rounded">
                          {classItem.subject}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                  {classItem.student_count !== undefined && (
                    <span className="flex items-center gap-1">
                      👥 {classItem.student_count} student{classItem.student_count !== 1 ? 's' : ''}
                    </span>
                  )}
                  {classItem.created_at && (
                    <span className="flex items-center gap-1">
                      📅 {new Date(classItem.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {onClassSelect && (
                    <button
                      onClick={() => onClassSelect(classItem)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                      Select
                    </button>
                  )}
                  <button
                    onClick={() => startEditClass(classItem)}
                    className="px-3 py-2 bg-gold-500 text-white text-sm rounded-lg font-semibold hover:bg-gold-600 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteClass(classItem.id)}
                    disabled={isLoading}
                    className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {classes.length > 0 && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              <strong className="text-slate-800">{filteredClasses.length}</strong> class{filteredClasses.length !== 1 ? 'es' : ''}
              {searchQuery && ` (filtered from ${classes.length} total)`}
            </span>
            <span className="text-xs">
              Teacher: {teacherPhone}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function useClassManagement() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
