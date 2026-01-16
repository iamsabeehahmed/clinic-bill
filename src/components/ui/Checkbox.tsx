'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean;
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', indeterminate = false, checked, label, ...props }, ref) => {
    const isChecked = checked || false;

    return (
      <label className={`inline-flex items-center gap-2 cursor-pointer ${props.disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={isChecked}
            className="sr-only"
            {...props}
          />
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isChecked || indeterminate
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-300 hover:border-gray-400'
            } ${className}`}
          >
            {indeterminate ? (
              <Minus className="w-3 h-3 text-white" />
            ) : isChecked ? (
              <Check className="w-3 h-3 text-white" />
            ) : null}
          </div>
        </div>
        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
