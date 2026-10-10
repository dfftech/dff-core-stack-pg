export const FULL_ACCESS_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN"];

/** True when a role id is, or contains, one of the reserved full access roles. */
export function isFullAccessRoleId(id?: string | null): boolean {
  const value = String(id ?? "").trim().toUpperCase();
  return value !== "" && FULL_ACCESS_ROLES.some((role) => value.includes(role));
}
