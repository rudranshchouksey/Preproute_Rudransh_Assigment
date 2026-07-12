import type { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Input } from '../../components/ui/Input';

interface SchedulingControlsProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors;
}

export const SchedulingControls = ({ register, watch, errors }: SchedulingControlsProps) => {
  const publishMode = watch('publishMode', 'now');
  const liveUntil = watch('liveUntil', 'always');

  const durationOptions = [
    { value: 'always', label: 'Always Available' },
    { value: '1week', label: '1 Week' },
    { value: '2weeks', label: '2 Weeks' },
    { value: '1month', label: '1 Month' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <div className="flex flex-col gap-[30px] w-full">
      {/* Schedule Publish Tabs */}
      <div className="flex w-[329px] h-[50px] bg-white border border-[#D1D5DB] rounded-[12px] items-center px-[10px] gap-[10px]">
        <label 
          className={`flex-1 flex items-center justify-center h-[40px] px-[11px] cursor-pointer rounded-[8px] transition-colors ${
            publishMode === 'now' ? 'bg-[#F8FAFF] font-bold text-[#07013C]' : 'bg-transparent font-normal text-[#9CA3AF]'
          }`}
        >
           <span className="text-[14px]">Publish Now</span>
           <input type="radio" value="now" {...register('publishMode')} className="hidden" />
        </label>
        
        <label 
          className={`flex-1 flex items-center justify-center h-[40px] px-[11px] cursor-pointer rounded-[8px] transition-colors ${
            publishMode === 'schedule' ? 'bg-[#F8FAFF] font-bold text-[#07013C]' : 'bg-transparent font-normal text-[#9CA3AF]'
          }`}
        >
           <span className="text-[14px]">Schedule Publish</span>
           <input type="radio" value="schedule" {...register('publishMode')} className="hidden" />
        </label>
      </div>

      {/* Live Until Section */}
      <div className="flex flex-col gap-[15px]">
        <h3 className="text-[#374151] font-bold text-[16px]">Live Until</h3>
        <p className="text-[#6B7180] font-medium text-[14px]">Choose how long this test should remain available on the platform.</p>
        
        <div className="grid grid-cols-2 gap-y-6 gap-x-12 max-w-[600px] mt-2">
          {durationOptions.map((opt) => (
            <label 
              key={opt.value} 
              className="flex items-center gap-[15px] cursor-pointer"
            >
              <div className="w-[18px] h-[18px] rounded-full border border-[#7489FF] flex items-center justify-center shrink-0">
                 {liveUntil === opt.value && (
                   <div className="w-[10px] h-[10px] rounded-full bg-[#7489FF]"></div>
                 )}
              </div>
              <span className="text-[#374151] text-[14px]">{opt.label}</span>
              <input type="radio" value={opt.value} {...register("liveUntil")} className="hidden" />
            </label>
          ))}
        </div>
      </div>

      {/* Custom Date/Time pickers */}
      <div className="flex items-center gap-[20px] w-full max-w-[600px]">
        <div className="flex-1 relative">
          <Input 
            type="date" 
            {...register('scheduleDate', { required: publishMode === 'schedule' || liveUntil === 'custom' })} 
            error={errors.scheduleDate ? "Required" : undefined}
            placeholder="Select End Date"
            className="w-full h-[48px] text-[#9CA3AF] text-[14px]"
          />
        </div>
        <div className="flex-1 relative">
          <Input 
            type="time" 
            {...register('scheduleTime', { required: publishMode === 'schedule' || liveUntil === 'custom' })} 
            error={errors.scheduleTime ? "Required" : undefined}
            placeholder="Select End Time"
            className="w-full h-[48px] text-[#9CA3AF] text-[14px]"
          />
        </div>
      </div>
    </div>
  );
};
