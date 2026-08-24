"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl";
import type { Scenario, ScenarioPlayer } from "@/lib/types";
import FootballPitch, { type DirectionMode, type PlayerData, type BallData, type AISuggestion } from "@/components/football-pitch";

function mapPlayers(scenarioPlayers: ScenarioPlayer[]): PlayerData[] {
  return scenarioPlayers.map((sp) => {
    const pos = sp.position;
    const isGK = pos === "GK";
    return {
      id: sp.id,
      teamId: sp.teamId,
      number: sp.number,
      x: sp.startX,
      y: sp.startY,
      hasBall: sp.hasBall,
      isTarget: sp.isTarget,
      isDefender: false,
      isGoalkeeper: isGK,
      position: pos,
      direction: null,
      suggestedDirection: null,
      wrongDirection: null,
    };
  });
}

export default function ScenarioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const tNav = useTranslations("nav");
  const tSc = useTranslations("scenarios");
  const tTr = useTranslations("training");
  const id = params?.id as string;

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [ball, setBall] = useState<BallData>({ x: 50, y: 50, holderId: null, direction: null, suggestedDirection: null, wrongDirection: null });
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [directionMode, setDirectionMode] = useState<DirectionMode>("current");
  const [loading, setLoading] = useState(true);

  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [hasAIAccess, setHasAIAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.scenarios.get(id), api.scenarios.getPlayers(id)])
      .then(([s, p]) => {
        setScenario(s);
        setPlayers(mapPlayers(p));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    api.ai.checkAccess().then(setHasAIAccess).catch(() => setHasAIAccess(false));
  }, []);

  const handlePlayerMove = useCallback((playerId: string, x: number, y: number) => {
    setPlayers((prev) => prev.map((p) => p.id === playerId ? { ...p, x, y } : p));
    if (ball.holderId === playerId) {
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
    setBall((b) => ({ ...b, suggestedDirection: { x: (Math.random() > 0.5 ? 1 : -1) * 12, y: (Math.random() - 0.5) * 10 } }));
  }, []);

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
      if (response.passTarget && !allSuggestions.some(s => s.playerId === response.passTarget!.playerId)) {
        allSuggestions.push(response.passTarget);
      }
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

  const selPlayer = players.find((p) => p.id === selectedPlayerId);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">{tNav("loading") || "Loading..."}</div>;
  if (!scenario) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">{tSc("notFound")}</div>;

  const difficultyColor = (d: string) => {
    switch (d) {
      case "Beginner": return "bg-green-600";
      case "Intermediate": return "bg-yellow-600";
      case "Advanced": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/scenarios")} className="text-white hover:text-green-400">&larr; {tSc("back")}</button>
          <h1 className="text-white font-bold text-lg">{scenario.name}</h1>
          <span className={`text-xs px-2 py-1 rounded-full text-white ${difficultyColor(scenario.difficulty)}`}>{scenario.difficulty}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-600 text-gray-200">{scenario.category}</span>
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
            onBallClaimed={handleBallClaimed} onPass={handlePass}
            aiSuggestions={aiSuggestions} showAISuggestions={showAISuggestions}
          />
        </div>

        <div className="w-80 bg-gray-800 p-4 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-56px)]">
          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-white font-bold mb-2">{tTr("tacticalOptions")}</h3>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {(["current", "suggested", "wrong", "all"] as DirectionMode[]).map((m) => (
                <button key={m} onClick={() => setDirectionMode(m)}
                  className={`py-1.5 rounded text-xs font-semibold transition ${
                    directionMode === m
                      ? m === "current" ? "bg-white text-gray-900" : m === "suggested" ? "bg-green-600 text-white" : m === "wrong" ? "bg-red-600 text-white" : "bg-purple-600 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}>
                  {m === "current" ? tTr("current") : m === "suggested" ? tTr("suggested") : m === "wrong" ? tTr("wrong") : tTr("all")}
                </button>
              ))}
            </div>
            <p className="text-gray-400 text-xs">
              {directionMode === "current" ? tTr("currentDesc")
                : directionMode === "suggested" ? tTr("suggestedDesc")
                : directionMode === "wrong" ? tTr("wrongDesc")
                : tTr("allDesc")}
            </p>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-white font-bold mb-2">{tTr("actions")}</h3>
            <button onClick={handleAutoSuggest} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-1 text-sm">{tTr("autoSuggest")}</button>
            <button onClick={handleClearDirections} className="w-full py-2 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm">{tTr("clearDirections")}</button>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-white font-bold mb-2">{tSc("info")}</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>{tSc("formation")}: <span className="font-semibold">{scenario.formation}</span></p>
              <p>{tSc("phase")}: <span className="font-semibold">{scenario.gamePhase}</span></p>
              <p>{tSc("minute")}: <span className="font-semibold">{scenario.gameMinute}&apos;</span></p>
              <p>{tSc("mode")}: <span className="font-semibold">{scenario.trainingMode}</span></p>
              <p>Score: <span className="font-semibold">{scenario.homeScore} - {scenario.awayScore}</span></p>
            </div>
          </div>

          {selPlayer && (
            <div className="bg-gray-700 rounded-lg p-3">
              <h3 className="text-white font-bold mb-2">{tTr("selectedPlayer")}</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>#{selPlayer.number} - {selPlayer.position}</p>
                <p>{selPlayer.teamId === 1 ? tTr("team1") : tTr("team2")}</p>
                {selPlayer.isGoalkeeper && <p className="text-yellow-400">{tTr("goalkeeper")}</p>}
                {ball.holderId === selPlayer.id && <p className="text-orange-400">{tTr("hasBall")}</p>}
                <p className="text-xs text-gray-400">{tTr("clickPitchSetDir")}</p>
              </div>
            </div>
          )}

          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-white font-bold mb-2">{tTr("aiSuggestion")}</h3>
            {!selectedPlayerId ? (
              <p className="text-gray-400 text-xs">{tTr("selectPlayerForAI")}</p>
            ) : hasAIAccess === false ? (
              <div className="text-center">
                <p className="text-yellow-400 text-xs mb-2">{tTr("subscriptionRequired")}</p>
                <button className="w-full py-1.5 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700">
                  {tTr("upgrade")}
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleAISuggestion}
                  disabled={aiLoading}
                  className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 mb-2 text-sm disabled:opacity-50">
                  {aiLoading ? tTr("analyzing") : tTr("getAISuggestion")}
                </button>
                {showAISuggestions && (
                  <button onClick={handleClearAISuggestions}
                    className="w-full py-1.5 bg-gray-600 text-white rounded hover:bg-gray-500 text-xs">
                    {tTr("clearAISuggestions")}
                  </button>
                )}
              </>
            )}
          </div>

          {showAISuggestions && aiExplanation && (
            <div className="bg-purple-900/50 border border-purple-500/30 rounded-lg p-3">
              <h3 className="text-purple-300 font-bold mb-2 text-sm">{tTr("aiExplanation")}</h3>
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

          <button onClick={() => router.push(`/training/${id}`)} className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
            {tTr("startTraining")}
          </button>
        </div>
      </div>
    </div>
  );
}
