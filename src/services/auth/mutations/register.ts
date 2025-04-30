import type { RegisterRequest, RegisterResponse } from '../types/auth';

/**
 * Registrerar en ny användare via API
 */
export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Ett fel uppstod vid registrering',
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      message: 'Registrering lyckades!',
      user: responseData,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error
        ? error.message
        : 'Ett fel uppstod vid registrering',
    };
  }
};