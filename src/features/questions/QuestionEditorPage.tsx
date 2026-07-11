import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { QuestionForm } from './QuestionForm';
import { QuestionSidebar } from './components/QuestionSidebar';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Button } from '../../components/ui/Button';
import type { QuestionDraft, BulkQuestionPayload } from './types';

export const QuestionEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [testName, setTestName] = useState<string>('Loading...');
  const [numQuestions, setNumQuestions] = useState<number>(10);
  
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTestMeta = async () => {
      try {
        const res = await api.get(`/tests/${id}`);
        const data = res.data.data || res.data;
        setTestName(data.name || `Test ${id}`);
        
        const total = data.numQuestions || 10;
        setNumQuestions(total);
        
        if (questions.length === 0) {
          setQuestions(Array(total).fill(null));
        }
      } catch (err) {
        console.error("Failed to fetch test metadata", err);
        setTestName(`Test ${id}`);
        if (questions.length === 0) {
          setQuestions(Array(10).fill(null));
        }
      }
    };
    if (id) fetchTestMeta();
  }, [id]);

  const handleSaveQuestion = (data: QuestionDraft) => {
    const updatedQuestions = [...questions];
    updatedQuestions[activeIndex] = data;
    setQuestions(updatedQuestions);
    
    if (activeIndex < numQuestions - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handleClearQuestion = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[activeIndex] = null as any;
    setQuestions(updatedQuestions);
  };

  const handleBulkSubmit = async () => {
    const isComplete = questions.every(q => q !== null);
    if (!isComplete) {
      setError("Please complete all questions before publishing.");
      const firstIncomplete = questions.findIndex(q => q === null);
      if (firstIncomplete !== -1) {
        setActiveIndex(firstIncomplete);
      }
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const payload: BulkQuestionPayload = {
        testId: id!,
        questions: questions
      };
      
      await api.post('/questions/bulk', payload);
      navigate(`/test/${id}/publish`);
      
    } catch (err: any) {
      console.error("Bulk submit failed", err);
      setError(err.response?.data?.message || "Failed to save questions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full font-sans">
      <div className="shrink-0 mb-6">
        <PageHeader 
          breadcrumbs={[
            { label: 'Test Creation', href: '/test/create' },
            { label: 'Edit Test', href: `/test/edit/${id}` },
            { label: 'Add Questions' }
          ]}
          title={`Edit Questions: ${testName}`}
          action={
            <Button onClick={handleBulkSubmit} isLoading={isSubmitting}>
              Publish Test
            </Button>
          }
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 mb-6 p-3 rounded-lg text-sm text-center border border-red-100 font-medium shrink-0">
          {error}
        </div>
      )}

      {/* 3-column Layout structure is created here with flex */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row gap-6 pb-6 min-h-[600px]">
        {/* Left Sidebar */}
        <div className="w-full md:w-72 shrink-0">
          <QuestionSidebar 
            questions={questions}
            activeIndex={activeIndex}
            numQuestions={numQuestions}
            onSelect={setActiveIndex}
          />
        </div>

        {/* Main Content Area (which itself contains the Form and Right Sidebar) */}
        <div className="flex-1 overflow-hidden min-w-0 bg-white rounded-xl shadow-sm border border-gray-100">
          <QuestionForm
            key={activeIndex}
            questionNumber={activeIndex + 1}
            initialData={questions[activeIndex] || null}
            onSave={handleSaveQuestion}
            onClear={handleClearQuestion}
            testName={testName}
            numQuestions={numQuestions}
          />
        </div>
      </div>
    </div>
  );
};
