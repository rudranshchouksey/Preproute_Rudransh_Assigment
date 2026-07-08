import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { TestTable, type TestData } from './TestTable';
import api from '../../services/api';

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
        // Handle both possible structures: { data: [] } or just []
        const data = response.data.data || response.data || [];
        setTests(data);
      } catch (error) {
        console.error('Failed to fetch tests', error);
        // Fallback for development if API is unseeded/unavailable
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage and track all your tests</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 input-field w-64"
            />
          </div>
          <button 
            onClick={() => navigate('/test/create')}
            className="btn-primary flex items-center space-x-2 whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Create New Test</span>
          </button>
        </div>
      </div>

      <TestTable tests={filteredTests} isLoading={isLoading} onDelete={handleDelete} />
    </div>
  );
};
