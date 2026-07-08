import type { UseFormRegister, FieldErrors } from 'react-hook-form';

interface MarkingSchemeProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export const MarkingScheme = ({ register, errors }: MarkingSchemeProps) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-secondary mb-2">
        Marking Scheme
      </label>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Correct (+)</label>
          <input
            type="number"
            {...register("markingCorrect", { required: true, valueAsNumber: true })}
            defaultValue={5}
            className={`input-field ${errors.markingCorrect ? 'border-red-500' : ''}`}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Wrong (-)</label>
          <input
            type="number"
            {...register("markingWrong", { required: true, valueAsNumber: true })}
            defaultValue={-1}
            className={`input-field ${errors.markingWrong ? 'border-red-500' : ''}`}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Unattempted</label>
          <input
            type="number"
            {...register("markingUnattempted", { required: true, valueAsNumber: true })}
            defaultValue={0}
            className={`input-field ${errors.markingUnattempted ? 'border-red-500' : ''}`}
          />
        </div>
      </div>
    </div>
  );
};
