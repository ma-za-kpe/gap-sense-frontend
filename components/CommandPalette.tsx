'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  category: 'upload' | 'view' | 'settings' | 'help' | 'flow';
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter commands based on search
  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) {
          cmd.action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  const categoryLabels: Record<string, string> = {
    upload: '📤 Upload',
    view: '👁️ View',
    settings: '⚙️ Settings',
    help: '❓ Help',
    flow: '🔄 Flow Control',
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-32 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 outline-none text-lg placeholder:text-slate-400"
            />
            <kbd className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm font-mono">
              ESC
            </kbd>
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-lg mb-2">No commands found</p>
              <p className="text-sm">Try searching for "upload", "dashboard", or "help"</p>
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category} className="mb-4">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {categoryLabels[category as keyof typeof categoryLabels] || category}
                  </div>
                  {cmds.map((cmd, idx) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={cmd.id}
                        className={`
                          w-full px-4 py-3 flex items-center justify-between
                          transition-colors text-left
                          ${isSelected ? 'bg-whatsapp-50 border-l-4 border-whatsapp-500' : 'border-l-4 border-transparent hover:bg-slate-50'}
                        `}
                        onClick={() => {
                          cmd.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {cmd.icon && <span className="text-xl">{cmd.icon}</span>}
                          <div className="flex-1">
                            <div className="font-medium text-slate-800">{cmd.label}</div>
                            {cmd.description && (
                              <div className="text-sm text-slate-500">{cmd.description}</div>
                            )}
                          </div>
                        </div>
                        {cmd.shortcut && (
                          <kbd className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>⏎ Select</span>
              <span>ESC Close</span>
            </div>
            <div>
              {filteredCommands.length} {filteredCommands.length === 1 ? 'command' : 'commands'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for managing command palette
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
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
