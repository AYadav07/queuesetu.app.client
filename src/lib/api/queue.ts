const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// ── Types ──────────────────────────────────────────────────────────────────

export type QueueRequest = {
  name: string;
  tenantId: string;
  branchId: string;
  serviceId?: string;
  counterId?: string;
  slotId?: string;
};

export type Queue = {
  id: string;
  name: string;
  tenantId: string;
  branchId: string;
  serviceId: string | null;
  counterId: string | null;
  slotId: string | null;
};

// ── Internal fetch helper ──────────────────────────────────────────────────

async function request<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Queue API client ───────────────────────────────────────────────────────

export const queueApi = {
  createQueue(body: QueueRequest, token: string): Promise<Queue> {
    return request("/api/queues", token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getQueue(queueId: string, token: string): Promise<Queue> {
    return request(`/api/queues/${queueId}`, token);
  },

  deleteQueue(queueId: string, token: string): Promise<void> {
    return request(`/api/queues/${queueId}`, token, { method: "DELETE" });
  },

  getQueuesByBranch(branchId: string, token: string): Promise<Queue[]> {
    return request(`/api/queues/branch/${branchId}`, token);
  },

  getQueuesByTenant(tenantId: string, token: string): Promise<Queue[]> {
    return request(`/api/queues/tenant/${tenantId}`, token);
  },

  getQueuesBySlot(slotId: string, token: string): Promise<Queue[]> {
    return request(`/api/queues/slot/${slotId}`, token);
  },
};
