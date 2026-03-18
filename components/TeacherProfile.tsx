'use client';

import { useState, useEffect } from 'react';

interface TeacherProfileData {
  name?: string;
  phone: string;
  email?: string;
  school_name?: string;
  subject?: string;
  years_experience?: number;
  bio?: string;
  created_at?: string;
}

interface TeacherProfileProps {
  teacherPhone: string;
  onProfileUpdate?: (profile: TeacherProfileData) => void;
}

export function TeacherProfile({ teacherPhone, onProfileUpdate }: TeacherProfileProps) {
  const [profile, setProfile] = useState<TeacherProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    years_experience: '',
    bio: '',
  });

  // Load teacher profile
  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/demo/api/teacher/profile?phone=${encodeURIComponent(teacherPhone)}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || '',
          email: data.profile.email || '',
          subject: data.profile.subject || '',
          years_experience: data.profile.years_experience?.toString() || '',
          bio: data.profile.bio || '',
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/demo/api/teacher/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: teacherPhone,
          name: formData.name,
          email: formData.email || undefined,
          subject: formData.subject || undefined,
          years_experience: formData.years_experience ? parseInt(formData.years_experience) : undefined,
          bio: formData.bio || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setIsEditing(false);
        onProfileUpdate?.(data.profile);
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        subject: profile.subject || '',
        years_experience: profile.years_experience?.toString() || '',
        bio: profile.bio || '',
      });
    }
    setIsEditing(false);
  };

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [teacherPhone]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
        <div className="text-4xl mb-3">⟳</div>
        <p className="text-slate-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Teacher Profile</h2>
            <p className="text-indigo-100 text-sm">Manage your account information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <button
              onClick={() => loadProfile()}
              disabled={isLoading}
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50"
            >
              {isLoading ? '⟳' : '🔄'} Refresh
            </button>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6">
        {!isEditing ? (
          // View Mode
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile?.name ? profile.name[0].toUpperCase() : '👤'}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {profile?.name || 'Teacher Name Not Set'}
                </h3>
                <p className="text-slate-600">{teacherPhone}</p>
                {profile?.school_name && (
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    🏫 {profile.school_name}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <p className="text-slate-800">
                  {profile?.email || <span className="text-slate-400 italic">Not provided</span>}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Primary Subject
                </label>
                <p className="text-slate-800">
                  {profile?.subject || <span className="text-slate-400 italic">Not provided</span>}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Years of Experience
                </label>
                <p className="text-slate-800">
                  {profile?.years_experience
                    ? `${profile.years_experience} years`
                    : <span className="text-slate-400 italic">Not provided</span>
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Member Since
                </label>
                <p className="text-slate-800">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : <span className="text-slate-400 italic">Unknown</span>
                  }
                </p>
              </div>
            </div>

            {/* Bio Section */}
            {profile?.bio && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Bio
                </label>
                <p className="text-slate-800 bg-slate-50 p-4 rounded-lg">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Empty State */}
            {!profile?.name && (
              <div className="text-center py-8 bg-slate-50 rounded-lg">
                <div className="text-4xl mb-2">👤</div>
                <p className="text-slate-600 mb-4">Complete your profile to get started</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
                >
                  Complete Profile
                </button>
              </div>
            )}
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email Address (optional)
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Primary Subject (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics, English"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Years of Experience (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="Years"
                  value={formData.years_experience}
                  onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Bio (optional)
              </label>
              <textarea
                placeholder="Tell us a bit about yourself and your teaching experience..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-2.5 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : '💾 Save Profile'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Phone: <strong className="text-slate-800">{teacherPhone}</strong>
          </span>
          {profile?.school_name && (
            <span className="flex items-center gap-1">
              🏫 {profile.school_name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function useTeacherProfile() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
