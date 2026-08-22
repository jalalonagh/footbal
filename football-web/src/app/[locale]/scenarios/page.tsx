"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface Scenario {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  gamePhase: string;
  formation: string;
}

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "Striker", label: "Striker" },
  { value: "Winger", label: "Winger" },
  { value: "Midfielder", label: "Midfielder" },
  { value: "Defender", label: "Defender" },
  { value: "Team", label: "Team" },
];

const DIFFICULTIES = [
  { value: "", label: "All Levels" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

const difficultyColor = (d: string) => {
  switch (d) {
    case "Beginner": return "bg-green-600";
    case "Intermediate": return "bg-yellow-600";
    case "Advanced": return "bg-red-600";
    default: return "bg-gray-600";
  }
};

export default function ScenariosPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const result = await api.scenarios.list({ category: category || undefined, difficulty: difficulty || undefined });
      setScenarios(result.items || []);
    } catch {
      setScenarios([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchScenarios(); }, [category, difficulty]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="text-white hover:text-green-400">Home</button>
          <h1 className="text-xl font-bold">Tactical Scenarios</h1>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated && <button onClick={() => router.push("/dashboard")} className="text-sm bg-gray-600 px-4 py-2 rounded hover:bg-gray-500">Dashboard</button>}
          {!isAuthenticated && <button onClick={() => router.push("/login")} className="text-sm bg-green-600 px-4 py-2 rounded hover:bg-green-700">Login</button>}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-green-500">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-green-500">
            {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading scenarios...</div>
        ) : scenarios.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No scenarios found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((s) => (
              <div key={s.id} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition cursor-pointer border border-gray-700 hover:border-green-500" onClick={() => router.push(`/training/${s.id}`)}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${difficultyColor(s.difficulty)}`}>{s.difficulty}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-600 text-gray-200">{s.category}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{s.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{s.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{s.formation}</span>
                  <span>{s.gamePhase}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
