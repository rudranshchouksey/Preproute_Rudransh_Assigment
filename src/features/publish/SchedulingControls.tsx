import type { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';

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
        <label className="block text-sm font-semibold text-secondary mb-3">Publish Timing</label>
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <label className={`flex-1 text-center py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
            publishMode === 'now' ? 'bg-white shadow-sm text-brand' : 'text-gray-500 hover:text-secondary'
          }`}>
            <input type="radio" value="now" {...register('publishMode')} className="hidden" />
            Publish Now
          </label>
          <label className={`flex-1 text-center py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
            publishMode === 'schedule' ? 'bg-white shadow-sm text-brand' : 'text-gray-500 hover:text-secondary'
          }`}>
            <input type="radio" value="schedule" {...register('publishMode')} className="hidden" />
            Schedule Publish
          </label>
        </div>
      </div>

      {publishMode === 'schedule' && (
        <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Select Date</label>
            <input 
              type="date" 
              {...register('scheduleDate', { required: publishMode === 'schedule' })} 
              className={`input-field ${errors.scheduleDate ? 'border-red-500' : ''}`} 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Select Time</label>
            <input 
              type="time" 
              {...register('scheduleTime', { required: publishMode === 'schedule' })} 
              className={`input-field ${errors.scheduleTime ? 'border-red-500' : ''}`} 
            />
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-100">
        <label className="block text-sm font-semibold text-secondary mb-3">Live Until (Duration limit)</label>
        <div className="grid grid-cols-2 gap-3">
          {durationOptions.map((opt) => (
            <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value={opt.value}
                {...register("liveUntil")}
                className="text-brand focus:ring-brand h-4 w-4 border-gray-300"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
