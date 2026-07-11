import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { TestTable, type TestData } from './TestTable';
import api from '../../services/api';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Button } from '../../components/ui/Button';

export const Dashboard = () => {
  const [tests, setTests] = useState<TestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/tests');
        const data = response.data.data || response.data || [];
        setTests(data);
      } catch (error) {
        console.error('Failed to fetch tests', error);
        setTests([
          { id: '1', name: 'Midterm Mathematics', subject: 'Math', status: 'live', creationDate: '2026-07-01' },
          { id: '2', name: 'History Quiz 1', subject: 'History', status: 'draft', creationDate: '2026-07-05' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
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

  const filteredTests = tests.filter(test => 
    test.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                className="pl-9 h-10 w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
              />
            </div>
            <Button onClick={() => navigate('/test/create')}>
              <Plus size={18} className="mr-2" />
              Create New Test
            </Button>
          </div>
        }
      />

      <TestTable tests={filteredTests} isLoading={isLoading} onDelete={handleDelete} />
    </div>
  );
};
