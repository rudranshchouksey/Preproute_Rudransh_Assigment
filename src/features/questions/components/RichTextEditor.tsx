import { 
  Bold, Italic, Underline, List, AlignLeft, 
  AlignCenter, AlignRight, Link, Image as ImageIcon, 
  Undo, Redo, FunctionSquare 
} from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '../../../lib/utils';

interface RichTextEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label: string;
}

export const RichTextEditor = forwardRef<HTMLTextAreaElement, RichTextEditorProps>(
  ({ error, label, className, ...props }, ref) => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
        
        <div className={cn(
          "bg-white border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all",
          error ? "border-red-300 focus-within:ring-red-500/20 focus-within:border-red-500" : "border-gray-200"
        )}>
          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-gray-50/50 flex-wrap">
            <ToolbarButton icon={<Bold size={16} />} title="Bold" />
            <ToolbarButton icon={<Italic size={16} />} title="Italic" />
            <ToolbarButton icon={<Underline size={16} />} title="Underline" />
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <ToolbarButton icon={<List size={16} />} title="Bulleted List" />
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <ToolbarButton icon={<AlignLeft size={16} />} title="Align Left" />
            <ToolbarButton icon={<AlignCenter size={16} />} title="Align Center" />
            <ToolbarButton icon={<AlignRight size={16} />} title="Align Right" />
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <ToolbarButton icon={<Link size={16} />} title="Insert Link" />
            <ToolbarButton icon={<ImageIcon size={16} />} title="Insert Image" />
            <ToolbarButton icon={<FunctionSquare size={16} />} title="Insert Math Equation" />
            <div className="flex-1"></div>
            <ToolbarButton icon={<Undo size={16} />} title="Undo" />
            <ToolbarButton icon={<Redo size={16} />} title="Redo" />
          </div>
          
          {/* Editor Area */}
          <textarea
            ref={ref}
            className={cn(
              "w-full p-4 text-gray-700 bg-transparent border-none focus:ring-0 resize-y min-h-[160px] text-base placeholder-gray-400",
              className
            )}
            {...props}
          />
        </div>
        
        {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

const ToolbarButton = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <button 
    type="button" 
    title={title}
    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
  >
    {icon}
  </button>
);
