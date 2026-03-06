import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'tonal';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  // M3: Fully rounded corners, specific heights, no heavy outlines usually.
  const baseStyle = "px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed";
  
  const variants = {
    // Primary: High emphasis, Primary color
    primary: "bg-primary-600 text-white shadow-md hover:shadow-lg hover:bg-primary-700 active:shadow-sm",
    // Secondary: Outlined, lower emphasis
    secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 bg-white",
    // Tonal: Filled but lighter color (Secondary Container)
    tonal: "bg-primary-100 text-primary-900 hover:bg-primary-200",
    // Danger
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    // Ghost: Text only
    ghost: "text-primary-600 hover:bg-primary-50 hover:text-primary-700"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};