import { formatCurrency } from "../../../../lib/utils";

export const ResultItem = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <p>{label}</p>
    <p className="text-xl">&#8377;{formatCurrency(value)}</p>
  </div>
);