'use client';

import { useState } from 'react';

interface School {
  id: string;
  name: string;
  region?: string;
  district?: string;
  type?: string;
  phone?: string;
  address?: string;
}

interface SchoolSelectorProps {
  teacherPhone: string;
  onSchoolSelect: (school: School) => void;
  selectedSchool?: School | null;
}

export function SchoolSelector({ teacherPhone, onSchoolSelect, selectedSchool }: SchoolSelectorProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Registration form state
  const [registerData, setRegisterData] = useState({
    name: '',
    region: '',
    district: '',
    type: 'public',
    phone: '',
    address: '',
  });

  // Search schools
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a school name to search');
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/demo/api/schools/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools || []);
      } else {
        alert('Failed to search schools');
      }
    } catch (error) {
      console.error('Error searching schools:', error);
      alert('Failed to search schools');
    } finally {
      setIsSearching(false);
    }
  };

  // Register new school
  const handleRegisterSchool = async () => {
    if (!registerData.name.trim() || !registerData.region.trim() || !registerData.district.trim()) {
      alert('Please fill in school name, region, and district');
      return;
    }

    setIsRegistering(true);
    try {
      const response = await fetch('/demo/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_phone: teacherPhone,
          ...registerData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onSchoolSelect(data.school);
        resetRegisterForm();
        setShowRegisterForm(false);
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to register school');
      }
    } catch (error) {
      console.error('Error registering school:', error);
      alert('Failed to register school');
    } finally {
      setIsRegistering(false);
    }
  };

  // Reset registration form
  const resetRegisterForm = () => {
    setRegisterData({
      name: '',
      region: '',
      district: '',
      type: 'public',
      phone: '',
      address: '',
    });
  };

  // Handle key press for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">School Selection</h2>
          <p className="text-purple-100 text-sm">Search for your school or register a new one</p>
        </div>
      </div>

      {/* Selected School Display */}
      {selectedSchool && (
        <div className="p-6 bg-green-50 border-b border-green-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-800 mb-1">
                ✅ Selected School
              </h3>
              <p className="text-xl font-bold text-slate-800 mb-2">{selectedSchool.name}</p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                {selectedSchool.region && (
                  <span className="flex items-center gap-1">
                    📍 {selectedSchool.region}
                  </span>
                )}
                {selectedSchool.district && (
                  <span className="flex items-center gap-1">
                    🗺️ {selectedSchool.district}
                  </span>
                )}
                {selectedSchool.type && (
                  <span className="flex items-center gap-1 capitalize">
                    🏫 {selectedSchool.type}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onSchoolSelect(null as any)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
            >
              Change School
            </button>
          </div>
        </div>
      )}

      {/* Search Section */}
      {!selectedSchool && !showRegisterForm && (
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Search for your school
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter school name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-2.5 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {isSearching ? '🔍 Searching...' : '🔍 Search'}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {schools.length > 0 ? (
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-bold text-slate-700">Search Results ({schools.length})</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {schools.map((school) => (
                  <div
                    key={school.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-slate-800 mb-1">{school.name}</h4>
                      <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                        {school.region && (
                          <span className="flex items-center gap-1">
                            📍 {school.region}
                          </span>
                        )}
                        {school.district && (
                          <span className="flex items-center gap-1">
                            🗺️ {school.district}
                          </span>
                        )}
                        {school.type && (
                          <span className="flex items-center gap-1 capitalize">
                            🏫 {school.type}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onSchoolSelect(school)}
                      className="ml-4 px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="text-center py-8 mb-6">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-slate-600">No schools found for "{searchQuery}"</p>
            </div>
          ) : null}

          {/* Register New School CTA */}
          <div className="text-center pt-6 border-t border-slate-200">
            <p className="text-slate-600 mb-3">Can't find your school?</p>
            <button
              onClick={() => {
                setShowRegisterForm(true);
                setRegisterData({ ...registerData, name: searchQuery });
              }}
              className="px-6 py-2.5 bg-gold-500 text-white rounded-lg font-semibold hover:bg-gold-600 transition-colors"
            >
              ➕ Register New School
            </button>
          </div>
        </div>
      )}

      {/* Register New School Form */}
      {showRegisterForm && (
        <div className="p-6 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 mb-4">➕ Register New School</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter full school name"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Region <span className="text-red-500">*</span>
              </label>
              <select
                value={registerData.region}
                onChange={(e) => setRegisterData({ ...registerData, region: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                <option value="">Select region...</option>
                <option value="Greater Accra">Greater Accra</option>
                <option value="Ashanti">Ashanti</option>
                <option value="Central">Central</option>
                <option value="Eastern">Eastern</option>
                <option value="Northern">Northern</option>
                <option value="Western">Western</option>
                <option value="Volta">Volta</option>
                <option value="Upper East">Upper East</option>
                <option value="Upper West">Upper West</option>
                <option value="Brong Ahafo">Brong Ahafo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter district"
                value={registerData.district}
                onChange={(e) => setRegisterData({ ...registerData, district: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                School Type
              </label>
              <select
                value={registerData.type}
                onChange={(e) => setRegisterData({ ...registerData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="international">International</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                placeholder="+233..."
                value={registerData.phone}
                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Address (optional)
              </label>
              <textarea
                placeholder="Enter school address..."
                value={registerData.address}
                onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRegisterSchool}
              disabled={isRegistering}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              {isRegistering ? 'Registering...' : 'Register School'}
            </button>
            <button
              onClick={() => {
                setShowRegisterForm(false);
                resetRegisterForm();
              }}
              disabled={isRegistering}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            ℹ️ Your school registration will be reviewed by administrators before approval.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!selectedSchool && !showRegisterForm && schools.length === 0 && !searchQuery && (
        <div className="p-12 text-center">
          <div className="text-6xl mb-4">🏫</div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Select Your School</h3>
          <p className="text-slate-600 mb-6">
            Search for your school using the search box above, or register a new school if it's not listed.
          </p>
        </div>
      )}
    </div>
  );
}

export function useSchoolSelector() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
