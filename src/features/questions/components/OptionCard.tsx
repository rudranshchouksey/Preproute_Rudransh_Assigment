import { UseFormRegister } from 'react-hook-form';
import { cn } from '../../../lib/utils';
import type { QuestionDraft } from '../types';

interface OptionCardProps {
  index: number;
  isSelected: boolean;
  register: UseFormRegister<QuestionDraft>;
}

export const OptionCard: React.FC<OptionCardProps> = ({ index, isSelected, register }) => {
  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
  const value = (index + 1).toString();

  return (
    <label 
      className={cn(
        "flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group",
        isSelected 
          ? "border-brand bg-brand/5 shadow-sm" 
          : "border-gray-200 bg-white hover:border-brand/40 hover:bg-gray-50"
      )}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="radio"
          value={value}
          {...register('correctOptionId')}
          className="peer sr-only"
        />
        <div className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          isSelected ? "border-brand" : "border-gray-300 group-hover:border-brand/50"
        )}>
          {isSelected && <div className="w-3 h-3 bg-brand rounded-full"></div>}
        </div>
      </div>
      
      <div className="flex-1 flex items-center space-x-3">
        <span className={cn("font-semibold", isSelected ? "text-brand" : "text-gray-400 group-hover:text-gray-500")}>
          Option {optionLabel}
        </span>
        <div className="w-px h-4 bg-gray-200"></div>
        <input
          type="text"
          {...register(`options.${index}.text` as const, { required: 'Option text is required' })}
          className="w-full bg-transparent border-none focus:ring-0 text-base p-0 text-gray-800 placeholder-gray-400 font-medium"
          placeholder={`Enter option ${optionLabel} text...`}
        />
      </div>
    </label>
  );
};
