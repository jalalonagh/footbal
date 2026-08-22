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
}

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
