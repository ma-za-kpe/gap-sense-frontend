import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`
        bg-white
        rounded-xl
        p-5
        shadow-card
        border border-whatsapp-50
        ${hover ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-whatsapp-500' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-semibold text-whatsapp-500 mb-2 ${className}`}>
      {children}
    </h3>
  );
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return (
    <div className={`text-slate-700 text-base leading-relaxed ${className}`}>
      {children}
    </div>
  );
};
