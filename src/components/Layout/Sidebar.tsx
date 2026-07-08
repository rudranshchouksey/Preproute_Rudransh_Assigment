import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus2, ListChecks } from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Test Creation', path: '/test/create', icon: <FilePlus2 size={20} /> },
    { name: 'Test Tracking', path: '/test/tracking', icon: <ListChecks size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-brand">Preproute</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 font-medium ${
                isActive
                  ? 'bg-brand/10 text-brand'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-secondary'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        © 2026 Preproute
      </div>
    </aside>
  );
};
