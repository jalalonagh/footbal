// ─── Auth ──────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  refreshToken: string;
  email: string;
  role: string;
  userId: string;
  fullName: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Scenario ──────────────────────────────────────────
export interface Scenario {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  formation: string;
  gamePhase: string;
  gameMinute: number;
  homeScore: number;
  awayScore: number;
  status: string;
  trainingMode: string;
  playerCount: number;
  isPublic: boolean;
  players?: ScenarioPlayer[];
}

export interface ScenarioPlayer {
  id: string;
  number: number;
  position: string;
  role: string;
  startX: number;
  startY: number;
  teamId: number;
  speed: number;
  hasBall: boolean;
  isTarget: boolean;
}

export interface ScenarioSolution {
  id: string;
  solutionType: string;
  name: string;
  optimalX: number;
  optimalY: number;
  score: number;
  movementPath: string;
  coachingExplanation: string;
}

export interface ScenarioRule {
  id: string;
  conditionJson: string;
  actionJson: string;
  priority: number;
  isActive: boolean;
}

// ─── Training ──────────────────────────────────────────
export interface TrainingSession {
  id: string;
  playerProfileId: string;
  scenarioId: string;
  scenarioName?: string;
  status: string;
  trainingMode: string;
  overallScore: number;
  startedAt: string;
  completedAt: string;
}

export interface TrainingDecision {
  id: string;
  trainingSessionId: string;
  actionType: string;
  userX: number;
  userY: number;
  userTiming: number;
  optimalX: number;
  optimalY: number;
  optimalTiming: number;
  score: number;
  feedback: string;
  recordedAt: string;
}

export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  playerProfileId: string;
  teamId: string;
  createdByCoachId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  items?: TrainingPlanItem[];
}

export interface TrainingPlanItem {
  id: string;
  title: string;
  description: string;
  scenarioId: string;
  duration: number;
  isCompleted: boolean;
  completedAt: string;
}

// ─── Player ────────────────────────────────────────────
export interface PlayerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  position: string;
  jerseyNumber: number;
  dateOfBirth: string;
  skillLevel: string;
  overallRating: number;
  technicalSkill: number;
  tacticalAwareness: number;
  physicalCondition: number;
  mentalStrength: number;
}

export interface PlayerProgress {
  id: string;
  playerProfileId: string;
  category: string;
  score: number;
  sessionsCompleted: number;
  lastUpdated: string;
}

export interface PlayerAchievement {
  id: string;
  playerProfileId: string;
  title: string;
  description: string;
  iconUrl: string;
  earnedAt: string;
}

// ─── Team ──────────────────────────────────────────────
export interface Team {
  id: string;
  name: string;
  academyId: string;
  coachId: string;
  description: string;
  playerCount: number;
}

// ─── Academy ───────────────────────────────────────────
export interface Academy {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  teamCount: number;
}

// ─── Subscription ──────────────────────────────────────
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  price: number;
  discountPrice: number;
  currency: string;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: string;
}

// ─── CMS ───────────────────────────────────────────────
export interface ArticleTranslation {
  language: string;
  title: string;
  content: string;
  summary: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  keywords?: string;
  excerpt?: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  slug: string;
  coverImageUrl: string;
  coverImageAlt?: string;
  viewCount: number;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  keywords?: string;
  canonicalUrl?: string;
  schemaJson?: string;
  readingTimeMinutes?: number;
  excerpt?: string;
  translations?: ArticleTranslation[];
}

export interface AIArticleResponse {
  title: string;
  content: string;
  summary: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  keywords: string;
  excerpt: string;
  readingTimeMinutes: number;
  schemaJson: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  language: string;
  isActive: boolean;
  displayOrder: number;
}

// ─── Discount / Coupon ─────────────────────────────────
export interface Discount {
  id: string;
  code: string;
  description: string;
  percentage: number;
  fixedAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountId: string;
  maxUses: number;
  currentUses: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  minAmount: number;
}

// ─── Statistics ────────────────────────────────────────
export interface PlayerStats {
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  totalHours: number;
  strongestSkill: string;
  weakestSkill: string;
  rank: number;
}

export interface CoachStats {
  totalPlayers: number;
  totalTeams: number;
  totalSessions: number;
  averagePlayerScore: number;
}

export interface AdminStats {
  totalUsers: number;
  totalSubscriptions: number;
  totalRevenue: number;
  activeUsers: number;
}

// ─── Tactical ──────────────────────────────────────────
export interface PlayerData {
  id: string;
  teamId: number;
  number: number;
  x: number;
  y: number;
  hasBall: boolean;
  isTarget: boolean;
  isDefender: boolean;
  position: string;
}

export interface BallData { x: number; y: number; }

export interface TacticalRecommendation {
  actionType: string;
  targetX: number;
  targetY: number;
  score: number;
  description?: string;
  coachingTip?: string;
}

export interface EvaluationResult {
  overallScore: number;
  positionScore: number;
  timingScore: number;
  movementScore: number;
  mistakeType?: string;
  explanation?: string;
  bestAlternative?: string;
}

export interface GameState {
  time: number;
  ballX: number;
  ballY: number;
  players: PlayerState[];
  phase: string;
  targetPlayerId?: string;
}

export interface PlayerState {
  id: string;
  teamId: number;
  number: number;
  position: string;
  x: number;
  y: number;
  direction: number;
  speed: number;
  hasBall: boolean;
  isTarget: boolean;
}

// ─── Paginated Result ──────────────────────────────────
export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
