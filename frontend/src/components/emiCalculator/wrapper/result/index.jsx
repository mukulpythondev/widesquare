import { ResultItem } from "./ResultItem";

export const Result = ({ result }) => (
  <div className="grid gap-5 mt-20">
    <ResultItem label="Monthly EMI" value={result.monthlyEMI} />
    <ResultItem label="Principal Amount" value={result.totalPrincipal} />
    <ResultItem label="Total Interest" value={result.totalInterest} />
    <ResultItem label="Total Amount" value={result.totalAmount} />
  </div>
);