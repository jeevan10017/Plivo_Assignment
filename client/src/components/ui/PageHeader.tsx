import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
}) => {
  return (
    <div className=" ">
      <div className="px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 max-w-2xl">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};