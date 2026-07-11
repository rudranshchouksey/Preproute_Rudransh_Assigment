import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { QuestionForm } from './QuestionForm';
import { TopHeader } from './components/TopHeader';
import { QuestionSidebar } from './components/QuestionSidebar';
import type { QuestionDraft, BulkQuestionPayload } from './types';

export const QuestionEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [testName, setTestName] = useState<string>('Loading...');
  const [numQuestions, setNumQuestions] = useState<number>(10); // default
  
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Fetch test metadata to get numQuestions and testName
    const fetchTestMeta = async () => {
      try {
        const res = await api.get(`/tests/${id}`);
        const data = res.data.data || res.data;
        setTestName(data.name || `Test ${id}`);
        
        // Initialize empty array based on numQuestions
        const total = data.numQuestions || 10;
        setNumQuestions(total);
        
        if (questions.length === 0) {
          setQuestions(Array(total).fill(null));
        }
      } catch (err) {
        console.error("Failed to fetch test metadata", err);
        setTestName(`Test ${id}`);
        if (questions.length === 0) {
          setQuestions(Array(10).fill(null)); // fallback
        }
      }
    };
    if (id) fetchTestMeta();
  }, [id]);

  const handleSaveQuestion = (data: QuestionDraft) => {
    const updatedQuestions = [...questions];
    updatedQuestions[activeIndex] = data;
    setQuestions(updatedQuestions);
    
    // Auto-advance if not at the end
    if (activeIndex < numQuestions - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handleClearQuestion = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[activeIndex] = null as any; // Clear data
    setQuestions(updatedQuestions);
  };

  const handleBulkSubmit = async () => {
    // Basic validation: ensure all questions are filled out
    const isComplete = questions.every(q => q !== null);
    if (!isComplete) {
      setError("Please complete all questions before publishing.");
      // Optional: auto-navigate to the first incomplete question
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
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      <TopHeader onPublish={handleBulkSubmit} isPublishing={isSubmitting} />

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 text-sm text-center border-b border-red-100 z-20 shadow-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row relative">
        {/* Left Sidebar */}
        <QuestionSidebar 
          questions={questions}
          activeIndex={activeIndex}
          numQuestions={numQuestions}
          onSelect={setActiveIndex}
        />

        {/* Main Content Area (Includes Right Sidebar inside QuestionForm) */}
        <main className="flex-1 overflow-hidden relative">
          <QuestionForm
            key={activeIndex} // Force re-mount when index changes
            questionNumber={activeIndex + 1}
            initialData={questions[activeIndex] || null}
            onSave={handleSaveQuestion}
            onClear={handleClearQuestion}
            testName={testName}
            numQuestions={numQuestions}
          />
        </main>
      </div>
    </div>
  );
};
