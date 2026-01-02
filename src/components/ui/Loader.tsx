import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', text, className }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-primary/30 border-t-primary',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
};

export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <Loader size="lg" text={text} />
  </div>
);

export const TableLoader: React.FC = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-12 bg-muted/50 rounded-md animate-pulse" />
    ))}
  </div>
);

export const CardLoader: React.FC = () => (
  <div className="p-6 bg-card rounded-lg border border-border animate-pulse">
    <div className="h-4 bg-muted rounded w-3/4 mb-4" />
    <div className="h-4 bg-muted rounded w-1/2 mb-2" />
    <div className="h-4 bg-muted rounded w-2/3" />
  </div>
);
