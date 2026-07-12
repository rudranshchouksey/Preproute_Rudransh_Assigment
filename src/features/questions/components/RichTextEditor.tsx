import { 
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link, Image as ImageIcon, 
  Undo, Redo, Code, Quote, Table
} from 'lucide-react';
import { useRef, useEffect, useCallback } from 'react';
import { cn } from '../../../lib/utils';

interface RichTextEditorProps {
  error?: string;
  label: string;
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor = ({ error, label, value, onChange, placeholder, className }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value into the editor only when it actually changes from outside
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (editorRef.current && value !== undefined) {
      // Only update DOM if the HTML content is actually different
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      isInternalChange.current = true;
      const html = editorRef.current.innerHTML;
      // Treat empty or whitespace-only as empty
      const cleaned = html === '<br>' || html === '<div><br></div>' ? '' : html;
      onChange(cleaned);
    }
  }, [onChange]);

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleBold = () => exec('bold');
  const handleItalic = () => exec('italic');
  const handleUnderline = () => exec('underline');
  const handleStrikethrough = () => exec('strikeThrough');
  const handleUnorderedList = () => exec('insertUnorderedList');
  const handleOrderedList = () => exec('insertOrderedList');
  const handleAlignLeft = () => exec('justifyLeft');
  const handleAlignCenter = () => exec('justifyCenter');
  const handleAlignRight = () => exec('justifyRight');
  const handleUndo = () => exec('undo');
  const handleRedo = () => exec('redo');

  const handleLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) exec('createLink', url);
  };

  const handleImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) exec('insertImage', url);
  };

  const handleCode = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      if (selectedText) {
        const code = document.createElement('code');
        code.style.backgroundColor = '#f3f4f6';
        code.style.padding = '2px 6px';
        code.style.borderRadius = '4px';
        code.style.fontFamily = 'monospace';
        code.style.fontSize = '0.9em';
        code.textContent = selectedText;
        range.deleteContents();
        range.insertNode(code);
        handleInput();
      }
    }
  };

  const handleBlockQuote = () => {
    exec('formatBlock', 'blockquote');
  };

  const handleTable = () => {
    const rows = window.prompt('Number of rows:', '3');
    const cols = window.prompt('Number of columns:', '3');
    if (rows && cols) {
      const r = parseInt(rows, 10);
      const c = parseInt(cols, 10);
      if (r > 0 && c > 0 && r <= 20 && c <= 10) {
        let tableHtml = '<table style="border-collapse:collapse;width:100%;margin:8px 0">';
        for (let i = 0; i < r; i++) {
          tableHtml += '<tr>';
          for (let j = 0; j < c; j++) {
            const tag = i === 0 ? 'th' : 'td';
            tableHtml += `<${tag} style="border:1px solid #d1d5db;padding:8px;text-align:left">${i === 0 ? `Header ${j + 1}` : ''}</${tag}>`;
          }
          tableHtml += '</tr>';
        }
        tableHtml += '</table><p><br></p>';
        exec('insertHTML', tableHtml);
      }
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
      
      <div className={cn(
        "bg-white border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all",
        error ? "border-red-300 focus-within:ring-red-500/20 focus-within:border-red-500" : "border-gray-200"
      )}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-gray-50/50 flex-wrap">
          <ToolbarButton icon={<Bold size={16} />} title="Bold" onClick={handleBold} />
          <ToolbarButton icon={<Italic size={16} />} title="Italic" onClick={handleItalic} />
          <ToolbarButton icon={<Underline size={16} />} title="Underline" onClick={handleUnderline} />
          <ToolbarButton icon={<Strikethrough size={16} />} title="Strikethrough" onClick={handleStrikethrough} />
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <ToolbarButton icon={<List size={16} />} title="Bulleted List" onClick={handleUnorderedList} />
          <ToolbarButton icon={<ListOrdered size={16} />} title="Ordered List" onClick={handleOrderedList} />
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <ToolbarButton icon={<AlignLeft size={16} />} title="Align Left" onClick={handleAlignLeft} />
          <ToolbarButton icon={<AlignCenter size={16} />} title="Align Center" onClick={handleAlignCenter} />
          <ToolbarButton icon={<AlignRight size={16} />} title="Align Right" onClick={handleAlignRight} />
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <ToolbarButton icon={<Link size={16} />} title="Insert Link" onClick={handleLink} />
          <ToolbarButton icon={<ImageIcon size={16} />} title="Insert Image" onClick={handleImage} />
          <ToolbarButton icon={<Code size={16} />} title="Insert Code" onClick={handleCode} />
          <ToolbarButton icon={<Quote size={16} />} title="Block Quote" onClick={handleBlockQuote} />
          <ToolbarButton icon={<Table size={16} />} title="Insert Table" onClick={handleTable} />
          <div className="flex-1"></div>
          <ToolbarButton icon={<Undo size={16} />} title="Undo" onClick={handleUndo} />
          <ToolbarButton icon={<Redo size={16} />} title="Redo" onClick={handleRedo} />
        </div>
        
        {/* Contenteditable Editor Area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleInput}
          data-placeholder={placeholder || 'Start typing...'}
          className={cn(
            "w-full p-4 text-gray-700 bg-transparent border-none focus:ring-0 focus:outline-none min-h-[160px] text-base",
            "prose prose-sm max-w-none",
            "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400 [&:empty]:before:pointer-events-none",
            "[&_blockquote]:border-l-4 [&_blockquote]:border-brand/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-2",
            "[&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm",
            "[&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2",
            "[&_a]:text-brand [&_a]:underline",
            "[&_table]:border-collapse [&_table]:w-full [&_th]:bg-gray-50 [&_th]:font-semibold",
            className
          )}
        />
      </div>
      
      {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
};

RichTextEditor.displayName = 'RichTextEditor';

const ToolbarButton = ({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick?: () => void }) => (
  <button 
    type="button" 
    title={title}
    onClick={onClick}
    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
  >
    {icon}
  </button>
);
