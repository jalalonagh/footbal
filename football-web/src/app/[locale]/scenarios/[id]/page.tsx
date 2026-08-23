"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Scenario, ScenarioPlayer } from "@/lib/types";

export default function ScenarioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [players, setPlayers] = useState<ScenarioPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.scenarios.get(id), api.scenarios.getPlayers(id)])
      .then(([s, p]) => { setScenario(s); setPlayers(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  if (!scenario) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Scenario not found.</div>;

  const difficultyColor = (d: string) => {
    switch (d) {
      case "Beginner": return "bg-green-600";
      case "Intermediate": return "bg-yellow-600";
      case "Advanced": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/scenarios")} className="text-white hover:text-green-400">&larr; Back</button>
        <h1 className="text-xl font-bold">{scenario.name}</h1>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs px-2 py-1 rounded-full text-white ${difficultyColor(scenario.difficulty)}`}>{scenario.difficulty}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-600 text-gray-200">{scenario.category}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">{scenario.status}</span>
          </div>
          <p className="text-gray-300 mb-4">{scenario.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-400">Formation:</span> <span className="font-semibold">{scenario.formation}</span></div>
            <div><span className="text-gray-400">Phase:</span> <span className="font-semibold">{scenario.gamePhase}</span></div>
            <div><span className="text-gray-400">Minute:</span> <span className="font-semibold">{scenario.gameMinute}'</span></div>
            <div><span className="text-gray-400">Mode:</span> <span className="font-semibold">{scenario.trainingMode}</span></div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            Score: {scenario.homeScore} - {scenario.awayScore}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Players ({players.length})</h2>
          {players.length === 0 ? (
            <p className="text-gray-400 text-sm">No players configured.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {players.map((p) => (
                <div key={p.id} className="bg-gray-700 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold">{p.number}</div>
                  <div>
                    <div className="text-sm font-semibold">{p.position}</div>
                    <div className="text-xs text-gray-400">Team {p.teamId}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => router.push(`/training/${id}`)} className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
          Start Training
        </button>
      </main>
    </div>
  );
}
