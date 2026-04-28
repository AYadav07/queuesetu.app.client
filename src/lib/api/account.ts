const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// ── Types ──────────────────────────────────────────────────────────────────

export type TenantPlan = "FREE" | "PRO" | "ENTERPRISE";
export type AccountStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type TenantRequest = {
  tenantName: string;
  plan?: TenantPlan;
  adminId?: string;
};

export type Tenant = {
  id: string;
  name: string;
  plan: string | null;
  createdAt: string;
  status: AccountStatus;
};

export type BranchRequest = {
  tenantId: string;
  name: string;
  address: string;
  city: string;
  pinCode: string;
  phoneCode?: string;
};

export type Branch = {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  city: string;
  pinCode: string;
  phoneCode: string | null;
  status: AccountStatus;
  createdAt: string;
};

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
      // ignore parse errors
    }
    throw new Error(message);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as Promise<T>;
}

// ── Tenant API ─────────────────────────────────────────────────────────────

export const accountApi = {
  /** GET /api/tenants/my-tenants */
  getMyTenants: (token: string) =>
    request<Tenant[]>("/api/tenants/my-tenants", token),

  /** POST /api/tenants */
  createTenant: (body: TenantRequest, token: string) =>
    request<Tenant>("/api/tenants", token, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** GET /api/tenants/:id */
  getTenant: (tenantId: string, token: string) =>
    request<Tenant>(`/api/tenants/${tenantId}`, token),

  /** PUT /api/tenants/:id */
  updateTenant: (tenantId: string, body: TenantRequest, token: string) =>
    request<Tenant>(`/api/tenants/${tenantId}`, token, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  /** DELETE /api/tenants/:id */
  deleteTenant: (tenantId: string, token: string) =>
    request<string>(`/api/tenants/${tenantId}`, token, { method: "DELETE" }),

  // ── Branch API ───────────────────────────────────────────────────────────

  /** GET /api/tenants/:tenantId/branches */
  getBranchesByTenant: (tenantId: string, token: string) =>
    request<Branch[]>(`/api/tenants/${tenantId}/branches`, token),

  /** POST /api/branches */
  createBranch: (body: BranchRequest, token: string) =>
    request<Branch>("/api/branches", token, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** GET /api/branches/:id */
  getBranch: (branchId: string, token: string) =>
    request<Branch>(`/api/branches/${branchId}`, token),

  /** PUT /api/branches/:id */
  updateBranch: (branchId: string, body: BranchRequest, token: string) =>
    request<Branch>(`/api/branches/${branchId}`, token, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  /** DELETE /api/branches/:id */
  deleteBranch: (branchId: string, token: string) =>
    request<string>(`/api/branches/${branchId}`, token, { method: "DELETE" }),
};
