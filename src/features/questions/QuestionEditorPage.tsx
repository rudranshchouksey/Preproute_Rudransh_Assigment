import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { QuestionForm } from './QuestionForm';
import { QuestionSidebar } from './components/QuestionSidebar';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { QuestionDraft, BulkQuestionPayload } from './types';
import { mapApiToDraft, mapDraftToApi } from './utils';

export const QuestionEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [testName, setTestName] = useState<string>('Loading...');
  const [testSubjectId, setTestSubjectId] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<number>(10);
  
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchTestMetaAndQuestions = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const res = await api.get(`/tests/${id}`);
      const data = res.data.data || res.data;
      setTestName(data.name || `Test ${id}`);
      if (data.subject) setTestSubjectId(data.subject);
      
      const total = data.numQuestions || 10;
      setNumQuestions(total);
      
      if (data.questionIds && data.questionIds.length > 0) {
        try {
          const qRes = await api.post('/questions/fetchBulk', { question_ids: data.questionIds });
          const fetchedQuestions = Array.isArray(qRes.data) ? qRes.data : qRes.data.data || [];
          
          const mappedQuestions = fetchedQuestions.map((q: any) => mapApiToDraft(q));
          const filledQuestions = [...mappedQuestions];
          // Pad with nulls up to total
          while (filledQuestions.length < total) {
            filledQuestions.push(null);
          }
          setQuestions(filledQuestions);
        } catch (qErr) {
          console.error("Failed to fetch questions", qErr);
          setQuestions(Array(total).fill(null));
        }
      } else {
        setQuestions(Array(total).fill(null));
      }
    } catch (err) {
      console.error("Failed to fetch test metadata", err);
      setFetchError("Failed to load test configuration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTestMetaAndQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const payload: any = {
        testId: id!,
        questions: questions.map(q => mapDraftToApi(q, { subject: testSubjectId }))
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

  if (fetchError) {
    return (
      <div className="flex flex-col h-full font-sans">
        <PageHeader 
          breadcrumbs={[{ label: 'Test Creation', href: '/' }, { label: 'Edit Test' }]}
          title="Edit Questions"
        />
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto mt-12">
          <AlertCircle size={40} className="text-red-500" />
          <p className="font-medium text-lg">{fetchError}</p>
          <Button onClick={fetchTestMetaAndQuestions}>
            <RefreshCw size={16} className="mr-2" /> Retry Fetching
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full font-sans">
        <div className="shrink-0 mb-6">
          <PageHeader 
            breadcrumbs={[{ label: 'Test Creation', href: '/' }, { label: 'Edit Test' }]}
            title="Edit Questions: Loading..."
            action={<Skeleton className="h-10 w-32 rounded-lg" />}
          />
        </div>
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row gap-6 pb-6 min-h-[600px]">
          <div className="w-full md:w-72 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full flex flex-col">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="space-y-3">
                {Array(10).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <Skeleton className="h-8 w-1/3 mb-6" />
            <Skeleton className="h-32 w-full mb-6" />
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans">
      <div className="shrink-0 mb-6">
        <PageHeader 
          breadcrumbs={[
            { label: 'Test Creation', href: '/' },
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
