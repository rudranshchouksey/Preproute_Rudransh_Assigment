import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus2, ListChecks, Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Test Creation', path: '/test/create', icon: <FilePlus2 size={20} /> },
    { name: 'Test Tracking', path: '/test/tracking', icon: <ListChecks size={20} /> },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-md shadow-sm border border-gray-200 text-gray-600"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu size={20} />
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm transition-transform duration-300 lg:static lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
          <h1 className="text-2xl font-bold text-brand">Preproute</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium group",
                  isActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <div className="transition-transform group-hover:scale-110">
                {item.icon}
              </div>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 shrink-0">
          <div className="px-4 py-3 bg-gray-50 rounded-xl text-center">
            <p className="text-xs font-semibold text-gray-900">Preproute Admin</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Version 2.0.1</p>
          </div>
        </div>
      </aside>
    </>
  );
};
