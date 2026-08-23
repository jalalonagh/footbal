"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Team } from "@/lib/types";

export default function TeamsPage() {
  const { isAuthenticated, isCoach, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isAuthenticated) return;
    api.teams.list()
      .then(setTeams)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="text-white hover:text-green-400">Home</button>
          <h1 className="text-xl font-bold">Teams</h1>
        </div>
        {(isCoach || isAdmin) && (
          <button onClick={() => alert("Create team functionality coming soon")} className="text-sm bg-green-600 px-4 py-2 rounded hover:bg-green-700">Create Team</button>
        )}
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-2">No teams yet.</div>
            <div className="text-gray-500 text-sm">{(isCoach || isAdmin) ? "Create your first team to get started." : "You are not a member of any team."}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((t) => (
              <div key={t.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition">
                <h3 className="font-bold text-lg mb-2">{t.name}</h3>
                {t.description && <p className="text-gray-400 text-sm mb-3 line-clamp-2">{t.description}</p>}
                <div className="text-sm text-gray-400">
                  <span className="font-semibold text-white">{t.playerCount}</span> players
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
