"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { TrainingSession } from "@/lib/types";
import { Link } from "@/i18n/routing";

export default function TrainingListPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const t = useTranslations("training");
  const tNav = useTranslations("nav");
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (!isAuthenticated) return;
    api.trainingSessions.getRecent(20)
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  if (authLoading || !isAuthenticated) return null;

  const statusColor = (s: string) => {
    switch (s) {
      case "Completed": return "text-green-400";
      case "InProgress": return "text-yellow-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white hover:text-green-400">{tNav("home")}</Link>
          <h1 className="text-xl font-bold">{t("sessions")}</h1>
        </div>
        <Link href="/scenarios" className="text-sm bg-green-600 px-4 py-2 rounded hover:bg-green-700">{t("start")}</Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400">{t("loading")}</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-4">{t("noSessions")}</div>
            <Link href="/scenarios" className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 inline-block">
              {t("startFirst")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s) => (
              <Link key={s.id} href={`/training/${s.id}/result`} className="bg-gray-800 rounded-xl p-4 flex items-center justify-between border border-gray-700 hover:border-green-500 transition cursor-pointer">
                <div className="flex-1">
                  <div className="font-semibold">{s.scenarioName || t("session")}</div>
                  <div className="text-sm text-gray-400">{new Date(s.startedAt).toLocaleDateString()}</div>
                </div>
                <div className="text-center px-6">
                  <div className={`text-2xl font-bold ${s.overallScore >= 80 ? "text-green-400" : s.overallScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>{s.overallScore}</div>
                  <div className="text-xs text-gray-400">{t("score")}</div>
                </div>
                <div className={`text-sm font-medium ${statusColor(s.status)}`}>{s.status}</div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
