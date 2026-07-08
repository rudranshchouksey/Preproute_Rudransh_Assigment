import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { MultiSelect } from '../../components/Form/MultiSelect';
import { MarkingScheme } from './MarkingScheme';

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
  
  // Watchers for chained API calls
  const selectedSubject = watch('subjectId');
  const selectedTopics = watch('topicIds') as Option[] | undefined;

  // 1. Fetch Subjects on Mount (and fetch Test Data if Edit Mode)
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch subjects
        const subRes = await api.get('/subjects').catch(() => ({ data: [] }));
        const subData = Array.isArray(subRes.data) ? subRes.data : subRes.data.data || [];
        setSubjects(subData.map((s: any) => ({ value: s.id || s._id, label: s.name })));

        // If edit mode, fetch test details and pre-populate
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
            
            // For topics and subtopics, we might need to map them back to Option[] format.
            // Simplified for now, assuming the API returns matching structures.
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

  // 2. Fetch Topics when Subject changes
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

  // 3. Fetch Sub-Topics when Topics change
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

  const onSubmit = async (data: Record<string, any>) => {
    try {
      const payload = {
        name: data.name,
        subject: data.subjectId,
        topics: data.topicIds?.map((t: Option) => t.value) || [],
        sub_topics: data.subTopicIds?.map((t: Option) => t.value) || [],
        total_time: data.duration,
        total_questions: data.numQuestions,
        total_marks: data.totalMarks,
        difficulty: data.difficulty,
        type: 'practice', // Required by backend
        correct_marks: data.markingCorrect,
        wrong_marks: data.markingWrong,
        unattempt_marks: data.markingUnattempted
      };

      let testId = id;
      if (isEditMode) {
        await api.put(`/tests/${id}`, payload);
      } else {
        const res = await api.post('/tests', payload);
        testId = res.data.id || res.data._id || res.data.data?.id; // Map returned test-uuid
      }

      if (testId) {
        navigate(`/test/${testId}/questions`);
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary tracking-tight">
          {isEditMode ? 'Edit Test Configuration' : 'Create New Test'}
        </h1>
        <p className="text-gray-500 mt-1">Configure test details, topics, and marking scheme.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Subject *</label>
              <select
                {...register("subjectId", { required: "Subject is required" })}
                className={`input-field ${errors.subjectId ? 'border-red-500' : ''}`}
              >
                <option value="">Select a subject...</option>
                {subjects.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {errors.subjectId && <p className="text-red-500 text-xs mt-1">{(errors.subjectId as any).message}</p>}
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
              <label className="block text-sm font-medium text-secondary mb-1">Duration (Minutes) *</label>
              <input
                type="number"
                {...register("duration", { required: "Duration is required", valueAsNumber: true })}
                className={`input-field ${errors.duration ? 'border-red-500' : ''}`}
                placeholder="e.g. 60"
              />
              {errors.duration && <p className="text-red-500 text-xs mt-1">{(errors.duration as any).message}</p>}
            </div>

            <MarkingScheme register={register} errors={errors} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Name of Test *</label>
              <input
                type="text"
                {...register("name", { required: "Test name is required" })}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g. Midterm Mathematics"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{(errors.name as any).message}</p>}
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
              <label className="block text-sm font-medium text-secondary mb-2">Test Difficulty Level</label>
              <div className="flex gap-4">
                {['Easy', 'Medium', 'Difficult'].map((level) => (
                  <label key={level} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value={level.toLowerCase()}
                      {...register("difficulty")}
                      className="text-brand focus:ring-brand h-4 w-4"
                      defaultChecked={level === 'Medium'}
                    />
                    <span className="text-sm text-gray-700">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Number of Questions</label>
                <input
                  type="number"
                  {...register("numQuestions", { valueAsNumber: true })}
                  className="input-field"
                  placeholder="e.g. 50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Total Marks</label>
                <input
                  type="number"
                  {...register("totalMarks", { valueAsNumber: true })}
                  className="input-field"
                  placeholder="e.g. 100"
                />
              </div>
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="button" onClick={() => navigate('/')} className="px-6 py-2 text-gray-600 hover:text-secondary font-medium mr-4">
            Cancel
          </button>
          <button type="submit" className="btn-primary px-8">
            Next
          </button>
        </div>
      </form>
    </div>
  );
};
