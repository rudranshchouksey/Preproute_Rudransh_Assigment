import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { QuestionDraft } from './types';
import { ChapterInfoCard } from './components/ChapterInfoCard';
import { RichTextEditor } from './components/RichTextEditor';
import { OptionCard } from './components/OptionCard';
import { PropertiesSidebar } from './components/PropertiesSidebar';

interface QuestionFormProps {
  initialData: QuestionDraft | null;
  onSave: (data: QuestionDraft) => void;
  onClear: () => void;
  questionNumber: number;
  testName?: string;
  numQuestions?: number;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({ 
  initialData, 
  onSave, 
  onClear,
  questionNumber,
  testName = 'Untitled Test',
  numQuestions = 10
}) => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<QuestionDraft>({
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
    <form onSubmit={handleSubmit(onSave)} className="flex h-full w-full">
      
      {/* Main Form Content Canvas */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6 lg:p-8 no-scrollbar relative">
        <div className="max-w-3xl mx-auto pb-24">
          <ChapterInfoCard testName={testName} numQuestions={numQuestions} />

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Question {questionNumber} Editor</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <RichTextEditor
              label="Question Text *"
              error={errors.stem?.message}
              {...register('stem', { required: 'Question text is required' })}
              placeholder="Enter the question here..."
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
              <button 
                type="button" 
                onClick={() => { onClear(); reset(); }}
                className="text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear Edits
              </button>
              <button 
                type="submit" 
                className="bg-brand text-white font-medium px-8 py-2.5 rounded-full hover:bg-brand-dark transition-colors shadow-md hover:shadow-lg"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Properties Sidebar */}
      <PropertiesSidebar register={register} />
      
    </form>
  );
};
