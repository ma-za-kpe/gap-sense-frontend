'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardTitle, CardBody, Badge, Button } from '@/components/ui';
import { getStudentReport } from '@/lib/api';

interface GapNode {
  code: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  severity_numeric: number;
  severity_rationale: string;
  ghana_evidence: string;
  grade: string;
  subject: string;
  level: string;
  strand_name: string;
  strand_description: string;
  substrand_name: string;
  substrand_description: string;
  questions_required: number;
  confidence_threshold: string;
  population_status: string;
}

interface ErrorItem {
  question: string;
  student_answer: string;
  error_type: string;
  description: string;
}

interface StudentReportData {
  timestamp: string;
  report_id: string;
  student: {
    id: string;
    name: string;
    age: number | null;
    gender: string | null;
    grade: string;
    school: string;
    school_type: string;
    home_language: string | null;
    school_language: string;
    diagnosis_count: number;
  };
  ai_metadata: {
    analysis_id: string;
    timestamp: string;
    provider: string;
    model: string;
    prompt: string;
    input_tokens: string;
    output_tokens: string;
    total_tokens: string;
    latency_ms: string;
    latency_seconds: string;
    input_cost: string;
    output_cost: string;
    total_cost: string;
    success: string;
  };
  analysis: {
    topic: string;
    readable: boolean;
    confidence: number;
    student_approach: string;
    errors: ErrorItem[] | string[];
    patterns: string[];
    gap_nodes: GapNode[];
    focus_areas: string[];
    reasoning: string;
  };
  historical_usage: Array<{
    timestamp: string;
    model: string;
    prompt: string;
    cost: string;
    latency_ms: string;
    status: string;
  }>;
  raw_response: string;
}

export default function StudentDetailReport() {
  const params = useParams();
  const router = useRouter();
  const teacherPhone = decodeURIComponent(params.phone as string);
  const studentId = params.id as string;

  const [data, setData] = useState<StudentReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawJSON, setShowRawJSON] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const result = await getStudentReport(teacherPhone, studentId);
      if (result.success && result.data?.report) {
        setData(result.data.report);
      } else {
        setError(result.error || 'Failed to load student report');
      }
      setLoading(false);
    }
    fetchData();
  }, [teacherPhone, studentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading student report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody>
            <p className="text-red-500">❌ {error || 'No data available'}</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => router.push(`/reports/${encodeURIComponent(teacherPhone)}`)}
            >
              Back to Dashboard
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-gold-100 text-gold-600 border-gold-300';
      case 'low':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-300';
    }
  };

  return (
    <div className="min-h-screen p-5">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-whatsapp-500 mb-2">
              {data.student.name}
            </h1>
            <p className="text-slate-600">
              Detailed Analysis Report • {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/reports/${encodeURIComponent(teacherPhone)}`)}
          >
            ← Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {/* Student Profile */}
          <Card className="lg:col-span-1">
            <CardTitle>Student Profile</CardTitle>
            <CardBody>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="font-semibold text-slate-700">{data.student.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Grade</p>
                  <p className="font-semibold text-slate-700">{data.student.grade}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">School</p>
                  <p className="font-semibold text-slate-700">{data.student.school}</p>
                  <p className="text-xs text-slate-500">{data.student.school_type}</p>
                </div>
                {data.student.age && (
                  <div>
                    <p className="text-xs text-slate-500">Age</p>
                    <p className="font-semibold text-slate-700">{data.student.age} years</p>
                  </div>
                )}
                {data.student.gender && (
                  <div>
                    <p className="text-xs text-slate-500">Gender</p>
                    <p className="font-semibold text-slate-700">{data.student.gender}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500">Language</p>
                  <p className="font-semibold text-slate-700">{data.student.school_language}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Diagnoses</p>
                  <p className="font-semibold text-slate-700">{data.student.diagnosis_count}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* AI Metadata */}
          <Card className="lg:col-span-2">
            <CardTitle>AI Analysis Metadata</CardTitle>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Provider</p>
                  <p className="font-semibold text-slate-700">{data.ai_metadata.provider}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Model</p>
                  <p className="font-semibold text-slate-700">{data.ai_metadata.model}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <Badge variant={data.ai_metadata.success === 'True' ? 'whatsapp' : 'gold'}>
                    {data.ai_metadata.success === 'True' ? '✓ Success' : '✗ Failed'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Latency</p>
                  <p className="font-semibold text-slate-700">{data.ai_metadata.latency_seconds}s</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Tokens</p>
                  <p className="font-semibold text-slate-700">{data.ai_metadata.total_tokens}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Cost</p>
                  <p className="font-semibold text-gold-600">${data.ai_metadata.total_cost}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Input Tokens</p>
                  <p className="text-sm text-slate-700">{data.ai_metadata.input_tokens}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Output Tokens</p>
                  <p className="text-sm text-slate-700">{data.ai_metadata.output_tokens}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Analysis ID</p>
                  <p className="text-xs text-slate-700 truncate">{data.ai_metadata.analysis_id}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Error Analysis */}
        {data.analysis.errors.length > 0 && (
          <Card className="mb-8" hover>
            <CardTitle>Error Analysis ({data.analysis.errors.length})</CardTitle>
            <CardBody>
              <div className="space-y-4">
                {data.analysis.errors.map((error, idx) => (
                  <div key={idx} className="border-l-4 border-red-500 pl-4 py-2">
                    {typeof error === 'string' ? (
                      <p className="text-slate-700">{error}</p>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-700 mb-1">
                          {error.error_type}
                        </p>
                        <p className="text-sm text-slate-600">{error.description}</p>
                        {error.question && (
                          <p className="text-xs text-slate-500 mt-1">
                            Question: {error.question}
                          </p>
                        )}
                        {error.student_answer && (
                          <p className="text-xs text-slate-500">
                            Student Answer: {error.student_answer}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Gap Nodes */}
        {data.analysis.gap_nodes.length > 0 && (
          <Card className="mb-8" hover>
            <CardTitle>Learning Gaps Identified ({data.analysis.gap_nodes.length})</CardTitle>
            <CardBody>
              <div className="space-y-6">
                {data.analysis.gap_nodes.map((gap, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-lg text-slate-700 mb-1">
                          {gap.code} - {gap.title}
                        </p>
                        <p className="text-sm text-slate-600">{gap.description}</p>
                      </div>
                      <Badge className={`${getSeverityColor(gap.severity)} border px-3 py-1`}>
                        {gap.severity.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-xs text-slate-500">Grade</p>
                        <p className="font-semibold text-slate-700">{gap.grade}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Subject</p>
                        <p className="font-semibold text-slate-700">{gap.subject}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Level</p>
                        <p className="font-semibold text-slate-700">{gap.level}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Questions Required</p>
                        <p className="font-semibold text-slate-700">{gap.questions_required}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-slate-600 mb-1">
                        Curriculum Context
                      </p>
                      <p className="text-sm text-slate-700 mb-2">
                        <span className="font-semibold">Strand:</span> {gap.strand_name}
                      </p>
                      {gap.strand_description && (
                        <p className="text-xs text-slate-600 mb-2">{gap.strand_description}</p>
                      )}
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">Sub-strand:</span> {gap.substrand_name}
                      </p>
                    </div>

                    <div className="bg-gold-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-600 mb-1">
                        Ghana Evidence
                      </p>
                      <p className="text-sm text-slate-700">{gap.ghana_evidence}</p>
                    </div>

                    {gap.severity_rationale && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-slate-600 mb-1">
                          Severity Rationale
                        </p>
                        <p className="text-sm text-slate-700">{gap.severity_rationale}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Patterns & Focus Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {data.analysis.patterns.length > 0 && (
            <Card hover>
              <CardTitle>Patterns Observed</CardTitle>
              <CardBody>
                <div className="space-y-2">
                  {data.analysis.patterns.map((pattern, idx) => (
                    <p key={idx} className="text-sm text-slate-700">• {pattern}</p>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {data.analysis.focus_areas.length > 0 && (
            <Card hover>
              <CardTitle>Recommended Focus Areas</CardTitle>
              <CardBody>
                <div className="space-y-2">
                  {data.analysis.focus_areas.map((area, idx) => (
                    <p key={idx} className="text-sm text-slate-700">• {area}</p>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* AI Reasoning */}
        {data.analysis.reasoning && (
          <Card className="mb-8" hover>
            <CardTitle>AI Reasoning</CardTitle>
            <CardBody>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {data.analysis.reasoning}
              </p>
            </CardBody>
          </Card>
        )}

        {/* Historical Usage */}
        {data.historical_usage.length > 0 && (
          <Card className="mb-8" hover>
            <CardTitle>Historical AI Usage ({data.historical_usage.length})</CardTitle>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="text-left py-2 px-3 text-slate-600">Timestamp</th>
                      <th className="text-left py-2 px-3 text-slate-600">Model</th>
                      <th className="text-left py-2 px-3 text-slate-600">Latency</th>
                      <th className="text-left py-2 px-3 text-slate-600">Cost</th>
                      <th className="text-left py-2 px-3 text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.historical_usage.map((log, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-2 px-3">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-2 px-3">{log.model}</td>
                        <td className="py-2 px-3">{log.latency_ms}ms</td>
                        <td className="py-2 px-3 text-gold-600">${log.cost}</td>
                        <td className="py-2 px-3">{log.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Raw JSON Viewer */}
        <Card>
          <div className="flex items-center justify-between p-5 border-b border-slate-200">
            <CardTitle className="mb-0">Raw JSON Response</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRawJSON(!showRawJSON)}
            >
              {showRawJSON ? 'Hide' : 'Show'}
            </Button>
          </div>
          {showRawJSON && (
            <CardBody>
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                {data.raw_response}
              </pre>
            </CardBody>
          )}
        </Card>
      </div>
    </div>
  );
}
