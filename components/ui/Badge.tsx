import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'whatsapp' | 'slate';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  className = '',
}) => {
  const variantClasses = {
    gold: 'bg-gold-500 text-white',
    whatsapp: 'bg-whatsapp-500 text-white',
    slate: 'bg-slate-300 text-slate-700',
  };

  return (
    <span
      className={`
        inline-block
        px-3 py-1
        rounded-full
        font-bold text-lg
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
