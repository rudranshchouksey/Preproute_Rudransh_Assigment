import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { QuestionDraft } from './types';

interface QuestionFormProps {
  initialData: QuestionDraft | null;
  onSave: (data: QuestionDraft) => void;
  onClear: () => void;
  questionNumber: number;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({ 
  initialData, 
  onSave, 
  onClear,
  questionNumber
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuestionDraft>({
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
      explanation: ''
    }
  });

  // Reset form when initialData changes (e.g., navigating to a different question)
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
        explanation: ''
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSave)} className="card space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-secondary">Question {questionNumber} Editor</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary mb-1">Question Text *</label>
        <textarea
          {...register('stem', { required: 'Question text is required' })}
          rows={4}
          className={`input-field resize-none ${errors.stem ? 'border-red-500' : ''}`}
          placeholder="Enter the question..."
        />
        {errors.stem && <p className="text-red-500 text-xs mt-1">{errors.stem.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary mb-3">Options (Select the correct answer) *</label>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <input
                type="radio"
                value={(index + 1).toString()}
                {...register('correctOptionId')}
                className="w-5 h-5 text-brand focus:ring-brand border-gray-300"
              />
              <div className="flex-1">
                <input
                  type="text"
                  {...register(`options.${index}.text` as const, { required: 'Option text is required' })}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 placeholder-gray-400"
                  placeholder={`Option ${index + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
        {errors.options && <p className="text-red-500 text-xs mt-2">All options must be filled.</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Media URL (Optional)</label>
          <input
            type="url"
            {...register('mediaUrl')}
            className="input-field"
            placeholder="https://example.com/image.png"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Explanation (Optional)</label>
          <textarea
            {...register('explanation')}
            rows={2}
            className="input-field resize-none"
            placeholder="Provide an explanation for the correct answer..."
          />
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button 
          type="button" 
          onClick={() => { onClear(); reset(); }}
          className="text-red-500 hover:text-red-700 font-medium px-4 py-2 transition-colors"
        >
          Clear Edits
        </button>
        <button type="submit" className="btn-primary">
          Save Question
        </button>
      </div>
    </form>
  );
};
