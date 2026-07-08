import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Edit3, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { SchedulingControls } from './SchedulingControls';
import type { QuestionDraft } from '../questions/types';
import type { TestConfig } from '../../types/api';

export const TestPublishPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [testData, setTestData] = useState<TestConfig | null>(null);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      publishMode: 'now',
      scheduleDate: '',
      scheduleTime: '',
      liveUntil: 'always'
    }
  });

  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        setIsLoading(true);
        // Fetch test metadata
        const testRes = await api.get(`/tests/${id}`);
        const data = testRes.data.data || testRes.data;
        setTestData(data);

        // Fetch questions using POST /questions/fetchBulk
        // Assuming testData contains an array of question IDs: data.questionIds
        const questionIds = data.questionIds || [];
        if (questionIds.length > 0) {
          const qRes = await api.post('/questions/fetchBulk', { question_ids: questionIds }).catch(() => ({ data: [] }));
          setQuestions(Array.isArray(qRes.data) ? qRes.data : qRes.data.data || []);
        } else {
          // Fallback mock questions for preview if none exist
          setQuestions([
            { stem: 'What is the primary capital of France?', correctOptionId: '3', options: [{ id: '1', text: 'London' }, { id: '2', text: 'Berlin' }, { id: '3', text: 'Paris' }, { id: '4', text: 'Madrid' }] },
            { stem: 'Which planet is known as the Red Planet?', correctOptionId: '1', options: [{ id: '1', text: 'Mars' }, { id: '2', text: 'Jupiter' }, { id: '3', text: 'Venus' }, { id: '4', text: 'Saturn' }] },
          ]);
        }
      } catch (error) {
        console.error("Failed to load publish data", error);
        toast.error("Failed to load test configuration.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchConfiguration();
  }, [id]);

  const onConfirmPublish = async (formData: Record<string, any>) => {
    try {
      setIsPublishing(true);
      const payload = {
        status: 'live',
        publishSettings: formData
      };

      await api.put(`/tests/${id}`, payload);
      toast.success('Test published successfully!');

      // Redirect home
      navigate('/');
    } catch (error: any) {
      console.error("Failed to publish test", error);
      toast.error(error.response?.data?.message || "Failed to publish test.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary tracking-tight">Preview & Publish</h1>
        <p className="text-gray-500 mt-1">Review your test configuration before making it live.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Comprehensive Evaluation View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Summary Card */}
          <div className="card relative">
            <Link
              to={`/test/edit/${id}`}
              className="absolute top-6 right-6 text-gray-400 hover:text-brand transition-colors p-2 bg-gray-50 rounded-full hover:bg-brand/10"
              title="Edit Test Configuration"
            >
              <Edit3 size={18} />
            </Link>

            <h2 className="text-xl font-bold text-secondary mb-4">{testData?.name || 'Untitled Test'}</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Subject</p>
                <p className="font-medium text-secondary">{testData?.subjectId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Duration</p>
                <p className="font-medium text-secondary flex items-center">
                  <Clock size={14} className="mr-1 text-gray-400" /> {testData?.duration || 0} mins
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Items</p>
                <p className="font-medium text-secondary">{testData?.numQuestions || questions.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Marks</p>
                <p className="font-medium text-secondary">{testData?.totalMarks || 0}</p>
              </div>
            </div>

            {/* Topic Pills */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Topics Covered</p>
              <div className="flex flex-wrap gap-2">
                {testData?.topicIds?.length ? testData.topicIds.map((t: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 bg-brand/10 text-brand rounded-full text-xs font-medium">
                    {t}
                  </span>
                )) : (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Sample Topic</span>
                )}
              </div>
            </div>
          </div>

          {/* Inline Question Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-secondary flex items-center">
              <CheckCircle size={18} className="mr-2 text-green-500" />
              Question Sheet Preview
            </h3>

            {questions.map((q, idx) => (
              <div key={idx} className="card p-5 border-l-4 border-brand">
                <p className="font-medium text-secondary mb-4"><span className="text-gray-400 mr-2">{idx + 1}.</span> {q.stem}</p>
                <div className="space-y-2 pl-6">
                  {q.options.map((opt) => (
                    <div key={opt.id} className={`flex items-center space-x-3 p-2 rounded-md ${opt.id === q.correctOptionId ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-transparent'}`}>
                      <div className={`w-4 h-4 rounded-full border ${opt.id === q.correctOptionId ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}></div>
                      <span className={`text-sm ${opt.id === q.correctOptionId ? 'text-green-800 font-medium' : 'text-gray-600'}`}>{opt.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Publication Scheduling Engine */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit(onConfirmPublish)} className="card sticky top-8">
            <h3 className="text-lg font-bold text-secondary mb-6 border-b border-gray-100 pb-4">Publish Settings</h3>

            <SchedulingControls register={register} watch={watch} errors={errors} />

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={isPublishing}
                className="btn-primary w-full py-3 text-base shadow-brand/30 flex items-center justify-center"
              >
                {isPublishing ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                ) : (
                  'Confirm & Publish'
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
