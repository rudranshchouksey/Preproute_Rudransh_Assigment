import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { TestTable, type TestData } from './TestTable';
import api from '../../services/api';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { DashboardSkeleton } from './DashboardSkeleton';

export const Dashboard = () => {
  const [tests, setTests] = useState<TestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
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
      
      // Attempt fetching with pagination params. 
      // If backend ignores them, it returns all data and we paginate client-side.
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
    } catch (error) {
      console.error('Failed to delete test', error);
      alert('Failed to delete test');
    }
  };

  // Client-side pagination and filtering (handles cases where backend returns all items)
  const { paginatedTests, totalPages } = useMemo(() => {
    let filtered = tests;
    
    // If backend didn't filter, we filter client-side
    if (debouncedSearch) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        t.subject?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    const totalPagesCalc = Math.max(1, Math.ceil(filtered.length / limit));
    
    // If backend didn't paginate, we paginate client-side
    // We can detect this if tests.length > limit
    let paginated = filtered;
    if (filtered.length > limit) {
      const start = (page - 1) * limit;
      paginated = filtered.slice(start, start + limit);
    }

    return { paginatedTests: paginated, totalPages: totalPagesCalc };
  }, [tests, debouncedSearch, page, limit]);

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
          <TestTable tests={paginatedTests} isLoading={isLoading} onDelete={handleDelete} />
          
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
