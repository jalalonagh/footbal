"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import FootballPitch, { PlayerData, BallData, DirectionMode, AISuggestion } from "@/components/football-pitch";
import { api } from "@/lib/api";
import { Link } from "@/i18n/routing";

const FORMATION_442: [string, number, number][] = [
  ["GK", 1, 8], ["RB", 2, 25], ["CB", 4, 40], ["CB", 5, 55], ["LB", 3, 70],
  ["RM", 7, 25], ["CM", 6, 40], ["CM", 8, 55], ["LM", 11, 70],
  ["ST", 9, 38], ["ST", 10, 52],
];
const FORMATION_442_DEF: [string, number, number][] = [
  ["GK", 1, 92], ["RB", 2, 75], ["CB", 4, 60], ["CB", 5, 45], ["LB", 3, 30],
  ["RM", 7, 75], ["CM", 6, 60], ["CM", 8, 45], ["LM", 11, 30],
  ["ST", 9, 62], ["ST", 10, 48],
];

function makePlayers(): PlayerData[] {
  const team1 = FORMATION_442.map(([pos, num, y], i) => ({
    id: `t1-${num}`, teamId: 1, number: num, x: 15 + (i < 5 ? i * 5 : (i - 5) * 20), y,
    hasBall: num === 9, isTarget: num === 9, isDefender: false,
    isGoalkeeper: pos === "GK", position: pos,
    direction: null, suggestedDirection: null, wrongDirection: null,
  }));
  const team2 = FORMATION_442_DEF.map(([pos, num, y], i) => ({
    id: `t2-${num}`, teamId: 2, number: num, x: 85 - (i < 5 ? i * 5 : (i - 5) * 20), y,
    hasBall: false, isTarget: false, isDefender: true,
    isGoalkeeper: pos === "GK", position: pos,
    direction: null, suggestedDirection: null, wrongDirection: null,
  }));
  return [...team1, ...team2];
}

function makeBall(): BallData {
  return { x: 15 + 40, y: 38, holderId: "t1-9", direction: null, suggestedDirection: null, wrongDirection: null };
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
  const [coaching, setCoaching] = useState<CoachingTip | null>(null);
  const [showCoaching, setShowCoaching] = useState(false);

  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [hasAIAccess, setHasAIAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (scenarioId) api.scenarios.get(scenarioId).then(setScenario).catch(() => {});
  }, [scenarioId]);

  useEffect(() => {
    api.ai.checkAccess().then(setHasAIAccess).catch(() => setHasAIAccess(false));
  }, []);

  const handlePlayerMove = useCallback((id: string, x: number, y: number) => {
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, x, y } : p));
    if (ball.holderId === id) {
      setBall((b) => ({ ...b, x, y }));
    }
  }, [ball.holderId]);

  const handleBallMove = useCallback((x: number, y: number) => {
    setBall((b) => ({ ...b, x, y, holderId: null }));
    setPlayers((prev) => prev.map((p) => ({ ...p, hasBall: false })));
  }, []);

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

  const handleAutoSuggest = useCallback(() => {
    setPlayers((prev) => prev.map((p) => {
      if (p.isGoalkeeper) return { ...p, suggestedDirection: { x: 0, y: 0 } };
      const dx = p.teamId === 1 ? 8 : -8;
      const dy = (Math.random() - 0.5) * 10;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return { ...p, suggestedDirection: { x: (dx / dist) * 18, y: (dy / dist) * 18 } };
    }));
    setBall((b) => ({ ...b, suggestedDirection: { x: 12, y: 0 } }));
  }, []);

  const handleEvaluate = useCallback(async () => {
    try {
      const result = await api.tactical.evaluate({
        scenarioId, userX: ball.x, userY: ball.y,
        actionType: "POSITIONING", timing: 1.5,
      });
      setCoaching(result);
    } catch {
      setCoaching({ overall: 78, position: 82, timing: 75, movement: 76, explanation: t("coachingTip") });
    }
    setShowCoaching(true);
  }, [scenarioId, ball.x, ball.y, t]);

  const handleClearDirections = useCallback(() => {
    setPlayers((prev) => prev.map((p) => ({ ...p, direction: null, suggestedDirection: null, wrongDirection: null })));
    setBall((b) => ({ ...b, direction: null, suggestedDirection: null, wrongDirection: null }));
  }, []);

  const handleAISuggestion = useCallback(async () => {
    if (!selectedPlayerId) return;
    const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
    if (!selectedPlayer) return;

    setAiLoading(true);
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

      setAiExplanation(response.explanation);
      const allSuggestions: AISuggestion[] = [response.selectedPlayerSuggestion, ...response.teammateSuggestions];
      if (response.passTarget) allSuggestions.push(response.passTarget);
      setAiSuggestions(allSuggestions);
      setShowAISuggestions(true);
    } catch (err) {
      setAiExplanation("خطا در دریافت پیشنهاد هوش مصنوعی");
    }
    setAiLoading(false);
  }, [selectedPlayerId, players, ball, scenario]);

  const handleClearAISuggestions = useCallback(() => {
    setAiSuggestions([]);
    setShowAISuggestions(false);
    setAiExplanation("");
  }, []);

  const scoreColor = (s: number) => s >= 80 ? "text-green-600" : s >= 60 ? "text-yellow-600" : "text-red-600";
  const selPlayer = players.find((p) => p.id === selectedPlayerId);

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white hover:text-green-400">{tNav("home")}</Link>
          <h1 className="text-white font-bold text-lg">{scenario?.name || t("session")}</h1>
        </div>
      </header>

      <div className="flex">
        <div className="flex-1 p-4 flex justify-center">
          <FootballPitch
            players={players} ball={ball}
            selectedPlayerId={selectedPlayerId} directionMode={directionMode}
            onPlayerMove={handlePlayerMove} onBallMove={handleBallMove}
            onPlayerSelect={setSelectedPlayerId}
            onDirectionSet={handleDirectionSet} onBallDirectionSet={handleBallDirectionSet}
            aiSuggestions={aiSuggestions} showAISuggestions={showAISuggestions}
          />
        </div>

        <div className="w-80 bg-gray-800 p-4 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-56px)]">
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
            <button onClick={handleAutoSuggest} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-1 text-sm">{t("autoSuggest") || "Auto Suggest"}</button>
            <button onClick={handleEvaluate} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-1 text-sm">{t("evaluateDecision")}</button>
            <button onClick={handleClearDirections} className="w-full py-2 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm">{t("clearDirections") || "Clear Directions"}</button>
          </div>

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
            <h3 className="text-white font-bold mb-2">{t("aiSuggestion") || "AI Suggestion"}</h3>
            {!selectedPlayerId ? (
              <p className="text-gray-400 text-xs">{t("selectPlayerForAI") || "Select a player to get AI suggestion"}</p>
            ) : hasAIAccess === false ? (
              <div className="text-center">
                <p className="text-yellow-400 text-xs mb-2">{t("subscriptionRequired") || "Subscription required"}</p>
                <button className="w-full py-1.5 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700">
                  {t("upgrade") || "Upgrade"}
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleAISuggestion}
                  disabled={aiLoading}
                  className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 mb-2 text-sm disabled:opacity-50">
                  {aiLoading ? (t("analyzing") || "Analyzing...") : (t("getAISuggestion") || "Get AI Suggestion")}
                </button>
                {showAISuggestions && (
                  <button onClick={handleClearAISuggestions}
                    className="w-full py-1.5 bg-gray-600 text-white rounded hover:bg-gray-500 text-xs">
                    {t("clearAISuggestions") || "Clear AI Suggestions"}
                  </button>
                )}
              </>
            )}
          </div>

          {showAISuggestions && aiExplanation && (
            <div className="bg-purple-900/50 border border-purple-500/30 rounded-lg p-3">
              <h3 className="text-purple-300 font-bold mb-2 text-sm">{t("aiExplanation") || "AI Analysis"}</h3>
              <p className="text-gray-300 text-xs leading-relaxed">{aiExplanation}</p>
              {aiSuggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {aiSuggestions.map((s) => (
                    <div key={s.playerId} className="text-xs text-gray-400">
                      <span className="text-purple-400">#{players.find(p => p.id === s.playerId)?.number}</span>
                      {" "}({s.action}): {s.reason}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
