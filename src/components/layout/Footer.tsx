import React from 'react';
import { Leaf } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="px-4 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Leaf className="w-4 h-4 text-tobacco-leaf" />
            <span className="text-sm">
              © {currentYear} Ratenta Tobacco Management System
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Version 1.0.0</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">All rights reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
