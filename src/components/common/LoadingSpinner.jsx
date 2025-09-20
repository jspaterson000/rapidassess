import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Reusable loading spinner component
 */
export default function LoadingSpinner({ 
  size = 'default', 
  className = '', 
  text = null,
  fullScreen = false 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const spinner = (
    <div className={cn(
      'flex items-center justify-center',
      fullScreen && 'min-h-screen',
      className
    )}>
      <div className="text-center">
        <Loader2 className={cn(
          'animate-spin text-slate-400 mx-auto',
          sizeClasses[size]
        )} />
        {text && (
          <p className="mt-2 text-sm text-slate-600">{text}</p>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-50 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * Loading skeleton component
 */
export function LoadingSkeleton({ className = '', lines = 1 }) {
  return (
    <div className={cn('animate-pulse space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index}
          className="h-4 bg-slate-200 rounded"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Card loading skeleton
 */
export function LoadingCard({ className = '' }) {
  return (
    <div className={cn(
      'bg-white rounded-lg border border-slate-200 p-6 animate-pulse',
      className
    )}>
      <div className="space-y-4">
        <div className="h-6 bg-slate-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-slate-200 rounded w-20" />
          <div className="h-8 bg-slate-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table loading skeleton
 */
export function LoadingTable({ rows = 5, columns = 4 }) {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-200">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="h-4 bg-slate-200 rounded" />
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 border-b border-slate-100 last:border-b-0">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className="h-4 bg-slate-200 rounded"
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}