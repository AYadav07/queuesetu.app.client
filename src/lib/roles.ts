/**
 * Client-side role utilities — mirrors the JWT encoding defined in
 * UserRole.java (boot-core) and JwtConfig.java (user MS).
 *
 * JWT `roles` claim format:  [[abbrev, scopeId], ...]
 *
 * | Role            | Abbrev | Scope                    |
 * |-----------------|--------|--------------------------|
 * | SUPER_ADMIN     | SA     | "" (global)              |
 * | TENANT_ADMIN    | TA     | tenantId                 |
 * | BRANCH_ADMIN    | BA     | branchId                 |
 * | SERVICE_MANAGER | SM     | serviceId                |
 * | STAFF           | ST     | queueId                  |
 * | CUSTOMER        | CU     | "" (global)              |
 */

export type RolePair = [abbrev: string, scopeId: string];

export type ParsedRoles = {
  raw: RolePair[];
  isSuperAdmin: boolean;
  tenantAdminIds: string[];
  branchAdminIds: string[];
  serviceManagerIds: string[];
  staffQueueIds: string[];
  isCustomer: boolean;
};

/**
 * Decode the `roles` claim from a raw JWT access token.
 * Returns an empty role set if the token is missing or malformed.
 */
export function parseRolesFromToken(
  accessToken: string | null | undefined,
): ParsedRoles {
  const empty: ParsedRoles = {
    raw: [],
    isSuperAdmin: false,
    tenantAdminIds: [],
    branchAdminIds: [],
    serviceManagerIds: [],
    staffQueueIds: [],
    isCustomer: true,
  };

  if (!accessToken) return empty;

  try {
    const parts = accessToken.split(".");
    if (parts.length < 2) return empty;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    const rawRoles: unknown = payload.roles;

    if (!Array.isArray(rawRoles) || rawRoles.length === 0) return empty;

    const pairs: RolePair[] = rawRoles
      .filter((e) => Array.isArray(e) && e.length >= 1)
      .map((e) => [String(e[0] ?? ""), String(e[1] ?? "")] as RolePair);

    return {
      raw: pairs,
      isSuperAdmin: pairs.some(([r]) => r === "SA"),
      tenantAdminIds: pairs
        .filter(([r]) => r === "TA")
        .map(([, id]) => id)
        .filter(Boolean),
      branchAdminIds: pairs
        .filter(([r]) => r === "BA")
        .map(([, id]) => id)
        .filter(Boolean),
      serviceManagerIds: pairs
        .filter(([r]) => r === "SM")
        .map(([, id]) => id)
        .filter(Boolean),
      staffQueueIds: pairs
        .filter(([r]) => r === "ST")
        .map(([, id]) => id)
        .filter(Boolean),
      isCustomer: pairs.every(([r]) => r === "CU"),
    };
  } catch {
    return empty;
  }
}

// ── Typed check helpers ────────────────────────────────────────────────────

export function isSuperAdmin(roles: ParsedRoles): boolean {
  return roles.isSuperAdmin;
}

export function isTenantAdmin(roles: ParsedRoles, tenantId?: string): boolean {
  if (roles.isSuperAdmin) return true;
  if (!tenantId) return roles.tenantAdminIds.length > 0;
  return roles.tenantAdminIds.includes(tenantId);
}

export function isBranchAdmin(roles: ParsedRoles, branchId?: string): boolean {
  if (roles.isSuperAdmin) return true;
  if (!branchId) return roles.branchAdminIds.length > 0;
  return roles.branchAdminIds.includes(branchId);
}

export function isServiceManager(
  roles: ParsedRoles,
  serviceId?: string,
): boolean {
  if (roles.isSuperAdmin) return true;
  if (!serviceId) return roles.serviceManagerIds.length > 0;
  return roles.serviceManagerIds.includes(serviceId);
}

export function isStaffForQueue(roles: ParsedRoles, queueId?: string): boolean {
  if (roles.isSuperAdmin) return true;
  if (!queueId) return roles.staffQueueIds.length > 0;
  return roles.staffQueueIds.includes(queueId);
}

/**
 * Returns true if the user can perform staff-level operations on the
 * given queue (call next, mark completed, etc.).
 *
 * Hierarchy: SuperAdmin ⊃ TenantAdmin ⊃ BranchAdmin ⊃ ServiceManager ⊃ Staff(queue)
 */
export function canOperateQueue(
  roles: ParsedRoles,
  opts: {
    queueId?: string;
    tenantId?: string;
    branchId?: string;
    serviceId?: string;
  },
): boolean {
  return (
    isSuperAdmin(roles) ||
    isTenantAdmin(roles, opts.tenantId) ||
    isBranchAdmin(roles, opts.branchId) ||
    isServiceManager(roles, opts.serviceId) ||
    isStaffForQueue(roles, opts.queueId)
  );
}
