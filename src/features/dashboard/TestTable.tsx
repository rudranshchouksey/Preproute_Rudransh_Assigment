import React from 'react';

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
}

export const TestTable: React.FC<TestTableProps> = ({ tests, isLoading }) => {
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
                    test.status === 'live' ? 'bg-green-100 text-green-800' : 
                    test.status === 'draft' ? 'bg-amber-100 text-amber-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">{new Date(test.creationDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-brand hover:text-brand-dark font-medium text-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
