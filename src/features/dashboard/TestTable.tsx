import { Link } from 'react-router-dom';
import { Edit3, Eye, Trash2, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

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
      <Card className="w-full p-24 flex justify-center items-center">
        <Loader2 className="animate-spin text-brand h-8 w-8" />
      </Card>
    );
  }

  if (tests.length === 0) {
    return (
      <Card className="w-full p-24 text-center">
        <p className="text-gray-500 font-medium">No tests found. Click the button above to create one.</p>
      </Card>
    );
  }

  return (
    <Card className="!p-0 border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Test Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Subject</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Creation Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tests.map((test) => {
              const status = (test.status || 'draft').toLowerCase();
              return (
                <tr key={test.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{test.name}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{test.subject}</td>
                  <td className="px-6 py-4">
                    <Badge variant={status === 'live' ? 'success' : status === 'draft' ? 'warning' : 'default'}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm font-medium">{new Date(test.creationDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-1">
                      <Link to={`/test/${test.id || (test as any)._id}/publish`}>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-brand" title="View">
                          <Eye size={18} />
                        </Button>
                      </Link>
                      <Link to={`/test/edit/${test.id || (test as any)._id}`}>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-amber-500" title="Edit">
                          <Edit3 size={18} />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onDelete?.(test.id || (test as any)._id)} 
                        className="text-gray-500 hover:text-red-500" 
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
