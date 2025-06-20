import { useState } from "react";
import { calculateLoanDetails } from "../lib/utils";

export const useCalculator = () => {
  const [value, setValue] = useState({
    amount: '',
    roi: '',
    tenure: '',
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