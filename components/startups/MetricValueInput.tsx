"use client";

import { forwardRef, useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { type MetricFormat, parseMetricInput } from "@/lib/constants/metrics";

interface MetricValueInputProps {
  value: number;
  onChange: (value: number) => void;
  format: MetricFormat;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

function formatDisplayValue(value: number, format: MetricFormat): string {
  if (value === 0) return "";

  switch (format) {
    case "CURRENCY":
      return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    case "PERCENTAGE":
      return `${value.toFixed(1)}%`;
    case "NUMBER":
    default:
      return value.toLocaleString("en-US");
  }
}

export const MetricValueInput = forwardRef<
  HTMLInputElement,
  MetricValueInputProps
>(({ value, onChange, format, placeholder, disabled, className, id }, ref) => {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatDisplayValue(value, format));
    }
  }, [value, format, isFocused]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setDisplayValue(value === 0 ? "" : String(value));
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseMetricInput(displayValue, format);
    onChange(parsed);
    setDisplayValue(formatDisplayValue(parsed, format));
  }, [displayValue, format, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      if (format === "CURRENCY") {
        inputValue = inputValue.replace(/[^0-9.-]/g, "");
      } else if (format === "PERCENTAGE") {
        inputValue = inputValue.replace(/[^0-9.-]/g, "");
        const numValue = parseFloat(inputValue);
        if (!isNaN(numValue) && numValue > 100) {
          inputValue = "100";
        }
      } else {
        inputValue = inputValue.replace(/[^0-9.-]/g, "");
      }

      setDisplayValue(inputValue);
    },
    [format],
  );

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    switch (format) {
      case "CURRENCY":
        return "$0";
      case "PERCENTAGE":
        return "0%";
      default:
        return "0";
    }
  };

  return (
    <div className="relative">
      {format === "CURRENCY" && !isFocused && !displayValue && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          $
        </span>
      )}
      <Input
        ref={ref}
        id={id}
        type="text"
        inputMode="decimal"
        value={isFocused ? displayValue : displayValue || ""}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={getPlaceholder()}
        disabled={disabled}
        className={`${format === "CURRENCY" && !isFocused && !displayValue ? "pl-7" : ""} ${className || ""}`}
      />
    </div>
  );
});

MetricValueInput.displayName = "MetricValueInput";
