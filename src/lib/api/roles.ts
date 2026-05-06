const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// ── Types ──────────────────────────────────────────────────────────────────

export type RoleAssignRequest = {
  userId: string;
  /** TENANT_ADMIN | BRANCH_ADMIN | SERVICE_MANAGER | STAFF */
  role: string;
  tenantId?: string;
  branchId?: string;
  serviceId?: string;
  queueId?: string;
};

export type RoleEntry = {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  role: string;
  tenantId: string | null;
  branchId: string | null;
  serviceId: string | null;
  queueId: string | null;
  status: string;
};

export type UserSearchResult = {
  id: string;
  name: string;
  email: string;
};

export type ScopeType = "TENANT" | "BRANCH" | "SERVICE" | "QUEUE";

// ── Internal fetch helper ──────────────────────────────────────────────────

async function request<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data === "string") message = data;
      else message = data?.message ?? data?.error ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as Promise<T>;
}

// ── Roles API ──────────────────────────────────────────────────────────────

export const rolesApi = {
  /** Search users by email prefix */
  searchUsers: (emailPrefix: string, token: string) =>
    request<UserSearchResult[]>(
      `/api/roles/users/search?email=${encodeURIComponent(emailPrefix)}`,
      token,
    ),

  /** List role assignments for a scope */
  listRoles: (
    scopeType: ScopeType,
    scopeId: string,
    role: string | undefined,
    token: string,
  ) => {
    const roleParam = role ? `&role=${encodeURIComponent(role)}` : "";
    return request<RoleEntry[]>(
      `/api/roles?scopeType=${scopeType}&scopeId=${scopeId}${roleParam}`,
      token,
    );
  },

  /** Assign a role */
  assignRole: (body: RoleAssignRequest, token: string) =>
    request<RoleEntry>("/api/roles", token, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** Revoke a role assignment */
  revokeRole: (
    assignmentId: string,
    scopeType: ScopeType,
    scopeId: string,
    token: string,
  ) =>
    request<void>(
      `/api/roles/${assignmentId}?scopeType=${scopeType}&scopeId=${scopeId}`,
      token,
      { method: "DELETE" },
    ),
};
