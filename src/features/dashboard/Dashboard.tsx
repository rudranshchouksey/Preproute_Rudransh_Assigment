import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { TestTable, type TestData } from './TestTable';
import api from '../../services/api';

export const Dashboard = () => {
  const [tests, setTests] = useState<TestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage and track all your tests</p>
        </div>
        
        <button 
          onClick={() => navigate('/test/create')}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Create New Test</span>
        </button>
      </div>

      <TestTable tests={tests} isLoading={isLoading} />
    </div>
  );
};
