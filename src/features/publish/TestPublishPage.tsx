import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Edit3, CheckCircle, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { SchedulingControls } from './SchedulingControls';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
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
        const testRes = await api.get(`/tests/${id}`);
        const data = testRes.data.data || testRes.data;
        setTestData(data);

        const questionIds = data.questionIds || [];
        if (questionIds.length > 0) {
          const qRes = await api.post('/questions/fetchBulk', { question_ids: questionIds }).catch(() => ({ data: [] }));
          setQuestions(Array.isArray(qRes.data) ? qRes.data : qRes.data.data || []);
        } else {
          setQuestions([
            { stem: 'What is the primary capital of France?', correctOptionId: '3', options: [{ id: '1', text: 'London' }, { id: '2', text: 'Berlin' }, { id: '3', text: 'Paris' }, { id: '4', text: 'Madrid' }] },
            { stem: 'Which planet is known as the Red Planet?', correctOptionId: '1', options: [{ id: '1', text: 'Mars' }, { id: '2', text: 'Jupiter' }, { id: '3', text: 'Venus' }, { id: '4', text: 'Saturn' }] },
          ] as QuestionDraft[]);
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
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-brand" />
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Test Creation', href: '/' },
    { label: 'Edit Test', href: `/test/edit/${id}` },
    { label: 'Edit Questions', href: `/test/${id}/questions` },
    { label: 'Publish' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader 
        breadcrumbs={breadcrumbs}
        title="Preview & Publish"
        description="Review your test configuration before making it live."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Comprehensive Evaluation View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Summary Card */}
          <Card className="relative p-6">
            <Link
              to={`/test/edit/${id}`}
              className="absolute top-6 right-6 text-gray-400 hover:text-brand transition-colors p-2 bg-gray-50 rounded-full hover:bg-brand/10"
              title="Edit Test Configuration"
            >
              <Edit3 size={18} />
            </Link>

            <h2 className="text-xl font-bold text-gray-900 mb-6">{testData?.name || 'Untitled Test'}</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Subject</p>
                <p className="font-medium text-gray-900">{testData?.subjectId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Duration</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <Clock size={14} className="mr-1.5 text-gray-400" /> {testData?.duration || 0} mins
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Total Items</p>
                <p className="font-medium text-gray-900">{testData?.numQuestions || questions.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Total Marks</p>
                <p className="font-medium text-gray-900">{testData?.totalMarks || 0}</p>
              </div>
            </div>

            {/* Topic Pills */}
            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Topics Covered</p>
              <div className="flex flex-wrap gap-2">
                {testData?.topicIds?.length ? testData.topicIds.map((t: string, i: number) => (
                  <Badge key={i} variant="brand">{t}</Badge>
                )) : (
                  <Badge variant="default">Sample Topic</Badge>
                )}
              </div>
            </div>
          </Card>

          {/* Inline Question Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center text-lg mb-6">
              <CheckCircle size={20} className="mr-2 text-green-500" />
              Question Sheet Preview
            </h3>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <Card key={idx} className="p-6 border-l-4 border-l-brand">
                  <p className="font-medium text-gray-900 mb-5 text-base">
                    <span className="text-gray-400 mr-2">{idx + 1}.</span> 
                    <span dangerouslySetInnerHTML={{ __html: q.stem || '' }} />
                  </p>
                  <div className="space-y-3 pl-6">
                    {q.options.map((opt) => (
                      <div key={opt.id} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${opt.id === q.correctOptionId ? 'bg-green-50/80 border border-green-200' : 'bg-gray-50 border border-gray-100'}`}>
                        <div className={`w-4 h-4 rounded-full border ${opt.id === q.correctOptionId ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}></div>
                        <span className={`text-sm ${opt.id === q.correctOptionId ? 'text-green-800 font-medium' : 'text-gray-600'}`}>
                          {opt.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Publication Scheduling Engine */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit(onConfirmPublish)} className="sticky top-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Publish Settings</h3>

              <SchedulingControls register={register} watch={watch} errors={errors} />

              <div className="mt-8 pt-6 border-t border-gray-100">
                <Button
                  type="submit"
                  isLoading={isPublishing}
                  className="w-full h-12 text-base"
                >
                  Confirm & Publish
                </Button>
              </div>
            </Card>
          </form>
        </div>

      </div>
    </div>
  );
};
