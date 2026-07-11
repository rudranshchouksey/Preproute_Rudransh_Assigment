import { UseFormRegister } from 'react-hook-form';
import type { QuestionDraft } from '../types';

interface PropertiesSidebarProps {
  register: UseFormRegister<QuestionDraft>;
}

export const PropertiesSidebar: React.FC<PropertiesSidebarProps> = ({ register }) => {
  return (
    <aside className="w-full lg:w-80 bg-white border-l border-gray-200 flex flex-col h-full shrink-0 shadow-sm z-10 hidden lg:flex">
      <div className="p-5 border-b border-gray-100 bg-white z-10 shrink-0">
        <h3 className="font-semibold text-gray-900 text-lg">Properties</h3>
        <p className="text-sm text-gray-500 mt-1 font-medium">Configure question details</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
        {/* Topic & SubTopic */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
            <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5 outline-none">
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Mathematics</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Topic (Optional)</label>
            <input
              type="text"
              {...register('topicId')}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5 outline-none"
              placeholder="e.g., Kinematics"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sub-Topic (Optional)</label>
            <input
              type="text"
              {...register('subTopicId')}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5 outline-none"
              placeholder="e.g., Motion in 1D"
            />
          </div>
        </div>

        <div className="h-px bg-gray-100"></div>

        {/* Difficulty & Type */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Difficulty (Optional)</label>
            <select {...register('difficulty')} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5 outline-none">
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="difficult">Difficult</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Question Type</label>
            <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5 outline-none">
              <option>Multiple Choice (Single Correct)</option>
              <option>Multiple Choice (Multiple Correct)</option>
              <option>Numerical</option>
            </select>
          </div>
        </div>

        <div className="h-px bg-gray-100"></div>

        {/* Scoring & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Marks</label>
            <input type="number" defaultValue={4} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">-ve Marks</label>
            <input type="number" defaultValue={1} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5 outline-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Duration (Secs)</label>
            <input type="number" defaultValue={60} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5 outline-none" />
          </div>
        </div>

        <div className="h-px bg-gray-100"></div>

        {/* Media & Explanation */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Media URL (Optional)</label>
            <input
              type="url"
              {...register('mediaUrl')}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5 outline-none"
              placeholder="https://..."
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Explanation (Optional)</label>
            <textarea
              {...register('explanation')}
              rows={4}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5 outline-none resize-none"
              placeholder="Explain the answer..."
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
