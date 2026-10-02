import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3.5 py-1 text-base font-bold transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'bg-brand-100 text-brand-900 border border-brand-300',
        success: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
        warning: 'bg-amber-100 text-amber-900 border border-amber-300',
        destructive: 'bg-rose-100 text-rose-900 border border-rose-300',
        outline: 'text-slate-800 border-2 border-slate-300 bg-white',
        secondary: 'bg-teal-100 text-teal-900 border border-teal-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
