import type { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

interface SchedulingControlsProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors;
}

export const SchedulingControls = ({ register, watch, errors }: SchedulingControlsProps) => {
  const publishMode = watch('publishMode', 'now');

  const durationOptions = [
    { value: 'always', label: 'Always Available' },
    { value: '1week', label: '1 Week' },
    { value: '2weeks', label: '2 Weeks' },
    { value: '3weeks', label: '3 Weeks' },
    { value: '1month', label: '1 Month' },
    { value: 'custom', label: 'Custom Duration' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3">Publish Timing</Label>
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <label className={`flex-1 text-center py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
            publishMode === 'now' ? 'bg-white shadow-sm text-brand' : 'text-gray-500 hover:text-gray-900'
          }`}>
            <input type="radio" value="now" {...register('publishMode')} className="hidden" />
            Publish Now
          </label>
          <label className={`flex-1 text-center py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
            publishMode === 'schedule' ? 'bg-white shadow-sm text-brand' : 'text-gray-500 hover:text-gray-900'
          }`}>
            <input type="radio" value="schedule" {...register('publishMode')} className="hidden" />
            Schedule Publish
          </label>
        </div>
      </div>

      {publishMode === 'schedule' && (
        <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <Label className="text-xs text-gray-500 uppercase tracking-wider mb-2">Select Date</Label>
            <Input 
              type="date" 
              {...register('scheduleDate', { required: publishMode === 'schedule' })} 
              error={errors.scheduleDate ? "Required" : undefined}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500 uppercase tracking-wider mb-2">Select Time</Label>
            <Input 
              type="time" 
              {...register('scheduleTime', { required: publishMode === 'schedule' })} 
              error={errors.scheduleTime ? "Required" : undefined}
            />
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-100">
        <Label className="mb-3">Live Until (Duration limit)</Label>
        <div className="grid grid-cols-2 gap-3">
          {durationOptions.map((opt) => (
            <label key={opt.value} className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="radio"
                value={opt.value}
                {...register("liveUntil")}
                className="text-brand focus:ring-brand h-4 w-4 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
