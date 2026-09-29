export const UserRole = {
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  USER: "user",
  // Kept for compatibility with legacy modules that are no longer routed.
  STUDENT: "student",
  FACULTY: "faculty",
} as const;

export const userStatusEnum = ["in-progress", "active", "inactive", "pending", "blocked"] as const;
export const userRoleEnum = Object.values(UserRole);