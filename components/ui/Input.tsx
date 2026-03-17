import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  rounded?: boolean;
}

export const Input: React.FC<InputProps> = ({
  rounded = false,
  className = '',
  ...props
}) => {
  return (
    <input
      className={`
        flex-1
        bg-slate-50
        px-4 py-2
        border-none
        outline-none
        focus:ring-2 focus:ring-whatsapp-500
        ${rounded ? 'rounded-full' : 'rounded-lg'}
        ${className}
      `}
      {...props}
    />
  );
};
