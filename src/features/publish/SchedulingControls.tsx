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
    <div className="flex flex-col gap-[30px] w-[1160px]">
      
      {/* Live Until Section */}
      <div className="flex flex-col gap-[15px]">
        <h3 className="text-[#374151] font-bold text-[16px]">Live Until</h3>
        <p className="text-[#6B7180] font-medium text-[16px]">Choose how long this test should remain available on the platform.</p>
        
        <div className="grid grid-cols-2 gap-[10px]">
          {durationOptions.map((opt) => (
            <label 
              key={opt.value} 
              className={`flex items-center w-[575px] h-[48px] px-5 gap-[15px] cursor-pointer bg-white border ${
                liveUntil === opt.value ? 'border-[#7489FF]' : 'border-transparent'
              } transition-colors`}
            >
              <div className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0">
                 {liveUntil === opt.value ? (
                   <div className="w-4 h-4 rounded-full bg-[#7489FF]"></div>
                 ) : (
                   <div className="w-4 h-4 rounded-full bg-[#D9D9D9]"></div>
                 )}
              </div>
              
              <div className="flex items-center gap-2">
                 <div className="flex items-center justify-center bg-[#A8CDFC] rounded-full w-6 h-6">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="white"/>
                   </svg>
                 </div>
                 <span className="text-[#374151] text-[14px]">{opt.label}</span>
              </div>
              <input type="radio" value={opt.value} {...register("liveUntil")} className="hidden" />
            </label>
          ))}
        </div>
      </div>

      {/* Schedule Publish Section */}
      <div className="flex flex-col gap-[15px]">
        <h3 className="text-[#374151] font-bold text-[16px]">Schedule Publish</h3>
        <p className="text-[#6B7180] font-medium text-[16px]">Select the date and time when the test should go live.</p>
        
        <div className="grid grid-cols-2 gap-[10px]">
          {/* Publish Now */}
          <label 
            className={`flex items-center w-[575px] h-[48px] px-5 gap-[15px] cursor-pointer bg-white border ${
              publishMode === 'now' ? 'border-[#7489FF]' : 'border-transparent'
            } transition-colors`}
          >
            <div className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0">
               {publishMode === 'now' ? (
                 <div className="w-4 h-4 rounded-full bg-[#7489FF]"></div>
               ) : (
                 <div className="w-4 h-4 rounded-full bg-[#D9D9D9]"></div>
               )}
            </div>
            <div className="flex items-center gap-2">
                 <div className="flex items-center justify-center bg-[#A8CDFC] rounded-full w-6 h-6">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="white"/>
                   </svg>
                 </div>
                 <span className="text-[#374151] text-[14px]">Publish Now</span>
            </div>
            <input type="radio" value="now" {...register('publishMode')} className="hidden" />
          </label>

          {/* Schedule Publish */}
          <label 
            className={`flex items-center w-[575px] h-[48px] px-5 gap-[15px] cursor-pointer bg-white border ${
              publishMode === 'schedule' ? 'border-[#7489FF]' : 'border-transparent'
            } transition-colors`}
          >
            <div className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0">
               {publishMode === 'schedule' ? (
                 <div className="w-4 h-4 rounded-full bg-[#7489FF]"></div>
               ) : (
                 <div className="w-4 h-4 rounded-full bg-[#D9D9D9]"></div>
               )}
            </div>
            <div className="flex items-center gap-2">
                 <div className="flex items-center justify-center bg-[#A8CDFC] rounded-full w-6 h-6">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="white"/>
                   </svg>
                 </div>
                 <span className="text-[#374151] text-[14px]">Schedule Publish</span>
            </div>
            <input type="radio" value="schedule" {...register('publishMode')} className="hidden" />
          </label>
        </div>

        {/* Custom Date/Time pickers */}
        {publishMode === 'schedule' && (
          <div className="grid grid-cols-2 gap-[10px] mt-4 w-[1160px]">
            <div>
              <p className="text-[#6B7180] text-[12px] mb-2 font-medium">Schedule Date</p>
              <Input 
                type="date" 
                {...register('scheduleDate', { required: publishMode === 'schedule' })} 
                error={errors.scheduleDate ? "Required" : undefined}
                className="w-[575px]"
              />
            </div>
            <div>
              <p className="text-[#6B7180] text-[12px] mb-2 font-medium">Schedule Time</p>
              <Input 
                type="time" 
                {...register('scheduleTime', { required: publishMode === 'schedule' })} 
                error={errors.scheduleTime ? "Required" : undefined}
                className="w-[575px]"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
