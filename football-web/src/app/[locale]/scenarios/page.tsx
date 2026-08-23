"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Link } from "@/i18n/routing";

interface Scenario {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  gamePhase: string;
  formation: string;
}

export default function ScenariosPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations("scenarios");
  const tNav = useTranslations("nav");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const categories = [
    { value: "", label: t("allCategories") },
    { value: "Striker", label: t("striker") },
    { value: "Winger", label: t("winger") },
    { value: "Midfielder", label: t("midfielder") },
    { value: "Defender", label: t("defender") },
    { value: "Team", label: t("teamLabel") },
  ];

  const difficulties = [
    { value: "", label: t("allLevels") },
    { value: "Beginner", label: t("beginner") },
    { value: "Intermediate", label: t("intermediate") },
    { value: "Advanced", label: t("advanced") },
  ];

  const difficultyColor = (d: string) => {
    switch (d) {
      case "Beginner": return "bg-green-600";
      case "Intermediate": return "bg-yellow-600";
      case "Advanced": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

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
          <Link href="/" className="text-white hover:text-green-400">{tNav("home")}</Link>
          <h1 className="text-xl font-bold">{t("title")}</h1>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated && <Link href="/dashboard" className="text-sm bg-gray-600 px-4 py-2 rounded hover:bg-gray-500">{tNav("dashboard")}</Link>}
          {!isAuthenticated && <Link href="/login" className="text-sm bg-green-600 px-4 py-2 rounded hover:bg-green-700">{tNav("login")}</Link>}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-green-500">
            {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-green-500">
            {difficulties.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">{t("loading")}</div>
        ) : scenarios.length === 0 ? (
          <div className="text-center py-20 text-gray-400">{t("empty")}</div>
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
