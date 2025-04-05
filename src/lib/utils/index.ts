/**
 * Utils index file that exports all utility functions
 */

// Environment variable utilities
export * from './env-checker';

/**
 * Combines multiple class names into a single string
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Formats a currency amount
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Truncates a string to a maximum length
 * @param str The string to truncate
 * @param maxLength The maximum length
 * @param suffix The suffix to add after truncation (default: '...')
 */
export function truncateString(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}${suffix}`;
}

/**
 * Creates a delay using a promise
 * @param ms Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Capitalizes the first letter of a string
 * @param str The string to capitalize
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
