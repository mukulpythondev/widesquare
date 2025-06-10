import React from "react";
import { Calculator } from "../components/emiCalculator/wrapper/Calculator";
import "../styles/emi.css"

const EmiCalculator = () => (
  <div className="emi-calculator-theme w-full min-h-screen pt-16 px-2 sm:px-4 md:px-10">
    <h1 className="text-2xl text-center font-bold mb-8 sm:mb-10">
      Loan EMI Calculator
    </h1>
    <Calculator />
  </div>
);

export default EmiCalculator;