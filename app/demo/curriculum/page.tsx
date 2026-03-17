'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle, CardBody, Badge, Button, Input } from '@/components/ui';
import { getCurriculumNodes } from '@/lib/api';

interface CurriculumNode {
  code: string;
  title: string;
  grade: string;
  subject: string;
  description: string;
}

interface CurriculumData {
  success: boolean;
  total: number;
  by_grade: Record<string, CurriculumNode[]>;
  grades: string[];
}

export default function CurriculumExplorer() {
  const router = useRouter();
  const [data, setData] = useState<CurriculumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const result = await getCurriculumNodes(selectedGrade || undefined);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load curriculum data');
      }
      setLoading(false);
    }
    fetchData();
  }, [selectedGrade]);

  const filteredNodes = (): CurriculumNode[] => {
    if (!data) return [];

    let allNodes: CurriculumNode[] = [];
    Object.values(data.by_grade).forEach((nodes) => {
      allNodes = allNodes.concat(nodes);
    });

    if (!searchQuery) return allNodes;

    const query = searchQuery.toLowerCase();
    return allNodes.filter(
      (node) =>
        node.code.toLowerCase().includes(query) ||
        node.title.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading curriculum...</p>
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

  const nodes = filteredNodes();

  return (
    <div className="min-h-screen p-3 sm:p-5">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-whatsapp-500 mb-2">
              Ghana Curriculum Explorer
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Browse {data.total} learning objectives from the NaCCA curriculum
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/demo')}>
            ← Back
          </Button>
        </div>

        {/* Controls */}
        <div className="mb-8">
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Grade Selector */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Filter by Grade
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedGrade === null ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedGrade(null)}
                    >
                      All Grades
                    </Button>
                    {data.grades.sort().map((grade) => (
                      <Button
                        key={grade}
                        variant={selectedGrade === grade ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedGrade(grade)}
                      >
                        {grade}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Search by Code or Title
                  </label>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., B1.1.1.1 or Place Value"
                    rounded
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-8">
          <Card>
            <CardBody>
              <div className="text-2xl sm:text-3xl font-bold text-whatsapp-500 mb-1">
                {data.total}
              </div>
              <div className="text-xs sm:text-sm text-slate-600">Total Learning Objectives</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-2xl sm:text-3xl font-bold text-gold-500 mb-1">
                {data.grades.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600">Grade Levels (B1-B9)</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-2xl sm:text-3xl font-bold text-slate-700 mb-1">
                {nodes.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600">
                {searchQuery || selectedGrade ? 'Filtered Results' : 'Currently Showing'}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Node Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-700">
              {selectedGrade ? `Grade ${selectedGrade}` : 'All'} Learning Objectives
              <span className="text-slate-500 text-sm sm:text-base lg:text-lg ml-2">({nodes.length})</span>
            </h2>
          </div>

          {nodes.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-center text-slate-500 py-8">
                  No curriculum nodes found matching your search.
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {nodes.map((node) => (
                <Card key={node.code} hover>
                  <CardBody>
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="whatsapp" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                        {node.code}
                      </Badge>
                      <Badge className="bg-slate-100 text-slate-600 text-[10px] sm:text-xs px-2 py-1">
                        Grade {node.grade}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-slate-700 mb-2">
                      {node.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 mb-3">
                      {node.description}
                    </p>

                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-[10px] sm:text-xs text-slate-500">
                        Subject: <span className="font-semibold text-slate-700">{node.subject}</span>
                      </p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-12 p-6 bg-whatsapp-50 rounded-xl border border-whatsapp-100">
          <p className="text-sm text-slate-700 mb-2">
            <span className="font-semibold">About this curriculum:</span> This data represents Ghana's
            National Council for Curriculum and Assessment (NaCCA) curriculum framework for basic education.
            Each learning objective has been mapped with prerequisite relationships to enable adaptive
            diagnostic assessments.
          </p>
          <p className="text-xs text-slate-500">
            🇬🇭 Aligned with Ghana Education Service • NaCCA Standards • Basic 1-9
          </p>
        </div>
      </div>
    </div>
  );
}
