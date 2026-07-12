import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import { TestTable, type TestData } from './TestTable';
import api from '../../services/api';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { DashboardSkeleton } from './DashboardSkeleton';
import toast from 'react-hot-toast';

type SortField = 'name' | 'subject' | 'status' | 'creationDate';
type SortDirection = 'asc' | 'desc';

export const Dashboard = () => {
  const [tests, setTests] = useState<TestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('creationDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const [page, setPage] = useState(1);
  const limit = 10;

  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/tests', {
        params: { page, limit, search: debouncedSearch }
      });
      
      const data = response.data.data || response.data || [];
      setTests(data);
    } catch (err: any) {
      console.error('Failed to fetch tests', err);
      setError('Failed to load tests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      await api.delete(`/tests/${id}`);
      setTests(tests.filter(t => t.id !== id && (t as any)._id !== id));
      toast.success('Test deleted successfully.');
    } catch (error) {
      console.error('Failed to delete test', error);
      toast.error('Failed to delete test.');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const testToDuplicate = tests.find(t => (t.id === id || (t as any)._id === id));
      if (!testToDuplicate) return;

      const payload = {
        name: `${testToDuplicate.name} (Copy)`,
        subject: testToDuplicate.subject,
        status: 'draft',
        type: 'mock',
      };

      const res = await api.post('/tests', payload);
      const newTest = res.data.data || res.data;
      
      if (newTest) {
        setTests([{ 
          id: newTest.id || newTest._id,
          name: payload.name,
          subject: testToDuplicate.subject,
          status: 'draft',
          creationDate: new Date().toISOString(),
          questionCount: 0,
          updatedDate: new Date().toISOString(),
        }, ...tests]);
        toast.success('Test duplicated successfully!');
      }
    } catch (error) {
      console.error('Failed to duplicate test', error);
      toast.error('Failed to duplicate test.');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Client-side pagination, filtering, and sorting
  const { paginatedTests, totalPages, totalFiltered } = useMemo(() => {
    let filtered = tests;
    
    // Search filter
    if (debouncedSearch) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        t.subject?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => (t.status || 'draft').toLowerCase() === statusFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'subject':
          comparison = (a.subject || '').localeCompare(b.subject || '');
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'creationDate':
          comparison = new Date(a.creationDate || 0).getTime() - new Date(b.creationDate || 0).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    const totalPagesCalc = Math.max(1, Math.ceil(filtered.length / limit));
    
    let paginated = filtered;
    if (filtered.length > limit) {
      const start = (page - 1) * limit;
      paginated = filtered.slice(start, start + limit);
    }

    return { paginatedTests: paginated, totalPages: totalPagesCalc, totalFiltered: filtered.length };
  }, [tests, debouncedSearch, statusFilter, sortField, sortDirection, page, limit]);

  if (isLoading && tests.length === 0) {
    return <DashboardSkeleton />;
  }

  const breadcrumbs = [
    { label: 'Dashboard' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader 
        breadcrumbs={breadcrumbs}
        title="Dashboard"
        description="Manage and track all your tests"
        action={
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors shadow-sm"
              />
            </div>
            <Button onClick={() => navigate('/test/create')}>
              <Plus size={18} className="mr-2" />
              Create New Test
            </Button>
          </div>
        }
      />

      {/* Filters Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter size={14} />
          <span className="font-medium">Filter:</span>
        </div>
        {['all', 'draft', 'live', 'archived'].map((status) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              statusFilter === status 
                ? 'bg-brand text-white border-brand' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand/40 hover:text-brand'
            }`}
          >
            {status === 'all' ? 'All Tests' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
        {totalFiltered !== tests.length && (
          <span className="text-xs text-gray-400 ml-2">{totalFiltered} of {tests.length} tests</span>
        )}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl flex flex-col items-center justify-center space-y-4">
          <AlertCircle size={32} className="text-red-500" />
          <p className="font-medium">{error}</p>
          <Button variant="outline" onClick={fetchTests} className="bg-white hover:bg-gray-50">
            <RefreshCw size={16} className="mr-2" /> Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <TestTable 
            tests={paginatedTests} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-gray-500 font-medium">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
