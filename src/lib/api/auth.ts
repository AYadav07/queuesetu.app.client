const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// ── Request types ──────────────────────────────────────────────────────────────

export type SignUpRequest = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type TokenRefreshRequest = {
  refreshToken: string;
};

// ── Response types ─────────────────────────────────────────────────────────────

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
};

export type LoginResponse = {
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
};

export type TokenRefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

// ── Internal fetch helper ─────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
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

  // Some endpoints (logout) return a plain string
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as Promise<T>;
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authApi = {
  /** POST /api/auth/sign-up */
  signUp: (body: SignUpRequest) =>
    request<UserResponse>("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** POST /api/auth/login */
  login: (body: LoginRequest) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** POST /api/auth/refresh */
  refresh: (body: TokenRefreshRequest) =>
    request<TokenRefreshResponse>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** GET /api/auth/me — requires Bearer token */
  me: (accessToken: string) =>
    request<UserResponse>("/api/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /** POST /api/auth/logout — requires Bearer token */
  logout: (accessToken: string) =>
    request<string>("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};
