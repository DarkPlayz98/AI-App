
import React from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => {
  const baseClasses = "flex items-center justify-center font-semibold px-4 py-2 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500";
  const activeClasses = "bg-indigo-600 text-white shadow-lg";
  const inactiveClasses = "bg-gray-700/50 text-gray-300 hover:bg-gray-700";

  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {children}
    </button>
  );
};

export default TabButton;
