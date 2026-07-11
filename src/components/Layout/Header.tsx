import { Bell, User } from 'lucide-react';

export const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 shadow-sm shrink-0 sticky top-0 z-20">
      <div className="flex items-center space-x-6">
        <button className="text-gray-400 hover:text-brand transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="w-px h-6 bg-gray-200"></div>
        
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="w-9 h-9 bg-brand/10 rounded-full flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-colors">
            <User size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-secondary">Alex Wando</span>
            <span className="text-xs text-gray-500 font-medium">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
