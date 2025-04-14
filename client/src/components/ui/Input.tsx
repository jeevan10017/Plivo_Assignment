import React, { forwardRef} from 'react';


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputContainerClassName?: string;
  successMessage?: string;
  showSuccess?: boolean;
  optional?: boolean;
  labelAction?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  inputContainerClassName = '',
  id,
  required,
  disabled,
  readOnly,
  successMessage,
  showSuccess = false,
  optional = false,
  labelAction,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  // Base styling
  const baseInputClasses = 'block w-full rounded-md transition duration-150 ease-in-out shadow-sm focus:outline-none';
  
  // State-based styling
  const stateClasses = error
    ? 'border-red-300 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-red-500'
    : showSuccess
      ? 'border-green-300 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500'
      : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500';
  
  // Responsive and layout classes
  const widthClass = fullWidth ? 'w-full' : '';
  const iconPaddingLeft = leftIcon ? 'pl-10' : '';
  const iconPaddingRight = rightIcon ? 'pr-10' : '';
  
  // State-specific styles
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white';
  const readOnlyClasses = readOnly ? 'bg-gray-50' : '';
  
  return (
    <div className={`${widthClass} ${containerClassName}`}>
      {/* Label Row with optional indicator and action */}
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label htmlFor={inputId} className={`block text-sm font-medium text-gray-700 ${labelClassName}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
            {optional && <span className="text-gray-500 text-xs ml-1">(optional)</span>}
          </label>
          {labelAction && (
            <div className="text-sm">{labelAction}</div>
          )}
        </div>
      )}
      
      {/* Input container with icons */}
      <div className={`relative ${inputContainerClassName}`}>
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          ref={ref}
          className={`
            ${baseInputClasses} 
            ${stateClasses} 
            ${iconPaddingLeft} 
            ${iconPaddingRight} 
            ${disabledClasses} 
            ${readOnlyClasses} 
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : 
            helperText ? `${inputId}-helper` : 
            showSuccess && successMessage ? `${inputId}-success` : 
            undefined
          }
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          {...props}
        />
        
        {/* Status icons or custom right icon */}
        {error && !rightIcon ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        ) : showSuccess && !rightIcon ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        ) : rightIcon ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
            {rightIcon}
          </div>
        ) : null}
      </div>
      
      {/* Feedback messages */}
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${inputId}-error`}>
          {error}
        </p>
      )}
      
      {!error && showSuccess && successMessage && (
        <p className="mt-1 text-sm text-green-600" id={`${inputId}-success`}>
          {successMessage}
        </p>
      )}
      
      {!error && !showSuccess && helperText && (
        <p className="mt-1 text-sm text-gray-500" id={`${inputId}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';