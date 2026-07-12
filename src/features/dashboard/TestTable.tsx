import { Link } from 'react-router-dom';
import { Edit3, Eye, Trash2, Loader2, Copy, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export interface TestData {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'live' | 'archived';
  creationDate: string;
  questionCount?: number;
  updatedDate?: string;
}

type SortField = 'name' | 'subject' | 'status' | 'creationDate';
type SortDirection = 'asc' | 'desc';

interface TestTableProps {
  tests: TestData[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
}

const SortIcon = ({ field, currentField, direction }: { field: SortField; currentField?: SortField; direction?: SortDirection }) => {
  if (field !== currentField) return <ArrowUpDown size={12} className="ml-1 text-gray-300" />;
  return direction === 'asc' 
    ? <ArrowUp size={12} className="ml-1 text-brand" /> 
    : <ArrowDown size={12} className="ml-1 text-brand" />;
};

export const TestTable = ({ tests, isLoading, onDelete, onDuplicate, sortField, sortDirection, onSort }: TestTableProps) => {
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

  const headerClass = "px-6 py-4 text-sm font-semibold text-gray-700 cursor-pointer hover:text-gray-900 transition-colors select-none";

  return (
    <Card className="!p-0 border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className={headerClass} onClick={() => onSort?.('name')}>
                <span className="flex items-center">
                  Test Name <SortIcon field="name" currentField={sortField} direction={sortDirection} />
                </span>
              </th>
              <th className={headerClass} onClick={() => onSort?.('subject')}>
                <span className="flex items-center">
                  Subject <SortIcon field="subject" currentField={sortField} direction={sortDirection} />
                </span>
              </th>
              <th className={headerClass} onClick={() => onSort?.('status')}>
                <span className="flex items-center">
                  Status <SortIcon field="status" currentField={sortField} direction={sortDirection} />
                </span>
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Questions</th>
              <th className={headerClass} onClick={() => onSort?.('creationDate')}>
                <span className="flex items-center">
                  Created <SortIcon field="creationDate" currentField={sortField} direction={sortDirection} />
                </span>
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Updated</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tests.map((test) => {
              const status = (test.status || 'draft').toLowerCase();
              const testId = test.id || (test as any)._id;
              return (
                <tr key={testId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{test.name}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{test.subject}</td>
                  <td className="px-6 py-4">
                    <Badge variant={status === 'live' ? 'success' : status === 'draft' ? 'warning' : 'default'}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm font-medium">
                    {test.questionCount !== undefined ? test.questionCount : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm font-medium">
                    {test.creationDate ? new Date(test.creationDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm font-medium">
                    {test.updatedDate ? new Date(test.updatedDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-1">
                      <Link to={`/test/${testId}/preview`}>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-brand" title="Preview">
                          <Eye size={18} />
                        </Button>
                      </Link>
                      <Link to={`/test/edit/${testId}`}>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-amber-500" title="Edit">
                          <Edit3 size={18} />
                        </Button>
                      </Link>
                      <Link to={`/test/${testId}/publish`}>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-green-500" title="Publish">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onDuplicate?.(testId)} 
                        className="text-gray-500 hover:text-brand" 
                        title="Duplicate"
                      >
                        <Copy size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onDelete?.(testId)} 
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
