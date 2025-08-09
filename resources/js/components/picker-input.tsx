import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

type PickerInputProps = {
  type: "date" | "month";
  value: string;
  onChange: (value: string) => void;
};

export function PickerInput({ type, value, onChange }: PickerInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      {/* Hide the native picker icon but still keep functionality */}
      <Input
        ref={ref}
        type={type}
        className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:pointer-events-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {/* Custom icon that triggers native picker */}
      <button
        type="button"
        onClick={() => ref.current?.showPicker?.()}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        <Calendar className="h-4 w-4" />
      </button>
    </div>
  );
}
