import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import React, { useCallback } from "react";

export const FieldInput = ({
  label,
  maxNumber,
  value,
  step = 1,
  onChange,
  placeholder = "",
}) => {
  // Handle text input change
  const handleInputChange = (e) => {
    const val = e.target.value;
    // Allow empty, integers, or decimals
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
  };

  // Handle slider change
  const handleSliderChange = useCallback(
    (sliderValue) => {
      // Always convert slider value to string for consistency
      onChange(String(sliderValue[0]));
    },
    [onChange]
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-5">
        <p>{label}</p>
        <Input
          type="text"
          className="w-80"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          inputMode="decimal"
          autoComplete="off"
        />
      </div>
      <Slider
        value={[value === "" ? 0 : Number(value)]}
        max={maxNumber}
        step={step}
        min={0}
        onValueChange={handleSliderChange}
      />
    </div>
  );
};