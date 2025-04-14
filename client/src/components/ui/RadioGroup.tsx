import React from 'react';
interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  error?: string;
  helperText?: string;
  required?: boolean;
  name?: string;
  horizontal?: boolean;
  optional?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  helperText,
  required,
  name,
  horizontal = false,
  optional = false,
}) => {
  const groupName = name || `radiogroup-${Math.random().toString(36).substring(2, 9)}`;
  const groupId = `${groupName}-group`;
  
  return (
    <fieldset className="space-y-3">
      {label && (
        <legend className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {optional && <span className="text-gray-500 text-xs ml-1">(optional)</span>}
        </legend>
      )}
      
      <div className={horizontal ? 'flex flex-wrap gap-3' : 'space-y-2'}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-start ${horizontal ? 'mr-4' : 'block'} 
              space-x-3 cursor-pointer rounded-md border p-3
              ${value === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              name={groupName}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
              disabled={option.disabled}
              aria-describedby={
                error ? `${groupId}-error` : helperText ? `${groupId}-helper` : undefined
              }
            />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {option.label}
              </div>
              {option.description && (
                <p className="text-sm text-gray-500">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${groupId}-error`}>
          {error}
        </p>
      )}
      
      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500" id={`${groupId}-helper`}>
          {helperText}
        </p>
      )}
    </fieldset>
  );
};
