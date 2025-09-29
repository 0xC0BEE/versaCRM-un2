import React, { useEffect, useState } from 'react';
import Icon from './Icon';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Animate in
    setShow(true);
  }, []);

  const handleClose = () => {
    setShow(false);
    // Allow animation to finish before calling parent onClose
    setTimeout(onClose, 300);
  };

  const baseClasses = 'flex items-center justify-between w-full max-w-sm p-4 text-white rounded-lg shadow-lg';
  const typeClasses = {
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-secondary',
  };

  const icons = {
      success: 'check', // Placeholder, needs check icon
      error: 'close', // Placeholder, needs error icon
      info: 'bell'
  }

  return (
    <div
      className={`${baseClasses} ${typeClasses[type]} transition-all duration-300 ease-in-out transform ${
        show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
      role="alert"
    >
      <div className="flex items-center">
        {/* <Icon name={icons[type]} className="mr-2"/> */}
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button onClick={handleClose} aria-label="Close" className="ml-4 -mr-2 p-1">
        <Icon name="close" className="w-4 h-4"/>
      </button>
    </div>
  );
};

export default Toast;