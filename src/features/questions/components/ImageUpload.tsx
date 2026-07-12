import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Replace } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  label?: string;
  className?: string;
}

export const ImageUpload = ({ value, onChange, label, className }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string>(value || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, GIF, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      onChange?.(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview('');
    onChange?.('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">{label}</label>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img 
            src={preview} 
            alt="Uploaded preview" 
            className="w-full h-40 object-contain bg-white"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button 
              type="button" 
              variant="secondary" 
              size="sm" 
              onClick={handleReplace}
              className="bg-white/90 hover:bg-white text-gray-900"
            >
              <Replace size={14} className="mr-1" />
              Replace
            </Button>
            <Button 
              type="button" 
              variant="danger" 
              size="sm" 
              onClick={handleRemove}
            >
              <X size={14} className="mr-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
            isDragOver 
              ? "border-brand bg-brand/5 scale-[1.02]" 
              : "border-gray-300 hover:border-brand/50 hover:bg-gray-50"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              isDragOver ? "bg-brand/10 text-brand" : "bg-gray-100 text-gray-400"
            )}>
              {isDragOver ? <ImageIcon size={20} /> : <Upload size={20} />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {isDragOver ? 'Drop image here' : 'Click or drag image'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, GIF, WEBP • Max 5MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
