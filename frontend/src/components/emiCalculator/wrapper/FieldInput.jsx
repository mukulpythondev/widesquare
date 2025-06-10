import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import React, { useCallback } from "react";

export const FieldInput = ({
  label,
  maxNumber,
  value,
  step = 1,
  onChange,
}) => {
  const handleInputChange = (event) => {
    const { value } = event.target;
    onChange(value ? parseInt(value, 10) : 0);
  };

  const handleSliderChange = useCallback(
    (value) => {
      onChange(value[0]);
    },
    [onChange]
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-5">
        <p>{label}</p>
        <Input
          type="number"
          className="w-80"
          value={value}
          onChange={handleInputChange}
        />
      </div>
      <Slider
        value={[value]}
        max={maxNumber}
        step={step}
        min={0}
        onValueChange={handleSliderChange}
      />
    </div>
  );
};