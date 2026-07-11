import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { MultiSelect } from '../../components/Form/MultiSelect';
import { MarkingScheme } from './MarkingScheme';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';

interface Option {
  value: string | number;
  label: string;
}

export const TestForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm();
  
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [topics, setTopics] = useState<Option[]>([]);
  const [subTopics, setSubTopics] = useState<Option[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  
  const selectedSubject = watch('subjectId');
  const selectedTopics = watch('topicIds') as Option[] | undefined;

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const subRes = await api.get('/subjects').catch(() => ({ data: [] }));
        const subData = Array.isArray(subRes.data) ? subRes.data : subRes.data.data || [];
        setSubjects(subData.map((s: any) => ({ value: s.id || s._id, label: s.name })));

        if (isEditMode) {
          const testRes = await api.get(`/tests/${id}`).catch(() => null);
          if (testRes && testRes.data) {
            const data = testRes.data.data || testRes.data;
            setValue('name', data.name);
            setValue('subjectId', data.subjectId);
            setValue('duration', data.duration);
            setValue('numQuestions', data.numQuestions);
            setValue('totalMarks', data.totalMarks);
            setValue('difficulty', data.difficulty);
            setValue('markingCorrect', data.markingScheme?.correct || 5);
            setValue('markingWrong', data.markingScheme?.wrong || -1);
            setValue('markingUnattempted', data.markingScheme?.unattempted || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching initial data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [id, isEditMode, setValue]);

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]);
      setValue('topicIds', []);
      return;
    }
    
    const fetchTopics = async () => {
      try {
        const res = await api.get(`/topics/subject/${selectedSubject}`).catch(() => ({ data: [] }));
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setTopics(data.map((t: any) => ({ value: t.id || t._id, label: t.name })));
      } catch (error) {
        console.error("Error fetching topics", error);
      }
    };
    
    fetchTopics();
  }, [selectedSubject, setValue]);

  useEffect(() => {
    if (!selectedTopics || selectedTopics.length === 0) {
      setSubTopics([]);
      setValue('subTopicIds', []);
      return;
    }
    
    const fetchSubTopics = async () => {
      try {
        const topicIds = selectedTopics.map(t => t.value);
        const res = await api.post('/sub-topics/multi-topics', { topicIds }).catch(() => ({ data: [] }));
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setSubTopics(data.map((st: any) => ({ value: st.id || st._id, label: st.name })));
      } catch (error) {
        console.error("Error fetching sub-topics", error);
      }
    };
    
    fetchSubTopics();
  }, [selectedTopics, setValue]);

  const onSubmit = async (data: Record<string, any>, mode: 'draft' | 'next' = 'next') => {
    try {
      const payload = {
        name: data.name,
        subject: data.subjectId,
        topics: data.topicIds?.map((t: Option) => t.value) || [],
        sub_topics: data.subTopicIds?.map((t: Option) => t.value) || [],
        total_time: data.duration,
        total_questions: data.numQuestions,
        total_marks: data.totalMarks,
        difficulty: data.difficulty === 'difficult' ? 'hard' : (data.difficulty || 'medium').toLowerCase(),
        status: 'draft',
        type: 'mock', 
        correct_marks: data.markingCorrect,
        wrong_marks: data.markingWrong,
        unattempt_marks: data.markingUnattempted
      };

      let testId = id;
      if (isEditMode) {
        await api.put(`/tests/${id}`, payload);
      } else {
        const res = await api.post('/tests', payload);
        testId = res.data.id || res.data._id || res.data.data?.id;
      }

      if (testId) {
        if (mode === 'draft') {
          navigate('/');
        } else {
          navigate(`/test/${testId}/questions`);
        }
      } else {
        console.error("Failed to extract Test ID from response");
      }
    } catch (error: any) {
      console.error("Error saving test", error);
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && Array.isArray(apiErrors)) {
        alert("Validation Failed:\n" + apiErrors.map((e: any) => `- ${e.msg}`).join("\n"));
      } else {
        alert("Error saving test: " + (error.response?.data?.message || error.message));
      }
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Loading form...</div>;
  }

  const breadcrumbs = [
    { label: 'Test Creation', href: '/' },
    { label: isEditMode ? 'Edit Test' : 'Create Test' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader 
        breadcrumbs={breadcrumbs}
        title={isEditMode ? 'Edit Test Configuration' : 'Create New Test'}
        description="Configure test details, topics, and marking scheme."
      />

      <form onSubmit={handleSubmit((d) => onSubmit(d, 'next'))}>
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <Label>Subject *</Label>
                <Select
                  {...register("subjectId", { required: "Subject is required" })}
                  error={(errors.subjectId as any)?.message}
                >
                  <option value="">Select a subject...</option>
                  {subjects.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
              </div>

              <MultiSelect
                name="topicIds"
                control={control}
                options={topics}
                label="Topics"
                placeholder="Select topics..."
                isDisabled={!selectedSubject || topics.length === 0}
              />

              <div>
                <Label>Duration (Minutes) *</Label>
                <Input
                  type="number"
                  {...register("duration", { required: "Duration is required", valueAsNumber: true })}
                  error={(errors.duration as any)?.message}
                  placeholder="e.g. 60"
                />
              </div>

              <MarkingScheme register={register} errors={errors} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <Label>Name of Test *</Label>
                <Input
                  type="text"
                  {...register("name", { required: "Test name is required" })}
                  error={(errors.name as any)?.message}
                  placeholder="e.g. Midterm Mathematics"
                />
              </div>

              <MultiSelect
                name="subTopicIds"
                control={control}
                options={subTopics}
                label="Sub Topics"
                placeholder="Select sub-topics..."
                isDisabled={!selectedTopics || selectedTopics.length === 0 || subTopics.length === 0}
              />

              <div>
                <Label>Test Type *</Label>
                <Select
                  {...register("type", { required: "Type is required" })}
                  error={(errors.type as any)?.message}
                  defaultValue="practice"
                >
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
                      <input
                        type="radio"
                        value={level.toLowerCase()}
                        {...register("difficulty")}
                        className="text-brand focus:ring-brand h-4 w-4 border-gray-300"
                        defaultChecked={level === 'Medium'}
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors font-medium">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Number of Questions</Label>
                  <Input
                    type="number"
                    {...register("numQuestions", { valueAsNumber: true })}
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <Label>Total Marks</Label>
                  <Input
                    type="number"
                    {...register("totalMarks", { valueAsNumber: true })}
                    placeholder="e.g. 100"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          
          <div className="flex justify-end items-center px-6 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-xl gap-3">
            <Button variant="ghost" type="button" onClick={() => navigate('/')} className="mr-auto">
              Cancel
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              onClick={handleSubmit((d) => onSubmit(d, 'draft'))}
            >
              Save as Draft
            </Button>
            <Button type="submit">
              Next: Add Questions
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
