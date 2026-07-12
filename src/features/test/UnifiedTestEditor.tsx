import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

import { PageHeader } from '../../components/Layout/PageHeader';
import { Select } from '../../components/ui/Select';
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
  const [questions, setQuestions] = useState<(QuestionDraft | null)[]>([]);
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

        const validQuestions = currentQuestions
          .filter(q => q !== null && q.stem && q.stem.trim() !== '')
          .map(q => {
             const clean = { ...q } as any;
             if (!clean.topicId) delete clean.topicId;
             if (!clean.subTopicId) delete clean.subTopicId;
             if (!clean.difficulty) delete clean.difficulty;
             if (clean.options) {
               clean.options = clean.options.filter((o: any) => o.text && o.text.trim() !== '');
             }
             return clean;
          });
          
        if (validQuestions.length > 0) {
          await api.post('/questions/bulk', {
            testId: id,
            questions: validQuestions
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
            while (updated.length < numQ) updated.push(null);
          } else if (updated.length > numQ) {
            updated.length = numQ;
          }
          return updated;
        });
      }
      setCurrentStep(2);
    } else {
      // From Step 2, "Next" takes us to Publish
      const testId = await handleSaveAll(testData, 'save');
      if (testId) navigate(`/test/${testId}/publish`);
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

      const validQuestions = currentQuestions
        .filter(q => q !== null && q.stem && q.stem.trim() !== '')
        .map(q => {
           const clean = { ...q } as any;
           if (!clean.topicId) delete clean.topicId;
           if (!clean.subTopicId) delete clean.subTopicId;
           if (!clean.difficulty) delete clean.difficulty;
           if (clean.options) {
             clean.options = clean.options.filter((o: any) => o.text && o.text.trim() !== '');
           }
           return clean;
        });
        
      if (validQuestions.length > 0) {
        await api.post('/questions/bulk', {
          testId: testId,
          questions: validQuestions
        });
      }

      if (mode === 'save') {
        // Will navigate in the caller
      } else {
        toast.success('Draft saved successfully!');
      }
      
      return testId;
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
          <Button onClick={fetchInitialData}><RefreshCw size={16} className="mr-2" /> Retry</Button>
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

  // Figma Layout logic for Test Creation Modal

  return (
    <div className="flex flex-col min-h-screen bg-white items-start overflow-x-auto">
      {currentStep === 1 ? (
        /* Modal Header for Step 1 (Pixel Perfect to Figma) */
        <div className="w-[1200px] h-[72px] px-[20px] bg-white flex items-center justify-between shrink-0 box-border">
          <div className="flex items-center gap-[10px] h-[24px]">
            <span className="text-[16px] font-medium text-black/60 leading-[150%]">Edit Test creation</span>
          </div>
          <button type="button" onClick={() => navigate('/')} className="w-[24px] h-[24px] flex items-center justify-center shrink-0 cursor-pointer hover:bg-gray-100 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#111827" />
            </svg>
          </button>
        </div>
      ) : (
        /* Regular View Headers for Step 2 */
        <div className="w-[1200px] flex flex-col shrink-0">
          {/* Top Nav */}
          <div className="w-[1200px] h-[92px] px-[21px] bg-white border-b border-[#E5E7EB] flex items-center justify-end shrink-0 box-border">
            <div className="flex items-center gap-[20px] h-[52px]">
              <div className="w-[48px] h-[48px] bg-white border border-[#D1D5DB] rounded-[24px] flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.89 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z" fill="#111827" />
                  <circle cx="16.5" cy="7.5" r="4.5" fill="#0C9D61" stroke="white" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex items-center gap-[9px] h-[52px]">
                <div className="w-[48px] h-[48px] bg-[#FFD284] border border-[#6366F1] rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-[4px] w-[115px] justify-center">
                  <span className="text-[20px] font-semibold text-[#374151] leading-[150%] h-[30px] flex items-center">Alex Wando</span>
                  <span className="text-[12px] font-normal text-[#374151] leading-[150%] h-[18px]">Admin</span>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10L12 15L17 10H7Z" fill="#374151" />
                </svg>
              </div>
            </div>
          </div>
          {/* Sub Header (Breadcrumbs + Publish) */}
          <div className="w-[1200px] h-[72px] px-[20px] bg-white flex items-center justify-between shrink-0 box-border">
            <div className="flex items-center gap-[8px] h-[24px]">
              <span className="text-[16px] font-medium text-black/60 leading-[150%]">Test Creation</span>
              <span className="text-[16px] font-normal text-black/60 leading-[150%] mx-[4px]">/</span>
              <span className="text-[16px] font-normal text-black/60 leading-[19px]">{isEditMode ? 'Edit Test' : 'Create Test'}</span>
              <span className="text-[16px] font-normal text-black/60 leading-[150%] mx-[4px]">/</span>
              <span className="text-[16px] font-normal text-black/60 leading-[19px]">{watchTest('testType') || 'Assessment'}</span>
            </div>
            <button type="button" onClick={handleTestSubmit(async (d) => { const tid = await handleSaveAll(d, 'save'); if(tid) navigate(`/test/${tid}/publish`); })} disabled={isSaving} className="w-[160px] h-[48px] bg-[#7489FF] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
              <span className="text-[16px] font-medium text-[#FAFAFA] leading-[150%]">{isSaving ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>
      )}

      <div className="w-[1200px] px-[20px] py-[30px] flex flex-col shrink-0">
        {currentStep === 1 ? (
          /* STEP 1: Basic Info Form matching Figma exactly */
          <div className="w-[1152px] bg-white rounded-[12px] flex flex-col gap-[50px]">

            {/* Test Type Tabs */}
            <div className="w-[1152px] flex items-center justify-between">
              <div className="w-[329px] h-[50px] bg-white border-[0.5px] border-[#D1D5DB] rounded-[12px] flex items-center px-[10px] py-[2px] gap-[30px] box-border">
                {[
                  { id: 'chapterwise', label: 'Chapterwise', w: 'w-[107px]' },
                  { id: 'pyq', label: 'PYQ', w: 'w-[51px]' },
                  { id: 'mock', label: 'Mock Test', w: 'w-[91px]' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTestType(t.id as any)}
                    className={`h-[40px] flex items-center justify-center px-[11px] py-[3px] box-border transition-colors ${testType === t.id
                        ? `bg-[#F8FAFF] rounded-[8px] ${t.w}`
                        : `rounded-[48px] ${t.w} hover:bg-gray-50`
                      }`}
                  >
                    <span className={`text-[14px] leading-[150%] h-[21px] ${testType === t.id ? 'font-medium text-[#384EC7]' : 'font-normal text-[#9CA3AF]'
                      }`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form id="test-config-form" onSubmit={handleTestSubmit(handleNextStep)} className="flex flex-col gap-[50px]">

              {/* Row 1 */}
              <div className="w-[1152px] h-[87px] flex items-start gap-[50px]">
                <div className="w-[551px] flex flex-col gap-[15px]">
                  <label className="text-[16px] font-medium text-[#374151] leading-[150%] h-[24px]">Subject</label>
                  <Select {...registerTest("subjectId", { required: "Subject is required" })} className="w-[551px] h-[48px] bg-white border-[0.5px] border-[#9CA3AF] rounded-[8px] px-[16px] py-[12px] text-[16px] text-[#374151]">
                    <option value="" className="text-[#D1D5DB]">Choose from Drop-down</option>
                    {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </Select>
                  {testErrors.subjectId && <span className="text-red-500 text-xs">{(testErrors.subjectId as any).message}</span>}
                </div>

                <div className="w-[551px] flex flex-col gap-[15px]">
                  <label className="text-[16px] font-medium text-[#374151] leading-[150%] h-[24px]">Name of Test</label>
                  <input type="text" {...registerTest("name", { required: "Test name is required" })} placeholder="Enter name of Test" className="w-[551px] h-[48px] bg-white border-[0.5px] border-[#9CA3AF] rounded-[8px] px-[16px] py-[12px] text-[16px] font-medium text-[#374151] placeholder:text-[#D1D5DB] outline-none focus:border-blue-500" />
                  {testErrors.name && <span className="text-red-500 text-xs">{(testErrors.name as any).message}</span>}
                </div>
              </div>

              {/* Row 2 */}
              <div className="w-[1152px] h-[87px] flex items-start gap-[50px]">
                <div className="w-[551px] flex flex-col gap-[15px]">
                  <MultiSelect name="topicIds" control={control} options={topics} label="Topic" placeholder="Choose from Drop-down" isDisabled={!selectedSubject || topics.length === 0} />
                </div>

                <div className="w-[551px] flex flex-col gap-[15px]">
                  <MultiSelect name="subTopicIds" control={control} options={subTopics} label="Sub Topic" placeholder="Choose from Drop-down" isDisabled={!selectedTopics || selectedTopics.length === 0 || subTopics.length === 0} />
                </div>
              </div>

              {/* Row 3 */}
              <div className="w-[1152px] h-[87px] flex items-start gap-[50px]">
                <div className="w-[551px] flex flex-col gap-[15px]">
                  <label className="text-[16px] font-medium text-[#374151] leading-[150%] h-[24px]">Duration (Minutes)</label>
                  <input type="number" {...registerTest("duration", { required: "Duration is required", valueAsNumber: true })} placeholder="Enter the time" className="w-[551px] h-[48px] bg-white border-[0.5px] border-[#9CA3AF] rounded-[8px] px-[16px] py-[12px] text-[16px] font-medium text-[#374151] placeholder:text-[#D1D5DB] outline-none focus:border-blue-500" />
                  {testErrors.duration && <span className="text-red-500 text-xs">{(testErrors.duration as any).message}</span>}
                </div>

                <div className="w-[551px] flex flex-col gap-[30px]">
                  <label className="text-[16px] font-medium text-[#374151] leading-[150%] h-[24px]">Test Difficulty Level</label>
                  <div className="w-[510px] h-[24px] flex items-center gap-[30px]">
                    {['Easy', 'Medium', 'Difficult'].map((level) => (
                      <label key={level} className="flex items-center gap-[10px] cursor-pointer">
                        <div className="w-[24px] h-[24px] rounded-full bg-[#D9D9D9] flex items-center justify-center">
                          <input type="radio" value={level.toLowerCase()} {...registerTest("difficulty")} className="w-[16px] h-[16px] text-[#7489FF] bg-[#7489FF] border-none focus:ring-0" defaultChecked={level === 'Medium'} />
                        </div>
                        <span className="text-[16px] font-medium text-[#374151] leading-[150%]">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Marking Scheme & Totals */}
              <div className="w-[1152px] h-[141px] flex items-start gap-[50px]">

                <div className="w-[551px] flex flex-col gap-[30px]">
                  <label className="text-[16px] font-medium text-[#374151] leading-[150%] h-[24px]">Marking Scheme:</label>
                  <div className="w-[551px] h-[87px] flex items-center gap-[50px]">
                    <div className="w-[150.33px] flex flex-col gap-[15px]">
                      <label className="text-[16px] font-medium text-[#374151] leading-[150%] h-[24px]">Wrong Answer</label>
                      <input type="number" defaultValue={-1} {...registerTest("markingWrong")} className="w-[150.33px] h-[48px] bg-white border-[0.5px] border-[#9CA3AF] rounded-[8px] px-[16px] py-[12px] text-[16px] font-medium text-[#111827] outline-none focus:border-blue-500" />
                    </div>
                    <div className="w-[150.33px] flex flex-col gap-[15px]">
                      <label className="text-[16px] font-medium text-[#374151] leading-[150%] h-[24px]">Unattempted</label>
                      <input type="number" defaultValue={0} {...registerTest("markingUnattempted")} className="w-[150.33px] h-[48px] bg-white border-[0.5px] border-[#9CA3AF] rounded-[8px] px-[16px] py-[12px] text-[16px] font-medium text-[#111827] outline-none focus:border-blue-500" />
                    </div>
                    <div className="w-[150.33px] flex flex-col gap-[15px]">
                      <label className="text-[16px] font-medium text-[#374151] leading-[150%] h-[24px]">Correct Answer</label>
                      <input type="number" defaultValue={5} {...registerTest("markingCorrect")} className="w-[150.33px] h-[48px] bg-white border-[0.5px] border-[#9CA3AF] rounded-[8px] px-[16px] py-[12px] text-[16px] font-medium text-[#111827] outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="w-[551px] h-[87px] flex flex-row items-end pb-[1px] gap-[50px]">
                  <div className="w-[250.5px] flex flex-col gap-[15px]">
                    <label className="text-[16px] font-medium text-[#374151] leading-[150%] h-[24px]">No of Questions</label>
                    <input type="number" {...registerTest("numQuestions", { valueAsNumber: true })} placeholder="Ex:250 Marks" className="w-[250.5px] h-[48px] bg-white border border-[#D1D5DB] rounded-[8px] px-[16px] py-[12px] text-[16px] font-medium text-[#374151] placeholder:text-[#D1D5DB] outline-none focus:border-blue-500" />
                  </div>
                  <div className="w-[250.5px] flex flex-col gap-[15px]">
                    <label className="text-[16px] font-medium text-[#D1D5DB] leading-[150%] h-[24px]">Total Marks</label>
                    <input type="number" {...registerTest("totalMarks", { valueAsNumber: true })} placeholder="Ex:250 Marks" className="w-[250.5px] h-[48px] bg-white border border-[#D1D5DB] rounded-[8px] px-[16px] py-[12px] text-[16px] font-medium text-[#374151] placeholder:text-[#D1D5DB] outline-none focus:border-blue-500" />
                  </div>
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="w-[1152px] h-[44px] flex justify-end gap-[20px] mt-[10px]">
                <button type="button" onClick={() => navigate('/')} className="w-[112px] h-[44px] bg-[#F8FAFC] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="text-[16px] font-medium text-[#384EC7] leading-[150%]">Cancel</span>
                </button>
                <button type="submit" className="w-[112px] h-[44px] bg-[#7489FF] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                  <span className="text-[16px] font-medium text-white leading-[150%]">Save</span>
                </button>
              </div>

            </form>
          </div>
        ) : (

          /* STEP 2: Question Editor Layout matching Figma Image */
          <div className="w-[1200px] flex flex-row items-start border-t border-[#E5E7EB] bg-white min-h-[1455px]">
            {/* Left Sidebar */}
            <div className="w-[196px] min-h-[1455px] bg-white border-r border-[#E5E7EB] shrink-0 pt-6">
              <h3 className="text-[#6B7180] font-medium text-[12px] px-4 mb-6 flex items-center justify-between uppercase">
                Question creation
                <ChevronRight size={14} className="text-gray-400 rotate-180" />
              </h3>

              <div className="text-[#374151] font-semibold text-[14px] px-4 mb-6 pb-4 border-b border-[#E5E7EB]">
                Total Questions . <span className="text-[#6B7180] font-normal">{numQuestions}</span>
              </div>

              <div className="px-2">
                <QuestionSidebar
                  questions={questions as QuestionDraft[]}
                  activeIndex={activeIndex}
                  numQuestions={numQuestions}
                  onSelect={handleSelectQuestion}
                  variant="minimal"
                />
              </div>
            </div>

            {/* Main Question Editor Container */}
            <div className="flex-1 w-[1004px] flex flex-col p-[20px] gap-[20px] box-border bg-white">
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
                  updated[activeIndex] = null;
                  setQuestions(updated);
                }}
                onDuplicate={handleDuplicateQuestion}
                testName={testName}
                numQuestions={numQuestions}
                onOpenCsv={() => setIsCsvOpen(true)}
                onNavigate={(index) => handleSelectQuestion(index - 1)}
                testData={{
                  subject: subjects.find(s => s.value === selectedSubject)?.label,
                  topic: topics.find(t => selectedTopics?.find(st => st.value === t.value))?.label,
                  subTopic: subTopics.find(t => t.label)?.label, // simplified for view
                  duration: watchTest('duration'),
                  totalMarks: watchTest('totalMarks'),
                  difficulty: watchTest('difficulty')
                }}
              />

              {/* Form Actions footer */}
              <div className="flex justify-between items-center w-full h-[48px] mt-[20px]">
                <button type="button" onClick={() => setCurrentStep(1)} className="w-[172px] h-[48px] bg-[#FF7D7D] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-red-500 transition-colors">
                  <span className="text-[16px] font-medium text-white leading-[150%]">Exit Test Creation</span>
                </button>
                <div className="flex gap-4">
                  <button type="button" onClick={handleTestSubmit(async (d) => { const tid = await handleSaveAll(d, 'draft'); if(tid) navigate(`/test/${tid}/preview`); })} className="w-[160px] h-[48px] bg-white border border-[#7489FF] text-[#7489FF] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors">
                    <span className="text-[16px] font-medium leading-[150%]">Preview</span>
                  </button>
                  <button type="button" onClick={handleTestSubmit(handleNextStep)} className="w-[160px] h-[48px] bg-[#7489FF] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                    <span className="text-[16px] font-medium text-[#FAFAFA] leading-[150%]">Next</span>
                  </button>
                </div>
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
