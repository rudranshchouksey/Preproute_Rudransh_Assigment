import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, AlertCircle, RefreshCw, Copy, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { SchedulingControls } from './SchedulingControls';
import { ConfirmPublishDialog } from './ConfirmPublishDialog';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Button } from '../../components/ui/Button';
import type { QuestionDraft } from '../questions/types';
import type { TestConfig } from '../../types/api';

export const TestPublishPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [testData, setTestData] = useState<TestConfig | null>(null);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const pendingFormData = useRef<Record<string, any> | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      publishMode: 'now',
      scheduleDate: '',
      scheduleTime: '',
      liveUntil: 'always'
    }
  });

  const fetchConfiguration = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const testRes = await api.get(`/tests/${id}`);
      const data = testRes.data.data || testRes.data;
      setTestData(data);

      const questionIds = data.questionIds || [];
      if (questionIds.length > 0) {
        const qRes = await api.post('/questions/fetchBulk', { question_ids: questionIds }).catch(() => ({ data: [] }));
        setQuestions(Array.isArray(qRes.data) ? qRes.data : qRes.data.data || []);
      } else {
        setQuestions([
          { stem: 'Mock Question', options: [] } as any
        ]);
      }
    } catch (err) {
      console.error("Failed to load publish data", err);
      setError("Failed to load test configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchConfiguration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmitForm = (formData: Record<string, any>) => {
    pendingFormData.current = formData;
    setShowConfirmDialog(true);
  };

  const onConfirmPublish = async () => {
    try {
      setIsPublishing(true);
      const payload = {
        status: 'live',
        publishSettings: pendingFormData.current
      };
      await api.put(`/tests/${id}`, payload);
      setShowConfirmDialog(false);
      setPublishSuccess(true);
      toast.success('Test published successfully!');
    } catch (err: any) {
      console.error("Failed to publish test", err);
      toast.error(err.response?.data?.message || "Failed to publish test.");
    } finally {
      setIsPublishing(false);
    }
  };

  const publishedUrl = `${window.location.origin}/test/${id}/view`;
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publishedUrl);
    toast.success('URL copied to clipboard!');
  };

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6">
        <PageHeader breadcrumbs={[{ label: 'Test Creation', href: '/' }, { label: 'Publish Test' }]} title="Publish" />
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto mt-12">
          <AlertCircle size={40} className="text-red-500" />
          <p className="font-medium text-lg">{error}</p>
          <Button onClick={fetchConfiguration}><RefreshCw size={16} className="mr-2" /> Retry</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full min-h-[400px]"><Loader2 className="animate-spin h-8 w-8 text-brand" /></div>;
  }

  if (publishSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white border border-gray-200 rounded-xl p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Published Successfully! 🎉</h2>
        <p className="text-gray-500 mb-6"><strong>{testData?.name}</strong> is now live.</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Published URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 truncate text-left">{publishedUrl}</code>
            <Button variant="outline" size="sm" onClick={handleCopyUrl}><Copy size={14} className="mr-1" /> Copy</Button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[1200px] flex flex-row items-start border-t border-[#E5E7EB] bg-white min-h-[1455px] mx-auto">
      {/* Left Sidebar */}
      <div className="w-[196px] min-h-[1455px] bg-white border-r border-[#E5E7EB] shrink-0 pt-6">
        <h3 className="text-[#6B7180] font-medium text-[12px] px-4 mb-6 flex items-center justify-between uppercase">
          Question creation
          <ChevronLeft size={16} className="text-[#7489FF]" />
        </h3>

        <div className="text-[#374151] font-semibold text-[14px] px-4 mb-6 pb-4 border-b border-[#E5E7EB]">
          Total Questions . <span className="text-[#6B7180] font-normal">{questions.length}</span>
        </div>

        <div className="px-2">
          {/* QuestionSidebar would go here, we mock the rendering of the first 6 questions with green checks to match screenshot */}
          {questions.slice(0, 6).map((_, idx) => (
             <div key={idx} className="flex items-center justify-between px-3 py-2 border border-[#0C9D61] rounded-lg bg-white mb-2 cursor-not-allowed opacity-80">
               <div className="flex items-center gap-2">
                 <CheckCircle size={14} className="text-[#0C9D61]" fill="#0C9D61" stroke="white" />
                 <span className="text-[#0C9D61] text-[12px] font-medium">Question {idx === 0 ? 'x' : idx + 1}</span>
               </div>
               <ChevronRight size={14} className="text-[#0C9D61]" />
             </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-[1004px] flex flex-col p-[20px] gap-[20px] box-border bg-white">
        
        {/* Top Header */}
        <div className="flex flex-col gap-4">
          <span className="text-[#6B7180] text-[14px] font-medium">Test creation</span>
          <div className="flex items-center gap-4">
            <h1 className="text-[16px] font-bold text-[#111827]">Test created</h1>
            <div className="flex items-center px-[10px] py-[4px] border border-[#0C9D61] rounded-[8px] bg-white">
              <CheckCircle size={14} className="text-[#0C9D61] mr-1.5" fill="#0C9D61" stroke="white" />
              <span className="text-xs text-[#0C9D61]">All {questions.length} Questions done</span>
            </div>
          </div>
        </div>

        {/* Test Detail Card */}
        <div className="w-full h-[230px] bg-white border border-[#E5E7EB] rounded-[8px] flex items-start justify-between p-[20px] box-border shrink-0 mt-2 relative">
          <button type="button" onClick={() => navigate(`/test/edit/${id}`)} className="absolute top-4 right-4 text-[#7489FF] hover:text-blue-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
          </button>
          
          <div className="w-[215px] h-[190px] flex flex-col gap-[20px]">
            <div className="flex items-end gap-[5px] h-[24px]">
              <div className="w-[110px] h-[24px] flex items-center justify-center rounded-[12px] px-[10px] py-[5px] box-border" style={{ background: 'linear-gradient(104.9deg, #07013C 0%, #000A3A 102.39%)', border: '0.5px solid #F8FAFF' }}>
                <span className="text-[14px] font-normal text-[#F8FAFF] leading-[150%]">Chapter Wise</span>
              </div>
            </div>
            
            <div className="flex items-end gap-[10px] h-[24px]">
              <div className="flex items-center gap-[20px] h-[24px]">
                <div className="flex items-end gap-[5px] h-[24px]">
                  <div className="w-[24px] h-[24px] rounded-full overflow-hidden flex items-center justify-center bg-[#D9D9D9]">
                     <div className="w-[16px] h-[16px] rounded-full" style={{ background: 'linear-gradient(90deg, #6C5ABD 15.25%, #CE8302 99.14%)' }}></div>
                  </div>
                  <span className="text-[16px] font-bold text-[#000000] leading-[150%]">{testData?.name || 'Chapter 1'}</span>
                </div>
                <div className="h-[24px] bg-[#2AB7A9] rounded-[8px] flex items-center justify-center px-[10px] gap-[8px]">
                   <span className="text-[14px] font-normal text-[#FEFEFF] leading-[150%] capitalize">{testData?.difficulty || 'Easy'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[15px] h-[102px]">
              <div className="flex items-center gap-[5px] h-[24px]">
                <span className="text-[12px] font-normal text-[#6B7180] leading-[150%] w-[100px]">Subject</span>
                <span className="text-[12px] font-normal text-[#6B7180] leading-[150%] w-[4px]">:</span>
                <span className="text-[16px] font-medium text-[#6B7280] leading-[150%]">{testData?.subjectId || 'English'}</span>
              </div>
              <div className="flex items-center gap-[5px] h-[24px]">
                <span className="text-[12px] font-normal text-[#6B7180] leading-[150%] w-[100px]">Topic</span>
                <span className="text-[12px] font-normal text-[#6B7180] leading-[150%] w-[4px]">:</span>
                <div className="flex gap-[5px] h-[24px]">
                   {testData?.topicIds?.length ? testData.topicIds.map((t: string, i: number) => (
                      <div key={i} className="h-[24px] border-[0.5px] border-[#E9B406] rounded-[8px] flex items-center justify-center px-[10px]">
                        <span className="text-[14px] font-normal text-[#FFC82C] leading-[150%]">{t}</span>
                      </div>
                   )) : (
                      <>
                        <div className="h-[24px] border-[0.5px] border-[#E9B406] rounded-[8px] flex items-center justify-center px-[10px]">
                          <span className="text-[14px] font-normal text-[#FFC82C] leading-[150%]">Grammar</span>
                        </div>
                        <div className="h-[24px] border-[0.5px] border-[#E9B406] rounded-[8px] flex items-center justify-center px-[10px]">
                          <span className="text-[14px] font-normal text-[#FFC82C] leading-[150%]">Writing</span>
                        </div>
                      </>
                   )}
                </div>
              </div>
              <div className="flex items-center gap-[5px] h-[24px]">
                <span className="text-[12px] font-normal text-[#6B7180] leading-[150%] w-[100px]">Sub Topic</span>
                <span className="text-[12px] font-normal text-[#6B7180] leading-[150%] w-[4px]">:</span>
                <div className="flex gap-[5px] h-[24px]">
                  <div className="h-[24px] border-[0.5px] border-[#E9B406] rounded-[8px] flex items-center justify-center px-[10px]">
                    <span className="text-[14px] font-normal text-[#FFC82C] leading-[150%]">Application</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 mt-auto mb-[20px]">
             <div className="flex items-center gap-[24px]">
               <div className="flex items-center gap-1.5 border-r border-[#E5E7EB] pr-6">
                 <Clock size={14} className="text-[#D1D5DB]" />
                 <span className="text-[12px] font-medium text-[#6B7280]">{testData?.duration || 60} Min</span>
               </div>
               <div className="flex items-center gap-1.5 border-r border-[#E5E7EB] pr-6">
                 <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.33333 1.16669H4.66667C3.37801 1.16669 2.33333 2.21136 2.33333 3.50002V10.5C2.33333 11.7887 3.37801 12.8334 4.66667 12.8334H9.33333C10.622 12.8334 11.6667 11.7887 11.6667 10.5V3.50002C11.6667 2.21136 10.622 1.16669 9.33333 1.16669Z" stroke="#D1D5DB" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.66667 4.66669H9.33333" stroke="#D1D5DB" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.66667 7H9.33333" stroke="#D1D5DB" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.66667 9.33331H7" stroke="#D1D5DB" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 <span className="text-[12px] font-medium text-[#6B7280]">{testData?.numQuestions || 50} Q's</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 12.25V4.66667C3.5 4.35725 3.62292 4.06051 3.84171 3.84172C4.0605 3.62292 4.35725 3.5 4.66667 3.5H9.33333C9.64275 3.5 9.9395 3.62292 10.1583 3.84172C10.3771 4.06051 10.5 4.35725 10.5 4.66667V12.25" stroke="#D1D5DB" strokeLinecap="round" strokeLinejoin="round"/><path d="M1.75 12.25H12.25" stroke="#D1D5DB" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.83333 5.83331H8.16667" stroke="#D1D5DB" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.83333 8.16669H8.16667" stroke="#D1D5DB" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 <span className="text-[12px] font-medium text-[#6B7280]">{testData?.totalMarks || 250} Marks</span>
               </div>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="w-full flex flex-col gap-[30px]">
          <SchedulingControls register={register} watch={watch} errors={errors} />

          <div className="mt-[20px] flex justify-end gap-5 w-full">
             <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="bg-[#F8FAFF] text-[#384EC7] text-[14px] font-bold px-[11px] w-[112px] h-[44px] rounded-lg">
               Cancel
             </Button>
             <Button type="submit" isLoading={isPublishing} className="bg-[#7489FF] hover:bg-blue-500 text-white text-[14px] font-medium rounded-lg px-[11px] w-[112px] h-[44px]">
               Confirm
             </Button>
          </div>
        </form>
      </div>

      <ConfirmPublishDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={onConfirmPublish}
        isPublishing={isPublishing}
        testName={testData?.name || 'Untitled Test'}
        questionCount={questions.length}
      />
    </div>
  );
};
