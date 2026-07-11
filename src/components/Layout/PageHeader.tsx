import React from 'react';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';

interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ breadcrumbs, title, description, action }) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
        {title && <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>}
        {description && <p className="text-gray-500 mt-1.5 font-medium">{description}</p>}
      </div>
      {action && (
        <div className="flex items-center shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};
