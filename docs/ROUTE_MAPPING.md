# GapSense Route Mapping: FastAPI → Next.js

## ✅ Migration Complete!

All routes have been migrated to Next.js with full feature parity, including the interactive 12-slide pitch deck.

### FastAPI Routes

| Route | Method | Returns | Purpose | Next.js Equivalent |
|-------|--------|---------|---------|-------------------|
| `/` | GET | HTML | Landing page | `/` (app/page.tsx) ✅ |
| `/demo` | GET | HTML (Jinja2) | WhatsApp demo interface | `/demo` (app/demo/page.tsx) ✅ |
| `/demo/api/message` | POST | JSON | Send teacher message | API client ✅ |
| `/demo/api/upload-image` | POST | JSON | Upload exercise book | API client ✅ |
| `/demo/api/status` | GET | JSON | Class overview stats | API client ✅ |
| `/demo/api/gaps` | GET | JSON | Gap breakdown | API client ✅ |
| `/demo/api/student/{name}` | GET | JSON | Student report (by name) | API client ✅ |
| `/demo/api/teacher-info` | GET | JSON | Teacher + conversation state | API client ✅ |
| `/demo/api/reports/{phone}` | GET | JSON | Teacher dashboard data | API client ✅ |
| `/demo/api/reports/{phone}/student/{id}` | GET | JSON | Student detailed report data | API client ✅ |
| `/demo/api/curriculum` | GET | JSON | Curriculum data (nodes) | API client ✅ |
| `/demo/reports/{phone}` | GET | HTML | Teacher dashboard (full page) | `/demo/reports/[phone]/page.tsx` ✅ |
| `/demo/reports/{phone}/student/{id}` | GET | HTML | Student detailed report | `/demo/reports/[phone]/student/[id]/page.tsx` ✅ |
| `/demo/curriculum` | GET | HTML | Curriculum explorer | `/demo/curriculum/page.tsx` ✅ |

---

## Next.js App Router Structure

```
app/
├── page.tsx                                    ✅ Landing page (hero, stats, CTA)
├── demo/
│   ├── page.tsx                               ✅ WhatsApp demo interface
│   ├── reports/
│   │   └── [phone]/
│   │       ├── page.tsx                       ✅ Teacher dashboard
│   │       └── student/
│   │           └── [id]/
│   │               └── page.tsx              ✅ Student detailed report
│   └── curriculum/
│       └── page.tsx                           ✅ Curriculum explorer
├── components/
│   └── ui/                                    ✅ Component library (Button, Card, Badge, Input)
└── lib/
    └── api.ts                                 ✅ FastAPI client with all endpoints
```

---

## ✅ All Pages Complete!

### 1. **Teacher Dashboard** (`/reports/[phone]/page.tsx`)

**Old Route:** `GET /demo/reports/{teacher_phone}`
**Data Required:**
```typescript
{
  teacher: { name, phone },
  stats: {
    total_students: number,
    scanned_today: number,
    total_gaps: number,
    high_priority: number
  },
  latest_analysis: {
    student_name: string,
    created_at: string,
    errors: string[],
    patterns: string[],
    focus_areas: string[],
    gaps: Array<{ code, title, severity }>
  },
  students: Array<{
    id: string,
    first_name: string,
    grade: string,
    scan_count: number,
    last_diagnosed: string,
    gaps: Array<{ code, title, severity }>,
    errors: string[],
    patterns: string[],
    focus_areas: string[]
  }>
}
```

**New API Endpoint Needed:**
```typescript
GET /demo/api/reports/{phone}  // JSON version
```

**UI Components:**
- Stats cards (total students, scanned today, total gaps, high priority)
- Latest analysis summary
- Student grid/table with gap visualizations
- Severity indicators (high/medium/low)

---

### 2. **Student Detailed Report** (`/reports/[phone]/student/[id]/page.tsx`)

**Old Route:** `GET /demo/reports/{teacher_phone}/student/{student_id}`
**Data Required:**
```typescript
{
  timestamp: string,
  report_id: string,
  student: {
    id: string,
    name: string,
    age: number,
    gender: string,
    grade: string,
    school: string,
    school_type: string,
    home_language: string,
    school_language: string,
    diagnosis_count: number
  },
  ai_metadata: {
    analysis_id: string,
    timestamp: string,
    provider: string,
    model: string,
    prompt: string,
    input_tokens: string,
    output_tokens: string,
    total_tokens: string,
    latency_ms: string,
    latency_seconds: string,
    input_cost: string,
    output_cost: string,
    total_cost: string,
    success: string
  },
  analysis: {
    topic: string,
    readable: boolean,
    confidence: number,
    student_approach: string,
    errors: Array<{
      question: string,
      student_answer: string,
      error_type: string,
      description: string
    }>,
    patterns: Array<string>,
    gap_nodes: Array<{
      code: string,
      title: string,
      description: string,
      severity: "high" | "medium" | "low",
      severity_numeric: number,
      severity_rationale: string,
      ghana_evidence: string,
      grade: string,
      subject: string,
      level: string,
      strand_name: string,
      strand_description: string,
      substrand_name: string,
      substrand_description: string,
      questions_required: number,
      confidence_threshold: string,
      population_status: string
    }>,
    focus_areas: Array<string>,
    reasoning: string
  },
  historical_usage: Array<{
    timestamp: string,
    model: string,
    prompt: string,
    cost: string,
    latency_ms: string,
    status: string
  }>,
  raw_response: string  // JSON string
}
```

**New API Endpoint Needed:**
```typescript
GET /demo/api/reports/{phone}/student/{id}  // JSON version
```

**UI Components:**
- Student profile card
- AI metadata panel (cost, tokens, latency)
- Error analysis cards
- Gap node details (with severity indicators)
- Historical usage table
- Raw JSON viewer (collapsible)

---

### 3. **Curriculum Explorer** (`/curriculum/page.tsx`)

**Old Route:** `GET /demo/curriculum`
**Data Required:**
```typescript
{
  success: boolean,
  total: number,
  by_grade: Record<string, Array<{
    code: string,
    title: string,
    grade: string,
    subject: string,
    description: string
  }>>,
  grades: string[]  // ["B1", "B2", ..., "B9"]
}
```

**Existing API Endpoint:**
```typescript
GET /demo/api/curriculum?grade={grade}  // Already exists!
```

**UI Components:**
- Grade selector (B1-B9)
- Node cards grid
- Search/filter by code or title
- Prerequisite graph visualization (optional)

---

## API Client Updates Needed

Add to `lib/api.ts`:

```typescript
/**
 * GET /demo/api/reports/{phone}
 * Get teacher dashboard data (JSON)
 */
export async function getTeacherReports(teacher_phone: string): Promise<ApiResponse<any>>

/**
 * GET /demo/api/reports/{phone}/student/{id}
 * Get student detailed report (JSON)
 */
export async function getStudentReport(teacher_phone: string, student_id: string): Promise<ApiResponse<any>>

/**
 * GET /demo/api/curriculum
 * Get curriculum nodes (optionally filtered by grade)
 */
export async function getCurriculumNodes(grade?: string): Promise<ApiResponse<any>>
```

---

## Implementation Priority

### Phase 1 (Current) ✅
- [x] Main demo page (`/`)
- [x] API client for message/upload/status/gaps/student
- [x] Component library (Button, Card, Badge, Input)
- [x] GapSense design system (colors, fonts)

### Phase 2 (Next Steps) ❌
1. **Add missing API endpoints to FastAPI backend:**
   - `GET /demo/api/reports/{phone}` (JSON version of teacher_reports_dashboard)
   - `GET /demo/api/reports/{phone}/student/{id}` (JSON version of student_detailed_report)

2. **Build Next.js pages:**
   - `/reports/[phone]/page.tsx` (Teacher Dashboard)
   - `/reports/[phone]/student/[id]/page.tsx` (Student Detailed Report)
   - `/curriculum/page.tsx` (Curriculum Explorer)

3. **Update API client:**
   - Add `getTeacherReports()`
   - Add `getStudentReport()`
   - Add `getCurriculumNodes()`

---

## Notes

- **HTML Routes:** The 3 HTML routes (`/reports/...`, `/curriculum`) need Next.js page equivalents
- **JSON API Endpoints:** We need to add 2 new JSON endpoints to FastAPI (reports endpoints)
- **Curriculum API:** Already exists! Just needs Next.js page to consume it
- **Styling:** All pages should use the GapSense design system (WhatsApp green + gold)
- **Navigation:** Add links between pages (e.g., demo → reports → student detail)
