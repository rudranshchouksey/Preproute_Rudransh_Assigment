import { Edit3, Clock, Target, Hash } from 'lucide-react';

interface ChapterInfoCardProps {
  testName: string;
  numQuestions: number;
}

export const ChapterInfoCard: React.FC<ChapterInfoCardProps> = ({ testName, numQuestions }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{testName}</h1>
            <span className="px-2.5 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">Medium</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Physics • Kinematics</p>
        </div>
        <button className="text-gray-400 hover:text-brand transition-colors p-2 rounded-full hover:bg-gray-50">
          <Edit3 size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium border border-gray-200">
          Motion in 1D
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium border border-gray-200">
          Relative Velocity
        </span>
      </div>

      <div className="flex items-center space-x-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
        <div className="flex items-center space-x-1.5">
          <Clock size={16} className="text-gray-400" />
          <span className="font-medium">120 Mins</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Target size={16} className="text-gray-400" />
          <span className="font-medium">100 Marks</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Hash size={16} className="text-gray-400" />
          <span className="font-medium">{numQuestions} Questions</span>
        </div>
      </div>
    </div>
  );
};
