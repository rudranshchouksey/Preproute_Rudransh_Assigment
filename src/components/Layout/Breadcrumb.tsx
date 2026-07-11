import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <div className="flex items-center text-sm mb-6 flex-wrap gap-y-2">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={16} className="text-gray-400 mx-2 shrink-0" />}
            {isLast ? (
              <span className="text-gray-900 font-semibold bg-gray-100 px-2 py-1 rounded-md">{item.label}</span>
            ) : item.href ? (
              <Link to={item.href} className="text-gray-500 font-medium hover:text-gray-700 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-500 font-medium">{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
