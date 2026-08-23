"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Team } from "@/lib/types";
import { Link } from "@/i18n/routing";

export default function TeamsPage() {
  const { isAuthenticated, isCoach, isAdmin, loading: authLoading } = useAuth();
  const t = useTranslations("teams");
  const tNav = useTranslations("nav");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (!isAuthenticated) return;
    api.teams.list()
      .then(setTeams)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white hover:text-green-400">{tNav("home")}</Link>
          <h1 className="text-xl font-bold">{t("title")}</h1>
        </div>
        {(isCoach || isAdmin) && (
          <button onClick={() => alert(t("comingSoon"))} className="text-sm bg-green-600 px-4 py-2 rounded hover:bg-green-700">{t("createTeam")}</button>
        )}
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400">{t("loading")}</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-2">{t("noTeams")}</div>
            <div className="text-gray-500 text-sm">{(isCoach || isAdmin) ? t("createFirst") : t("noMembership")}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team) => (
              <div key={team.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition">
                <h3 className="font-bold text-lg mb-2">{team.name}</h3>
                {team.description && <p className="text-gray-400 text-sm mb-3 line-clamp-2">{team.description}</p>}
                <div className="text-sm text-gray-400">
                  <span className="font-semibold text-white">{team.playerCount}</span> {t("players")}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
