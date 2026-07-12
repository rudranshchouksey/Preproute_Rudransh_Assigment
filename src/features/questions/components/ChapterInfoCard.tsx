import { Clock, Target, Hash } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

interface ChapterInfoCardProps {
  testName: string;
  numQuestions: number;
  subject?: string;
  topic?: string;
  subTopics?: string[];
  duration?: number;
  totalMarks?: number;
  difficulty?: string;
}

export const ChapterInfoCard: React.FC<ChapterInfoCardProps> = ({ 
  testName, 
  numQuestions, 
  subject,
  topic,
  subTopics,
  duration,
  totalMarks,
  difficulty = 'Medium'
}) => {
  const difficultyVariant = difficulty?.toLowerCase() === 'easy' ? 'success' 
    : difficulty?.toLowerCase() === 'difficult' ? 'danger' 
    : 'warning';

  return (
    <Card className="mb-6 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{testName}</h1>
              <Badge variant={difficultyVariant}>
                {difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'Medium'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {subject || 'Subject'} {topic ? `• ${topic}` : ''}
            </p>
          </div>
        </div>

        {subTopics && subTopics.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {subTopics.map((st, idx) => (
              <Badge key={idx} variant="outline">{st}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
          <div className="flex items-center space-x-1.5">
            <Clock size={16} className="text-gray-400" />
            <span className="font-medium">{duration || '—'} Mins</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Target size={16} className="text-gray-400" />
            <span className="font-medium">{totalMarks || '—'} Marks</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Hash size={16} className="text-gray-400" />
            <span className="font-medium">{numQuestions} Questions</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
