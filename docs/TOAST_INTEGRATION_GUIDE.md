# 🎯 Toast Integration Guide
## Add Beautiful Notifications to Demo Page

### Step 1: Add Imports (Top of app/demo/page.tsx)

```typescript
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
```

### Step 2: Add Toast Hook (After other useState declarations ~line 82)

```typescript
// Toast notifications
const toast = useToast();
```

### Step 3: Add ToastContainer to Render (Right before closing </div> of min-h-screen ~line 1100)

```typescript
      </div> {/* End slideshow container */}
    </div> {/* End main container */}

    {/* Toast Notifications */}
    <ToastContainer toasts={toast.toasts} onDismiss={toast.removeToast} />
  </div> {/* End min-h-screen */}
```

### Step 4: Replace Error Messages with Toasts

#### In handleImageUpload (~line 187-213):

**Replace:**
```typescript
if (file.size > maxSize) {
  const errorMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'received',
    text: '❌ Error: Image too large. Maximum size is 10MB.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setChatHistory((prev) => [...prev, errorMessage]);
  // ...
}
```

**With:**
```typescript
if (file.size > maxSize) {
  toast.error('Image too large. Maximum size is 10MB.', {
    label: 'Choose different file',
    onClick: () => fileInputRef.current?.click(),
  });
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
  return;
}
```

#### Similar for file type validation (~line 201-213):

```typescript
if (!allowedTypes.includes(file.type)) {
  toast.error('Invalid file type. Please upload JPG, PNG, or WebP.', {
    label: 'Choose different file',
    onClick: () => fileInputRef.current?.click(),
  });
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
  return;
}
```

#### In handleSendMessage (~line 157-177):

**Replace error ChatMessage with:**
```typescript
} else {
  toast.error(result.error || 'Failed to send message', {
    label: 'Retry',
    onClick: () => handleSendMessage(buttonId),
  });
}
```

#### In handleImageUpload success (~line 244-262):

**Add success toast:**
```typescript
// After successful upload
if (result.success && result.data) {
  toast.success('Image uploaded successfully!');

  // Track backend state
  setBackendState({
    // ...
  });
  // ...
}
```

#### In handleStudentSelection (~line 329):

**Add info toast when starting analysis:**
```typescript
// NOW start polling (after student selection, not before!)
startPollingForCompletion();
toast.info('Analysis started. This usually takes 8-10 seconds.');
```

#### In startPollingForCompletion (~line 417-423):

**Replace completion message with success toast:**
```typescript
if (isComplete) {
  // ... existing code ...

  toast.success(`Analysis complete in ${elapsedTime}s! Found learning gaps.`, {
    label: 'View Report',
    onClick: () => router.push(`/demo/reports/${encodeURIComponent(teacherPhone)}`),
  });

  // Keep the chat message too for history
  const dashboardMessage: ChatMessage = {
    // ... existing code ...
  };
}
```

#### For timeout (~line 431-437):

```typescript
} else if (attempts >= maxAttempts) {
  // ... existing code ...

  toast.warning('Analysis is taking longer than expected.', {
    label: 'Check Dashboard',
    onClick: () => router.push(`/demo/reports/${encodeURIComponent(teacherPhone)}`),
  });
}
```

---

## Additional Toast Opportunities

### 1. Network Errors:

```typescript
try {
  const result = await sendMessage({...});
} catch (error) {
  toast.error('Network error. Please check your connection.', {
    label: 'Retry',
    onClick: () => handleSendMessage(buttonId),
  });
}
```

### 2. Student Selection:

```typescript
const handleStudentSelection = async (student: Student) => {
  toast.info(`Analyzing ${student.name}'s work...`);
  // ... rest of function
};
```

### 3. Flow Phase Transitions:

```typescript
// When onboarding completes
if (result.data.completed && result.data.flow === 'FLOW-TEACHER-ONBOARD') {
  setFlowPhase('AWAITING_UPLOAD');
  toast.success('Onboarding complete! You can now upload exercise books.');
}
```

### 4. Cancel Actions:

```typescript
// In student picker cancel button
onClick={() => {
  setFlowPhase('AWAITING_UPLOAD');
  setStudents([]);
  toast.info('Student selection cancelled.');
}}
```

---

## Toast Best Practices

### ✅ DO:
- Use `success` for completed actions (upload, analysis done)
- Use `error` for failures with recovery actions
- Use `warning` for timeouts or non-critical issues
- Use `info` for status updates (analyzing, processing)
- Add action buttons for recoverable errors
- Keep messages short and actionable

### ❌ DON'T:
- Don't use toasts for every chat message (keep chat for conversation)
- Don't stack more than 3 toasts
- Don't use toasts for critical confirmations (use modals instead)
- Don't make error messages vague ("Error occurred")

### Example Patterns:

```typescript
// Good error with recovery
toast.error('Upload failed. File may be corrupted.', {
  label: 'Try different file',
  onClick: () => fileInputRef.current?.click(),
});

// Good success with next action
toast.success('Student added successfully!', {
  label: 'Upload their work',
  onClick: () => fileInputRef.current?.click(),
});

// Good info for long operations
toast.info('Analyzing work. This takes 8-10 seconds.', {
  duration: 10000, // Stay visible longer
});

// Good warning with option
toast.warning('No students added yet.', {
  label: 'Complete onboarding',
  onClick: () => handleSendMessage(),
});
```

---

## Testing Checklist

After integration, test these scenarios:

- [ ] Upload too large file → See error toast with "Choose different" action
- [ ] Upload wrong type → See error toast
- [ ] Upload success → See success toast
- [ ] Start analysis → See info toast "Analysis started"
- [ ] Analysis complete → See success toast with "View Report" action
- [ ] Analysis timeout → See warning toast with dashboard link
- [ ] Network error → See error toast with retry button
- [ ] Cancel student selection → See info toast
- [ ] Multiple toasts → Max 3 visible, stacked nicely
- [ ] Auto-dismiss → Toasts disappear after 3-5s
- [ ] Manual dismiss → X button works
- [ ] Action buttons → Clicking performs action and dismisses toast

---

## Quick Implementation

If you want to implement all at once, search for these patterns in app/demo/page.tsx:

1. Search: `const errorMessage: ChatMessage` (9 occurrences)
   - Replace with `toast.error()`

2. Search: `text: '❌ Error:`
   - Replace with toast.error() calls

3. Search: `text: '✅`
   - Consider adding toast.success() alongside

4. Add ToastContainer before closing `</div>` of `min-h-screen`

---

**Estimated Time:** 30 minutes to integrate all toast notifications
**Impact:** Massive UX improvement - professional, non-intrusive feedback
