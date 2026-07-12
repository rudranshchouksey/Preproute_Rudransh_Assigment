import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ConfirmPublishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPublishing: boolean;
  testName: string;
  questionCount: number;
}

export const ConfirmPublishDialog = ({ isOpen, onClose, onConfirm, isPublishing, testName, questionCount }: ConfirmPublishDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Confirm Publish</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            You are about to publish <strong className="text-gray-900">{testName}</strong>. This will make the test available to students.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Test Name</span>
              <span className="font-medium text-gray-900">{testName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Questions</span>
              <span className="font-medium text-gray-900">{questionCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status Change</span>
              <span className="font-medium text-green-600">Draft → Live</span>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            This action can be reversed by unpublishing the test later.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <Button variant="ghost" onClick={onClose} disabled={isPublishing}>
            Cancel
          </Button>
          <Button onClick={onConfirm} isLoading={isPublishing}>
            Confirm & Publish
          </Button>
        </div>
      </div>
    </div>
  );
};
