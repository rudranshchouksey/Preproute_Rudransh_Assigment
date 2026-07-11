import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

import { PageHeader } from '../../components/Layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { MultiSelect } from '../../components/Form/MultiSelect';
import { MarkingScheme } from './MarkingScheme';
import { Skeleton } from '../../components/ui/Skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { QuestionForm, QuestionFormRef } from '../questions/QuestionForm';
import { QuestionSidebar } from '../questions/components/QuestionSidebar';
import type { QuestionDraft } from '../questions/types';

interface Option {
  value: string | number;
  label: string;
}

export const UnifiedTestEditor = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  // Test Config Form
  const { register: registerTest, handleSubmit: handleTestSubmit, control, watch: watchTest, setValue: setTestValue, formState: { errors: testErrors } } = useForm();
  const selectedSubject = watchTest('subjectId');
  const selectedTopics = watchTest('topicIds') as Option[] | undefined;

  // Question Editor State
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const questionFormRef = useRef<QuestionFormRef>(null);

  // Data Loading State
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [topics, setTopics] = useState<Option[]>([]);
  const [subTopics, setSubTopics] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

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
      } catch (error) {}
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
      } catch (error) {}
    };
    fetchSubTopics();
  }, [selectedTopics, setTestValue]);

  // Handle saving the current question to local state before switching
  const handleSelectQuestion = (index: number) => {
    if (questionFormRef.current) {
      const currentData = questionFormRef.current.getCurrentData();
      const updated = [...questions];
      updated[activeIndex] = currentData;
      setQuestions(updated);
    }
    setActiveIndex(index);
  };

  const handleSaveAll = async (testData: Record<string, any>, mode: 'draft' | 'save' = 'save') => {
    try {
      setIsSaving(true);

      // 1. Sync current question
      let currentQuestions = [...questions];
      if (questionFormRef.current) {
        currentQuestions[activeIndex] = questionFormRef.current.getCurrentData();
        setQuestions(currentQuestions);
      }

      // 2. Save Test Metadata
      const payload = {
        name: testData.name,
        subject: testData.subjectId,
        topics: testData.topicIds?.map((t: Option) => t.value) || [],
        sub_topics: testData.subTopicIds?.map((t: Option) => t.value) || [],
        total_time: testData.duration,
        total_questions: testData.numQuestions,
        total_marks: testData.totalMarks,
        difficulty: testData.difficulty === 'difficult' ? 'hard' : (testData.difficulty || 'medium').toLowerCase(),
        status: mode === 'draft' ? 'draft' : 'live',
        type: 'mock', 
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

      // 3. Save Questions Bulk (only if not drafting an empty test)
      if (currentQuestions.some(q => q !== null)) {
        await api.post('/questions/bulk', {
          testId: testId,
          questions: currentQuestions
        });
      }

      toast.success(mode === 'draft' ? 'Draft saved!' : 'Test saved successfully!');
      
      if (mode === 'draft') {
        navigate('/');
      } else {
        navigate(`/test/${testId}/publish`);
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
        <PageHeader breadcrumbs={[{ label: 'Test Creation', href: '/' }, { label: 'Edit Test' }]} title="Unified Editor" />
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
      <div className="max-w-7xl mx-auto space-y-6 pb-24">
        <PageHeader breadcrumbs={[{ label: 'Test Creation', href: '/' }, { label: 'Edit Test' }]} title="Loading Editor..." />
        <Card className="p-8"><Skeleton className="h-48 w-full" /></Card>
        <div className="flex flex-col md:flex-row gap-6 min-h-[600px]">
          <div className="w-full md:w-72"><Skeleton className="h-96 w-full" /></div>
          <div className="flex-1"><Skeleton className="h-[600px] w-full" /></div>
        </div>
      </div>
    );
  }

  const testName = watchTest('name') || 'Untitled Test';
  const numQuestions = watchTest('numQuestions') || 10;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 relative">
      <PageHeader 
        breadcrumbs={[
          { label: 'Test Creation', href: '/' },
          { label: isEditMode ? 'Edit Test' : 'Create Test' }
        ]}
        title={isEditMode ? 'Edit Test & Questions' : 'Create New Test & Questions'}
        description="Configure test details and manage all questions seamlessly on one page."
      />

      <div className="space-y-6">
        <form id="test-config-form">
          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <Label>Subject *</Label>
                  <Select {...registerTest("subjectId", { required: "Subject is required" })} error={(testErrors.subjectId as any)?.message}>
                    <option value="">Select a subject...</option>
                    {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </Select>
                </div>
                <MultiSelect name="topicIds" control={control} options={topics} label="Topics" placeholder="Select topics..." isDisabled={!selectedSubject || topics.length === 0} />
                <div>
                  <Label>Duration (Minutes) *</Label>
                  <Input type="number" {...registerTest("duration", { required: "Duration is required", valueAsNumber: true })} error={(testErrors.duration as any)?.message} placeholder="e.g. 60" />
                </div>
                <MarkingScheme register={registerTest} errors={testErrors} />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <Label>Name of Test *</Label>
                  <Input type="text" {...registerTest("name", { required: "Test name is required" })} error={(testErrors.name as any)?.message} placeholder="e.g. Midterm Mathematics" />
                </div>
                <MultiSelect name="subTopicIds" control={control} options={subTopics} label="Sub Topics" placeholder="Select sub-topics..." isDisabled={!selectedTopics || selectedTopics.length === 0 || subTopics.length === 0} />
                <div>
                  <Label>Test Type *</Label>
                  <Select {...registerTest("type", { required: "Type is required" })} error={(testErrors.type as any)?.message} defaultValue="practice">
                    <option value="practice">Practice</option>
                    <option value="mock">Mock Test</option>
                    <option value="exam">Exam</option>
                  </Select>
                </div>
                <div>
                  <Label>Test Difficulty Level</Label>
                  <div className="flex gap-4">
                    {['Easy', 'Medium', 'Difficult'].map((level) => (
                      <label key={level} className="flex items-center space-x-2 cursor-pointer group">
                        <input type="radio" value={level.toLowerCase()} {...registerTest("difficulty")} className="text-brand focus:ring-brand h-4 w-4 border-gray-300" defaultChecked={level === 'Medium'} />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Number of Questions</Label>
                    <Input type="number" {...registerTest("numQuestions", { valueAsNumber: true })} placeholder="e.g. 50" />
                  </div>
                  <div>
                    <Label>Total Marks</Label>
                    <Input type="number" {...registerTest("totalMarks", { valueAsNumber: true })} placeholder="e.g. 100" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        <div className="flex flex-col md:flex-row gap-6 min-h-[600px] scroll-mt-24" id="question-editor">
          <div className="w-full md:w-72 shrink-0">
            <div className="sticky top-24">
              <QuestionSidebar 
                questions={questions}
                activeIndex={activeIndex}
                numQuestions={numQuestions}
                onSelect={handleSelectQuestion}
              />
            </div>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100">
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
              testName={testName}
              numQuestions={numQuestions}
            />
          </div>
        </div>
      </div>

      {/* Global Actions Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] z-50 px-6 lg:px-12">
        <Button variant="ghost" onClick={() => navigate('/')} disabled={isSaving} className="mr-auto text-gray-500 hover:text-gray-700">
          Cancel
        </Button>
        <Button variant="outline" onClick={handleTestSubmit((d) => handleSaveAll(d, 'draft'))} isLoading={isSaving && watchTest('status') === 'draft'}>
          Save Draft
        </Button>
        <Button onClick={handleTestSubmit((d) => handleSaveAll(d, 'save'))} isLoading={isSaving && watchTest('status') !== 'draft'}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};
