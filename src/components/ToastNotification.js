import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Bell, TrendingUp } from 'lucide-react';

const ToastNotification = ({ id, message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300); // Allow time for exit animation
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Allow time for exit animation
  };
  
  // Get styles based on notification type
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          containerClass: 'bg-green-500 border-green-600',
          icon: <CheckCircle size={20} className="text-white" />,
          textClass: 'text-white'
        };
      case 'error':
        return {
          containerClass: 'bg-red-500 border-red-600',
          icon: <AlertCircle size={20} className="text-white" />,
          textClass: 'text-white'
        };
      case 'warning':
        return {
          containerClass: 'bg-yellow-500 border-yellow-600',
          icon: <AlertCircle size={20} className="text-white" />,
          textClass: 'text-white'
        };
      case 'trade':
        return {
          containerClass: 'bg-indigo-600 border-indigo-700',
          icon: <TrendingUp size={20} className="text-white" />,
          textClass: 'text-white font-medium'
        };
      case 'info':
      default:
        return {
          containerClass: 'bg-blue-500 border-blue-600',
          icon: <Bell size={20} className="text-white" />,
          textClass: 'text-white'
        };
    }
  };
  
  const { containerClass, icon, textClass } = getTypeStyles();
  
  return (
    <div 
      className={`relative flex items-center p-3 pr-8 rounded-md shadow-lg border max-w-md transition-opacity duration-300 ${containerClass} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      role="alert"
    >
      <div className="mr-3">
        {icon}
      </div>
      <div className={`${textClass} text-sm`}>{message}</div>
      <button 
        onClick={handleClose}
        className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ToastNotification; 