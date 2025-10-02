
import React from 'react';
import Card from '../ui/Card';
import Icon from '../ui/Icon';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isNegative?: boolean;
  icon: any; // Using 'any' to pass icon name string to Icon component
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isNegative = false, icon }) => {
  const changeColor = isNegative ? 'text-danger' : 'text-success';
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="text-2xl font-semibold text-text-default">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${changeColor}`}>{change}</p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Icon name={icon} className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;