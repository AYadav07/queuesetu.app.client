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

export type QueueToken = {
  id: string;
  tokenNumber: number;
  type: string | null;
  status: string | null;
  priorityScore: number | null;
  checkinTime: string;
  userId: string;
  queueId: string;
  appointmentId: string | null;
};

export type QueueDetail = {
  id: string;
  name: string;
  tenantId: string;
  branchId: string;
  serviceId: string | null;
  counterId: string | null;
  slotId: string | null;
  totalTokens: number;
  waitingCount: number;
  calledCount: number;
  completedCount: number;
  currentToken: QueueToken | null;
  nextTokens: QueueToken[];
};

export type QueueTokenRequest = {
  userId: string;
  appointmentId?: string;
  type?: string;
  tier?: number;
};

export type QueueTokenPosition = {
  queueId: string;
  userId: string;
  tokenId: string;
  /** Zero-based position. 0 means next to be served. null when not in queue. */
  position: number | null;
};

// ── Role helpers ───────────────────────────────────────────────────────────
// JWT `roles` claim is [[abbreviatedRole, id], ...] where:
//   TA = TENANT_ADMIN (id = tenantId)
//   BA = BRANCH_ADMIN (id = branchId)
//   ST = STAFF
//   CU = CUSTOMER

type RolePair = [string, string];

function parseRoles(accessToken: string): RolePair[] {
  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    return (payload.roles as RolePair[]) ?? [];
  } catch {
    return [];
  }
}

/**
 * Returns true if the user (identified by `accessToken`) can operate the
 * "Call Next" / "Mark Completed" controls for the given queue.
 * Eligible roles: TENANT_ADMIN for the queue's tenant, BRANCH_ADMIN for the
 * queue's branch, or any STAFF assignment.
 */
export function canOperateQueue(
  queue: { tenantId: string; branchId: string },
  accessToken: string,
): boolean {
  const roles = parseRoles(accessToken);
  return roles.some(
    ([role, id]) =>
      (role === "TA" && id === queue.tenantId) ||
      (role === "BA" && id === queue.branchId) ||
      role === "ST",
  );
}

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

  getQueueDetail(queueId: string, token: string): Promise<QueueDetail> {
    return request(`/api/queues/${queueId}/detail`, token);
  },

  getAllQueues(token: string): Promise<Queue[]> {
    return request("/api/queues", token);
  },

  /** Join a queue — creates a token (check-in) for the user */
  joinQueue(
    queueId: string,
    body: QueueTokenRequest,
    token: string,
  ): Promise<QueueToken> {
    return request(`/api/queue-tokens/${queueId}/tokens`, token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /**
   * Get the user's live position in a queue.
   * Returns null if the user has no active token (not joined / 204 response).
   */
  async getQueuePosition(
    queueId: string,
    userId: string,
    token: string,
  ): Promise<QueueTokenPosition | null> {
    try {
      const result = await request<QueueTokenPosition | undefined>(
        `/api/queue-tokens/${queueId}/position/${userId}`,
        token,
      );
      return result ?? null;
    } catch {
      return null;
    }
  },

  /** Call the next waiting token (staff/admin only). Returns null when queue is empty. */
  async callNext(queueId: string, token: string): Promise<QueueToken | null> {
    try {
      const result = await request<QueueToken | undefined>(
        `/api/queue-tokens/${queueId}/callNext`,
        token,
        { method: "POST" },
      );
      return result ?? null;
    } catch {
      return null;
    }
  },

  /** Mark a currently-called token as completed (staff/admin only). */
  markCompleted(
    queueId: string,
    tokenId: string,
    token: string,
  ): Promise<QueueToken> {
    return request(
      `/api/queue-tokens/${queueId}/tokens/${tokenId}/complete`,
      token,
      {
        method: "POST",
      },
    );
  },
};
