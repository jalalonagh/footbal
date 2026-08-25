"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import FootballPitch, { PlayerData, BallData, DirectionMode } from "@/components/football-pitch";
import { api } from "@/lib/api";
import { Link } from "@/i18n/routing";
import type { Scenario, ScenarioPlayer } from "@/lib/types";

const FORMATIONS: Record<number, [string, number, number, number][]> = {
  5: [
    ["GK", 1, 5, 50], ["CB", 4, 18, 30], ["CB", 5, 18, 70],
    ["CM", 6, 38, 35], ["CM", 8, 38, 65],
  ],
  6: [
    ["GK", 1, 5, 50], ["CB", 4, 18, 30], ["CB", 5, 18, 70],
    ["CM", 6, 35, 30], ["CM", 8, 35, 70], ["ST", 9, 45, 50],
  ],
  7: [
    ["GK", 1, 5, 50], ["CB", 4, 18, 25], ["CB", 5, 18, 50], ["CB", 3, 18, 75],
    ["CM", 6, 35, 30], ["CM", 8, 35, 70], ["ST", 9, 45, 50],
  ],
  8: [
    ["GK", 1, 5, 50], ["CB", 4, 18, 25], ["CB", 5, 18, 50], ["CB", 3, 18, 75],
    ["LM", 11, 35, 20], ["CM", 6, 35, 50], ["RM", 7, 35, 80], ["ST", 9, 45, 50],
  ],
  9: [
    ["GK", 1, 5, 50], ["CB", 4, 18, 25], ["CB", 5, 18, 50], ["CB", 3, 18, 75],
    ["LM", 11, 35, 18], ["CM", 6, 35, 40], ["CM", 8, 35, 60], ["RM", 7, 35, 82], ["ST", 9, 45, 50],
  ],
  10: [
    ["GK", 1, 5, 50], ["CB", 4, 18, 25], ["CB", 5, 18, 50], ["CB", 3, 18, 75],
    ["LM", 11, 35, 18], ["CM", 6, 35, 40], ["CM", 8, 35, 60], ["RM", 7, 35, 82],
    ["LW", 10, 45, 25], ["RW", 17, 45, 75],
  ],
  11: [
    ["GK", 1, 5, 50], ["CB", 4, 18, 25], ["CB", 5, 18, 50], ["CB", 3, 18, 75],
    ["LM", 11, 35, 18], ["CM", 6, 35, 38], ["CM", 8, 35, 62], ["RM", 7, 35, 82],
    ["LW", 10, 45, 25], ["ST", 9, 45, 50], ["RW", 17, 45, 75],
  ],
};

export default function ScenarioEditorPage() {
  const params = useParams();
  const router = useRouter();
  const scenarioId = params?.id as string;

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [ball, setBall] = useState<BallData>({ x: 50, y: 50, holderId: null, direction: null, suggestedDirection: null, wrongDirection: null });
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [directionMode, setDirectionMode] = useState<DirectionMode>("current");
  const [playerCount, setPlayerCount] = useState(11);
  const [coachingNotes, setCoachingNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (scenarioId) {
      api.scenarios.get(scenarioId).then((s) => {
        setScenario(s);
        setPlayerCount(s.playerCount || 11);
        setCoachingNotes(s.description || "");
      }).catch(() => {});
    }
  }, [scenarioId]);

  useEffect(() => {
    if (scenarioId) {
      api.scenarios.getPlayers(scenarioId).then((sp) => {
        if (sp && sp.length > 0) {
          const mapped = sp.map((p) => ({
            id: p.id,
            teamId: p.teamId,
            number: p.number,
            x: p.startX,
            y: p.startY,
            hasBall: p.hasBall,
            isTarget: p.isTarget,
            isDefender: p.teamId === 2,
            isGoalkeeper: p.position === "GK",
            position: p.position,
            role: p.role || "Player",
            direction: null,
            suggestedDirection: null,
            wrongDirection: null,
          }));
          setPlayers(mapped);
          const holder = mapped.find((p) => p.hasBall);
          if (holder) {
            setBall((b) => ({ ...b, x: holder.x, y: holder.y, holderId: holder.id }));
          }
        } else {
          resetToFormation(playerCount);
        }
        setLoading(false);
      }).catch(() => {
        resetToFormation(playerCount);
        setLoading(false);
      });
    }
  }, [scenarioId]);

  const resetToFormation = useCallback((count: number) => {
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
    setPlayers([...team1, ...team2]);
    setBall({ x: 50, y: 50, holderId: null, direction: null, suggestedDirection: null, wrongDirection: null });
    setSelectedPlayerId(null);
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

  const handleSave = async () => {
    if (!scenario) return;
    setSaving(true);
    setMessage("");
    try {
      await api.scenarios.update(scenario.id, {
        name: scenario.name,
        description: coachingNotes,
        category: scenario.category,
        difficulty: scenario.difficulty,
        gamePhase: scenario.gamePhase,
        formation: `${playerCount}v${playerCount}`,
      });

      const existingPlayers = await api.scenarios.getPlayers(scenario.id);
      for (const ep of existingPlayers) {
        await api.scenarios.deletePlayer(ep.id);
      }

      const playersToSave = players.map((p) => ({
        number: p.number,
        position: p.position,
        role: p.role || "Player",
        startX: Math.round(p.x),
        startY: Math.round(p.y),
        teamId: p.teamId,
        direction: 0,
        speed: 5,
        hasBall: p.hasBall,
        isTarget: p.isTarget,
        isDefender: false,
      }));

      await api.scenarios.bulkAddPlayers(scenario.id, playersToSave);

      setMessage("Scenario saved successfully!");
    } catch (e: any) {
      const msg = e?.message || "Failed to save";
      if (msg.includes("403") || msg.includes("Forbidden")) {
        setMessage("Access denied. You need Coach, Admin, or SuperAdmin role.");
      } else if (msg.includes("401")) {
        setMessage("Unauthorized. Please login again.");
        setTimeout(() => window.location.href = "/login", 2000);
      } else {
        setMessage(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const selPlayer = players.find((p) => p.id === selectedPlayerId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/scenarios" className="text-white hover:text-green-400">← Back</Link>
          <h1 className="text-white font-bold text-lg">Edit: {scenario?.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <select value={playerCount} onChange={(e) => { setPlayerCount(Number(e.target.value)); resetToFormation(Number(e.target.value)); }}
            className="bg-gray-700 text-white rounded px-3 py-1 text-sm">
            {[5, 6, 7, 8, 9, 10, 11].map((n) => <option key={n} value={n}>{n}v{n}</option>)}
          </select>
          <button onClick={() => resetToFormation(playerCount)} className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500">Reset</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save Scenario"}
          </button>
        </div>
      </header>

      {message && (
        <div className={`mx-6 mt-4 px-4 py-2 rounded-lg ${message.includes("success") ? "bg-green-900/50 border border-green-600 text-green-300" : "bg-red-900/50 border border-red-600 text-red-300"}`}>
          {message}
        </div>
      )}

      <div className="flex p-4 gap-4">
        <div className="flex-1">
          <FootballPitch
            players={players} ball={ball}
            selectedPlayerId={selectedPlayerId} directionMode={directionMode}
            onPlayerMove={handlePlayerMove} onBallMove={handleBallMove}
            onPlayerSelect={setSelectedPlayerId}
            onDirectionSet={handleDirectionSet} onBallDirectionSet={handleBallDirectionSet}
            onBallClaimed={handleBallClaimed} onPass={handlePass}
          />
        </div>

        <div className="w-80 flex flex-col gap-3 max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-white font-bold mb-2">Direction Mode</h3>
            <div className="grid grid-cols-4 gap-1">
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

          {selPlayer && (
            <div className="bg-gray-800 rounded-lg p-3">
              <h3 className="text-white font-bold mb-2">Player #{selPlayer.number}</h3>
              <div className="text-sm text-gray-300 space-y-1 mb-3">
                <p>Position: {selPlayer.position}</p>
                <p>Team: {selPlayer.teamId === 1 ? "Home" : "Away"}</p>
                {selPlayer.isGoalkeeper && <p className="text-yellow-400">Goalkeeper</p>}
                {ball.holderId === selPlayer.id && <p className="text-orange-400">Has Ball ⚽</p>}
              </div>
              <div className="space-y-1">
                {selPlayer.direction && (
                  <button onClick={() => handleClearPlayerDirection(selPlayer.id)}
                    className="w-full py-1.5 bg-white/10 text-white rounded text-xs hover:bg-white/20">Clear Current</button>
                )}
                {selPlayer.suggestedDirection && (
                  <button onClick={() => handleClearPlayerDirection(selPlayer.id)}
                    className="w-full py-1.5 bg-green-600/30 text-green-300 rounded text-xs hover:bg-green-600/50">Clear Suggested</button>
                )}
                {selPlayer.wrongDirection && (
                  <button onClick={() => handleClearPlayerDirection(selPlayer.id)}
                    className="w-full py-1.5 bg-red-600/30 text-red-300 rounded text-xs hover:bg-red-600/50">Clear Wrong</button>
                )}
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-white font-bold mb-2">Coaching Notes</h3>
            <textarea
              value={coachingNotes}
              onChange={(e) => setCoachingNotes(e.target.value)}
              className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm h-40 resize-none"
              placeholder="Write coaching points, instructions, and tips for this scenario..."
            />
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-white font-bold mb-2">Quick Guide</h3>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• Drag players to position them</li>
              <li>• Drag ball to move it</li>
              <li>• Drop ball near player to give them possession</li>
              <li>• Double-click player to set direction</li>
              <li>• Click player with ball on another to pass</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
