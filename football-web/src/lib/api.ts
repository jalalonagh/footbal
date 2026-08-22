const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Request failed");
  }
  return response.json();
}

export interface ScenarioListResult {
  items: any[];
  total: number;
  page: number;
  pageSize: number;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; email: string; role: string; userId: string; fullName: string; firstName?: string }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      ),
    register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
      request<{ token: string; email: string; role: string; userId: string; fullName: string; firstName?: string }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify(data) }
      ),
  },
  scenarios: {
    list: (filters?: { category?: string; difficulty?: string; page?: number; pageSize?: number }) => {
      const params = new URLSearchParams();
      if (filters?.category) params.set("category", filters.category);
      if (filters?.difficulty) params.set("difficulty", filters.difficulty);
      if (filters?.page) params.set("page", filters.page.toString());
      if (filters?.pageSize) params.set("pageSize", filters.pageSize.toString());
      const qs = params.toString();
      return request<ScenarioListResult>(`/scenarios${qs ? "?" + qs : ""}`);
    },
    get: (id: string) => request<any>(`/scenarios/${id}`),
    create: (data: any) => request<any>("/scenarios", { method: "POST", body: JSON.stringify(data) }),
  },
  tactical: {
    analyze: (gameState: any) =>
      request<any>("/tactical/analyze", { method: "POST", body: JSON.stringify(gameState) }),
    evaluate: (data: any) =>
      request<any>("/tactical/evaluate", { method: "POST", body: JSON.stringify(data) }),
    recommendations: (gameState: any, playerId: string) =>
      request<any[]>(`/tactical/recommendations?playerId=${playerId}`, {
        method: "POST",
        body: JSON.stringify(gameState),
      }),
  },
  subscription: {
    plans: () => request<any[]>("/subscription/plans"),
    createPayment: (planId: string) =>
      request<{ paymentUrl?: string; authority?: string; url?: string }>("/subscription/create-payment", {
        method: "POST",
        body: JSON.stringify({ planId, callbackUrl: typeof window !== "undefined" ? `${window.location.origin}/subscription/callback` : "" }),
      }),
    active: () => request<{ planName: string; expiresAt: string } | null>("/subscription/active"),
    checkFeature: (key: string) => request<{ allowed: boolean }>(`/subscription/check-feature/${key}`),
  },
};
