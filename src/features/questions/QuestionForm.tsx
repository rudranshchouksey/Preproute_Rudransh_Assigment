import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { QuestionDraft } from './types';
import { ChapterInfoCard } from './components/ChapterInfoCard';
import { RichTextEditor } from './components/RichTextEditor';
import { OptionCard } from './components/OptionCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Label } from '../../components/ui/Label';
import { Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Textarea } from '../../components/ui/Textarea';

interface QuestionFormProps {
  initialData: QuestionDraft | null;
  onSave: (data: QuestionDraft) => void;
  onClear: () => void;
  questionNumber: number;
  testName?: string;
  numQuestions?: number;
  onOpenCsv?: () => void;
  onNavigate?: (index: number) => void;
}

export interface QuestionFormRef {
  getCurrentData: () => QuestionDraft;
}

export const QuestionForm = forwardRef<QuestionFormRef, QuestionFormProps>(({ 
  initialData, 
  onSave, 
  onClear,
  questionNumber,
  testName = 'Untitled Test',
  numQuestions = 10,
  onOpenCsv,
  onNavigate
}, ref) => {
  const { register, handleSubmit, reset, watch, getValues, control, formState: { errors } } = useForm<QuestionDraft>({
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
    <form onSubmit={handleSubmit(onSave)} className="flex h-full w-full flex-col">
      <div className="flex-1 overflow-y-auto pt-2 pb-12 no-scrollbar min-w-0">
        <div className="max-w-4xl mx-auto">
          <ChapterInfoCard testName={testName} numQuestions={numQuestions} />

          {/* Question Header & Actions */}
          <div className="flex items-center justify-between mb-4 mt-6">
            <h2 className="text-lg font-bold text-gray-900">
              Question {questionNumber}<span className="text-brand font-medium">/{numQuestions}</span>
            </h2>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="h-9 px-4 text-gray-600 font-medium">
                <Plus size={16} className="mr-1.5 text-gray-400" />
                MCQ
              </Button>
              <Button type="button" variant="outline" className="h-9 px-4 text-gray-600 font-medium" onClick={onOpenCsv}>
                <Plus size={16} className="mr-1.5 text-gray-400" />
                CSV
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all edits for this question?')) {
                  onClear();
                  reset();
                }
              }}
              className="text-[#FF7D7D] flex items-center text-sm font-semibold hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} className="mr-1.5" />
              Delete All Edits
            </button>
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-6">
            <Controller
              name="stem"
              control={control}
              rules={{ required: 'Question text is required' }}
              render={({ field }) => (
                <RichTextEditor
                  error={errors.stem?.message}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Type here"
                />
              )}
            />

            <div className="mt-8">
              <label className="block text-sm font-bold text-gray-900 mb-4">Type the options below</label>
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
            
            {/* Add Solution */}
            <div className="mt-8">
              <label className="block text-sm font-bold text-gray-900 mb-4">Add Solution</label>
              <Textarea 
                {...register('explanation')} 
                placeholder="Type here"
                className="h-32 resize-none bg-white border-gray-200 shadow-sm"
              />
            </div>

            {/* Pagination Arrows */}
            <div className="flex justify-center items-center gap-12 mt-8 mb-12">
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-600 p-2"
                onClick={() => onNavigate && onNavigate(questionNumber - 2)}
                disabled={questionNumber <= 1}
              >
                <ChevronLeft size={20} strokeWidth={2.5} className={questionNumber <= 1 ? "opacity-30" : ""} />
              </button>
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-600 p-2"
                onClick={() => onNavigate && onNavigate(questionNumber)}
                disabled={questionNumber >= numQuestions}
              >
                <ChevronRight size={20} strokeWidth={2.5} className={questionNumber >= numQuestions ? "opacity-30" : ""} />
              </button>
            </div>

            {/* Question settings */}
            <div className="border-t border-gray-100 pt-8 pb-8 space-y-6">
              <h3 className="font-semibold text-gray-900 text-sm">Question settings</h3>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-gray-600 font-semibold mb-2">Level of Difficulty</Label>
                  <Select {...register('difficulty')} className="h-12 w-full max-w-lg text-gray-500 bg-white">
                    <option value="">Select from Drop-down</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="difficult">Difficult</option>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-gray-600 font-semibold mb-2">Topic</Label>
                  <Select {...register('topicId')} className="h-12 w-full max-w-lg text-gray-500 bg-white">
                    <option value="">Select from Drop-down</option>
                    <option value="Grammar">Grammar</option>
                    <option value="Writing">Writing</option>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-gray-600 font-semibold mb-2">Sub-topic</Label>
                  <Select {...register('subTopicId')} className="h-12 w-full max-w-lg text-gray-500 bg-white">
                    <option value="">Select from Drop-down</option>
                    <option value="Application">Application</option>
                    <option value="Comprehension">Comprehension</option>
                  </Select>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </form>
  );
});
