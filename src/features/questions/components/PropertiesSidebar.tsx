import { UseFormRegister, Control, UseFormSetValue, Controller } from 'react-hook-form';
import type { QuestionDraft } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';
import { ImageUpload } from './ImageUpload';

interface PropertiesSidebarProps {
  register: UseFormRegister<QuestionDraft>;
  control?: Control<QuestionDraft>;
  setValue?: UseFormSetValue<QuestionDraft>;
}

export const PropertiesSidebar: React.FC<PropertiesSidebarProps> = ({ register, control }) => {
  return (
    <aside className="w-full h-full flex flex-col hidden lg:flex">
      <div className="p-5 border-b border-gray-200 bg-gray-50/50 z-10 shrink-0">
        <h3 className="font-semibold text-gray-900 text-lg">Properties</h3>
        <p className="text-sm text-gray-500 mt-1 font-medium">Configure question details</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {/* Topic & SubTopic */}
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-gray-500 mb-2">Topic (Optional)</Label>
            <Input
              type="text"
              {...register('topicId')}
              placeholder="e.g., Kinematics"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-gray-500 mb-2">Sub-Topic (Optional)</Label>
            <Input
              type="text"
              {...register('subTopicId')}
              placeholder="e.g., Motion in 1D"
            />
          </div>
        </div>

        <div className="h-px bg-gray-200"></div>

        {/* Difficulty & Type */}
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-gray-500 mb-2">Difficulty (Optional)</Label>
            <Select {...register('difficulty')}>
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="difficult">Difficult</option>
            </Select>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-gray-500 mb-2">Question Type</Label>
            <Select>
              <option>Multiple Choice (Single Correct)</option>
              <option>Multiple Choice (Multiple Correct)</option>
              <option>Numerical</option>
            </Select>
          </div>
        </div>

        <div className="h-px bg-gray-200"></div>

        {/* Scoring & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-gray-500 mb-2">Marks</Label>
            <Input type="number" defaultValue={4} />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-gray-500 mb-2">-ve Marks</Label>
            <Input type="number" defaultValue={1} />
          </div>
          <div className="col-span-2">
            <Label className="text-xs uppercase tracking-wider text-gray-500 mb-2">Duration (Secs)</Label>
            <Input type="number" defaultValue={60} />
          </div>
        </div>

        <div className="h-px bg-gray-200"></div>

        {/* Media Upload */}
        <div className="space-y-4">
          <div>
            {control ? (
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
            ) : (
              <>
                <Label className="text-xs uppercase tracking-wider text-gray-500 mb-2">Media URL (Optional)</Label>
                <Input
                  type="url"
                  {...register('mediaUrl')}
                  placeholder="https://..."
                />
              </>
            )}
          </div>
          
          <div>
            <Label className="text-xs uppercase tracking-wider text-gray-500 mb-2">Explanation (Optional)</Label>
            <Textarea
              {...register('explanation')}
              placeholder="Explain the answer..."
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
