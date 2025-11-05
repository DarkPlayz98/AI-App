
import React from 'react';

interface AlertProps {
  message: string;
  type?: 'error' | 'info';
}

const Alert: React.FC<AlertProps> = ({ message, type = 'error' }) => {
  const baseClasses = "p-4 rounded-lg text-sm";
  const typeClasses = {
    error: "bg-red-900/50 text-red-300 border border-red-800",
    info: "bg-blue-900/50 text-blue-300 border border-blue-800",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      <span className="font-medium">{type === 'error' ? 'Error: ' : 'Info: '}</span> {message}
    </div>
  );
};

export default Alert;
