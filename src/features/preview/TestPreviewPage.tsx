import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Button } from '../../components/ui/Button';
import type { QuestionDraft } from '../questions/types';
import type { TestConfig } from '../../types/api';

export const TestPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [testData, setTestData] = useState<TestConfig | null>(null);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        setIsLoading(true);
        const testRes = await api.get(`/tests/${id}`);
        const data = testRes.data.data || testRes.data;
        setTestData(data);

        if (data.questionIds && data.questionIds.length > 0) {
          const qRes = await api.post('/questions/fetchBulk', { question_ids: data.questionIds }).catch(() => ({ data: [] }));
          setQuestions(Array.isArray(qRes.data) ? qRes.data : qRes.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load preview data", err);
        setError("Failed to load test preview.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPreviewData();
  }, [id]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 mt-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl flex flex-col items-center justify-center space-y-4">
          <AlertCircle size={40} className="text-red-500" />
          <p className="font-medium text-lg">{error}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full min-h-[400px]"><Loader2 className="animate-spin h-8 w-8 text-brand" /></div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 mt-6 px-4">
      <PageHeader 
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Test Creation', href: `/test/edit/${id}` },
          { label: 'Preview' }
        ]}
        title={`Preview: ${testData?.name || 'Untitled Test'}`}
        action={
          <Button onClick={() => navigate(`/test/${id}/publish`)}>
            Proceed to Publish
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Info */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div><span className="font-semibold text-gray-900">Subject:</span> {(testData as any)?.subject || testData?.subjectId || 'N/A'}</div>
            <div><span className="font-semibold text-gray-900">Duration:</span> {testData?.duration || 0} Min</div>
            <div><span className="font-semibold text-gray-900">Total Marks:</span> {testData?.totalMarks || 0}</div>
          </div>
          <div className="text-sm font-semibold text-brand bg-brand/10 px-3 py-1 rounded-full">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
        </div>

        {totalQuestions === 0 ? (
          <div className="p-12 text-center text-gray-500">No questions available in this test.</div>
        ) : (
          <div className="p-8">
            {/* Question Stem */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex gap-3">
                <span className="text-gray-400 font-normal">Q{currentQuestionIndex + 1}.</span>
                <div 
                  className="prose max-w-none text-gray-800"
                  dangerouslySetInnerHTML={{ __html: currentQuestion?.stem || '' }} 
                />
              </h3>
              {currentQuestion?.mediaUrl && (
                <div className="mt-4 mb-6">
                  <img src={currentQuestion.mediaUrl} alt="Question Media" className="max-h-[300px] object-contain rounded-lg border border-gray-200" />
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3 max-w-3xl">
              {currentQuestion?.options?.map((option) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === option.id;
                return (
                  <div 
                    key={option.id}
                    onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: option.id })}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected 
                        ? 'border-brand bg-brand/5' 
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-brand' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-3 h-3 bg-brand rounded-full" />}
                    </div>
                    <div className="text-gray-700 flex-1">{option.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        {totalQuestions > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between overflow-x-auto">
            <Button 
              variant="outline" 
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            >
              <ChevronLeft size={18} className="mr-1" /> Previous
            </Button>
            
            <div className="flex gap-2 mx-4">
              {Array.from({ length: totalQuestions }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors shrink-0 ${
                    currentQuestionIndex === idx 
                      ? 'bg-brand text-white' 
                      : selectedAnswers[idx] 
                        ? 'bg-brand/20 text-brand border border-brand/30' 
                        : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <Button 
              disabled={currentQuestionIndex === totalQuestions - 1}
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            >
              Next <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
