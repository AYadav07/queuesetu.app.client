const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// ── Types ──────────────────────────────────────────────────────────────────

export type ServiceDefinition = {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  description: string | null;
  avgDurationMin: number | null;
  bufferDurationMin: number | null;
  active: boolean;
};

export type CreateServiceDefinitionRequest = {
  tenantId: string;
  branchId: string;
  name: string;
  description?: string;
  avgDurationMin?: number;
  bufferDurationMin?: number;
  active?: boolean;
};

export type UpdateServiceDefinitionRequest = {
  name?: string;
  description?: string;
  avgDurationMin?: number;
  bufferDurationMin?: number;
  active?: boolean;
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

// ── Service API ────────────────────────────────────────────────────────────

export const bookingApi = {
  /** GET /api/services?branchId=... */
  getServicesByBranch: (branchId: string, token: string) =>
    request<ServiceDefinition[]>(`/api/services?branchId=${branchId}`, token),

  /** GET /api/services/:id */
  getService: (serviceId: string, token: string) =>
    request<ServiceDefinition>(`/api/services/${serviceId}`, token),

  /** POST /api/services */
  createService: (body: CreateServiceDefinitionRequest, token: string) =>
    request<ServiceDefinition>("/api/services", token, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** PUT /api/services/:id */
  updateService: (
    serviceId: string,
    body: UpdateServiceDefinitionRequest,
    token: string,
  ) =>
    request<ServiceDefinition>(`/api/services/${serviceId}`, token, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  /** DELETE /api/services/:id */
  deleteService: (serviceId: string, token: string) =>
    request<void>(`/api/services/${serviceId}`, token, { method: "DELETE" }),
};
