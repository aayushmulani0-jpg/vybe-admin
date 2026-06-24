import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  fullWidth, 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-vybe-neon text-vybe-dark shadow-[0_0_15px_rgba(163,255,18,0.3)] hover:shadow-[0_0_20px_rgba(163,255,18,0.5)] hover:bg-[#8ee600]",
    secondary: "bg-vybe-glass text-white border border-vybe-glassBorder hover:bg-vybe-glassBorder",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    ghost: "text-gray-400 hover:text-white hover:bg-vybe-glass",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const classes = twMerge(
    clsx(
      baseStyles,
      variants[variant],
      sizes[size],
      fullWidth && "w-full",
      className
    )
  );

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
