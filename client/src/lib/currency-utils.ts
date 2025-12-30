/**
 * Currency utility functions for Rupiah formatting
 */

/**
 * Format number to Rupiah display string
 * @param amount - Number to format
 * @returns Formatted string (e.g., "Rp 1.000.000")
 */
export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

/**
 * Parse Rupiah string to number
 * @param value - Rupiah string (e.g., "Rp 1.000.000" or "1.000.000")
 * @returns Parsed number
 */
export function parseRupiah(value: string): number {
  // Remove "Rp", spaces, and dots
  const cleaned = value.replace(/Rp\s?/g, '').replace(/\./g, '').replace(/,/g, '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format input value as user types (thousands separator)
 * @param value - Raw input value
 * @returns Formatted string with thousands separators
 */
export function formatRupiahInput(value: string): string {
  // Remove non-numeric characters except dots
  const cleaned = value.replace(/[^\d]/g, '');
  
  if (!cleaned) return '';
  
  // Add thousands separators
  const number = parseInt(cleaned, 10);
  return number.toLocaleString('id-ID');
}

/**
 * Get raw number from formatted input
 * @param value - Formatted input value
 * @returns Raw number
 */
export function getRawNumber(value: string): number {
  const cleaned = value.replace(/\./g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}
