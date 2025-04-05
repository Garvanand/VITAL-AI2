/**
 * Utility functions for checking environment variables
 */

/**
 * Checks if an API key is present and valid
 * @param key The API key to check
 * @param keyName The name of the API key (for logging)
 * @param validationPattern Optional regex pattern to validate key format
 * @returns True if the key is valid, false otherwise
 */
export function isApiKeyValid(key: string | undefined, keyName: string, validationPattern?: RegExp): boolean {
  // Check if key exists
  if (!key || key === '' || key === 'your_api_key_here') {
    console.warn(`${keyName} is missing or invalid.`);
    return false;
  }

  // If validation pattern provided, check if key matches expected format
  if (validationPattern && !validationPattern.test(key)) {
    console.warn(`${keyName} doesn't match expected format.`);
    return false;
  }

  return true;
}

/**
 * Checks if Gemini API key is valid
 * @returns True if the key is valid, false otherwise
 */
export function isGeminiKeyValid(): boolean {
  const key = process.env.GEMINI_API_KEY;
  // Gemini API keys start with 'AIza'
  return isApiKeyValid(key, 'Gemini API key', /^AIza.+/);
}

/**
 * Checks if RapidAPI key is valid
 * @returns True if the key is valid, false otherwise
 */
export function isRapidApiKeyValid(): boolean {
  const key = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  // No specific pattern for RapidAPI keys, just check if it exists and isn't a placeholder
  return isApiKeyValid(key, 'RapidAPI key');
}

/**
 * Logs the status of all environment variables
 */
export function checkAllEnvironmentVariables(): void {
  console.group('Environment Variables Status:');

  console.log(`Gemini API: ${isGeminiKeyValid() ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`RapidAPI: ${isRapidApiKeyValid() ? '✅ Valid' : '❌ Invalid'}`);

  // Add more checks for other environment variables as needed

  console.groupEnd();
}
