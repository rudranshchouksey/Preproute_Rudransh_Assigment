import { ChevronRight, Bell, User, Globe } from 'lucide-react';

interface TopHeaderProps {
  onPublish?: () => void;
  isPublishing?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onPublish, isPublishing }) => {
  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center text-sm">
        <span className="text-gray-500 font-medium hover:text-gray-700 cursor-pointer transition-colors">Test Creation</span>
        <ChevronRight size={16} className="text-gray-400 mx-2" />
        <span className="text-gray-500 font-medium hover:text-gray-700 cursor-pointer transition-colors">Create Test</span>
        <ChevronRight size={16} className="text-gray-400 mx-2" />
        <span className="text-gray-900 font-semibold bg-gray-100 px-2 py-1 rounded-md">Chapter Wise</span>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={onPublish}
          disabled={isPublishing}
          className="flex items-center space-x-2 bg-brand text-white px-4 py-2 rounded-full font-medium text-sm hover:bg-brand-dark transition-all duration-200 shadow hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPublishing ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          ) : (
            <Globe size={16} />
          )}
          <span>Publish</span>
        </button>
        
        <div className="w-px h-6 bg-gray-200 mx-2"></div>
        
        <button className="text-gray-500 hover:text-brand transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <button className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:border-brand hover:text-brand transition-colors">
          <User size={18} />
        </button>
      </div>
    </header>
  );
};
