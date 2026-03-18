'use client';

import { useState } from 'react';
import { StudentManagement } from './StudentManagement';
import { ClassManagement } from './ClassManagement';
import { SchoolSelector } from './SchoolSelector';
import { TeacherProfile } from './TeacherProfile';

type TabId = 'students' | 'classes' | 'school' | 'profile';

interface ManagementDashboardProps {
  teacherPhone: string;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabId;
}

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'students',
    label: 'Students',
    icon: '👥',
    color: 'whatsapp',
    description: 'Manage your students',
  },
  {
    id: 'classes',
    label: 'Classes',
    icon: '🏫',
    color: 'blue',
    description: 'Organize your classes',
  },
  {
    id: 'school',
    label: 'School',
    icon: '🎓',
    color: 'purple',
    description: 'School information',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: '👤',
    color: 'indigo',
    description: 'Your account settings',
  },
];

export function ManagementDashboard({
  teacherPhone,
  isOpen,
  onClose,
  initialTab = 'students',
}: ManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);

  if (!isOpen) return null;

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8 animate-slide-up">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Management Dashboard
                </h2>
                <p className="text-slate-300 text-sm">
                  {teacherPhone} • {currentTab?.description}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                aria-label="Close dashboard"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all
                    ${activeTab === tab.id
                      ? 'bg-white text-slate-800 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                    }
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-280px)] overflow-y-auto">
            {activeTab === 'students' && (
              <StudentManagement
                teacherPhone={teacherPhone}
              />
            )}

            {activeTab === 'classes' && (
              <ClassManagement
                teacherPhone={teacherPhone}
                schoolId={selectedSchool?.id}
              />
            )}

            {activeTab === 'school' && (
              <SchoolSelector
                teacherPhone={teacherPhone}
                onSchoolSelect={setSelectedSchool}
                selectedSchool={selectedSchool}
              />
            )}

            {activeTab === 'profile' && (
              <TeacherProfile
                teacherPhone={teacherPhone}
              />
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-slate-600">
                <span className="font-semibold">Quick Tip:</span>{' '}
                {activeTab === 'students' && 'Click "Add Student" to manually add students to your roster'}
                {activeTab === 'classes' && 'Organize students into classes for better management'}
                {activeTab === 'school' && 'Select your school to enable school-wide features'}
                {activeTab === 'profile' && 'Keep your profile updated for personalized experience'}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 transition-colors whitespace-nowrap"
              >
                Close Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export function useManagementDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<TabId>('students');

  return {
    isOpen,
    initialTab,
    open: (tab: TabId = 'students') => {
      setInitialTab(tab);
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
  };
}
