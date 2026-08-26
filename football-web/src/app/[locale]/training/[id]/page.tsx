"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import FootballPitch, { PlayerData, BallData, DirectionMode } from "@/components/football-pitch";
import { api } from "@/lib/api";
import { Link } from "@/i18n/routing";
import AnimatedPassBall from "@/components/animated-pass-ball";

const ThreeDView = dynamic(() => import("@/components/three-d-view"), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-gray-800 rounded-lg flex items-center justify-center text-white">Loading 3D...</div>,
});

type FormationEntry = [string, number, number, number];

const FORMATIONS: Record<number, FormationEntry[]> = {
  5: [
    ["GK", 1, 5, 50],
    ["CB", 4, 18, 30], ["CB", 5, 18, 70],
    ["CM", 6, 38, 35], ["CM", 8, 38, 65],
  ],
  6: [
    ["GK", 1, 5, 50],
    ["CB", 4, 18, 30], ["CB", 5, 18, 70],
    ["CM", 6, 35, 30], ["CM", 8, 35, 70],
    ["ST", 9, 45, 50],
  ],
  7: [
    ["GK", 1, 5, 50],
    ["CB", 4, 18, 25], ["CB", 5, 18, 50], ["CB", 3, 18, 75],
    ["CM", 6, 35, 30], ["CM", 8, 35, 70],
    ["ST", 9, 45, 50],
  ],
  8: [
    ["GK", 1, 5, 50],
    ["CB", 4, 18, 25], ["CB", 5, 18, 50], ["CB", 3, 18, 75],
    ["LM", 11, 35, 20], ["CM", 6, 35, 50], ["RM", 7, 35, 80],
    ["ST", 9, 45, 50],
  ],
  9: [
    ["GK", 1, 5, 50],
    ["CB", 4, 18, 25], ["CB", 5, 18, 50], ["CB", 3, 18, 75],
    ["LM", 11, 35, 18], ["CM", 6, 35, 40], ["CM", 8, 35, 60], ["RM", 7, 35, 82],
    ["ST", 9, 45, 50],
  ],
  10: [
    ["GK", 1, 5, 50],
    ["CB", 4, 18, 25], ["CB", 5, 18, 50], ["CB", 3, 18, 75],
    ["LM", 11, 35, 18], ["CM", 6, 35, 40], ["CM", 8, 35, 60], ["RM", 7, 35, 82],
    ["LW", 10, 45, 25], ["RW", 17, 45, 75],
  ],
  11: [
    ["GK", 1, 5, 50],
    ["CB", 4, 18, 25], ["CB", 5, 18, 50], ["CB", 3, 18, 75],
    ["LM", 11, 35, 18], ["CM", 6, 35, 38], ["CM", 8, 35, 62], ["RM", 7, 35, 82],
    ["LW", 10, 45, 25], ["ST", 9, 45, 50], ["RW", 17, 45, 75],
  ],
};

function makePlayers(count: number = 11): PlayerData[] {
  const formation = FORMATIONS[count];
  const team1 = formation.map(([pos, num, x, y]) => ({
    id: `t1-${num}`, teamId: 1, number: num, x, y,
    hasBall: num === 9, isTarget: num === 9, isDefender: false,
    isGoalkeeper: pos === "GK", position: pos,
    direction: null, suggestedDirection: null, wrongDirection: null,
  }));
  const team2 = formation.map(([pos, num, x, y]) => ({
    id: `t2-${num}`, teamId: 2, number: num, x: 100 - x, y,
    hasBall: false, isTarget: false, isDefender: true,
    isGoalkeeper: pos === "GK", position: pos,
    direction: null, suggestedDirection: null, wrongDirection: null,
  }));
  return [...team1, ...team2];
}

function makeBall(): BallData {
  return { x: 50, y: 50, holderId: null, direction: null, suggestedDirection: null, wrongDirection: null };
}

interface CoachingTip {
  overall: number; position: number; timing: number; movement: number;
  explanation: string;
}

export default function TrainingPage() {
  const params = useParams();
  const scenarioId = params?.id as string;
  const t = useTranslations("training");
  const tNav = useTranslations("nav");

  const [players, setPlayers] = useState<PlayerData[]>(makePlayers);
  const [ball, setBall] = useState<BallData>(makeBall);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [directionMode, setDirectionMode] = useState<DirectionMode>("current");
  const [scenario, setScenario] = useState<any>(null);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [coaching, setCoaching] = useState<CoachingTip | null>(null);
  const [showCoaching, setShowCoaching] = useState(false);

  const [evaluations, setEvaluations] = useState<Record<string, {
    suggestedX: number;
    suggestedY: number;
    direction: { x: number; y: number };
    explanation: string;
    action: string;
    reason: string;
  }>>({});
  const [evaluating, setEvaluating] = useState(false);

  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [passSimulation, setPassSimulation] = useState<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    targetPlayerNumber: number;
    targetPlayerName: string;
    passType: string;
    reason: string;
    trajectory: string;
  } | null>(null);
  const [passSimulating, setPassSimulating] = useState(false);

  const [hasAIAccess, setHasAIAccess] = useState<boolean | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(11);
  const [passMode, setPassMode] = useState(false);
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    if (scenarioId) {
      Promise.all([
        api.scenarios.get(scenarioId),
        api.scenarios.getPlayers(scenarioId),
        api.scenarios.getSolutions(scenarioId).catch(() => []),
        api.scenarios.getRules(scenarioId).catch(() => []),
      ])
        .then(([s, p, sols, rls]) => {
          setScenario(s);
          setSolutions(sols || []);
          setRules(rls || []);
          if (p && p.length > 0) {
            const mapped = p.map((sp: any) => ({
              id: sp.id,
              teamId: sp.teamId,
              number: sp.number,
              x: sp.startX,
              y: sp.startY,
              hasBall: sp.hasBall,
              isTarget: sp.isTarget,
              isDefender: sp.teamId === 2,
              isGoalkeeper: sp.position === "GK",
              position: sp.position,
              direction: null,
              suggestedDirection: null,
              wrongDirection: null,
            }));
            setPlayers(mapped);
            const holder = mapped.find((pl: any) => pl.hasBall);
            if (holder) setBall({ x: holder.x, y: holder.y, holderId: holder.id, direction: null, suggestedDirection: null, wrongDirection: null });
          }
        })
        .catch(() => {});
    }
  }, [scenarioId]);

  useEffect(() => {
    setHasAIAccess(true);
  }, []);

  const handlePlayerMove = useCallback((id: string, x: number, y: number) => {
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, x, y } : p));
    if (ball.holderId === id) {
      setBall((b) => ({ ...b, x, y }));
    }
  }, [ball.holderId]);

  const handleBallMove = useCallback((x: number, y: number, clearHolder = true) => {
    setBall((b) => ({ ...b, x, y, holderId: clearHolder ? null : b.holderId }));
    if (clearHolder) {
      setPlayers((prev) => prev.map((p) => ({ ...p, hasBall: false })));
    }
  }, []);

  const handleBallClaimed = useCallback((playerId: string) => {
    setBall((b) => ({ ...b, holderId: playerId }));
    setPlayers((prev) => prev.map((p) => ({ ...p, hasBall: p.id === playerId })));
  }, []);

  const handlePass = useCallback((fromPlayerId: string, toPlayerId: string) => {
    setBall((b) => ({ ...b, holderId: toPlayerId }));
    setPlayers((prev) => prev.map((p) => {
      if (p.id === fromPlayerId) return { ...p, hasBall: false };
      if (p.id === toPlayerId) return { ...p, hasBall: true };
      return p;
    }));
  }, []);

  const handleResetPositions = useCallback(() => {
    const formation = FORMATIONS[playerCount];
    const team1 = formation.map(([pos, num, x, y]) => ({
      id: `t1-${num}`, teamId: 1, number: num, x, y,
      hasBall: num === 9, isTarget: num === 9, isDefender: false,
      isGoalkeeper: pos === "GK", position: pos,
      direction: null, suggestedDirection: null, wrongDirection: null,
    }));
    const team2 = formation.map(([pos, num, x, y]) => ({
      id: `t2-${num}`, teamId: 2, number: num, x: 100 - x, y,
      hasBall: false, isTarget: false, isDefender: true,
      isGoalkeeper: pos === "GK", position: pos,
      direction: null, suggestedDirection: null, wrongDirection: null,
    }));
    setPlayers([...team1, ...team2]);
    setBall({ x: 50, y: 50, holderId: null, direction: null, suggestedDirection: null, wrongDirection: null });
    setSelectedPlayerId(null);
    setEvaluations({});
    setAiSuggestions([]);
    setShowAISuggestions(false);
    setAiExplanation(null);
  }, [playerCount]);

  const handleDirectionSet = useCallback((playerId: string, dx: number, dy: number) => {
    setPlayers((prev) => prev.map((p) => {
      if (p.id !== playerId) return p;
      if (directionMode === "current") return { ...p, direction: { x: dx, y: dy } };
      if (directionMode === "suggested") return { ...p, suggestedDirection: { x: dx, y: dy } };
      return { ...p, wrongDirection: { x: dx, y: dy } };
    }));
  }, [directionMode]);

  const handleBallDirectionSet = useCallback((dx: number, dy: number) => {
    setBall((b) => {
      if (directionMode === "current") return { ...b, direction: { x: dx, y: dy } };
      if (directionMode === "suggested") return { ...b, suggestedDirection: { x: dx, y: dy } };
      return { ...b, wrongDirection: { x: dx, y: dy } };
    });
  }, [directionMode]);

  const handleClearPlayerDirection = useCallback((playerId: string) => {
    setPlayers((prev) => prev.map((p) => {
      if (p.id !== playerId) return p;
      if (directionMode === "current") return { ...p, direction: null };
      if (directionMode === "suggested") return { ...p, suggestedDirection: null };
      return { ...p, wrongDirection: null };
    }));
  }, [directionMode]);

  const handleClearBallDirection = useCallback(() => {
    setBall((b) => {
      if (directionMode === "current") return { ...b, direction: null };
      if (directionMode === "suggested") return { ...b, suggestedDirection: null };
      return { ...b, wrongDirection: null };
    });
  }, [directionMode]);

  const handleAISuggestion = useCallback(async () => {
    if (!selectedPlayerId) return;
    setAiLoading(true);
    try {
      const ballHolder = ball.holderId ? players.find((p) => p.id === ball.holderId) : null;
      const response = await api.ai.getTacticalSuggestion({
        selectedPlayerId,
        selectedPlayerNumber: players.find((p) => p.id === selectedPlayerId)?.number || 0,
        selectedPlayerPosition: players.find((p) => p.id === selectedPlayerId)?.position || "",
        selectedPlayerTeam: players.find((p) => p.id === selectedPlayerId)?.teamId || 0,
        selectedPlayerX: players.find((p) => p.id === selectedPlayerId)?.x || 0,
        selectedPlayerY: players.find((p) => p.id === selectedPlayerId)?.y || 0,
        hasBall: ball.holderId === selectedPlayerId,
        allPlayers: players.map((p) => ({
          id: p.id, position: p.position, teamId: p.teamId,
          x: p.x, y: p.y, number: p.number,
          isGoalkeeper: p.isGoalkeeper, hasBall: p.hasBall,
        })),
        ballHolder: ballHolder ? {
          id: ballHolder.id, position: ballHolder.position, teamId: ballHolder.teamId,
          x: ballHolder.x, y: ballHolder.y, number: ballHolder.number,
          isGoalkeeper: ballHolder.isGoalkeeper, hasBall: ballHolder.hasBall,
        } : undefined,
        scenarioContext: scenario?.description,
      });
      setAiSuggestions(response.teammateSuggestions || []);
      setAiExplanation(response.explanation || null);
      setShowAISuggestions(true);
    } catch (err: any) {
      console.error("AI suggestion failed", err);
    }
    setAiLoading(false);
  }, [selectedPlayerId, players, ball, scenario, hasAIAccess, t]);

  const handleClearAISuggestions = useCallback(() => {
    setAiSuggestions([]);
    setShowAISuggestions(false);
    setAiExplanation(null);
  }, []);

  const handleSimulatePass = useCallback(async () => {
    if (!ball.holderId) return;
    const ballHolder = players.find((p) => p.id === ball.holderId);
    if (!ballHolder) return;
    setPassSimulating(true);
    try {
      const response = await api.ai.simulatePass({
        ballHolderId: ballHolder.id,
        ballHolderNumber: ballHolder.number,
        ballHolderPosition: ballHolder.position,
        ballHolderX: ballHolder.x,
        ballHolderY: ballHolder.y,
        teamId: ballHolder.teamId,
        allPlayers: players.map((p) => ({
          id: p.id, position: p.position, teamId: p.teamId,
          x: p.x, y: p.y, number: p.number,
          isGoalkeeper: p.isGoalkeeper, hasBall: p.hasBall,
        })),
        scenarioContext: scenario?.description,
      });
      setPassSimulation({
        fromX: ballHolder.x,
        fromY: ballHolder.y,
        toX: response.targetX,
        toY: response.targetY,
        targetPlayerNumber: response.targetPlayerNumber,
        targetPlayerName: response.targetPlayerName,
        passType: response.passType,
        reason: response.reason,
        trajectory: response.trajectory,
      });
    } catch (err: any) {
      console.error("Pass simulation failed", err);
    }
    setPassSimulating(false);
  }, [ball.holderId, players, scenario]);

  const handleClearDirections = useCallback(() => {
    setPlayers((prev) => prev.map((p) => ({ ...p, direction: null, suggestedDirection: null, wrongDirection: null })));
    setBall((b) => ({ ...b, direction: null, suggestedDirection: null, wrongDirection: null }));
  }, []);

  const handleEvaluate = useCallback(async () => {
    if (!selectedPlayerId) return;
    const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
    if (!selectedPlayer) return;
    if (evaluations[selectedPlayerId]) return;

    setEvaluating(true);
    try {
      const ballHolder = ball.holderId ? players.find((p) => p.id === ball.holderId) : null;
      const response = await api.ai.getTacticalSuggestion({
        selectedPlayerId: selectedPlayer.id,
        selectedPlayerNumber: selectedPlayer.number,
        selectedPlayerPosition: selectedPlayer.position,
        selectedPlayerTeam: selectedPlayer.teamId,
        selectedPlayerX: selectedPlayer.x,
        selectedPlayerY: selectedPlayer.y,
        hasBall: ball.holderId === selectedPlayer.id,
        allPlayers: players.map((p) => ({
          id: p.id, position: p.position, teamId: p.teamId,
          x: p.x, y: p.y, number: p.number,
          isGoalkeeper: p.isGoalkeeper, hasBall: p.hasBall,
        })),
        ballHolder: ballHolder ? {
          id: ballHolder.id, position: ballHolder.position, teamId: ballHolder.teamId,
          x: ballHolder.x, y: ballHolder.y, number: ballHolder.number,
          isGoalkeeper: ballHolder.isGoalkeeper, hasBall: ballHolder.hasBall,
        } : undefined,
        scenarioContext: scenario?.description,
      });

      const sug = response.selectedPlayerSuggestion;
      const suggestedX = Math.max(2, Math.min(98, selectedPlayer.x + sug.moveX));
      const suggestedY = Math.max(2, Math.min(98, selectedPlayer.y + sug.moveY));
      const dirLen = Math.sqrt(sug.moveX * sug.moveX + sug.moveY * sug.moveY) || 1;

      setEvaluations((prev) => ({
        ...prev,
        [selectedPlayerId]: {
          suggestedX,
          suggestedY,
          direction: { x: (sug.moveX / dirLen) * 18, y: (sug.moveY / dirLen) * 18 },
          explanation: response.explanation,
          action: sug.action,
          reason: sug.reason,
        },
      }));
    } catch (e: any) {
      const msg = e?.message || "Error";
      if (msg.includes("403") || msg.includes("Forbidden")) {
        alert(t("subscriptionRequired") || "Subscription required for AI features");
      } else {
        alert("Evaluation error: " + msg);
      }
    }
    setEvaluating(false);
  }, [selectedPlayerId, players, ball, scenario, evaluations]);

  const handleClearEvaluations = useCallback(() => {
    setEvaluations({});
  }, []);

  const scoreColor = (s: number) => s >= 80 ? "text-green-600" : s >= 60 ? "text-yellow-600" : "text-red-600";
  const selPlayer = players.find((p) => p.id === selectedPlayerId);

  const [zoom, setZoom] = useState(1);
  const [showTacticalPanel, setShowTacticalPanel] = useState(false);
  const [showActionsPanel, setShowActionsPanel] = useState(false);
  const [showPlayerPanel, setShowPlayerPanel] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const isZoomed = zoom > 1;

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white hover:text-green-400">{tNav("home")}</Link>
          <h1 className="text-white font-bold text-lg">{scenario?.name || t("session")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShow3D(!show3D)}
            className={`px-3 py-1 rounded text-sm font-semibold transition ${
              show3D
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {show3D ? "2D" : "3D"}
          </button>
          <button onClick={() => setZoom((z) => Math.max(1, z - 0.25))} className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm">−</button>
          <span className="text-white text-sm min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.25))} className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm">+</button>
          <button onClick={() => setZoom(1)} className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 text-xs ml-1">Reset</button>
        </div>
      </header>

      <div className="relative overflow-auto" style={{ height: "calc(100vh - 56px)" }}>
        <div className="flex justify-center p-4" style={{ transform: `scale(${zoom})`, transformOrigin: "top center", minHeight: isZoomed ? `${100 / zoom}%` : undefined }}>
          {show3D ? (
            <Suspense fallback={<div className="w-full h-[500px] bg-gray-800 rounded-lg flex items-center justify-center text-white">Loading 3D...</div>}>
              <ThreeDView
                players={players.map((p) => ({
                  id: p.id,
                  x: p.x,
                  y: p.y,
                  teamId: p.teamId,
                  number: p.number,
                  position: p.position,
                  isGoalkeeper: p.isGoalkeeper,
                  hasBall: p.hasBall,
                }))}
                ball={{ x: ball.x, y: ball.y, holderId: ball.holderId }}
                selectedPlayerId={selectedPlayerId}
                width={800}
                height={500}
              />
            </Suspense>
          ) : (
            <FootballPitch
              players={players} ball={ball}
              selectedPlayerId={selectedPlayerId} directionMode={directionMode}
              passMode={passMode}
              onPlayerMove={handlePlayerMove} onBallMove={handleBallMove}
              onPlayerSelect={setSelectedPlayerId}
              onDirectionSet={handleDirectionSet} onBallDirectionSet={handleBallDirectionSet}
              onBallClaimed={handleBallClaimed} onPass={handlePass}
              evaluations={evaluations}
              aiSuggestions={aiSuggestions}
              showAISuggestions={showAISuggestions}
              passSimulation={passSimulation}
              onPassSimulationComplete={() => setPassSimulation(null)}
              onPassSimulationDismiss={() => setPassSimulation(null)}
            />
          )}
        </div>

        {!isZoomed && (
          <div className="w-80 bg-gray-800 p-4 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-56px)] absolute right-0 top-0">
            {/* Normal mode panels - same as before */}
          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-white font-bold mb-2">{t("tacticalOptions")}</h3>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {(["current", "suggested", "wrong", "all"] as DirectionMode[]).map((m) => (
                <button key={m} onClick={() => setDirectionMode(m)}
                  className={`py-1.5 rounded text-xs font-semibold transition ${
                    directionMode === m
                      ? m === "current" ? "bg-white text-gray-900" : m === "suggested" ? "bg-green-600 text-white" : m === "wrong" ? "bg-red-600 text-white" : "bg-purple-600 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}>
                  {m === "current" ? t("current") || "Current" : m === "suggested" ? t("suggested") || "Suggested" : m === "wrong" ? t("wrong") || "Wrong" : t("all") || "All"}
                </button>
              ))}
            </div>
            <p className="text-gray-400 text-xs">
              {directionMode === "current" ? (t("currentDesc") || "White arrows: actual positions")
                : directionMode === "suggested" ? (t("suggestedDesc") || "Green arrows: recommended moves")
                : directionMode === "wrong" ? (t("wrongDesc") || "Red arrows: incorrect moves")
                : (t("allDesc") || "Show all arrows (view only)")}
            </p>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-white font-bold mb-2">{t("actions") || "Actions"}</h3>
            <div className="mb-2">
              <label className="text-gray-300 text-sm mb-1 block">{t("playerCount") || "Player Count"}</label>
              <select
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
                className="w-full py-1 px-2 bg-gray-600 text-white rounded text-sm"
              >
                {[5, 6, 7, 8, 9, 10, 11].map((n) => (
                  <option key={n} value={n}>{n}v{n}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setPassMode(!passMode)}
              className={`w-full py-2 rounded mb-1 text-sm font-semibold transition ${
                passMode
                  ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                  : "bg-gray-600 text-gray-300 hover:bg-gray-500"
              }`}
            >
              {passMode ? (t("passModeOn") || "⚽ Pass Mode ON") : (t("passModeOff") || "⚽ Pass Mode OFF")}
            </button>
            <button onClick={handleResetPositions} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-1 text-sm">{t("resetPositions") || "Reset Positions"}</button>
            <button onClick={handleClearDirections} className="w-full py-2 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm">{t("clearDirections") || "Clear Directions"}</button>
          </div>

          {scenario && (
            <div className="bg-gray-700 rounded-lg p-3">
              <h3 className="text-white font-bold mb-2">{t("gameInfo") || "Game Info"}</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>{t("formation") || "Formation"}: <span className="font-semibold">{scenario.formation}</span></p>
                <p>{t("phase") || "Phase"}: <span className="font-semibold">{scenario.gamePhase}</span></p>
                <p>{t("minute") || "Minute"}: <span className="font-semibold">{scenario.gameMinute}&apos;</span></p>
                <p>{t("mode") || "Mode"}: <span className="font-semibold">{scenario.trainingMode}</span></p>
                <p>Score: <span className="font-semibold">{scenario.homeScore} - {scenario.awayScore}</span></p>
                {scenario.description && <p className="text-gray-400 text-xs mt-2">{scenario.description}</p>}
              </div>
            </div>
          )}

          {solutions.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-3">
              <h3 className="text-white font-bold mb-2">{t("coachingNotes") || "Coaching Notes"}</h3>
              <div className="space-y-2">
                {solutions.map((sol: any) => (
                  <div key={sol.id} className="bg-gray-600 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-xs font-semibold">{sol.name}</span>
                      <span className="text-green-400 text-xs">{sol.score}%</span>
                    </div>
                    {sol.coachingExplanation && (
                      <p className="text-gray-300 text-xs">{sol.coachingExplanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {rules.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-3">
              <h3 className="text-white font-bold mb-2">{t("scenarioRules") || "Scenario Rules"}</h3>
              <div className="space-y-1">
                {rules.filter((r: any) => r.isActive).map((rule: any, i: number) => (
                  <div key={rule.id} className="text-xs text-gray-300 bg-gray-600 rounded p-2">
                    <span className="text-yellow-400">Rule {i + 1}</span> (Priority: {rule.priority})
                  </div>
                ))}
              </div>
            </div>
          )}

          {selPlayer && (
            <div className="bg-gray-700 rounded-lg p-3">
              <h3 className="text-white font-bold mb-2">{t("selectedPlayer") || "Selected Player"}</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>#{selPlayer.number} - {selPlayer.position}</p>
                <p>{selPlayer.teamId === 1 ? (t("team1") || "Home") : (t("team2") || "Away")}</p>
                {selPlayer.isGoalkeeper && <p className="text-yellow-400">{t("goalkeeper") || "Goalkeeper"}</p>}
                {ball.holderId === selPlayer.id && <p className="text-orange-400">{t("hasBall") || "Has Ball"}</p>}
                <p className="text-xs text-gray-400">{t("dblClickSetDir") || "Double-click to set direction"}</p>
              </div>
              <div className="mt-3 space-y-1">
                {selPlayer.direction && (
                  <button onClick={() => handleClearPlayerDirection(selPlayer.id)}
                    className="w-full py-1.5 bg-white/10 text-white rounded text-xs hover:bg-white/20">
                    {t("clearCurrent") || "Clear Current Direction"}
                  </button>
                )}
                {selPlayer.suggestedDirection && (
                  <button onClick={() => handleClearPlayerDirection(selPlayer.id)}
                    className="w-full py-1.5 bg-green-600/30 text-green-300 rounded text-xs hover:bg-green-600/50">
                    {t("clearSuggested") || "Clear Suggested Direction"}
                  </button>
                )}
                {selPlayer.wrongDirection && (
                  <button onClick={() => handleClearPlayerDirection(selPlayer.id)}
                    className="w-full py-1.5 bg-red-600/30 text-red-300 rounded text-xs hover:bg-red-600/50">
                    {t("clearWrong") || "Clear Wrong Direction"}
                  </button>
                )}
              </div>
            </div>
          )}

          {showCoaching && coaching && (
            <div className="bg-gray-700 rounded-lg p-3">
              <h3 className="text-white font-bold mb-2">{t("coachingFeedback")}</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[{ l: t("overall"), v: coaching.overall }, { l: t("position"), v: coaching.position },
                  { l: t("timing"), v: coaching.timing }, { l: t("movement"), v: coaching.movement }].map((s) => (
                  <div key={s.l} className="bg-gray-600 rounded p-2 text-center">
                    <div className={`text-xl font-bold ${scoreColor(s.v)}`}>{s.v}</div>
                    <div className="text-gray-300 text-xs">{s.l}</div>
                  </div>
                ))}
              </div>
              <p className="text-gray-300 text-sm">{coaching.explanation}</p>
            </div>
          )}

          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-white font-bold mb-2">{t("evaluateDecision") || "Evaluate Decision"}</h3>
            {!selectedPlayerId ? (
              <p className="text-gray-400 text-xs">{t("selectPlayerForEval") || "Select a player to evaluate"}</p>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleAISuggestion}
                  disabled={aiLoading || !selectedPlayerId}
                  className="flex-1 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs disabled:opacity-50">
                  {aiLoading ? "..." : (t("getAISuggestion") || "AI Suggestion")}
                </button>
                <button
                  onClick={handleEvaluate}
                  disabled={evaluating || evaluations[selectedPlayerId] !== undefined}
                  className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs disabled:opacity-50">
                  {evaluating ? "..." : evaluations[selectedPlayerId] ? (t("alreadyEvaluated") || "Done") : (t("evaluatePlayer") || "Evaluate")}
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-white font-bold mb-2">{t("passSimulation") || "Pass Simulation"}</h3>
            {!ball.holderId ? (
              <p className="text-gray-400 text-xs">{t("noBallHolder") || "Drag ball to a player first"}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">
                  {t("simulatePassDesc") || "AI will find best pass target and animate ball trajectory"}
                </p>
                <button
                  onClick={handleSimulatePass}
                  disabled={passSimulating}
                  className="w-full py-2 bg-amber-600 text-white rounded hover:bg-amber-700 text-xs disabled:opacity-50">
                  {passSimulating ? "..." : (t("simulatePass") || "Simulate Pass")}
                </button>
                {passSimulation && (
                  <div className="bg-gray-600 rounded p-2">
                    <p className="text-xs text-gray-300">
                      <span className="text-amber-400">#{passSimulation.targetPlayerNumber}</span> — {passSimulation.passType}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{passSimulation.reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {showAISuggestions && aiSuggestions.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-3">
              <h3 className="text-white font-bold mb-2">{t("aiSuggestion") || "AI Suggestion"}</h3>
              <div className="space-y-1">
                {aiSuggestions.map((s: any, i: number) => (
                  <div key={i} className="text-xs text-gray-300 bg-gray-600 rounded p-2">
                    <span className="text-purple-400">#{players.find(p => p.id === s.playerId)?.number || "?"}</span> — {s.action}
                    <br /><span className="text-gray-400">{s.reason}</span>
                  </div>
                ))}
              </div>
              {aiExplanation && (
                <p className="text-gray-300 text-xs mt-2">{aiExplanation}</p>
              )}
            </div>
          )}

          {Object.keys(evaluations).length > 0 && (
            <div className="bg-purple-900/50 border border-purple-500/30 rounded-lg p-3">
              <h3 className="text-purple-300 font-bold mb-2 text-sm">{t("evaluations") || "Evaluations"}</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {Object.entries(evaluations).map(([pid, ev]) => {
                  const p = players.find((pl) => pl.id === pid);
                  return (
                    <div key={pid} className="bg-gray-700/50 rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-purple-400 font-bold text-xs">#{p?.number}</span>
                        <span className="text-white text-xs">{p?.position}</span>
                        <span className="text-gray-500 text-xs">({p?.teamId === 1 ? "Home" : "Away"})</span>
                      </div>
                      <p className="text-green-400 text-xs font-semibold">{ev.action}</p>
                      <p className="text-gray-300 text-xs">{ev.reason}</p>
                    </div>
                  );
                })}
              </div>
              <button onClick={handleClearEvaluations}
                className="w-full mt-2 py-1.5 bg-red-600/80 text-white rounded hover:bg-red-700 text-xs">
                {t("clearEvaluations") || "Clear All Evaluations"}
              </button>
            </div>
          )}

        </div>
        )}

        {isZoomed && (
          <>
            <button onClick={() => setShowTacticalPanel(!showTacticalPanel)} className="fixed bottom-4 left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300">
              {t("tacticalOptions") || "Tactical"}
            </button>
            <button onClick={() => setShowActionsPanel(!showActionsPanel)} className="fixed bottom-4 left-36 z-50 px-4 py-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-300">
              {t("actions") || "Actions"}
            </button>
            {selPlayer && (
              <button onClick={() => setShowPlayerPanel(!showPlayerPanel)} className="fixed bottom-4 left-64 z-50 px-4 py-2 bg-yellow-600 text-white rounded-full shadow-lg hover:bg-yellow-700 transition-all duration-300">
                #{selPlayer.number}
              </button>
            )}
            <button onClick={() => setShowAIPanel(!showAIPanel)} className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300">
              AI
            </button>

            <div className={`fixed left-4 bottom-16 z-50 w-72 bg-gray-800 rounded-lg p-4 shadow-2xl transition-all duration-300 ${showTacticalPanel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-bold">{t("tacticalOptions")}</h3>
                <button onClick={() => setShowTacticalPanel(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {(["current", "suggested", "wrong", "all"] as DirectionMode[]).map((m) => (
                  <button key={m} onClick={() => setDirectionMode(m)}
                    className={`py-1.5 rounded text-xs font-semibold transition ${
                      directionMode === m
                        ? m === "current" ? "bg-white text-gray-900" : m === "suggested" ? "bg-green-600 text-white" : m === "wrong" ? "bg-red-600 text-white" : "bg-purple-600 text-white"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    }`}>
                    {m === "current" ? "Current" : m === "suggested" ? "Suggested" : m === "wrong" ? "Wrong" : "All"}
                  </button>
                ))}
              </div>
            </div>

            <div className={`fixed left-4 bottom-16 z-50 w-72 bg-gray-800 rounded-lg p-4 shadow-2xl transition-all duration-300 ${showActionsPanel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-bold">{t("actions") || "Actions"}</h3>
                <button onClick={() => setShowActionsPanel(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="mb-2">
                <label className="text-gray-300 text-sm mb-1 block">{t("playerCount") || "Player Count"}</label>
                <select value={playerCount} onChange={(e) => setPlayerCount(Number(e.target.value))} className="w-full py-1 px-2 bg-gray-600 text-white rounded text-sm">
                  {[5, 6, 7, 8, 9, 10, 11].map((n) => (<option key={n} value={n}>{n}v{n}</option>))}
                </select>
              </div>
              <button
                onClick={() => setPassMode(!passMode)}
                className={`w-full py-2 rounded mb-1 text-sm font-semibold transition ${
                  passMode
                    ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                {passMode ? (t("passModeOn") || "⚽ Pass Mode ON") : (t("passModeOff") || "⚽ Pass Mode OFF")}
              </button>
              <button onClick={handleResetPositions} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-1 text-sm">{t("resetPositions") || "Reset Positions"}</button>
              <button onClick={handleClearDirections} className="w-full py-2 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm">{t("clearDirections") || "Clear"}</button>
            </div>

            {selPlayer && (
              <div className={`fixed left-4 bottom-16 z-50 w-72 bg-gray-800 rounded-lg p-4 shadow-2xl transition-all duration-300 ${showPlayerPanel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-white font-bold">#{selPlayer.number} - {selPlayer.position}</h3>
                  <button onClick={() => setShowPlayerPanel(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>{selPlayer.teamId === 1 ? (t("team1") || "Home") : (t("team2") || "Away")}</p>
                  {selPlayer.isGoalkeeper && <p className="text-yellow-400">{t("goalkeeper") || "Goalkeeper"}</p>}
                  {ball.holderId === selPlayer.id && <p className="text-orange-400">{t("hasBall") || "Has Ball"}</p>}
                </div>
                <div className="mt-3 space-y-1">
                  {selPlayer.direction && (
                    <button onClick={() => handleClearPlayerDirection(selPlayer.id)}
                      className="w-full py-1.5 bg-white/10 text-white rounded text-xs hover:bg-white/20">
                      {t("clearCurrent") || "Clear Current"}
                    </button>
                  )}
                  {selPlayer.suggestedDirection && (
                    <button onClick={() => handleClearPlayerDirection(selPlayer.id)}
                      className="w-full py-1.5 bg-green-600/30 text-green-300 rounded text-xs hover:bg-green-600/50">
                      {t("clearSuggested") || "Clear Suggested"}
                    </button>
                  )}
                  {selPlayer.wrongDirection && (
                    <button onClick={() => handleClearPlayerDirection(selPlayer.id)}
                      className="w-full py-1.5 bg-red-600/30 text-red-300 rounded text-xs hover:bg-red-600/50">
                      {t("clearWrong") || "Clear Wrong"}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className={`fixed right-4 bottom-16 z-50 w-72 bg-gray-800 rounded-lg p-4 shadow-2xl transition-all duration-300 ${showAIPanel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-bold">{t("aiSuggestion") || "AI Suggestion"}</h3>
                <button onClick={() => setShowAIPanel(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              {!selectedPlayerId ? (
                <p className="text-gray-400 text-xs">{t("selectPlayerForAI") || "Select a player"}</p>
              ) : (
                <>
                  <button onClick={handleAISuggestion} disabled={aiLoading} className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 mb-2 text-sm disabled:opacity-50">
                    {aiLoading ? "..." : (t("getAISuggestion") || "Get AI Suggestion")}
                  </button>
                  {showAISuggestions && (
                    <button onClick={handleClearAISuggestions} className="w-full py-1.5 bg-gray-600 text-white rounded hover:bg-gray-500 text-xs">
                      {t("clearAISuggestions") || "Clear"}
                    </button>
                  )}
                </>
              )}
              {showAISuggestions && aiExplanation && (
                <div className="mt-3 bg-purple-900/50 border border-purple-500/30 rounded p-2">
                  <p className="text-gray-300 text-xs">{aiExplanation}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
