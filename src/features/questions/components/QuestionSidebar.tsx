import { CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import type { QuestionDraft } from '../types';

interface QuestionSidebarProps {
  questions: QuestionDraft[];
  activeIndex: number;
  numQuestions: number;
  onSelect: (index: number) => void;
  variant?: 'default' | 'minimal';
}

export const QuestionSidebar: React.FC<QuestionSidebarProps> = ({
  questions,
  activeIndex,
  numQuestions,
  onSelect,
  variant = 'default',
}) => {
  const completedCount = questions.filter((q) => q !== null).length;

  if (variant === 'minimal') {
    return (
      <div className="w-full flex flex-col h-[calc(100vh-300px)] overflow-y-auto no-scrollbar pr-2">
        <div className="flex flex-col gap-2">
          {questions.map((q, idx) => {
            const isActive = activeIndex === idx;
            const isCompleted = q !== null;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelect(idx)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 border rounded-lg bg-white transition-all",
                  isActive
                    ? "border-[#5984F7] shadow-sm bg-blue-50/30"
                    : isCompleted
                      ? "border-[#0C9D61]"
                      : "border-gray-200"
                )}
              >
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle2 size={14} className={isActive ? "text-[#5984F7]" : "text-[#0C9D61]"} fill="currentColor" stroke="white" />
                  ) : (
                    <div className="w-[14px] h-[14px] rounded-full border border-gray-300" />
                  )}
                  <span className={cn(
                    "text-[12px] font-medium",
                    isActive ? "text-[#5984F7]" : isCompleted ? "text-[#0C9D61]" : "text-gray-500"
                  )}>
                    Question {idx + 1}
                  </span>
                </div>
                <ChevronRight size={14} className={isActive ? "text-[#5984F7]" : isCompleted ? "text-[#0C9D61]" : "text-gray-300"} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default Variant
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
