import { Link } from 'react-router-dom';
import { Edit3, Eye, Trash2 } from 'lucide-react';
export interface TestData {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'live' | 'archived';
  creationDate: string;
}

interface TestTableProps {
  tests: TestData[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
}

export const TestTable = ({ tests, isLoading, onDelete }: TestTableProps) => {
  if (isLoading) {
    return (
      <div className="card w-full p-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="card w-full p-12 text-center text-gray-500">
        No tests found. Click the button above to create one.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden !p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-semibold text-secondary">Test Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-secondary">Subject</th>
              <th className="px-6 py-4 text-sm font-semibold text-secondary">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-secondary">Creation Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-secondary text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tests.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-secondary">{test.name}</td>
                <td className="px-6 py-4 text-gray-600">{test.subject}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    (test.status || 'draft') === 'live' ? 'bg-green-100 text-green-800' : 
                    (test.status || 'draft') === 'draft' ? 'bg-amber-100 text-amber-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {(test.status || 'draft').charAt(0).toUpperCase() + (test.status || 'draft').slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">{new Date(test.creationDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <Link to={`/test/${test.id || (test as any)._id}/publish`} className="p-1.5 text-gray-400 hover:text-brand bg-gray-50 hover:bg-brand/10 rounded-md transition-colors" title="View">
                      <Eye size={16} />
                    </Link>
                    <Link to={`/test/edit/${test.id || (test as any)._id}`} className="p-1.5 text-gray-400 hover:text-amber-500 bg-gray-50 hover:bg-amber-50 rounded-md transition-colors" title="Edit">
                      <Edit3 size={16} />
                    </Link>
                    <button 
                      onClick={() => onDelete?.(test.id || (test as any)._id)} 
                      className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-md transition-colors" 
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
