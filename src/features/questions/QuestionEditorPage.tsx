import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Save } from 'lucide-react';
import api from '../../services/api';
import { QuestionForm } from './QuestionForm';
import { QuestionDraft, BulkQuestionPayload } from './types';

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
      setError("Please complete all questions before saving.");
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
      // On absolute success, smoothly advance
      navigate(`/test/${id}/publish`);
      
    } catch (err: any) {
      console.error("Bulk submit failed", err);
      setError(err.response?.data?.message || "Failed to save questions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Left Sidebar Panel - Question Navigation */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="font-semibold text-secondary">Question Navigation</h3>
          <p className="text-xs text-gray-500 mt-1">
            {questions.filter(q => q !== null).length} of {numQuestions} completed
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {questions.map((q, idx) => {
            const isActive = activeIndex === idx;
            const isCompleted = q !== null;
            
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                  isActive 
                    ? 'bg-brand text-white shadow-md' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <span className="font-medium text-sm">Question {idx + 1}</span>
                {isCompleted && (
                  <CheckCircle2 size={16} className={isActive ? 'text-white' : 'text-green-500'} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Main Work Canvas */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {/* Active Test Metadata Banner */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white shrink-0">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500 font-medium">Editing:</span>
            <span className="text-brand font-semibold px-2 py-1 bg-brand/10 rounded-md">{testName}</span>
          </div>
          
          <button 
            onClick={handleBulkSubmit}
            disabled={isSubmitting}
            className="btn-primary flex items-center space-x-2 py-1.5 px-4 text-sm"
          >
            {isSubmitting ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            ) : (
              <>
                <Save size={16} />
                <span>Save & Continue</span>
              </>
            )}
          </button>
        </div>
        
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 text-sm text-center border-b border-red-100">
            {error}
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          <div className="max-w-3xl mx-auto">
            <QuestionForm
              key={activeIndex} // Force re-mount when index changes
              questionNumber={activeIndex + 1}
              initialData={questions[activeIndex] || null}
              onSave={handleSaveQuestion}
              onClear={handleClearQuestion}
            />
          </div>
        </div>
      </div>

    </div>
  );
};
