import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  // FIX: Added helperText prop to support hints or extra information.
  helperText?: string;
}

const Input: React.FC<InputProps> = ({ label, id, className, helperText, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>}
      <input
        id={id}
        className={`w-full px-3 py-2 border border-border-default rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-bg-card ${className}`}
        {...props}
      />
      {helperText && <p className="text-xs text-text-secondary mt-1">{helperText}</p>}
    </div>
  );
};

export default Input;