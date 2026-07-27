/**
 * Utility functions for extracting currency symbols and formatting money values.
 */

export const getCurrencySymbol = (currencyString?: string): string => {
  if (!currencyString) return '$';
  // If format is like "₹ (INR)" or "CA$ (CAD)", split by space and take the first part
  const trimmed = currencyString.trim();
  const parts = trimmed.split(' ');
  if (parts.length > 0 && parts[0]) {
    return parts[0];
  }
  return '$';
};

export const formatMoney = (amount: number | undefined | null, currencyString?: string): string => {
  const sym = getCurrencySymbol(currencyString);
  const val = amount || 0;
  return `${sym}${val.toLocaleString()}`;
};
