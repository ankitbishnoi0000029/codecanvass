"use client";
import React from 'react';

// Reusable Card Component
export const ToolCard = ({
  title,
  variant = 'default',
  isActive = false,
  onClick,
}: {
  title: string;
  variant: 'default' | 'primary';
  isActive?: boolean;
  onClick: () => void;
}) => {
  const variants = {
    default:
      'bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 text-gray-800 border-gray-300 hover:border-blue-400',
    primary:
      'bg-gradient-to-br from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white border-transparent',
  };

  const activeClass =
    'bg-gradient-to-r from-blue-600 to-indigo-500 text-white border-transparent shadow-lg scale-[1.05]';

  return (
    <button
      onClick={onClick}
      className={`
        ${isActive ? activeClass : variants[variant]}
        w-full px-5 py-4 rounded-xl border-2 border-transparent
        transition-all duration-300 ease-in-out
        transform hover:scale-[1.02] hover:shadow-2xl
        focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2
        text-left font-semibold text-base
        active:scale-100
        cursor-pointer
        shadow-md hover:shadow-indigo-200
        relative overflow-hidden
        group
      `}
    >
      <div className="relative z-10">{title}</div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

      {/* Active glow effect */}
      {isActive && (
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-pink-400 opacity-20 blur-md"></span>
      )}
    </button>
  );
};
