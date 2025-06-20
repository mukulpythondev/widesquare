export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

export function calculateLoanDetails({ amount, roi, tenure }) {
  const principal = Number(amount);
  const rate = Number(roi);
  const years = Number(tenure);

  const monthlyRate = rate / 12 / 100;
  const tenureMonths = years * 12;

  let emi = 0;
  if (principal > 0 && monthlyRate > 0 && tenureMonths > 0) {
    emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  }

  const totalAmount = emi * tenureMonths;
  const totalInterest = totalAmount - principal;

  return {
    monthlyEMI: emi.toFixed(2),
    totalPrincipal: principal.toFixed(2),
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