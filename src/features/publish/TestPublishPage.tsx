import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Edit3, CheckCircle, Clock, Loader2, AlertCircle, RefreshCw, Copy, Eye, Target, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { SchedulingControls } from './SchedulingControls';
import { ConfirmPublishDialog } from './ConfirmPublishDialog';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Card } from '../../components/ui/Card';
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
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const [isStudentView, setIsStudentView] = useState(false);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
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
          { stem: 'What is the primary capital of France?', correctOptionId: '3', options: [{ id: '1', text: 'London' }, { id: '2', text: 'Berlin' }, { id: '3', text: 'Paris' }, { id: '4', text: 'Madrid' }] },
          { stem: 'Which planet is known as the Red Planet?', correctOptionId: '1', options: [{ id: '1', text: 'Mars' }, { id: '2', text: 'Jupiter' }, { id: '3', text: 'Venus' }, { id: '4', text: 'Saturn' }] },
        ] as QuestionDraft[]);
      }
    } catch (err) {
      console.error("Failed to load publish data", err);
      setError("Failed to load test configuration.");
      toast.error("Failed to load test configuration.");
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

  const scrollToQuestion = (index: number) => {
    setActivePreviewIndex(index);
    questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const publishedUrl = `${window.location.origin}/test/${id}/view`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publishedUrl);
    toast.success('URL copied to clipboard!');
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader 
          breadcrumbs={[{ label: 'Test Creation', href: '/' }, { label: 'Publish Test' }]}
          title="Preview & Publish"
        />
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto mt-12">
          <AlertCircle size={40} className="text-red-500" />
          <p className="font-medium text-lg">{error}</p>
          <Button onClick={fetchConfiguration}>
            <RefreshCw size={16} className="mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-brand" />
      </div>
    );
  }

  // Success Screen after Publish
  if (publishSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card className="p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Published Successfully! 🎉</h2>
          <p className="text-gray-500 mb-6">
            <strong>{testData?.name}</strong> is now live and available to students.
          </p>

          {/* Published URL */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Published URL</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 truncate text-left">
                {publishedUrl}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                <Copy size={14} className="mr-1" /> Copy
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
            <Button onClick={() => navigate(`/test/edit/${id}`)}>
              <Edit3 size={16} className="mr-2" />
              Edit Test
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Test Creation', href: '/' },
    { label: 'Edit Test', href: `/test/edit/${id}` },
    { label: 'Edit Questions', href: `/test/${id}/questions` },
    { label: 'Publish' }
  ];

  const difficultyLabel = testData?.difficulty 
    ? testData.difficulty.charAt(0).toUpperCase() + testData.difficulty.slice(1) 
    : 'Medium';

  const difficultyVariant = testData?.difficulty === 'easy' ? 'success' : testData?.difficulty === 'difficult' ? 'danger' : 'warning';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader 
        breadcrumbs={breadcrumbs}
        title="Preview & Publish"
        description="Review your test configuration before making it live."
        action={
          <Button variant="outline" onClick={() => setIsStudentView(!isStudentView)}>
            <Eye size={16} className="mr-2" />
            {isStudentView ? 'Exit Student View' : 'Student View'}
          </Button>
        }
      />

      {/* Student View Mode */}
      {isStudentView ? (
        <Card className="p-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 pb-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{testData?.name || 'Untitled Test'}</h2>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Clock size={14} /> {testData?.duration || 0} mins</span>
                <span className="flex items-center gap-1"><Hash size={14} /> {questions.length} questions</span>
                <span className="flex items-center gap-1"><Target size={14} /> {testData?.totalMarks || 0} marks</span>
              </div>
            </div>
            
            <div className="space-y-8">
              {questions.map((q, idx) => (
                <div key={idx} className="space-y-4">
                  <p className="font-medium text-gray-900 text-base">
                    <span className="text-brand font-bold mr-2">{idx + 1}.</span>
                    <span dangerouslySetInnerHTML={{ __html: q.stem || '' }} />
                  </p>
                  {q.mediaUrl && (
                    <img src={q.mediaUrl} alt={`Question ${idx + 1} image`} className="max-w-md rounded-lg border border-gray-200" />
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                    {q.options.map((opt, optIdx) => (
                      <label key={opt.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-brand/40 hover:bg-gray-50 cursor-pointer transition-all">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-gray-500">{String.fromCharCode(65 + optIdx)}</span>
                        </div>
                        <span className="text-sm text-gray-700">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        /* Normal Preview & Publish View */
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

              <h2 className="text-xl font-bold text-gray-900 mb-2">{testData?.name || 'Untitled Test'}</h2>
              <Badge variant={difficultyVariant} className="mb-6">{difficultyLabel}</Badge>

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

            {/* Question Navigation Jumper */}
            <Card className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-500 mr-2">Jump to:</span>
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToQuestion(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      activePreviewIndex === idx 
                        ? 'bg-brand text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-brand/10 hover:text-brand'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
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
                  <Card 
                    key={idx} 
                    ref={(el) => { questionRefs.current[idx] = el; }}
                    className={`p-6 border-l-4 border-l-brand transition-shadow ${activePreviewIndex === idx ? 'ring-2 ring-brand/20 shadow-md' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-medium text-gray-900 text-base flex-1">
                        <span className="text-gray-400 mr-2">{idx + 1}.</span> 
                        <span dangerouslySetInnerHTML={{ __html: q.stem || '' }} />
                      </p>
                      {q.difficulty && (
                        <Badge variant={q.difficulty === 'easy' ? 'success' : q.difficulty === 'difficult' ? 'danger' : 'warning'} className="ml-3 shrink-0">
                          {q.difficulty}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Render Media Image */}
                    {q.mediaUrl && (
                      <div className="mb-4 pl-6">
                        <img 
                          src={q.mediaUrl} 
                          alt={`Question ${idx + 1} media`} 
                          className="max-w-md rounded-lg border border-gray-200 shadow-sm"
                        />
                      </div>
                    )}

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

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="mt-4 pl-6 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Explanation</p>
                        <p className="text-sm text-blue-600">{q.explanation}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Publication Scheduling Engine */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit(onSubmitForm)} className="sticky top-8">
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
      )}

      {/* Confirmation Dialog */}
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
