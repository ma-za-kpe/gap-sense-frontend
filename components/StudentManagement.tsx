'use client';

import { useState } from 'react';

interface Student {
  id: string;
  name: string;
  grade: string;
  age?: number;
  phone?: string;
  notes?: string;
  created_at?: string;
}

interface StudentManagementProps {
  teacherPhone: string;
  onStudentSelect?: (student: Student) => void;
}

export function StudentManagement({ teacherPhone, onStudentSelect }: StudentManagementProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    age: '',
    phone: '',
    notes: '',
  });

  // Load students from backend
  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/demo/api/students?teacher_phone=${encodeURIComponent(teacherPhone)}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new student
  const handleAddStudent = async () => {
    if (!formData.name.trim() || !formData.grade.trim()) {
      alert('Please fill in student name and grade');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/demo/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_phone: teacherPhone,
          name: formData.name,
          grade: formData.grade,
          age: formData.age ? parseInt(formData.age) : undefined,
          phone: formData.phone || undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStudents([...students, data.student]);
        resetForm();
        setIsAddingStudent(false);
      } else {
        alert('Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student');
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing student
  const handleUpdateStudent = async () => {
    if (!editingStudent || !formData.name.trim() || !formData.grade.trim()) {
      alert('Please fill in student name and grade');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/demo/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_phone: teacherPhone,
          name: formData.name,
          grade: formData.grade,
          age: formData.age ? parseInt(formData.age) : undefined,
          phone: formData.phone || undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(students.map(s => s.id === editingStudent.id ? data.student : s));
        resetForm();
        setEditingStudent(null);
      } else {
        alert('Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete student
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/demo/api/students/${studentId}?teacher_phone=${encodeURIComponent(teacherPhone)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStudents(students.filter(s => s.id !== studentId));
      } else {
        alert('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    } finally {
      setIsLoading(false);
    }
  };

  // Edit student - populate form
  const startEditStudent = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      grade: student.grade,
      age: student.age?.toString() || '',
      phone: student.phone || '',
      notes: student.notes || '',
    });
    setIsAddingStudent(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      grade: '',
      age: '',
      phone: '',
      notes: '',
    });
    setEditingStudent(null);
  };

  // Cancel form
  const cancelForm = () => {
    resetForm();
    setIsAddingStudent(false);
  };

  // Filter students by search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-whatsapp-500 to-whatsapp-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Student Management</h2>
            <p className="text-whatsapp-100 text-sm">View, add, and manage your students</p>
          </div>
          <button
            onClick={() => loadStudents()}
            disabled={isLoading}
            className="px-4 py-2 bg-white text-whatsapp-600 rounded-lg font-semibold hover:bg-whatsapp-50 transition-colors disabled:opacity-50"
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
              placeholder="🔍 Search students by name or grade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 outline-none"
            />
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsAddingStudent(true);
            }}
            disabled={isAddingStudent}
            className="px-6 py-2.5 bg-whatsapp-500 text-white rounded-lg font-semibold hover:bg-whatsapp-600 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            ➕ Add Student
          </button>
        </div>
      </div>

      {/* Add/Edit Student Form */}
      {isAddingStudent && (
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingStudent ? '✏️ Edit Student' : '➕ Add New Student'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 outline-none"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Age (optional)
              </label>
              <input
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                placeholder="+233..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 outline-none"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              placeholder="Any additional notes about the student..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 outline-none resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={editingStudent ? handleUpdateStudent : handleAddStudent}
              disabled={isLoading}
              className="px-6 py-2 bg-whatsapp-500 text-white rounded-lg font-semibold hover:bg-whatsapp-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : editingStudent ? 'Update Student' : 'Add Student'}
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

      {/* Students List */}
      <div className="p-6">
        {isLoading && students.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">⟳</div>
            <p className="text-slate-600">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-3">👥</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {searchQuery ? 'No students found' : 'No students yet'}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchQuery
                ? 'Try a different search term'
                : 'Click "Add Student" to add your first student'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-whatsapp-300 hover:bg-slate-50 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-800">{student.name}</h3>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded">
                      {student.grade}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    {student.age && (
                      <span className="flex items-center gap-1">
                        👤 {student.age} years old
                      </span>
                    )}
                    {student.phone && (
                      <span className="flex items-center gap-1">
                        📱 {student.phone}
                      </span>
                    )}
                    {student.created_at && (
                      <span className="flex items-center gap-1">
                        📅 Added {new Date(student.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {student.notes && (
                    <p className="text-sm text-slate-600 mt-2 italic">{student.notes}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  {onStudentSelect && (
                    <button
                      onClick={() => onStudentSelect(student)}
                      className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                      Select
                    </button>
                  )}
                  <button
                    onClick={() => startEditStudent(student)}
                    className="px-3 py-1.5 bg-gold-500 text-white text-sm rounded-lg font-semibold hover:bg-gold-600 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {students.length > 0 && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              <strong className="text-slate-800">{filteredStudents.length}</strong> student{filteredStudents.length !== 1 ? 's' : ''}
              {searchQuery && ` (filtered from ${students.length} total)`}
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

export function useStudentManagement() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
