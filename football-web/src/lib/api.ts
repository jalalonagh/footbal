import type { AuthResponse, User, Scenario, ScenarioPlayer, ScenarioSolution, ScenarioRule, TrainingSession, TrainingDecision, TrainingPlan, TrainingPlanItem, PlayerProfile, PlayerProgress, PlayerAchievement, Team, Academy, SubscriptionPlan, Subscription, Article, AIArticleResponse, Faq, Discount, Coupon, PlayerStats, CoachStats, AdminStats, PagedResult, GameState } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7223/api";

async function request<T>(endpoint: string, options?: RequestInit, isRetry = false): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (response.status === 401 && !isRetry && typeof window !== "undefined") {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem("token", data.token);
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("user", JSON.stringify(data));
          return request<T>(endpoint, options, true);
        }
      } catch {}
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Request failed");
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  // ─── Auth ────────────────────────────────────────────
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (data: { email: string; password: string; firstName: string; lastName: string; role?: string }) =>
      request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    refreshToken: (refreshToken: string) =>
      request<AuthResponse>("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) }),
    forgotPassword: (email: string) =>
      request<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
    resetPassword: (data: { email: string; token: string; newPassword: string }) =>
      request<{ message: string }>("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),
    getMe: () => request<User>("/auth/me"),
    updateProfile: (data: { firstName?: string; lastName?: string; phoneNumber?: string }) =>
      request<User>("/auth/me", { method: "PUT", body: JSON.stringify(data) }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request<{ message: string }>("/auth/change-password", { method: "POST", body: JSON.stringify(data) }),
    setupAdmin: (email: string, password: string) =>
      request<AuthResponse>("/auth/setup-admin", { method: "POST", body: JSON.stringify({ email, password }) }),
    getUsers: (page = 1, pageSize = 20) =>
      request<{ items: User[]; total: number }>(`/auth/users?page=${page}&pageSize=${pageSize}`),
    updateRole: (userId: string, role: string) =>
      request<void>(`/auth/users/${userId}/role`, { method: "PUT", body: JSON.stringify(role) }),
  },

  // ─── Scenarios ───────────────────────────────────────
  scenarios: {
    list: (filters?: { category?: string; difficulty?: string; search?: string; page?: number; pageSize?: number }) => {
      const p = new URLSearchParams();
      if (filters?.category) p.set("category", filters.category);
      if (filters?.difficulty) p.set("difficulty", filters.difficulty);
      if (filters?.search) p.set("search", filters.search);
      if (filters?.page) p.set("page", filters.page.toString());
      if (filters?.pageSize) p.set("pageSize", filters.pageSize.toString());
      const qs = p.toString();
      return request<Scenario[]>(`/scenarios${qs ? "?" + qs : ""}`).then(items => ({ items, total: items.length, page: filters?.page || 1, pageSize: filters?.pageSize || 20 }));
    },
    recent: (count = 3) => request<any[]>(`/scenarios/recent?count=${count}`),
    get: (id: string) => request<Scenario>(`/scenarios/${id}`),
    create: (data: Partial<Scenario>) => request<Scenario>("/scenarios", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Scenario>) => request<Scenario>(`/scenarios/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/scenarios/${id}`, { method: "DELETE" }),
    publish: (id: string) => request<Scenario>(`/scenarios/${id}/publish`, { method: "POST" }),
    archive: (id: string) => request<Scenario>(`/scenarios/${id}/archive`, { method: "POST" }),
    getPlayers: (id: string) => request<ScenarioPlayer[]>(`/scenarios/${id}/players`),
    addPlayer: (id: string, data: Partial<ScenarioPlayer>) => request<ScenarioPlayer>(`/scenarios/${id}/players`, { method: "POST", body: JSON.stringify(data) }),
    bulkAddPlayers: (id: string, data: Partial<ScenarioPlayer>[]) => request<{ message: string }>(`/scenarios/${id}/players/bulk`, { method: "POST", body: JSON.stringify(data) }),
    updatePlayer: (playerId: string, data: Partial<ScenarioPlayer>) => request<ScenarioPlayer>(`/scenarios/players/${playerId}`, { method: "PUT", body: JSON.stringify(data) }),
    deletePlayer: (playerId: string) => request<void>(`/scenarios/players/${playerId}`, { method: "DELETE" }),
    getSolutions: (id: string) => request<ScenarioSolution[]>(`/scenarios/${id}/solutions`),
    addSolution: (id: string, data: Partial<ScenarioSolution>) => request<ScenarioSolution>(`/scenarios/${id}/solutions`, { method: "POST", body: JSON.stringify(data) }),
    updateSolution: (solutionId: string, data: Partial<ScenarioSolution>) => request<ScenarioSolution>(`/scenarios/solutions/${solutionId}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteSolution: (solutionId: string) => request<void>(`/scenarios/solutions/${solutionId}`, { method: "DELETE" }),
    getRules: (id: string) => request<ScenarioRule[]>(`/scenarios/${id}/rules`),
    addRule: (id: string, data: Partial<ScenarioRule>) => request<ScenarioRule>(`/scenarios/${id}/rules`, { method: "POST", body: JSON.stringify(data) }),
    updateRule: (ruleId: string, data: Partial<ScenarioRule>) => request<ScenarioRule>(`/scenarios/rules/${ruleId}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteRule: (ruleId: string) => request<void>(`/scenarios/rules/${ruleId}`, { method: "DELETE" }),
  },

  // ─── Training Sessions ──────────────────────────────
  trainingSessions: {
    get: (id: string) => request<TrainingSession>(`/trainingsession/${id}`),
    getByPlayer: (playerId: string, page = 1, pageSize = 20) =>
      request<PagedResult<TrainingSession>>(`/trainingsession/player/${playerId}?page=${page}&pageSize=${pageSize}`),
    getByTeam: (teamId: string, page = 1, pageSize = 20) =>
      request<PagedResult<TrainingSession>>(`/trainingsession/team/${teamId}?page=${page}&pageSize=${pageSize}`),
    start: (data: { scenarioId: string; mode: string; teamId?: string }) =>
      request<TrainingSession>("/trainingsession/start", { method: "POST", body: JSON.stringify(data) }),
    recordDecision: (sessionId: string, data: { actionType: string; userX: number; userY: number; userTiming: number; optimalX: number; optimalY: number; optimalTiming: number; actionData?: string }) =>
      request<TrainingDecision>(`/trainingsession/${sessionId}/decision`, { method: "POST", body: JSON.stringify(data) }),
    complete: (sessionId: string) => request<TrainingSession>(`/trainingsession/${sessionId}/complete`, { method: "POST" }),
    getResult: (sessionId: string) => request<any>(`/trainingsession/${sessionId}/result`),
    getRecent: (count = 10) => request<TrainingSession[]>(`/trainingsession/recent?count=${count}`),
  },

  // ─── Training Plans ─────────────────────────────────
  trainingPlans: {
    get: (id: string) => request<TrainingPlan>(`/trainingplan/${id}`),
    getByPlayer: (playerId: string) => request<TrainingPlan[]>(`/trainingplan/player/${playerId}`),
    getByTeam: (teamId: string) => request<TrainingPlan[]>(`/trainingplan/team/${teamId}`),
    getByCoach: () => request<TrainingPlan[]>("/trainingplan/coach"),
    create: (data: Partial<TrainingPlan>) => request<TrainingPlan>("/trainingplan", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<TrainingPlan>) => request<TrainingPlan>(`/trainingplan/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/trainingplan/${id}`, { method: "DELETE" }),
    addItem: (planId: string, data: Partial<TrainingPlanItem>) => request<TrainingPlanItem>(`/trainingplan/${planId}/items`, { method: "POST", body: JSON.stringify(data) }),
    updateItem: (itemId: string, data: Partial<TrainingPlanItem>) => request<TrainingPlanItem>(`/trainingplan/items/${itemId}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteItem: (planId: string, itemId: string) => request<void>(`/trainingplan/${planId}/items/${itemId}`, { method: "DELETE" }),
    completeItem: (planId: string, itemId: string) => request<void>(`/trainingplan/${planId}/items/${itemId}/complete`, { method: "POST" }),
  },

  // ─── Player Profiles ────────────────────────────────
  playerProfiles: {
    get: (id: string) => request<PlayerProfile>(`/playerprofile/${id}`),
    getByUser: (userId: string) => request<PlayerProfile>(`/playerprofile/user/${userId}`),
    create: (data: Partial<PlayerProfile>) => request<PlayerProfile>("/playerprofile", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<PlayerProfile>) => request<PlayerProfile>(`/playerprofile/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/playerprofile/${id}`, { method: "DELETE" }),
    getProgress: (id: string) => request<PlayerProgress[]>(`/playerprofile/${id}/progress`),
    getAchievements: (id: string) => request<PlayerAchievement[]>(`/playerprofile/${id}/achievements`),
    awardAchievement: (id: string, data: { title: string; description: string; iconUrl?: string }) =>
      request<PlayerAchievement>(`/playerprofile/${id}/achievements`, { method: "POST", body: JSON.stringify(data) }),
  },

  // ─── Teams ───────────────────────────────────────────
  teams: {
    get: (id: string) => request<Team>(`/team/${id}`),
    list: () => request<Team[]>("/team"),
    create: (data: Partial<Team>) => request<Team>("/team", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Team>) => request<Team>(`/team/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/team/${id}`, { method: "DELETE" }),
    addPlayer: (teamId: string, playerId: string) => request<void>(`/team/${teamId}/players/${playerId}`, { method: "POST" }),
    removePlayer: (teamId: string, playerId: string) => request<void>(`/team/${teamId}/players/${playerId}`, { method: "DELETE" }),
  },

  // ─── Academies ───────────────────────────────────────
  academies: {
    get: (id: string) => request<Academy>(`/academy/${id}`),
    list: () => request<Academy[]>("/academy"),
    create: (data: Partial<Academy>) => request<Academy>("/academy", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Academy>) => request<Academy>(`/academy/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/academy/${id}`, { method: "DELETE" }),
  },

  // ─── Subscription ────────────────────────────────────
  subscription: {
    plans: () => request<SubscriptionPlan[]>("/subscription/plans"),
    createPayment: (planId: string, couponCode?: string) =>
      request<{ id?: string; redirectUrl?: string; paymentUrl?: string }>("/subscription/create-payment", {
        method: "POST",
        body: JSON.stringify({ planId, couponCode, callbackUrl: typeof window !== "undefined" ? `${window.location.origin}/payment/callback` : "" }),
      }),
    active: () => request<Subscription | null>("/subscription/active"),
    checkFeature: (key: string) => request<{ hasAccess: boolean; remainingUsage: number }>(`/subscription/check-feature/${key}`),
  },

  // ─── Articles ────────────────────────────────────────
  articles: {
    list: (page = 1, pageSize = 10, lang?: string, includeUnpublished?: boolean) => {
      const qs = [`page=${page}`, `pageSize=${pageSize}`];
      if (lang) qs.push(`lang=${lang}`);
      if (includeUnpublished) qs.push(`includeUnpublished=true`);
      return request<{ items: Article[]; total: number }>(`/Articles?${qs.join("&")}`);
    },
    getBySlug: (slug: string, lang?: string) => {
      const qs = lang ? `?lang=${lang}` : "";
      return request<Article>(`/Articles/${slug}${qs}`);
    },
    create: (data: Record<string, unknown>) =>
      request<Article>("/Articles", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      request<void>(`/Articles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/Articles/${id}`, { method: "DELETE" }),
    publish: (id: string) => request<void>(`/Articles/${id}/publish`, { method: "PUT" }),
  },

  // ─── FAQs ────────────────────────────────────────────
  faqs: {
    list: (language?: string) => {
      const qs = language ? `?language=${language}` : "";
      return request<Faq[]>(`/Faqs${qs}`);
    },
    create: (data: Partial<Faq>) => request<Faq>("/Faqs", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Faq>) => request<void>(`/Faqs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/Faqs/${id}`, { method: "DELETE" }),
  },

  // ─── Discounts / Coupons ─────────────────────────────
  discounts: {
    list: () => request<Discount[]>("/Discount/discounts"),
    get: (id: string) => request<Discount>(`/Discount/discounts/${id}`),
    create: (data: Partial<Discount>) => request<Discount>("/Discount/discounts", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Discount>) => request<Discount>(`/Discount/discounts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/Discount/discounts/${id}`, { method: "DELETE" }),
    listCoupons: () => request<Coupon[]>("/Discount/coupons"),
    createCoupon: (data: Partial<Coupon>) => request<Coupon>("/Discount/coupons", { method: "POST", body: JSON.stringify(data) }),
    updateCoupon: (id: string, data: Partial<Coupon>) => request<Coupon>(`/Discount/coupons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteCoupon: (id: string) => request<void>(`/Discount/coupons/${id}`, { method: "DELETE" }),
    validateCoupon: (code: string, planId: string) => request<{ valid: boolean; discount: number }>("/Discount/coupons/validate", { method: "POST", body: JSON.stringify({ code, planId }) }),
  },

  // ─── Statistics ──────────────────────────────────────
  statistics: {
    playerDashboard: (playerId: string) => request<PlayerStats>(`/statistics/player/${playerId}`),
    coachDashboard: (coachId: string) => request<CoachStats>(`/statistics/coach/${coachId}`),
    adminDashboard: () => request<AdminStats>("/statistics/admin"),
    playerTrends: (playerId: string, days = 30) =>
      request<any[]>(`/statistics/player/${playerId}/trends?days=${days}`),
    rankings: (teamId?: string) => {
      const qs = teamId ? `?teamId=${teamId}` : "";
      return request<any[]>(`/statistics/rankings${qs}`);
    },
  },

  // ─── Payment Settings (SuperAdmin) ──────────────────
  paymentSettings: {
    get: () => request<{ isSandbox: boolean }>("/admin/payment-settings"),
    update: (isSandbox: boolean) =>
      request<{ isSandbox: boolean; message: string }>("/admin/payment-settings", {
        method: "PUT",
        body: JSON.stringify({ isSandbox }),
      }),
  },

  // ─── Tactical ────────────────────────────────────────
  tactical: {
    analyze: (gameState: GameState) =>
      request<any>("/tactical/analyze", { method: "POST", body: JSON.stringify(gameState) }),
    evaluate: (data: any) =>
      request<any>("/tactical/evaluate", { method: "POST", body: JSON.stringify(data) }),
    recommendations: (gameState: GameState, playerId: string) =>
      request<any[]>(`/tactical/recommendations?playerId=${playerId}`, { method: "POST", body: JSON.stringify(gameState) }),
  },

  // ─── AI ──────────────────────────────────────────────
  ai: {
    chat: (systemPrompt: string, userMessage: string, temperature = 0.7, maxTokens = 2048) =>
      request<string>("/ai/chat", { method: "POST", body: JSON.stringify({ systemPrompt, userMessage, temperature, maxTokens }) }),
    analyzeTactical: (scenario: string, players: string) =>
      request<string>("/ai/analyze-tactical", { method: "POST", body: JSON.stringify({ scenario, players }) }),
    generateTrainingPlan: (playerLevel: string, focusArea: string) =>
      request<string>("/ai/generate-training-plan", { method: "POST", body: JSON.stringify({ playerLevel, focusArea }) }),
    evaluatePerformance: (stats: string) =>
      request<string>("/ai/evaluate-performance", { method: "POST", body: JSON.stringify({ stats }) }),
    getTacticalSuggestion: (data: {
      selectedPlayerId: string;
      selectedPlayerNumber: number;
      selectedPlayerPosition: string;
      selectedPlayerTeam: number;
      selectedPlayerX: number;
      selectedPlayerY: number;
      hasBall: boolean;
      allPlayers: Array<{
        id: string;
        position: string;
        teamId: number;
        x: number;
        y: number;
        number: number;
        isGoalkeeper: boolean;
        hasBall: boolean;
      }>;
      ballHolder?: {
        id: string;
        position: string;
        teamId: number;
        x: number;
        y: number;
        number: number;
        isGoalkeeper: boolean;
        hasBall: boolean;
      };
      scenarioContext?: string;
    }) => request<{
      explanation: string;
      selectedPlayerSuggestion: {
        playerId: string;
        moveX: number;
        moveY: number;
        action: string;
        reason: string;
      };
      teammateSuggestions: Array<{
        playerId: string;
        moveX: number;
        moveY: number;
        action: string;
        reason: string;
      }>;
      passTarget?: {
        playerId: string;
        moveX: number;
        moveY: number;
        action: string;
        reason: string;
      };
    }>("/ai/tactical-suggestion", { method: "POST", body: JSON.stringify(data) }),
    checkAccess: () => request<boolean>("/ai/check-ai-access", { method: "POST" }),
    generateArticle: (data: { title: string; summary?: string; focusKeyword?: string; language?: string; wordCount?: number }) =>
      request<AIArticleResponse>("/AI/generate-article", { method: "POST", body: JSON.stringify(data) }),
  },
};
