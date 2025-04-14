import React, { forwardRef, useState } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  required?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  optional?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  helperText,
  error,
  fullWidth = false,
  className = '',
  id,
  rows = 4,
  required,
  maxLength,
  showCharCount,
  onChange,
  disabled,
  optional = false,
  ...props
}, ref) => {
  const [charCount, setCharCount] = useState(props.value?.toString().length || 0);
  const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
  
  const baseClasses = 'block w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2';
  const stateClasses = error
    ? 'border-red-300 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-indigo-500';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white';
  const widthClass = fullWidth ? 'w-full' : '';
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    if (onChange) {
      onChange(e);
    }
  };
  
  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {optional && <span className="text-gray-500 text-xs ml-1">(optional)</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        ref={ref}
        rows={rows}
        className={`${baseClasses} ${stateClasses} ${disabledClasses} placeholder:text-gray-400`}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        maxLength={maxLength}
        required={required}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />
      
      {(showCharCount && maxLength) && (
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-500">
            {charCount}/{maxLength}
          </span>
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${textareaId}-error`}>
          {error}
        </p>
      )}
      
      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500" id={`${textareaId}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
