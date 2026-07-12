import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { QuestionDraft } from './types';
import { OptionCard } from './components/OptionCard';
import { RichTextEditor } from './components/RichTextEditor';
import { ImageUpload } from './components/ImageUpload';
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
  onDuplicate?: () => void;
  testData?: {
    subject?: string;
    topic?: string;
    subTopic?: string;
    duration?: number;
    totalMarks?: number;
    difficulty?: string;
  };
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
  onNavigate,
  testData
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
    <form onSubmit={handleSubmit(onSave)} className="flex h-full w-full flex-col items-center">
      <div className="flex-1 w-[1160px] no-scrollbar pb-12">
        {/* Test Detail Card (Pixel Perfect to Figma) */}
        <div className="w-[1160px] h-[230px] bg-white border border-[#E5E7EB] rounded-[8px] flex items-start justify-between p-[20px] box-border shrink-0 mb-[30px]">
          <div className="w-[215px] h-[190px] flex flex-col gap-[20px]">
            {/* Top row with Chapter Wise label */}
            <div className="flex items-end gap-[5px] h-[24px]">
              <div className="w-[110px] h-[24px] flex items-center justify-center rounded-[12px] px-[10px] py-[5px] box-border" style={{ background: 'linear-gradient(104.9deg, #07013C 0%, #000A3A 102.39%)', border: '0.5px solid #F8FAFF' }}>
                <span className="text-[14px] font-normal text-[#F8FAFF] leading-[150%]">Chapter Wise</span>
              </div>
            </div>
            
            {/* Chapter Title & Difficulty */}
            <div className="flex items-end gap-[10px] h-[24px]">
              <div className="flex items-center gap-[20px] h-[24px]">
                <div className="flex items-end gap-[5px] h-[24px]">
                  <div className="w-[24px] h-[24px] rounded-full overflow-hidden flex items-center justify-center bg-[#D9D9D9]">
                     <div className="w-[16px] h-[16px] rounded-full" style={{ background: 'linear-gradient(90deg, #6C5ABD 15.25%, #CE8302 99.14%)' }}></div>
                  </div>
                  <span className="text-[16px] font-bold text-[#000000] leading-[150%]">{testName}</span>
                </div>
                <div className="h-[24px] bg-[#2AB7A9] rounded-[8px] flex items-center justify-center px-[10px] gap-[8px]">
                   <span className="text-[14px] font-normal text-[#FEFEFF] leading-[150%] capitalize">{testData?.difficulty || 'Easy'}</span>
                </div>
              </div>
            </div>

            {/* Subject, Topic, Sub Topic Rows */}
            <div className="flex flex-col gap-[15px] h-[102px]">
              <div className="flex items-center gap-[5px] h-[24px]">
                <span className="text-[12px] font-normal text-[#6B7180] leading-[150%] w-[100px]">Subject</span>
                <span className="text-[12px] font-normal text-[#6B7180] leading-[150%] w-[4px]">:</span>
                <span className="text-[16px] font-medium text-[#6B7280] leading-[150%]">{testData?.subject || 'English'}</span>
              </div>
              <div className="flex items-center gap-[5px] h-[24px]">
                <span className="text-[12px] font-normal text-[#6B7180] leading-[150%] w-[100px]">Topic</span>
                <span className="text-[12px] font-normal text-[#6B7180] leading-[150%] w-[4px]">:</span>
                <div className="flex gap-[5px] h-[24px]">
                  <div className="h-[24px] border-[0.5px] border-[#E9B406] rounded-[8px] flex items-center justify-center px-[10px]">
                    <span className="text-[14px] font-normal text-[#FFC82C] leading-[150%]">{testData?.topic || 'Grammar'}</span>
                  </div>
                  <div className="h-[24px] border-[0.5px] border-[#E9B406] rounded-[8px] flex items-center justify-center px-[10px]">
                    <span className="text-[14px] font-normal text-[#FFC82C] leading-[150%]">Writing</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-[5px] h-[24px]">
                <span className="text-[12px] font-normal text-[#6B7180] leading-[150%] w-[100px]">Sub Topic</span>
                <span className="text-[12px] font-normal text-[#6B7180] leading-[150%] w-[4px]">:</span>
                <div className="h-[24px] border-[0.5px] border-[#E9B406] rounded-[8px] flex items-center justify-center px-[10px]">
                  <span className="text-[14px] font-normal text-[#FFC82C] leading-[150%]">{testData?.subTopic || 'Application'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side stats */}
          <div className="w-[322px] h-[190px] flex flex-col justify-between items-end">
            <button type="button" className="w-[20px] h-[20px] flex items-center justify-center text-[#7489FF] cursor-pointer hover:bg-gray-100 rounded-full transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
              </svg>
            </button>

            <div className="w-[322px] h-[32px] border border-[#E5E7EB] rounded-[8px] flex items-center justify-center gap-[5px] px-[5px] box-border">
              <div className="h-[32px] w-[80px] flex items-center gap-[5px]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="#D1D5DB"/>
                </svg>
                <span className="text-[14px] font-normal text-[#374151] leading-[150%]">{testData?.duration || 60} Min</span>
              </div>
              <span className="text-[#E5E7EB] font-medium text-[16px]">|</span>
              <div className="h-[32px] w-[100px] flex items-center gap-[5px] justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 16H16V18H8V16ZM8 12H16V14H8V12ZM14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="#D1D5DB"/>
                </svg>
                <span className="text-[14px] font-normal text-[#374151] leading-[150%]">{testData?.totalMarks || 50} Q's</span>
              </div>
              <span className="text-[#E5E7EB] font-medium text-[16px]">|</span>
              <div className="h-[32px] w-[100px] flex items-center gap-[5px] justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 17H7V15H17V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="#D1D5DB"/>
                </svg>
                <span className="text-[14px] font-normal text-[#374151] leading-[150%]">{(testData?.totalMarks || 50) * 5} Marks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Header & Actions */}
        <div className="flex items-center justify-between h-[68px] bg-white rounded-[8px] mb-[20px]">
          <h2 className="text-[16px] font-medium text-[#07013C] leading-[150%]">
            Question {questionNumber}<span className="text-[#07013C] font-normal">/{numQuestions}</span>
          </h2>
          <div className="flex gap-[10px]">
            <button type="button" className="w-[79px] h-[40px] bg-[#FAFAFA] rounded-[8px] flex items-center justify-center gap-[5px] px-[10px] hover:bg-gray-100 transition-colors">
              <Plus size={16} className="text-[#374151]" />
              <span className="text-[14px] font-medium text-[#9CA3AF] leading-[150%]">MCQ</span>
            </button>
            <button type="button" onClick={onOpenCsv} className="w-[75px] h-[40px] bg-[#FAFAFA] rounded-[8px] flex items-center justify-center gap-[5px] px-[10px] hover:bg-gray-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="#9CA3AF"/>
              </svg>
              <span className="text-[14px] font-medium text-[#9CA3AF] leading-[150%]">CSV</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end mb-[30px]">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all edits for this question?')) {
                onClear();
                reset();
              }
            }}
            className="h-[32px] bg-[#FFFBFB] rounded-[8px] px-[5px] flex items-center gap-[2px] text-[#FF7F7F] text-[14px] hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            <span className="font-normal leading-[150%] ml-[2px]">Delete All Edits</span>
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
                  label="Question Text"
                  error={errors.stem?.message}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Type here"
                />
              )}
            />
            
            <div className="mt-4">
              <Controller
                name="mediaUrl"
                control={control}
                render={({ field }) => (
                  <ImageUpload 
                    label="Question Image (Optional)" 
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

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
    </form>
  );
});
