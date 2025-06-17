import React from "react";
import { Card, CardContent } from "../ui/card";
import { Chart } from "./Chart";
import { FieldInput } from "./FieldInput";
import { Result } from "./result";
import { useCalculator } from "../../../hooks/useCaluclator";

export const Calculator = () => {
  const { value, result, chartData, onChange } = useCalculator();

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 lg:p-10 flex flex-col-reverse lg:flex-row gap-10 items-center">
        {/* Inputs and Results */}
        <div className="w-full lg:w-3/5">
          <div className="grid gap-10 sm:gap-12 md:gap-16">
            <FieldInput
              value={value.amount}
              label="Loan Amount"
              maxNumber={100000000}
              onChange={onChange("amount")}
            />
            <FieldInput
              value={value.roi}
              label="Rate of interest (Per Annum)"
              maxNumber={30}
              step={0.1}
              onChange={onChange("roi")}
            />
            <FieldInput
              value={value.tenure}
              label="Loan Tenure (Per Annum)"
              maxNumber={35}
              onChange={onChange("tenure")}
            />
          </div>
          <Result result={result} />
        </div>
        {/* Chart */}
        <div className="w-full lg:w-2/5 flex justify-center items-center mb-8 lg:mb-0">
          <Chart data={chartData} />
        </div>
      </CardContent>
    </Card>
  );
};