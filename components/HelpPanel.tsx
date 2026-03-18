'use client';

import { useState, useEffect } from 'react';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('quick-start');

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sections = [
    { id: 'quick-start', label: 'Quick Start', icon: '🚀' },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: '⌨️' },
    { id: 'commands', label: 'Text Commands', icon: '💬' },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: '🔧' },
    { id: 'support', label: 'Support', icon: '💁' },
  ];

  const shortcuts = [
    { keys: 'Cmd+K', action: 'Open command palette' },
    { keys: 'Cmd+U', action: 'Upload exercise book' },
    { keys: 'Cmd+D', action: 'View dashboard' },
    { keys: 'Cmd+B', action: 'Browse curriculum' },
    { keys: 'Cmd+F', action: 'Toggle fullscreen slides' },
    { keys: 'Cmd+H', action: 'Open help panel' },
    { keys: 'Cmd+V', action: 'Paste image from clipboard' },
    { keys: 'ESC', action: 'Close modals/panels' },
  ];

  const textCommands = [
    { command: 'STOP', description: 'Stop receiving messages' },
    { command: 'RESTART', description: 'Restart your session' },
    { command: 'HELP', description: 'Get help information' },
    { command: 'DASHBOARD', description: 'View your dashboard' },
  ];

  const troubleshooting = [
    {
      issue: 'Image upload fails',
      solution: 'Ensure file is under 10MB and in JPG, PNG, or WebP format. Check your internet connection.',
    },
    {
      issue: 'Analysis taking too long',
      solution: 'Analysis usually takes 8-10 seconds. If it exceeds 2 minutes, check the dashboard manually.',
    },
    {
      issue: 'Student not in list',
      solution: 'Complete teacher onboarding first. Add students through the onboarding flow.',
    },
    {
      issue: 'Cannot see dashboard',
      solution: 'Ensure at least one analysis has been completed. Use Cmd+D or the command palette to navigate.',
    },
  ];

  // Filter content based on search
  const filteredShortcuts = shortcuts.filter(
    s =>
      s.keys.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommands = textCommands.filter(
    c =>
      c.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[450px] bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-gradient-whatsapp text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">❓</span>
            <div>
              <h2 className="text-2xl font-bold">Help Center</h2>
              <p className="text-sm opacity-90">Learn how to use GapSense</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close help panel"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
          </div>
        </div>

        {/* Sections Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-200 px-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors border-b-2
                ${activeSection === section.id
                  ? 'border-whatsapp-500 text-whatsapp-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
                }
              `}
            >
              <span>{section.icon}</span>
              <span className="text-sm">{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-280px)] p-6">
          {/* Quick Start */}
          {activeSection === 'quick-start' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">🚀 Quick Start Guide</h3>
                <ol className="space-y-3 list-decimal list-inside text-slate-700">
                  <li>
                    <strong>Upload an exercise book:</strong> Click the upload area or drag and drop an image
                  </li>
                  <li>
                    <strong>Select student:</strong> Choose which student's work you're analyzing
                  </li>
                  <li>
                    <strong>Wait for analysis:</strong> AI analyzes the work in 8-10 seconds
                  </li>
                  <li>
                    <strong>View results:</strong> See learning gaps and recommendations
                  </li>
                  <li>
                    <strong>Access dashboard:</strong> Press Cmd+D or use command palette (Cmd+K)
                  </li>
                </ol>
              </div>

              <div className="bg-whatsapp-50 border border-whatsapp-200 rounded-lg p-4">
                <p className="text-sm text-whatsapp-700">
                  <strong>💡 Pro Tip:</strong> Use Cmd+K to quickly access any feature. It's like Spotlight for GapSense!
                </p>
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts */}
          {activeSection === 'shortcuts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-3">⌨️ Keyboard Shortcuts</h3>
              {filteredShortcuts.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No shortcuts match your search</p>
              ) : (
                <div className="space-y-2">
                  {filteredShortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <span className="text-slate-700">{shortcut.action}</span>
                      <kbd className="px-3 py-1 bg-white border border-slate-300 rounded shadow-sm text-sm font-mono text-slate-600">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Text Commands */}
          {activeSection === 'commands' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-3">💬 Text Commands</h3>
              <p className="text-sm text-slate-600 mb-4">
                Type these commands in the chat to perform actions:
              </p>
              {filteredCommands.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No commands match your search</p>
              ) : (
                <div className="space-y-2">
                  {filteredCommands.map((cmd, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <kbd className="px-2 py-1 bg-whatsapp-500 text-white rounded text-sm font-mono">
                          {cmd.command}
                        </kbd>
                      </div>
                      <p className="text-sm text-slate-600">{cmd.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Troubleshooting */}
          {activeSection === 'troubleshooting' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-3">🔧 Troubleshooting</h3>
              <div className="space-y-3">
                {troubleshooting.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg border-l-4 border-gold-500">
                    <h4 className="font-semibold text-slate-800 mb-2">{item.issue}</h4>
                    <p className="text-sm text-slate-600">{item.solution}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support */}
          {activeSection === 'support' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-3">💁 Need More Help?</h3>

              <div className="p-4 bg-whatsapp-50 rounded-lg">
                <h4 className="font-semibold text-whatsapp-700 mb-2">📧 Email Support</h4>
                <p className="text-sm text-slate-600 mb-2">
                  Send us an email and we'll respond within 24 hours
                </p>
                <a
                  href="mailto:support@gapsense.com"
                  className="text-sm text-whatsapp-600 hover:underline font-medium"
                >
                  support@gapsense.com
                </a>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-700 mb-2">📚 Documentation</h4>
                <p className="text-sm text-slate-600 mb-2">
                  Read our comprehensive guides and tutorials
                </p>
                <a
                  href="https://docs.gapsense.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  docs.gapsense.com →
                </a>
              </div>

              <div className="p-4 bg-gold-50 rounded-lg">
                <h4 className="font-semibold text-gold-700 mb-2">💬 WhatsApp Support</h4>
                <p className="text-sm text-slate-600 mb-2">
                  Chat with our support team on WhatsApp
                </p>
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gold-600 hover:underline font-medium"
                >
                  Start WhatsApp Chat →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-center text-slate-500">
            Press <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded text-[10px]">ESC</kbd> to close
          </p>
        </div>
      </div>
    </>
  );
}

// Hook for managing help panel
export function useHelpPanel() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+H or Ctrl+H to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
