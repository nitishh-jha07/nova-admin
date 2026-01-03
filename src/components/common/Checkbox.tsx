import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={cn(
          'flex items-center gap-3 cursor-pointer select-none',
          props.disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            ref={ref}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'h-5 w-5 rounded border-2 border-input bg-background',
              'transition-all duration-200',
              'peer-checked:border-primary peer-checked:bg-primary',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2'
            )}
          >
            <Check
              className={cn(
                'h-4 w-4 text-primary-foreground absolute top-0.5 left-0.5',
                'opacity-0 scale-50 transition-all duration-200',
                'peer-checked:opacity-100 peer-checked:scale-100'
              )}
              style={{
                opacity: 'var(--checkbox-opacity, 0)',
                transform: 'var(--checkbox-scale, scale(0.5))',
              }}
            />
          </div>
          <Check
            className={cn(
              'absolute top-0.5 left-0.5 h-4 w-4 text-primary-foreground',
              'opacity-0 scale-50 transition-all duration-200',
              'peer-checked:opacity-100 peer-checked:scale-100'
            )}
          />
        </div>
        {label && (
          <span className="text-sm text-foreground">{label}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
