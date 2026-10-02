import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 active:bg-brand-800',
        primary: 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800 shadow-md',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-md',
        destructive: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-md',
        outline: 'border-2 border-slate-300 bg-white text-slate-800 hover:bg-slate-100 active:bg-slate-200',
        secondary: 'bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 shadow-md',
        ghost: 'hover:bg-slate-100 text-slate-700',
      },
      size: {
        default: 'h-12 px-6 text-lg rounded-xl min-h-[48px]', // Touch target >= 48px
        lg: 'h-14 px-8 text-xl rounded-2xl min-h-[56px]',     // Touch target 56px (Ekstra Besar)
        sm: 'h-10 px-4 text-base rounded-lg min-h-[40px]',
        icon: 'h-12 w-12 rounded-xl min-h-[48px] min-w-[48px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
