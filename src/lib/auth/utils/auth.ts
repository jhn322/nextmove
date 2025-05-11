import { USER_ROLES, UserRole } from "@/lib/auth/constants/auth";

/**
 * Converts a user role to a readable text
 */
export const formatRole = (role: UserRole): string => {
  const roleMap: Record<UserRole, string> = {
    [USER_ROLES.USER]: "Student",
    [USER_ROLES.ADMIN]: "Administrator",
  };
  return roleMap[role] || role;
};

/**
 * Checks if the user has sufficient permissions based on hierarchy
 */
export const hasRequiredRole = (
  userRole: UserRole,
  requiredRole: UserRole | UserRole[]
): boolean => {
  // Updated hierarchy
  const roleHierarchy: UserRole[] = [USER_ROLES.USER, USER_ROLES.ADMIN];
  const userRoleIndex = roleHierarchy.indexOf(userRole);

  if (userRoleIndex === -1) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.some((role) => {
      const requiredRoleIndex = roleHierarchy.indexOf(role);
      return requiredRoleIndex !== -1 && userRoleIndex >= requiredRoleIndex;
    });
  } else {
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
    return requiredRoleIndex !== -1 && userRoleIndex >= requiredRoleIndex;
  }
};

/**
 * Safely retrieves the value of an environment variable, with error handling
 */
export const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    // In production, we want to use a logger instead of console.error
    console.error(`Environment variable ${key} is not defined!`);
    return "";
  }
  return value;
};
