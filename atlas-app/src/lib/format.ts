export function formatDue(date: Date | null, done: boolean): string | undefined {
  if (!date) return undefined;
  const label = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return done ? `Done ${label}` : `Due ${label}`;
}

export function formatMoney(amount: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}
