export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

export function calculateLoanDetails({ amount, roi, tenure }) {
  const monthlyRate = roi / 12 / 100;
  const tenureMonths = tenure * 12;
  const emi =
    (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  const totalAmount = emi * tenureMonths;
  const totalInterest = totalAmount - amount;
  return {
    monthlyEMI: emi.toFixed(2),
    totalPrincipal: amount.toFixed(2),
    totalInterest: totalInterest.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
  };
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    currencySign: "standard",
    currency: "INR",
  }).format(parseInt(amount, 10));
};