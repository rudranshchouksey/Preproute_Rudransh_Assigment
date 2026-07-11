import { CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import type { QuestionDraft } from '../types';

interface QuestionSidebarProps {
  questions: QuestionDraft[];
  activeIndex: number;
  numQuestions: number;
  onSelect: (index: number) => void;
}

export const QuestionSidebar: React.FC<QuestionSidebarProps> = ({
  questions,
  activeIndex,
  numQuestions,
  onSelect,
}) => {
  const completedCount = questions.filter((q) => q !== null).length;

  return (
    <aside className="w-full md:w-72 bg-white border-r border-gray-200 flex flex-col h-48 md:h-full shrink-0 shadow-sm z-10 border-b md:border-b-0">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-lg">Question Creation</h3>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          {completedCount} of {numQuestions} Completed
        </p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <motion.div 
            className="h-full bg-brand"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / numQuestions) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        {questions.map((q, idx) => {
          const isActive = activeIndex === idx;
          const isCompleted = q !== null;

          return (
            <motion.button
              key={idx}
              onClick={() => onSelect(idx)}
              whileHover={{ scale: isActive ? 1 : 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-200 border",
                isActive
                  ? "bg-brand text-white border-brand shadow-md"
                  : "bg-white text-gray-600 hover:border-gray-300 border-transparent hover:bg-gray-50"
              )}
            >
              <div className="flex items-center space-x-3">
                {isCompleted ? (
                  <CheckCircle2
                    size={18}
                    className={cn(isActive ? "text-white" : "text-brand")}
                  />
                ) : (
                  <div className={cn("w-[18px] h-[18px] rounded-full border-2", isActive ? "border-white/50" : "border-gray-300")} />
                )}
                <span className={cn("font-medium text-sm", isActive ? "text-white" : "text-gray-700")}>
                  Question {idx + 1}
                </span>
              </div>
              <ChevronRight
                size={16}
                className={cn(isActive ? "text-white/80" : "text-gray-400")}
              />
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
};
