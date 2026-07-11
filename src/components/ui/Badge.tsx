import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand' | 'outline';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-gray-100 text-gray-700 border-gray-200",
      success: "bg-green-100 text-green-700 border-green-200",
      warning: "bg-orange-100 text-orange-800 border-orange-200",
      danger: "bg-red-100 text-red-700 border-red-200",
      brand: "bg-brand/10 text-brand border-brand/20",
      outline: "bg-transparent text-gray-600 border-gray-300",
    };

    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand", variants[variant], className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
