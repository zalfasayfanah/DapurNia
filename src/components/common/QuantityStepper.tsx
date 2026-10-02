import React from 'react';
import { Button } from '../ui/Button';
import { Plus, Minus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="h-12 w-12 rounded-xl text-slate-800 text-xl font-black bg-white hover:bg-slate-100 border-2 border-slate-300"
        aria-label="Kurangi porsi"
      >
        <Minus className="w-6 h-6 stroke-[3]" />
      </Button>

      <span className="w-12 text-center text-2xl font-black text-slate-900">
        {value}
      </span>

      <Button
        type="button"
        variant="primary"
        size="icon"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="h-12 w-12 rounded-xl text-white text-xl font-black shadow-sm"
        aria-label="Tambah porsi"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </Button>
    </div>
  );
}
