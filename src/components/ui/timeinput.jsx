import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function TimeInput({ value, onChange, className, ...props }) {
  return (
    <Input
      type="time"
      value={value || ''}
      onChange={onChange}
      className={cn(
        "bg-black/20 border-amber-800/50 text-amber-100",
        className
      )}
      {...props}
    />
  );
}