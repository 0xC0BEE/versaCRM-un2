
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, actions }) => {
  return (
    <div className={`bg-bg-card shadow-sm rounded-lg border border-border-default ${className}`}>
        {(title || actions) && (
            <div className="p-4 border-b border-border-default flex justify-between items-center">
                {title && <h3 className="text-lg font-semibold text-text-default">{title}</h3>}
                {actions && <div className="flex items-center space-x-2">{actions}</div>}
            </div>
        )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;