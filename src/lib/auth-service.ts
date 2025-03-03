import { Session } from "next-auth";

/**
 * Checks if a session is valid and not expired
 * @param session The session to check
 * @returns boolean - true if session is valid, false otherwise
 */
export const isSessionValid = (session: Session | null): boolean => {
  if (!session) {
    return false;
  }

  // Check if session is expired
  const sessionExpiry = session.expires ? new Date(session.expires) : null;
  const now = new Date();

  // If session is expired, it's not valid
  if (sessionExpiry && sessionExpiry < now) {
    console.log("Session expired");
    return false;
  }

  return true;
};
