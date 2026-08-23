"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { AdminStats } from "@/lib/types";
import { Link } from "@/i18n/routing";

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const t = useTranslations("admin");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) window.location.href = "/login";
  }, [authLoading, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      api.statistics.adminDashboard().then(setStats).catch(() => setStats(null)).finally(() => setLoading(false));
    }
  }, [isAdmin]);

  if (authLoading || !isAdmin) return null;

  const cards = [
    { label: t("totalUsers"), value: stats?.totalUsers ?? "--" },
    { label: t("totalSubscriptions"), value: stats?.totalSubscriptions ?? "--" },
    { label: t("totalRevenue"), value: stats?.totalRevenue != null ? `$${stats.totalRevenue.toLocaleString()}` : "--" },
    { label: t("activeScenarios"), value: stats?.activeUsers ?? "--" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t("dashboard")}</h1>
      {loading ? (
        <p className="text-gray-400">{t("loading")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div key={card.label} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <p className="text-gray-400 text-sm mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-white">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
