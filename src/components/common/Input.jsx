import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = forwardRef(({ 
  className, 
  label, 
  error, 
  icon: Icon,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          ref={ref}
          className={twMerge(
            clsx(
              "w-full bg-vybe-dark border border-vybe-glassBorder rounded-lg text-white placeholder-gray-500",
              "focus:outline-none focus:border-vybe-neon focus:ring-1 focus:ring-vybe-neon/50 transition-colors",
              Icon ? "pl-10 pr-4 py-2" : "px-4 py-2",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
              className
            )
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
