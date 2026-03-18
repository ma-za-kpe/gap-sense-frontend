'use client';

import { useRef, useState, useEffect } from 'react';

interface DragDropUploadProps {
  onFileSelect: (file: File) => void;
  onError?: (message: string) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

export function DragDropUpload({
  onFileSelect,
  onError,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  className = '',
}: DragDropUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const dragCounter = useRef(0);

  // File validation
  const validateFile = (file: File): string | null => {
    const allowedTypes = accept.split(',').map(t => t.trim());

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload JPG, PNG, or WebP.';
    }

    if (file.size > maxSize) {
      const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
      return `File too large. Maximum size is ${maxMB}MB.`;
    }

    return null;
  };

  // Handle file selection
  const handleFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      onError?.(error);
      return;
    }

    // Simulate upload progress (visual feedback)
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 50);

    setTimeout(() => {
      onFileSelect(file);
      setUploadProgress(0);
    }, 600);
  };

  // Click to upload
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Paste from clipboard (Cmd+V / Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled]);

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative rounded-xl border-2 border-dashed
          transition-all duration-300 cursor-pointer
          ${isDragging
            ? 'border-whatsapp-500 bg-whatsapp-50 scale-[1.02]'
            : 'border-slate-300 bg-slate-50 hover:border-whatsapp-400 hover:bg-whatsapp-50/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          p-8 sm:p-12
        `}
      >
        {/* Upload Progress Bar */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 rounded-t-xl overflow-hidden">
            <div
              className="h-full bg-whatsapp-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div
            className={`
              mb-4 text-6xl sm:text-7xl
              transition-transform duration-300
              ${isDragging ? 'scale-110' : 'scale-100'}
            `}
          >
            {isDragging ? '📥' : '📤'}
          </div>

          {/* Main Text */}
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
            {isDragging ? 'Drop image here' : 'Upload Exercise Book'}
          </h3>

          {/* Instructions */}
          <p className="text-sm sm:text-base text-slate-600 mb-4">
            {isDragging ? (
              'Release to upload'
            ) : (
              <>
                <span className="font-semibold">Click to browse</span> or drag and drop
              </>
            )}
          </p>

          {/* Supported Formats */}
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">JPG</span>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">PNG</span>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">WebP</span>
          </div>

          {/* Additional Info */}
          <p className="text-xs text-slate-500">
            Max {(maxSize / (1024 * 1024)).toFixed(0)}MB • Press{' '}
            <kbd className="px-1 py-0.5 bg-slate-200 rounded text-slate-700 font-mono text-[10px]">
              Cmd+V
            </kbd>{' '}
            to paste
          </p>
        </div>
      </div>
    </div>
  );
}
