import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function GlassCard({ className, children, ...props }) {
  return (
    <div 
      className={twMerge(
        clsx(
          "bg-vybe-glass backdrop-blur-md border border-vybe-glassBorder rounded-2xl shadow-xl",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
