/*
  Prisma returns Decimal columns as a Decimal instance, not a number, so every
  amount reaches the UI as something with a `toString()`. Going through Number
  loses precision above 2^53 — no academy fee comes close, and the alternative
  is a decimal library for a display string.
*/
export function formatInr(amount: { toString(): string }): string {
  const value = Number(amount.toString());
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
