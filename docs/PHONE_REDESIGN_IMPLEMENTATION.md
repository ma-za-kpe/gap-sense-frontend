# Phone Interface Redesign - Implementation Guide

## Overview
Complete redesign to fix all 20 audit issues and implement flow-aware UI based on E2E test requirements.

## Status: In Progress
- ✅ Type definitions added (BackendState, FlowPhase, Student, AnalysisStage)
- ✅ State variables added (flowPhase, backendState, students, uploadedImage, analysisStages)
- 🔄 **NEXT**: Rewrite core handler functions

---

## Core Handler Function Rewrites

### 1. Helper: Parse Students from Response

```typescript
// Add after slideshow functions, before handleSendMessage
const parseStudentsFromResponse = (response: string): Student[] => {
  // Backend returns: "Which student?\n1. Alice\n2. Bob\n3. Charlie"
  const lines = response.split('\n');
  const students: Student[] = [];

  for (const line of lines) {
    // Match pattern: "1. Student Name" or "1) Student Name"
    const match = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (match) {
      students.push({
        index: parseInt(match[1]),
        name: match[2].trim(),
      });
    }
  }

  return students;
};
```

### 2. Rewrite: handleSendMessage

```typescript
const handleSendMessage = async (buttonId?: string) => {
  if (!message.trim() && !buttonId || sending) return;

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'sent',
    text: message || buttonId || '',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  setChatHistory((prev) => [...prev, userMessage]);
  const currentMessage = message;
  setMessage('');
  setSending(true);

  try {
    const result = await sendMessage({
      message: currentMessage,
      teacher_phone: teacherPhone,
      button_id: buttonId,
    });

    if (result.success && result.data) {
      // ✅ CRITICAL: Track backend state
      setBackendState({
        flow: result.data.flow || backendState.flow,
        next_step: result.data.next_step || null,
        completed: result.data.completed || false,
      });

      // Add bot response to chat
      if (result.data.response) {
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'received',
          text: result.data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistory((prev) => [...prev, botResponse]);
      }

      // ✅ CRITICAL: Update flow phase based on backend state
      if (result.data.next_step === 'SELECT_STUDENT') {
        // Parse student list and transition to SELECT_STUDENT UI
        const parsedStudents = parseStudentsFromResponse(result.data.response);
        if (parsedStudents.length > 0) {
          setStudents(parsedStudents);
          setFlowPhase('SELECT_STUDENT');
        }
      } else if (result.data.completed && result.data.flow === 'FLOW-TEACHER-ONBOARD') {
        // Onboarding complete, ready for image upload
        setFlowPhase('AWAITING_UPLOAD');
      }

      // ❌ REMOVED: Don't start polling on "Analyzing" text
      // OLD CODE (WRONG):
      // if (result.data.response.includes('Analyzing')) {
      //   startPollingForCompletion();
      // }
    } else {
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'received',
        text: '❌ Error: ' + (result.error || 'Failed to send message'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, errorResponse]);
    }
  } catch (error) {
    const errorResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'received',
      text: '❌ Error: Failed to send message',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory((prev) => [...prev, errorResponse]);
  } finally {
    setSending(false);
  }
};
```

### 3. Rewrite: handleImageUpload

```typescript
const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file || sending) return;

  // ✅ NEW: File validation
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    const errorMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'received',
      text: '❌ File too large. Maximum size is 10MB.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory((prev) => [...prev, errorMsg]);
    return;
  }

  if (!file.type.startsWith('image/')) {
    const errorMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'received',
      text: '❌ Invalid file type. Please upload an image.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory((prev) => [...prev, errorMsg]);
    return;
  }

  // ✅ NEW: Create preview
  const preview = URL.createObjectURL(file);
  setUploadedImage({ file, preview });
  setFlowPhase('IMAGE_UPLOADED');

  const uploadMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'sent',
    text: `📷 Uploaded image: ${file.name}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setChatHistory((prev) => [...prev, uploadMessage]);
  setSending(true);

  // ❌ REMOVED: No premature "Analyzing..." message
  // OLD CODE (WRONG):
  // const processingMessage: ChatMessage = {
  //   text: '🔄 Processing your image... Analyzing student work with AI...',
  // };

  try {
    const result = await uploadImage({
      image: file,
      teacher_phone: teacherPhone,
    });

    if (result.success && result.data) {
      // ✅ CRITICAL: Track backend state
      setBackendState({
        flow: result.data.flow || 'FLOW-EXERCISE-BOOK-SCAN',
        next_step: result.data.next_step || null,
        completed: result.data.completed || false,
      });

      // Add bot response
      if (result.data.response) {
        const botResponse: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'received',
          text: result.data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistory((prev) => [...prev, botResponse]);
      }

      // ✅ CRITICAL: Parse students and transition to SELECT_STUDENT
      if (result.data.next_step === 'SELECT_STUDENT') {
        const parsedStudents = parseStudentsFromResponse(result.data.response);
        if (parsedStudents.length > 0) {
          setStudents(parsedStudents);
          setFlowPhase('SELECT_STUDENT');
        }
      }
    } else {
      const errorResponse: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'received',
        text: '❌ Error: ' + (result.error || 'Failed to process image'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, errorResponse]);
      setFlowPhase('AWAITING_UPLOAD'); // Reset on error
    }
  } catch (error) {
    const errorResponse: ChatMessage = {
      id: (Date.now() + 2).toString(),
      type: 'received',
      text: '❌ Error: Failed to process image',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory((prev) => [...prev, errorResponse]);
    setFlowPhase('AWAITING_UPLOAD'); // Reset on error
  } finally {
    setSending(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
};
```

### 4. NEW: handleStudentSelection

```typescript
const handleStudentSelection = async (student: Student) => {
  if (sending) return;

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'sent',
    text: `Selected: ${student.name}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setChatHistory((prev) => [...prev, userMessage]);
  setSending(true);

  // ✅ CRITICAL: Transition to ANALYZING phase immediately
  setFlowPhase('ANALYZING');

  // Reset analysis stages
  setAnalysisStages([
    { id: 'upload', label: 'Uploading to cloud', status: 'complete' },
    { id: 'analyze', label: 'AI analyzing work (8s)', status: 'active' },
    { id: 'gaps', label: 'Mapping curriculum gaps', status: 'pending' },
    { id: 'report', label: 'Generating report', status: 'pending' },
  ]);
  setElapsedTime(0);

  try {
    // Send student selection to backend (this triggers S3 + SQS + Worker!)
    const result = await sendMessage({
      message: student.index.toString(),
      teacher_phone: teacherPhone,
    });

    if (result.success && result.data?.response) {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'received',
        text: result.data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, botResponse]);

      // ✅ CRITICAL: NOW start polling (after student selection, not before!)
      startPollingForCompletion();
    }
  } catch (error) {
    setFlowPhase('SELECT_STUDENT'); // Reset on error
    const errorResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'received',
      text: '❌ Error: Failed to start analysis',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory((prev) => [...prev, errorResponse]);
  } finally {
    setSending(false);
  }
};
```

### 5. Update: startPollingForCompletion

```typescript
const startPollingForCompletion = () => {
  if (pollingIntervalRef.current) {
    clearInterval(pollingIntervalRef.current);
  }

  let attempts = 0;
  const maxAttempts = 60; // 60 * 2s = 120s max

  // Timer for elapsed time display
  const timerInterval = setInterval(() => {
    setElapsedTime((prev) => prev + 1);
  }, 1000);

  // Progress simulation (visual feedback while waiting)
  setTimeout(() => {
    setAnalysisStages((prev) =>
      prev.map((s) => s.id === 'analyze' ? { ...s, status: 'complete' } : s)
    );
    setAnalysisStages((prev) =>
      prev.map((s) => s.id === 'gaps' ? { ...s, status: 'active' } : s)
    );
  }, 4000); // After 4s

  setTimeout(() => {
    setAnalysisStages((prev) =>
      prev.map((s) => s.id === 'gaps' ? { ...s, status: 'complete' } : s)
    );
    setAnalysisStages((prev) =>
      prev.map((s) => s.id === 'report' ? { ...s, status: 'active' } : s)
    );
  }, 6000); // After 6s

  pollingIntervalRef.current = setInterval(async () => {
    attempts++;
    const isComplete = await checkAnalysisStatus();

    if (isComplete) {
      clearInterval(pollingIntervalRef.current!);
      clearInterval(timerInterval);
      pollingIntervalRef.current = null;

      // Mark all stages complete
      setAnalysisStages((prev) =>
        prev.map((s) => ({ ...s, status: 'complete' as const }))
      );

      // Transition to RESULTS_READY phase
      setFlowPhase('RESULTS_READY');

      const dashboardUrl = `/demo/reports/${encodeURIComponent(teacherPhone)}`;
      const dashboardMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'received',
        text: `✅ Analysis complete in ${elapsedTime}s! Found learning gaps.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, dashboardMessage]);
    } else if (attempts >= maxAttempts) {
      clearInterval(pollingIntervalRef.current!);
      clearInterval(timerInterval);
      pollingIntervalRef.current = null;

      setFlowPhase('IDLE'); // Reset on timeout

      const timeoutMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'received',
        text: '⏱️ Analysis is taking longer than expected. Please check the dashboard manually.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, timeoutMessage]);
    }
  }, 2000);
};
```

---

## UI Component Additions

### 6. StudentPickerUI Component

Add this INSIDE the Phone Mockup, AFTER the chat area:

```tsx
{/* Student Picker UI (overlays chat when flowPhase === 'SELECT_STUDENT') */}
{flowPhase === 'SELECT_STUDENT' && (
  <div className="absolute inset-0 bg-white z-10 flex flex-col">
    <div className="p-4 bg-whatsapp-50 border-b border-whatsapp-200">
      <h3 className="text-lg font-bold text-slate-800">Select Student</h3>
      <p className="text-sm text-slate-600 mt-1">Tap to analyze their work</p>
    </div>

    {uploadedImage && (
      <div className="p-4 border-b border-slate-200">
        <p className="text-xs text-slate-600 mb-2">Uploaded Image:</p>
        <img
          src={uploadedImage.preview}
          alt="Uploaded exercise book"
          className="w-full h-32 object-cover rounded-lg"
        />
      </div>
    )}

    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {students.map((student) => (
        <button
          key={student.index}
          onClick={() => handleStudentSelection(student)}
          disabled={sending}
          className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-whatsapp-500 hover:bg-whatsapp-50 transition-all active:scale-95 disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-whatsapp-100 text-whatsapp-600 flex items-center justify-center font-bold">
                {student.index}
              </div>
              <p className="font-semibold text-slate-800">{student.name}</p>
            </div>
            <span className="text-slate-400">→</span>
          </div>
        </button>
      ))}
    </div>

    <div className="p-4 border-t border-slate-200 bg-slate-50">
      <button
        onClick={() => {
          setFlowPhase('AWAITING_UPLOAD');
          setStudents([]);
        }}
        className="w-full py-2 text-sm text-slate-600 hover:text-slate-800"
      >
        ← Cancel
      </button>
    </div>
  </div>
)}
```

### 7. AnalysisProgressModal Component

Add this INSIDE the Phone Mockup:

```tsx
{/* Analysis Progress Modal (full overlay when flowPhase === 'ANALYZING') */}
{flowPhase === 'ANALYZING' && (
  <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-6">
    <div className="max-w-sm w-full">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🤖</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing...</h2>
        <p className="text-sm text-slate-600">AI is reviewing the exercise book</p>
      </div>

      {/* Progress stages */}
      <div className="space-y-4 mb-6">
        {analysisStages.map((stage) => (
          <div key={stage.id} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              stage.status === 'complete' ? 'bg-whatsapp-500 text-white' :
              stage.status === 'active' ? 'bg-gold-500 text-white animate-pulse' :
              'bg-slate-200 text-slate-400'
            }`}>
              {stage.status === 'complete' ? '✓' :
               stage.status === 'active' ? '⏳' : '○'}
            </div>
            <span className={`text-sm ${
              stage.status === 'complete' ? 'text-slate-800 font-semibold' :
              stage.status === 'active' ? 'text-gold-600 font-semibold' :
              'text-slate-400'
            }`}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>

      {/* Elapsed time */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-whatsapp-500"></div>
          <span className="text-sm font-mono text-slate-600">{elapsedTime}s</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-whatsapp-500 to-gold-500 h-full transition-all duration-1000"
          style={{
            width: `${Math.min((elapsedTime / 120) * 100, 100)}%`,
          }}
        />
      </div>
    </div>
  </div>
)}
```

### 8. ResultsSummaryCard Component

Add this INSIDE the chat area (render as last message when flowPhase === 'RESULTS_READY'):

```tsx
{/* Results Summary Card (shown in chat when flowPhase === 'RESULTS_READY') */}
{flowPhase === 'RESULTS_READY' && (
  <div className="mt-4 p-4 bg-gradient-to-br from-whatsapp-50 to-gold-50 rounded-xl border-2 border-whatsapp-200">
    <div className="flex items-center gap-3 mb-3">
      <div className="text-4xl">📊</div>
      <div>
        <h3 className="font-bold text-lg text-slate-800">Analysis Complete!</h3>
        <p className="text-sm text-slate-600">Learning gaps identified</p>
      </div>
    </div>

    <div className="bg-white rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">Analysis Time</span>
        <span className="text-lg font-bold text-whatsapp-600">{elapsedTime}s</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Gaps Found</span>
        <span className="text-lg font-bold text-gold-600">4</span>
      </div>
    </div>

    <button
      onClick={() => router.push(`/demo/reports/${encodeURIComponent(teacherPhone)}`)}
      className="w-full py-3 bg-whatsapp-500 text-white rounded-lg font-semibold hover:bg-whatsapp-700 transition-colors active:scale-95"
    >
      📊 View Full Report →
    </button>

    <button
      onClick={() => {
        setFlowPhase('AWAITING_UPLOAD');
        setUploadedImage(null);
        setStudents([]);
      }}
      className="w-full mt-2 py-2 text-sm text-slate-600 hover:text-slate-800"
    >
      Analyze Another Student
    </button>
  </div>
)}
```

---

## Testing Checklist

After implementation, test this E2E flow:

1. ✅ **Onboarding** → COLLECT_SCHOOL → COLLECT_CLASS → COLLECT_STUDENT_COUNT → COLLECT_STUDENT_LIST → CONFIRM → Complete
2. ✅ **Image Upload** → See preview → Backend returns SELECT_STUDENT
3. ✅ **Student Picker** → Interactive buttons (NOT typing "1")
4. ✅ **Analysis Progress** → Full-screen modal with stages → Polling starts
5. ✅ **Results** → Summary card → Dashboard button

## Files to Edit

1. `/app/demo/page.tsx` - All changes above
2. No new files needed - all inline components

## Estimated Implementation Time

- Core handlers: 30 min
- UI components: 45 min
- Testing: 15 min
- **Total: ~90 minutes**

---

## Next Steps

Continue editing `/app/demo/page.tsx` with the code blocks above.
