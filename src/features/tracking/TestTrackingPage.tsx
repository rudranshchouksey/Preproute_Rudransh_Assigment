import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Eye, Trash2, AlertCircle, RefreshCw, BarChart3, Filter } from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DashboardSkeleton } from '../dashboard/DashboardSkeleton';
import toast from 'react-hot-toast';

interface TrackingTest {
  id: string;
  name: string;
  subject: string;
  status: string;
  creationDate: string;
  updatedDate?: string;
  numQuestions?: number;
  totalMarks?: number;
  duration?: number;
}

export const TestTrackingPage = () => {
  const [tests, setTests] = useState<TrackingTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/tests');
      const data = response.data.data || response.data || [];
      setTests(data.map((t: any) => ({
        id: t.id || t._id,
        name: t.name,
        subject: t.subject || t.subjectId || 'N/A',
        status: (t.status || 'draft').toLowerCase(),
        creationDate: t.creationDate || t.createdAt || '',
        updatedDate: t.updatedDate || t.updatedAt || '',
        numQuestions: t.numQuestions || t.total_questions || 0,
        totalMarks: t.totalMarks || t.total_marks || 0,
        duration: t.duration || t.total_time || 0,
      })));
    } catch (err: any) {
      console.error('Failed to fetch tests for tracking', err);
      setError('Failed to load test tracking data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      await api.delete(`/tests/${id}`);
      setTests(tests.filter(t => t.id !== id));
      toast.success('Test deleted.');
    } catch (err) {
      toast.error('Failed to delete test.');
    }
  };

  const filteredTests = useMemo(() => {
    if (statusFilter === 'all') return tests;
    return tests.filter(t => t.status === statusFilter);
  }, [tests, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = tests.length;
    const published = tests.filter(t => t.status === 'live').length;
    const drafts = tests.filter(t => t.status === 'draft').length;
    const archived = tests.filter(t => t.status === 'archived').length;
    const totalQuestions = tests.reduce((sum, t) => sum + (t.numQuestions || 0), 0);
    return { total, published, drafts, archived, totalQuestions };
  }, [tests]);

  if (isLoading && tests.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader 
        breadcrumbs={[{ label: 'Test Tracking' }]}
        title="Test Tracking" 
        description="Track performance and analytics for all your tests."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Tests', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: 'Published', value: stats.published, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Drafts', value: stats.drafts, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Archived', value: stats.archived, color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'Total Questions', value: stats.totalQuestions, color: 'text-brand', bg: 'bg-brand/5' },
        ].map((stat) => (
          <Card key={stat.label} className={`p-4 ${stat.bg}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter size={14} />
          <span className="font-medium">Filter:</span>
        </div>
        {['all', 'live', 'draft', 'archived'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              statusFilter === status 
                ? 'bg-brand text-white border-brand' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand/40 hover:text-brand'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl flex flex-col items-center justify-center space-y-4">
          <AlertCircle size={32} className="text-red-500" />
          <p className="font-medium">{error}</p>
          <Button variant="outline" onClick={fetchTests}>
            <RefreshCw size={16} className="mr-2" /> Retry
          </Button>
        </div>
      ) : filteredTests.length === 0 ? (
        <Card className="p-12 text-center">
          <BarChart3 size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No tests found for the selected filter.</p>
        </Card>
      ) : (
        <Card className="!p-0 border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Test Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Subject</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Questions</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Marks</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Duration</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Created</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Updated</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{test.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{test.subject}</td>
                    <td className="px-6 py-4">
                      <Badge variant={test.status === 'live' ? 'success' : test.status === 'draft' ? 'warning' : 'default'}>
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm font-medium">{test.numQuestions || 0}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm font-medium">{test.totalMarks || 0}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm font-medium">{test.duration || 0} min</td>
                    <td className="px-6 py-4 text-gray-500 text-sm font-medium">
                      {test.creationDate ? new Date(test.creationDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm font-medium">
                      {test.updatedDate ? new Date(test.updatedDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <Link to={`/test/${test.id}/publish`}>
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-brand" title="View">
                            <Eye size={18} />
                          </Button>
                        </Link>
                        <Link to={`/test/edit/${test.id}`}>
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-amber-500" title="Edit">
                            <Edit3 size={18} />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(test.id)} 
                          className="text-gray-500 hover:text-red-500" 
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
