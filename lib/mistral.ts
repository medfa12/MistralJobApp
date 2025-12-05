/**
 * Returns the Mistral API key from environment variables.
 * This is now the single source of truth for the API key.
 */
export const getMistralApiKey = (): string | undefined => {
  return process.env.MISTRAL_API_KEY;
};
