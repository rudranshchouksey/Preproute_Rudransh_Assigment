import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { QuestionDraft } from './types';
import { ChapterInfoCard } from './components/ChapterInfoCard';
import { RichTextEditor } from './components/RichTextEditor';
import { OptionCard } from './components/OptionCard';
import { PropertiesSidebar } from './components/PropertiesSidebar';
import { Button } from '../../components/ui/Button';
import { Copy } from 'lucide-react';

interface QuestionFormProps {
  initialData: QuestionDraft | null;
  onSave: (data: QuestionDraft) => void;
  onClear: () => void;
  onDuplicate?: () => void;
  questionNumber: number;
  testName?: string;
  numQuestions?: number;
}

export interface QuestionFormRef {
  getCurrentData: () => QuestionDraft;
}

export const QuestionForm = forwardRef<QuestionFormRef, QuestionFormProps>(({ 
  initialData, 
  onSave, 
  onClear,
  onDuplicate,
  questionNumber,
  testName = 'Untitled Test',
  numQuestions = 10
}, ref) => {
  const { register, handleSubmit, reset, watch, getValues, setValue, control, formState: { errors } } = useForm<QuestionDraft>({
    defaultValues: initialData || {
      stem: '',
      options: [
        { id: '1', text: '' },
        { id: '2', text: '' },
        { id: '3', text: '' },
        { id: '4', text: '' },
      ],
      correctOptionId: '1',
      mediaUrl: '',
      explanation: '',
      difficulty: '',
      topicId: '',
      subTopicId: ''
    }
  });

  const correctOptionId = watch('correctOptionId');

  useImperativeHandle(ref, () => ({
    getCurrentData: () => getValues()
  }));

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        stem: '',
        options: [
          { id: '1', text: '' },
          { id: '2', text: '' },
          { id: '3', text: '' },
          { id: '4', text: '' },
        ],
        correctOptionId: '1',
        mediaUrl: '',
        explanation: '',
        difficulty: '',
        topicId: '',
        subTopicId: ''
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSave)} className="flex h-full w-full flex-col xl:flex-row">
      
      {/* Main Form Content Canvas */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar relative min-w-0">
        <div className="max-w-3xl mx-auto pb-12">
          <ChapterInfoCard testName={testName} numQuestions={numQuestions} />

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Question {questionNumber} Editor</h2>
            {onDuplicate && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={onDuplicate}
                className="text-brand hover:text-brand-dark"
              >
                <Copy size={14} className="mr-1.5" />
                Duplicate
              </Button>
            )}
          </div>

          <div className="space-y-6">
            <Controller
              name="stem"
              control={control}
              rules={{ required: 'Question text is required' }}
              render={({ field }) => (
                <RichTextEditor
                  label="Question Text *"
                  error={errors.stem?.message}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter the question here..."
                />
              )}
            />

            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-900 mb-4">Options (Select the correct answer) *</label>
              <div className="space-y-4">
                {[0, 1, 2, 3].map((index) => (
                  <OptionCard
                    key={index}
                    index={index}
                    isSelected={correctOptionId === (index + 1).toString()}
                    register={register}
                  />
                ))}
              </div>
              {errors.options && <p className="text-red-500 text-xs mt-2 font-medium">All options must be filled.</p>}
            </div>
            
            <div className="mt-10 flex justify-between items-center pt-6 border-t border-gray-100">
              <Button 
                variant="ghost"
                type="button" 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this question? This cannot be undone.')) {
                    onClear();
                    reset();
                  }
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete Question
              </Button>
              <Button type="submit">
                Save & Continue
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Properties Sidebar */}
      <div className="w-full xl:w-80 border-t xl:border-t-0 xl:border-l border-gray-200 bg-gray-50/50 shrink-0">
        <PropertiesSidebar register={register} control={control} setValue={setValue} />
      </div>
      
    </form>
  );
});
