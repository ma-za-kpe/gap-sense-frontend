import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'rounded-lg font-semibold transition-all duration-200 flex items-center justify-center';

  const variantClasses = {
    primary: 'bg-whatsapp-500 text-white hover:bg-whatsapp-700 shadow-button',
    secondary: 'bg-gold-500 text-white hover:bg-gold-600',
    outline: 'bg-white border border-whatsapp-500 text-whatsapp-500 hover:bg-whatsapp-500 hover:text-white',
    ghost: 'bg-slate-50 text-whatsapp-500 hover:bg-whatsapp-500 hover:text-white',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
