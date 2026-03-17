'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardTitle, CardBody, Badge, Button } from '@/components/ui';
import { getTeacherReports } from '@/lib/api';

interface GapNode {
  code: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
}

interface Student {
  id: string;
  first_name: string;
  grade: string;
  scan_count: number;
  last_diagnosed: string | null;
  gaps: GapNode[];
  errors: string[];
  patterns: string[];
  focus_areas: string[];
}

interface LatestAnalysis {
  student_name: string;
  created_at: string;
  errors: string[];
  patterns: string[];
  focus_areas: string[];
  gaps: GapNode[];
}

interface TeacherReportsData {
  teacher: {
    name: string;
    phone: string;
  };
  stats: {
    total_students: number;
    scanned_today: number;
    total_gaps: number;
    high_priority: number;
  };
  latest_analysis: LatestAnalysis | null;
  students: Student[];
}

export default function TeacherDashboard() {
  const params = useParams();
  const router = useRouter();
  const teacherPhone = decodeURIComponent(params.phone as string);

  const [data, setData] = useState<TeacherReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const result = await getTeacherReports(teacherPhone);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load teacher reports');
      }
      setLoading(false);
    }
    fetchData();
  }, [teacherPhone]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
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
            <Button variant="primary" className="mt-4" onClick={() => router.push('/demo')}>
              Back to Demo
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
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-whatsapp-500 mb-2">
              Teacher Dashboard
            </h1>
            <p className="text-slate-600">
              {data.teacher.name} • {data.teacher.phone}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/demo')}>
            ← Back to Demo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <Card>
            <CardBody>
              <div className="text-3xl font-bold text-whatsapp-500 mb-1">
                {data.stats.total_students}
              </div>
              <div className="text-sm text-slate-600">Total Students</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-3xl font-bold text-gold-500 mb-1">
                {data.stats.scanned_today}
              </div>
              <div className="text-sm text-slate-600">Scanned Today</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-3xl font-bold text-slate-700 mb-1">
                {data.stats.total_gaps}
              </div>
              <div className="text-sm text-slate-600">Total Gaps</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-3xl font-bold text-red-500 mb-1">
                {data.stats.high_priority}
              </div>
              <div className="text-sm text-slate-600">High Priority</div>
            </CardBody>
          </Card>
        </div>

        {/* Latest Analysis */}
        {data.latest_analysis && (
          <Card className="mb-8" hover>
            <CardTitle>Latest Analysis</CardTitle>
            <CardBody>
              <div className="mb-4">
                <p className="font-semibold text-lg text-slate-700">
                  {data.latest_analysis.student_name}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(data.latest_analysis.created_at).toLocaleString()}
                </p>
              </div>

              {data.latest_analysis.errors.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-sm text-slate-600 mb-2">Errors Detected:</p>
                  <div className="space-y-1">
                    {data.latest_analysis.errors.map((error, idx) => (
                      <p key={idx} className="text-sm text-slate-700">• {error}</p>
                    ))}
                  </div>
                </div>
              )}

              {data.latest_analysis.gaps.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-sm text-slate-600 mb-2">Gaps Identified:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.latest_analysis.gaps.map((gap, idx) => (
                      <Badge
                        key={idx}
                        className={`${getSeverityColor(gap.severity)} border px-3 py-1`}
                      >
                        {gap.code} - {gap.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {data.latest_analysis.focus_areas.length > 0 && (
                <div>
                  <p className="font-semibold text-sm text-slate-600 mb-2">Focus Areas:</p>
                  <div className="space-y-1">
                    {data.latest_analysis.focus_areas.map((area, idx) => (
                      <p key={idx} className="text-sm text-slate-700">• {area}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Students Grid */}
        <Card>
          <CardTitle>Student Reports ({data.students.length})</CardTitle>
          <CardBody>
            <div className="space-y-4">
              {data.students.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  No students have been diagnosed yet.
                </p>
              ) : (
                data.students.map((student) => (
                  <div
                    key={student.id}
                    className="border border-slate-200 rounded-lg p-4 hover:border-whatsapp-500 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/reports/${encodeURIComponent(teacherPhone)}/student/${student.id}`)
                    }
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-lg text-slate-700">
                          {student.first_name}
                        </p>
                        <p className="text-sm text-slate-500">
                          Grade {student.grade} • {student.scan_count} scan(s)
                          {student.last_diagnosed && ` • Last: ${new Date(student.last_diagnosed).toLocaleDateString()}`}
                        </p>
                      </div>
                      <Badge variant="whatsapp" className="text-sm px-3 py-1">
                        {student.gaps.length} gaps
                      </Badge>
                    </div>

                    {student.gaps.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-slate-600 mb-2">
                          Learning Gaps:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {student.gaps.slice(0, 5).map((gap, idx) => (
                            <Badge
                              key={idx}
                              className={`${getSeverityColor(gap.severity)} border text-xs px-2 py-1`}
                            >
                              {gap.code}
                            </Badge>
                          ))}
                          {student.gaps.length > 5 && (
                            <Badge className="bg-slate-100 text-slate-600 border border-slate-300 text-xs px-2 py-1">
                              +{student.gaps.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {student.errors.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">
                          Recent Errors:
                        </p>
                        <p className="text-xs text-slate-600">
                          • {student.errors[0]}
                          {student.errors.length > 1 && ` (+${student.errors.length - 1} more)`}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
