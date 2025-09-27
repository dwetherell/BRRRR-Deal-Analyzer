export const toMonthlyRate = (aprPct: number) => (aprPct / 100) / 12;

export const pmt = (principal: number, aprPct: number, years: number) => {
  const n = Math.max(1, Math.round(years * 12));
  const r = toMonthlyRate(aprPct);
  if (r === 0) return principal / n;
  return principal * r / (1 - Math.pow(1 + r, -n));
};

export const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const round2 = (n: number) => Math.round(n * 100) / 100;