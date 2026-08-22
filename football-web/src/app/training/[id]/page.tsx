"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import FootballPitch, { PlayerData, BallData } from "@/components/football-pitch";
import { api } from "@/lib/api";

const DEFAULT_PLAYERS: PlayerData[] = [
  { id: "atk1", teamId: 1, number: 9, x: 70, y: 45, hasBall: true, isTarget: true, isDefender: false, position: "ST" },
  { id: "atk2", teamId: 1, number: 10, x: 55, y: 35, hasBall: false, isTarget: false, isDefender: false, position: "CAM" },
  { id: "atk3", teamId: 1, number: 7, x: 40, y: 20, hasBall: false, isTarget: false, isDefender: false, position: "RW" },
  { id: "atk4", teamId: 1, number: 11, x: 40, y: 70, hasBall: false, isTarget: false, isDefender: false, position: "LW" },
  { id: "def1", teamId: 2, number: 4, x: 80, y: 40, hasBall: false, isTarget: false, isDefender: true, position: "CB" },
  { id: "def2", teamId: 2, number: 5, x: 80, y: 55, hasBall: false, isTarget: false, isDefender: true, position: "CB" },
  { id: "def3", teamId: 2, number: 2, x: 85, y: 25, hasBall: false, isTarget: false, isDefender: true, position: "RB" },
];
const DEFAULT_BALL: BallData = { x: 70, y: 45 };

interface Recommendation {
  actionType: string;
  targetX: number;
  targetY: number;
  score: number;
  description: string;
  coachingTip: string;
}

interface Evaluation {
  overallScore: number;
  positionScore: number;
  timingScore: number;
  movementScore: number;
  explanation: string;
}

export default function TrainingPage() {
  const params = useParams();
  const router = useRouter();
  const scenarioId = params?.id as string;

  const [players, setPlayers] = useState<PlayerData[]>(DEFAULT_PLAYERS);
  const [ball, setBall] = useState<BallData>(DEFAULT_BALL);
  const [targetPlayerId] = useState("atk1");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [showCoaching, setShowCoaching] = useState(false);
  const [scenario, setScenario] = useState<any>(null);

  useEffect(() => {
    if (scenarioId) {
      api.scenarios.get(scenarioId).then(setScenario).catch(() => {});
    }
  }, [scenarioId]);

  const handlePlayerMove = useCallback((playerId: string, x: number, y: number) => {
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, x, y } : p)));
  }, []);

  const handleGetRecommendations = useCallback(async () => {
    try {
      const gameState = {
        time: 72, ballX: ball.x, ballY: ball.y,
        players: players.map((p) => ({
          id: p.id, teamId: p.teamId, number: p.number, position: p.position,
          x: p.x, y: p.y, direction: 0, speed: 1, hasBall: p.hasBall, isTarget: p.isTarget,
        })),
        phase: "ATTACK", targetPlayerId,
      };
      const data = await api.tactical.recommendations(gameState, targetPlayerId);
      setRecommendations(data);
    } catch {
      setRecommendations([
        { actionType: "RUN_IN_BEHIND", targetX: 88, targetY: 42, score: 92, description: "Run behind defense", coachingTip: "Attack the space behind the defensive line" },
        { actionType: "CHECK_TO_BALL", targetX: 60, targetY: 45, score: 78, description: "Check to ball", coachingTip: "Come short to receive the pass" },
        { actionType: "CREATE_SPACE", targetX: 65, targetY: 30, score: 70, description: "Create space", coachingTip: "Move to open a passing lane" },
      ]);
    }
    setShowCoaching(false);
    setEvaluation(null);
  }, [players, ball, targetPlayerId]);

  const handleEvaluate = useCallback(async () => {
    const target = players.find((p) => p.id === targetPlayerId);
    try {
      const result = await api.tactical.evaluate({
        scenarioId, userX: target?.x || 0, userY: target?.y || 0,
        actionType: selectedRec?.actionType || "HOLD_POSITION", timing: 1.8,
      });
      setEvaluation(result);
    } catch {
      setEvaluation({
        overallScore: 78, positionScore: 82, timingScore: 75, movementScore: 76,
        explanation: "Good positioning. Consider running behind the defense for a better scoring opportunity.",
      });
    }
    setShowCoaching(true);
  }, [players, targetPlayerId, selectedRec, scenarioId]);

  const scoreColor = (s: number) => s >= 80 ? "text-green-600" : s >= 60 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="text-white hover:text-green-400">Home</button>
          <h1 className="text-white font-bold text-lg">{scenario?.name || "Tactical Training"}</h1>
        </div>
      </header>
      <div className="flex">
        <div className="flex-1 p-4 flex justify-center">
          <FootballPitch
            players={players}
            ball={ball}
            onPlayerMove={handlePlayerMove}
            showMovementPath={!!selectedRec}
            movementPath={selectedRec ? [
              { x: players.find((p) => p.id === targetPlayerId)?.x || 0, y: players.find((p) => p.id === targetPlayerId)?.y || 0 },
              { x: selectedRec.targetX, y: selectedRec.targetY },
            ] : []}
            optimalPath={evaluation ? [
              { x: players.find((p) => p.id === targetPlayerId)?.x || 0, y: players.find((p) => p.id === targetPlayerId)?.y || 0 },
              { x: 88, y: 42 },
            ] : []}
            highlightZone={selectedRec ? [{ x: selectedRec.targetX, y: selectedRec.targetY, radius: 8, color: "rgba(59,130,246,0.3)" }] : []}
          />
        </div>
        <div className="w-80 bg-gray-800 p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-56px)]">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-white font-bold mb-2">Actions</h3>
            <button onClick={handleGetRecommendations} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-2">Get Tactical Analysis</button>
            <button onClick={handleEvaluate} disabled={!selectedRec} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">Evaluate My Decision</button>
          </div>
          {recommendations.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-bold mb-2">Tactical Options</h3>
              <div className="flex flex-col gap-2">
                {recommendations.map((r, i) => (
                  <button key={i} onClick={() => setSelectedRec(r)}
                    className={`p-3 rounded-lg text-left transition ${selectedRec?.actionType === r.actionType ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm font-semibold">{r.actionType.replace(/_/g, " ")}</span>
                      <span className={`text-sm font-bold ${scoreColor(r.score)}`}>{r.score}</span>
                    </div>
                    <p className="text-gray-300 text-xs mt-1">{r.coachingTip}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {showCoaching && evaluation && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-bold mb-2">Coaching Feedback</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: "Overall", value: evaluation.overallScore },
                  { label: "Position", value: evaluation.positionScore },
                  { label: "Timing", value: evaluation.timingScore },
                  { label: "Movement", value: evaluation.movementScore },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-600 rounded p-2 text-center">
                    <div className={`text-xl font-bold ${scoreColor(s.value)}`}>{s.value}</div>
                    <div className="text-gray-300 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-gray-300 text-sm">{evaluation.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
