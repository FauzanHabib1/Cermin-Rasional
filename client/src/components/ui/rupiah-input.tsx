import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatRupiahInput, getRawNumber } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";

export interface RupiahInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string | number;
  onChange?: (value: number) => void;
}

const RupiahInput = React.forwardRef<HTMLInputElement, RupiahInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');

    // Initialize display value from prop
    React.useEffect(() => {
      if (value !== undefined) {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (!isNaN(numValue) && numValue > 0) {
          setDisplayValue(formatRupiahInput(numValue.toString()));
        } else {
          setDisplayValue('');
        }
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Format the input
      const formatted = formatRupiahInput(inputValue);
      setDisplayValue(formatted);
      
      // Call onChange with raw number
      if (onChange) {
        const rawNumber = getRawNumber(formatted);
        onChange(rawNumber);
      }
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          Rp
        </span>
        <Input
          type="text"
          inputMode="numeric"
          ref={ref}
          className={cn("pl-10", className)}
          value={displayValue}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

RupiahInput.displayName = "RupiahInput";

export { RupiahInput };
