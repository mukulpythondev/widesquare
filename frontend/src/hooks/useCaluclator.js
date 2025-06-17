import { useState } from "react";
import { calculateLoanDetails } from "../lib/utils";

export const useCalculator = () => {
  const [value, setValue] = useState({
    amount: 0,
    roi: 0,
    tenure: 0,
  });

  const handleChange = (field) => (val) => {
    setValue((prevState) => ({
      ...prevState,
      [field]: val,
    }));
  };

  const createChartData = (result) => [
    {
      name: "principal",
      value: parseInt(result.totalPrincipal, 10),
      fill: "var(--color-principal)",
    },
    {
      name: "interest",
      value: parseInt(result.totalInterest, 10),
      fill: "var(--color-interest)",
    },
  ];

  const resultData = calculateLoanDetails(value);

  return {
    value,
    result: resultData,
    chartData: createChartData(resultData),
    onChange: handleChange,
  };
};