// * ==========================================================================
// *                            ENVIRONMENT UTILITIES
// * ==========================================================================

/**
 * Retrieves the value of an environment variable.
 * Throws an error if the variable is not set.
 * @param varName - The name of the environment variable.
 * @returns The value of the environment variable.
 * @throws Error if the environment variable is not defined.
 */
export const getEnvVar = (varName: string): string => {
  const value = process.env[varName];
  if (value === undefined || value === null || value === "") {
    console.error(`Environment variable ${varName} is not set.`);
    throw new Error(`Environment variable ${varName} is not set.`);
  }
  return value;
};
