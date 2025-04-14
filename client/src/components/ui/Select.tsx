import React, { forwardRef } from 'react';
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  fullWidth?: boolean;
  onChange?: (value: string) => void;
  required?: boolean;
  optional?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  helperText,
  error,
  options = [],
  fullWidth = false,
  className = '',
  id,
  onChange,
  required,
  placeholder,
  disabled,
  optional = false,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
  
  const baseClasses = 'block w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2';
  const stateClasses = error
    ? 'border-red-300 text-gray-900 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-indigo-500';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white';
  const widthClass = fullWidth ? 'w-full' : '';
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  
  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {optional && <span className="text-gray-500 text-xs ml-1">(optional)</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          className={`${baseClasses} ${stateClasses} ${disabledClasses} appearance-none pr-8 py-2`}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${selectId}-error`}>
          {error}
        </p>
      )}
      
      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500" id={`${selectId}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';