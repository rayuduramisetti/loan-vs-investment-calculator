/**
 * Format a number with commas (currency-agnostic)
 *
 * @param {number} value - The value to format
 * @returns {string} Formatted number string (e.g., "100,000")
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format a number as percentage
 *
 * @param {number} value - The value to format (e.g., 5.5)
 * @returns {string} Formatted percentage string (e.g., "5.50%")
 */
export function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

/**
 * Format months as a readable duration
 *
 * @param {number} months - Number of months
 * @returns {string} Formatted duration (e.g., "5 years, 3 months")
 */
export function formatMonths(months) {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
  }

  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }

  return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
}
