import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

import { PageHeader } from '../../components/Layout/PageHeader';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { MultiSelect } from '../../components/Form/MultiSelect';
import { Skeleton } from '../../components/ui/Skeleton';
import { AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { QuestionForm, QuestionFormRef } from '../questions/QuestionForm';
import { QuestionSidebar } from '../questions/components/QuestionSidebar';
import { CsvUploadModal } from '../questions/components/CsvUploadModal';
import type { QuestionDraft } from '../questions/types';

interface Option {
  value: string | number;
  label: string;
}

export const UnifiedTestEditor = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [testType, setTestType] = useState<'chapterwise' | 'pyq' | 'mock'>('chapterwise');

  // Test Config Form
  const { register: registerTest, handleSubmit: handleTestSubmit, control, watch: watchTest, setValue: setTestValue, formState: { errors: testErrors } } = useForm();
  const selectedSubject = watchTest('subjectId');
  const selectedTopics = watchTest('topicIds') as Option[] | undefined;

  // Question Editor State
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const questionFormRef = useRef<QuestionFormRef>(null);

  // CSV Upload State
  const [isCsvOpen, setIsCsvOpen] = useState(false);

  // Data Loading State
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [topics, setTopics] = useState<Option[]>([]);
  const [subTopics, setSubTopics] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Auto-save state
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const subRes = await api.get('/subjects').catch(() => ({ data: [] }));
      const subData = Array.isArray(subRes.data) ? subRes.data : subRes.data.data || [];
      setSubjects(subData.map((s: any) => ({ value: s.id || s._id, label: s.name })));

      if (isEditMode) {
        const testRes = await api.get(`/tests/${id}`);
        const data = testRes.data.data || testRes.data;
        
        setTestValue('name', data.name);
        setTestValue('subjectId', data.subjectId);
        setTestValue('duration', data.duration);
        setTestValue('numQuestions', data.numQuestions || 10);
        setTestValue('totalMarks', data.totalMarks);
        setTestValue('difficulty', data.difficulty);
        setTestValue('markingCorrect', data.markingScheme?.correct || 5);
        setTestValue('markingWrong', data.markingScheme?.wrong || -1);
        setTestValue('markingUnattempted', data.markingScheme?.unattempted || 0);
        if (data.type) setTestType(data.type);

        // Fetch Questions
        const total = data.numQuestions || 10;
        if (data.questionIds && data.questionIds.length > 0) {
          try {
            const qRes = await api.post('/questions/fetchBulk', { question_ids: data.questionIds });
            const fetchedQuestions = Array.isArray(qRes.data) ? qRes.data : qRes.data.data || [];
            const filledQuestions = [...fetchedQuestions];
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
      }
    } catch (error) {
      console.error("Error fetching unified data", error);
      setFetchError("Failed to load test configuration and questions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]);
      setTestValue('topicIds', []);
      return;
    }
    const fetchTopics = async () => {
      try {
        const res = await api.get(`/topics/subject/${selectedSubject}`).catch(() => ({ data: [] }));
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setTopics(data.map((t: any) => ({ value: t.id || t._id, label: t.name })));
      } catch {
        // Fallback or ignore
      }
    };
    fetchTopics();
  }, [selectedSubject, setTestValue]);

  useEffect(() => {
    if (!selectedTopics || selectedTopics.length === 0) {
      setSubTopics([]);
      setTestValue('subTopicIds', []);
      return;
    }
    const fetchSubTopics = async () => {
      try {
        const topicIds = selectedTopics.map(t => t.value);
        const res = await api.post('/sub-topics/multi-topics', { topicIds }).catch(() => ({ data: [] }));
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setSubTopics(data.map((st: any) => ({ value: st.id || st._id, label: st.name })));
      } catch {
        // Fallback or ignore
      }
    };
    fetchSubTopics();
  }, [selectedTopics, setTestValue]);

  // Auto-save (edit mode only, every 30s of inactivity)
  const triggerAutoSave = useCallback(() => {
    if (!isEditMode || isSaving) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        let currentQuestions = [...questions];
        if (questionFormRef.current) {
          currentQuestions[activeIndex] = questionFormRef.current.getCurrentData();
        }
        
        const payload = {
          status: 'draft',
        };
        
        await api.put(`/tests/${id}`, payload);
        
        if (currentQuestions.some(q => q !== null)) {
          await api.post('/questions/bulk', {
            testId: id,
            questions: currentQuestions
          });
        }
        
      } catch (err) {
        // Silent fail for auto-save
        console.warn('Auto-save failed', err);
      }
    }, 30000);
  }, [isEditMode, isSaving, questions, activeIndex, id]);

  useEffect(() => {
    if (isEditMode) triggerAutoSave();
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [questions, triggerAutoSave, isEditMode]);

  const handleSelectQuestion = (index: number) => {
    if (questionFormRef.current) {
      const currentData = questionFormRef.current.getCurrentData();
      const updated = [...questions];
      updated[activeIndex] = currentData;
      setQuestions(updated);
    }
    setActiveIndex(index);
  };

  const handleDuplicateQuestion = () => {
    if (questionFormRef.current) {
      const currentData = questionFormRef.current.getCurrentData();
      if (!currentData || !currentData.stem) {
        toast.error('Save the current question before duplicating.');
        return;
      }
      const nextEmpty = questions.findIndex((q, idx) => idx > activeIndex && q === null);
      if (nextEmpty !== -1) {
        const updated = [...questions];
        updated[activeIndex] = currentData; 
        updated[nextEmpty] = { ...currentData }; 
        setQuestions(updated);
        setActiveIndex(nextEmpty);
        toast.success(`Question duplicated to slot ${nextEmpty + 1}`);
      } else {
        toast.error('No empty question slots available.');
      }
    }
  };

  const handleCsvImport = (importedQuestions: QuestionDraft[]) => {
    let currentQuestions = [...questions];
    if (questionFormRef.current) {
      currentQuestions[activeIndex] = questionFormRef.current.getCurrentData();
    }
    let imported = 0;
    for (const q of importedQuestions) {
      const emptyIdx = currentQuestions.findIndex(existing => existing === null);
      if (emptyIdx !== -1) {
        currentQuestions[emptyIdx] = q;
        imported++;
      } else {
        break;
      }
    }
    setQuestions(currentQuestions);
    setIsCsvOpen(false);
    toast.success(`Successfully imported ${imported} questions!`);
    if (imported < importedQuestions.length) {
      toast(`${importedQuestions.length - imported} questions skipped (no empty slots).`, { icon: '⚠️' });
    }
  };

  const handleNextStep = async (testData: Record<string, any>) => {
    if (currentStep === 1) {
      // Navigate to step 2 but save basic info if we want
      const numQ = testData.numQuestions || 10;
      if (questions.length !== numQ) {
         setQuestions(prev => {
            const updated = [...prev];
            if (updated.length < numQ) {
                while(updated.length < numQ) updated.push(null);
            } else if (updated.length > numQ) {
                updated.length = numQ;
            }
            return updated;
         });
      }
      setCurrentStep(2);
    } else {
      // From Step 2, "Next" takes us to Publish
      await handleSaveAll(testData, 'save');
    }
  };

  const handleSaveAll = async (testData: Record<string, any>, mode: 'draft' | 'save' = 'save') => {
    try {
      setIsSaving(true);
      let currentQuestions = [...questions];
      if (questionFormRef.current && currentStep === 2) {
        currentQuestions[activeIndex] = questionFormRef.current.getCurrentData();
        setQuestions(currentQuestions);
      }

      const payload = {
        name: testData.name,
        subject: testData.subjectId,
        topics: testData.topicIds?.map((t: Option) => t.value) || [],
        sub_topics: testData.subTopicIds?.map((t: Option) => t.value) || [],
        total_time: testData.duration,
        total_questions: testData.numQuestions,
        total_marks: testData.totalMarks,
        difficulty: testData.difficulty === 'difficult' ? 'hard' : (testData.difficulty || 'medium').toLowerCase(),
        status: mode === 'draft' ? 'draft' : 'draft', // Live is set in publish page
        type: testType, 
        correct_marks: testData.markingCorrect,
        wrong_marks: testData.markingWrong,
        unattempt_marks: testData.markingUnattempted
      };

      let testId = id;
      if (isEditMode) {
        await api.put(`/tests/${id}`, payload);
      } else {
        const res = await api.post('/tests', payload);
        testId = res.data.id || res.data._id || res.data.data?.id;
      }

      if (!testId) throw new Error("Failed to extract Test ID");

      if (currentQuestions.some(q => q !== null)) {
        await api.post('/questions/bulk', {
          testId: testId,
          questions: currentQuestions
        });
      }
      
      if (mode === 'save') {
        navigate(`/test/${testId}/publish`);
      } else {
        toast.success('Draft saved successfully!');
      }
    } catch (error: any) {
      console.error("Error saving all", error);
      toast.error(error.response?.data?.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (fetchError) {
    return (
      <div className="flex flex-col h-full font-sans">
        <PageHeader breadcrumbs={[{ label: 'Test Creation', href: '/' }, { label: 'Edit Test' }]} title="Test Editor" />
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl flex flex-col items-center mt-12 mx-auto max-w-2xl">
          <AlertCircle size={40} className="text-red-500 mb-4" />
          <p className="font-medium text-lg mb-4">{fetchError}</p>
          <Button onClick={fetchInitialData}><RefreshCw size={16} className="mr-2"/> Retry</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-24 px-6 lg:px-8 mt-6">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  const testName = watchTest('name') || 'Untitled Test';
  const numQuestions = watchTest('numQuestions') || 10;
  
  // Figma breadcrumbs: Test Creation / Create Test / Chapter Wise
  const typeLabel = testType === 'chapterwise' ? 'Chapter Wise' : testType === 'pyq' ? 'PYQ' : 'Mock Test';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Figma style Header */}
      <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center text-sm font-medium text-gray-500">
          <span>Test Creation</span>
          <ChevronRight size={16} className="mx-2" />
          <span>{isEditMode ? 'Edit Test' : 'Create Test'}</span>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-900">{typeLabel}</span>
        </div>
        
        {currentStep === 2 && (
          <Button onClick={handleTestSubmit((d) => handleSaveAll(d, 'save'))} isLoading={isSaving} className="bg-[#5984F7] hover:bg-blue-600 text-white rounded-md px-6">
            Publish
          </Button>
        )}
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto p-8">
        {currentStep === 1 ? (
          /* STEP 1: Basic Info Form matching Figma exactly */
          <div className="max-w-5xl">
            {/* Test Type Tabs */}
            <div className="inline-flex rounded-lg border border-gray-200 p-1 mb-8">
              {[{id: 'chapterwise', label: 'Chapter Wise'}, {id: 'pyq', label: 'PYQ'}, {id: 'mock', label: 'Mock Test'}].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTestType(t.id as any)}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    testType === t.id 
                      ? 'bg-blue-50 text-[#3B82F6]' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form id="test-config-form" onSubmit={handleTestSubmit(handleNextStep)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Left Column */}
                <div className="space-y-8">
                  <div>
                    <Label className="text-gray-700 font-semibold mb-2">Subject</Label>
                    <Select {...registerTest("subjectId", { required: "Subject is required" })} error={(testErrors.subjectId as any)?.message} className="w-full h-12">
                      <option value="">Choose from Drop-down</option>
                      {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </Select>
                  </div>
                  
                  <div>
                    <MultiSelect name="topicIds" control={control} options={topics} label="Topic" placeholder="Choose from Drop-down" isDisabled={!selectedSubject || topics.length === 0} />
                  </div>
                  
                  <div>
                    <Label className="text-gray-700 font-semibold mb-2">Duration (Minutes)</Label>
                    <Input type="number" {...registerTest("duration", { required: "Duration is required", valueAsNumber: true })} error={(testErrors.duration as any)?.message} placeholder="Enter the time" className="h-12" />
                  </div>
                  
                  <div>
                    <Label className="text-gray-700 font-semibold mb-4 block">Marking Scheme:</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2">Wrong Answer</Label>
                        <Input type="number" defaultValue={-1} {...registerTest("markingWrong")} className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2">Unattempted</Label>
                        <Input type="number" defaultValue={0} {...registerTest("markingUnattempted")} className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2">Correct Answer</Label>
                        <Input type="number" defaultValue={5} {...registerTest("markingCorrect")} className="h-11" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  <div>
                    <Label className="text-gray-700 font-semibold mb-2">Name of Test</Label>
                    <Input type="text" {...registerTest("name", { required: "Test name is required" })} error={(testErrors.name as any)?.message} placeholder="Enter name of Test" className="h-12" />
                  </div>

                  <div>
                    <MultiSelect name="subTopicIds" control={control} options={subTopics} label="Sub Topic" placeholder="Choose from Drop-down" isDisabled={!selectedTopics || selectedTopics.length === 0 || subTopics.length === 0} />
                  </div>

                  <div>
                    <Label className="text-gray-700 font-semibold mb-4 block">Test Difficulty Level</Label>
                    <div className="flex gap-8 h-12 items-center">
                      {['Easy', 'Medium', 'Difficult'].map((level) => (
                        <label key={level} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" value={level.toLowerCase()} {...registerTest("difficulty")} className="w-5 h-5 text-[#3B82F6] border-gray-300 focus:ring-[#3B82F6]" defaultChecked={level === 'Medium'} />
                          <span className="text-gray-700 font-medium">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-700 font-semibold mb-2">No of Questions</Label>
                      <Input type="number" {...registerTest("numQuestions", { valueAsNumber: true })} placeholder="Ex:50" className="h-12" />
                    </div>
                    <div>
                      <Label className="text-gray-300 font-semibold mb-2">Total Marks</Label>
                      <Input type="number" {...registerTest("totalMarks", { valueAsNumber: true })} placeholder="Ex:250 Marks" className="h-12 bg-gray-50 border-gray-200 text-gray-400 placeholder:text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-end gap-4 mt-12 pt-8">
                <Button type="button" variant="ghost" className="bg-[#F8FAFC] text-[#3B82F6] hover:bg-blue-50 h-12 px-8 font-semibold rounded-lg" onClick={() => navigate('/')}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#5984F7] hover:bg-blue-600 text-white h-12 px-12 font-semibold rounded-lg shadow-sm">
                  Next
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: Question Editor Layout matching Figma Image 4 */
          <div className="flex gap-8 h-full min-h-[800px]">
            {/* Left Sidebar */}
            <div className="w-[280px] shrink-0 border-r border-gray-100 pr-6">
              <h3 className="text-gray-500 font-medium text-sm mb-6 flex items-center justify-between">
                Question creation
                <ChevronRight size={14} className="text-gray-400 rotate-180" />
              </h3>
              
              <div className="text-gray-900 font-semibold text-sm mb-6 pb-4 border-b border-gray-100">
                Total Questions . <span className="text-gray-600">{numQuestions}</span>
              </div>
              
              <QuestionSidebar 
                questions={questions}
                activeIndex={activeIndex}
                numQuestions={numQuestions}
                onSelect={handleSelectQuestion}
                variant="minimal"
              />
            </div>

            {/* Main Question Editor */}
            <div className="flex-1 max-w-4xl relative pb-24">
              <QuestionForm
                ref={questionFormRef}
                key={activeIndex}
                questionNumber={activeIndex + 1}
                initialData={questions[activeIndex] || null}
                onSave={(data) => {
                  const updated = [...questions];
                  updated[activeIndex] = data;
                  setQuestions(updated);
                  if (activeIndex < numQuestions - 1) setActiveIndex(activeIndex + 1);
                }}
                onClear={() => {
                  const updated = [...questions];
                  updated[activeIndex] = null as any;
                  setQuestions(updated);
                }}
                onDuplicate={handleDuplicateQuestion}
                testName={testName}
                numQuestions={numQuestions}
                onOpenCsv={() => setIsCsvOpen(true)}
                onNavigate={(index) => handleSelectQuestion(index - 1)}
              />

              {/* Form Actions footer */}
              <div className="mt-12 flex justify-between items-center">
                <Button variant="ghost" className="bg-[#FF7D7D] hover:bg-red-500 text-white px-6 h-11 rounded-md shadow-sm" onClick={() => setCurrentStep(1)}>
                  Exit Test Creation
                </Button>
                <Button onClick={handleTestSubmit(handleNextStep)} className="bg-[#5984F7] hover:bg-blue-600 text-white px-10 h-11 rounded-md shadow-sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CsvUploadModal
        isOpen={isCsvOpen}
        onClose={() => setIsCsvOpen(false)}
        onImport={handleCsvImport}
        existingCount={questions.filter(q => q !== null).length}
        maxQuestions={numQuestions}
      />
    </div>
  );
};
