import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, AlertCircle, RefreshCw, Copy, CheckCircle, Clock, Hash, Target } from 'lucide-react';
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
    <div className="max-w-[1200px] mx-auto bg-white min-h-[818px] p-[20px_20px_30px] flex flex-col gap-5">
      {/* Breadcrumb replacement */}
      <div className="flex items-center space-x-2 text-[16px]">
        <span className="text-gray-500 font-medium cursor-pointer hover:text-gray-700" onClick={() => navigate('/')}>Test Creation</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium cursor-pointer hover:text-brand" onClick={() => navigate(`/test/edit/${id}`)}>Test created</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500 font-medium">Publish</span>
      </div>

      <div className="flex items-center space-x-5 mb-2 mt-4">
        <h1 className="text-[16px] font-bold text-gray-800">Test created</h1>
        <div className="flex items-center px-[10px] py-[4px] border border-[#0C9D61] rounded-lg bg-white">
          <CheckCircle size={14} className="text-[#0C9D61] mr-1.5" />
          <span className="text-xs text-[#0C9D61]">Question {questions.length}</span>
        </div>
      </div>

      {/* Test Detail Card */}
      <div className="w-[1160px] h-[230px] bg-white border border-gray-200 rounded-lg p-[20px] flex justify-between items-start">
        <div className="flex flex-col gap-5 h-full">
          <div className="flex items-center gap-[35px]">
             <div className="flex items-center gap-2">
                <div className="px-[10px] py-[5px] rounded-xl text-[#F8FAFF] text-[14px] bg-gradient-to-r from-[#07013C] to-[#000A3A] border border-[#F8FAFF]">
                  Chapter Wise
                </div>
                <div className="px-[16px] py-[2px] bg-[#2AB7A9] rounded-lg text-black text-[16px] font-bold">
                  Chapter 1
                </div>
                <div className="flex items-center gap-1 px-[10px] py-[2px] bg-[#D9D9D9] rounded-lg text-[#FEFEFF] text-[14px]">
                   <span className="w-2 h-2 rounded-full bg-white block"></span>
                  {testData?.difficulty ? testData.difficulty.charAt(0).toUpperCase() + testData.difficulty.slice(1) : 'Easy'}
                </div>
             </div>
          </div>
          
          <div className="flex flex-col gap-[15px]">
            <div className="flex items-center gap-[5px]">
              <span className="text-[#6B7180] text-[12px] w-[100px]">Subject</span>
              <span className="text-[#6B7180] text-[12px] w-[4px]">:</span>
              <span className="text-[#6B7280] font-medium text-[16px] ml-2">{testData?.subjectId || 'Maths'}</span>
            </div>
            <div className="flex items-center gap-[5px]">
              <span className="text-[#6B7180] text-[12px] w-[100px]">Topic</span>
              <span className="text-[#6B7180] text-[12px] w-[4px]">:</span>
              <div className="flex gap-[10px] ml-2">
                 {testData?.topicIds?.length ? testData.topicIds.map((t: string, i: number) => (
                    <span key={i} className="px-[10px] py-[2px] border border-[#E9B406] text-[#FFC82C] rounded-lg text-[14px]">{t}</span>
                 )) : (
                    <>
                      <span className="px-[10px] py-[2px] border border-[#E9B406] text-[#FFC82C] rounded-lg text-[14px]">Grammar</span>
                      <span className="px-[10px] py-[2px] border border-[#E9B406] text-[#FFC82C] rounded-lg text-[14px]">Writing</span>
                    </>
                 )}
              </div>
            </div>
            <div className="flex items-center gap-[5px]">
              <span className="text-[#6B7180] text-[12px] w-[100px]">Sub Topic</span>
              <span className="text-[#6B7180] text-[12px] w-[4px]">:</span>
              <span className="px-[10px] py-[2px] border border-[#E9B406] text-[#FFC82C] rounded-lg text-[14px] ml-2">
                Application
              </span>
            </div>
          </div>
        </div>

        {/* Right side stats */}
        <div className="flex flex-col gap-5">
           <div className="h-[20px]"></div> 
           <div className="flex items-center border border-[#E5E7EB] rounded-lg h-[32px] w-[322px] px-1">
             <div className="flex-1 flex items-center justify-center gap-1 border-r border-[#E5E7EB] h-full">
               <Clock size={16} className="text-[#D1D5DB]" />
               <span className="text-[14px] text-[#374151]">{testData?.duration || 60} Min</span>
             </div>
             <div className="flex-1 flex items-center justify-center gap-1 border-r border-[#E5E7EB] h-full">
               <Hash size={16} className="text-[#D1D5DB]" />
               <span className="text-[14px] text-[#374151]">{testData?.numQuestions || 50} Q's</span>
             </div>
             <div className="flex-1 flex items-center justify-center gap-1 h-full">
               <Target size={16} className="text-[#D1D5DB]" />
               <span className="text-[14px] text-[#374151]">{testData?.totalMarks || 250} Marks</span>
             </div>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="w-[1160px] flex flex-col gap-[30px]">
        <SchedulingControls register={register} watch={watch} errors={errors} />

        <div className="mt-[20px] flex items-center border border-[#E5E7EB] rounded-lg p-[2px_10px] gap-5 w-[283px] bg-white">
           <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="bg-[#F8FAFF] text-[#07013C] text-[14px] font-bold px-[11px] h-[40px] rounded-lg flex-1">
             Cancel
           </Button>
           <Button type="submit" isLoading={isPublishing} className="bg-transparent hover:bg-transparent text-[#9CA3AF] text-[14px] font-normal rounded-[48px] px-[11px] h-[40px] flex-1 whitespace-nowrap">
             Publish Test
           </Button>
        </div>
      </form>

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
