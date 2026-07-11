import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

interface MarkingSchemeProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export const MarkingScheme = ({ register, errors }: MarkingSchemeProps) => {
  return (
    <div className="w-full">
      <Label className="mb-2">Marking Scheme</Label>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label className="text-xs text-gray-500">Correct (+)</Label>
          <Input
            type="number"
            {...register("markingCorrect", { required: true, valueAsNumber: true })}
            defaultValue={5}
            error={errors.markingCorrect ? "Required" : undefined}
          />
        </div>
        <div className="flex-1">
          <Label className="text-xs text-gray-500">Wrong (-)</Label>
          <Input
            type="number"
            {...register("markingWrong", { required: true, valueAsNumber: true })}
            defaultValue={-1}
            error={errors.markingWrong ? "Required" : undefined}
          />
        </div>
        <div className="flex-1">
          <Label className="text-xs text-gray-500">Unattempted</Label>
          <Input
            type="number"
            {...register("markingUnattempted", { required: true, valueAsNumber: true })}
            defaultValue={0}
            error={errors.markingUnattempted ? "Required" : undefined}
          />
        </div>
      </div>
    </div>
  );
};
