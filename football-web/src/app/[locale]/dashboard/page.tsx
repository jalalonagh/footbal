"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Link } from "@/i18n/routing";

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");
  const [subscription, setSubscription] = useState<{ planName: string; endDate: string } | null>(null);
  const [scenarioCount, setScenarioCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    api.subscription.active().then(setSubscription).catch(() => {});
    api.scenarios.list({}).then((r) => setScenarioCount(r.total)).catch(() => {});
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{tNav("dashboard")}</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm">{user?.fullName || user?.email}</span>
          <Link href="/scenarios" className="text-sm bg-green-600 px-4 py-2 rounded hover:bg-green-700">{tNav("scenarios")}</Link>
          <Link href="/pricing" className="text-sm bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">{t("upgrade")}</Link>
          <Link href="/profile" className="text-sm bg-gray-600 px-4 py-2 rounded hover:bg-gray-500">{tNav("profile")}</Link>
          <button onClick={logout} className="text-sm text-red-400 hover:text-red-300">{tNav("logout")}</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">{t("welcome")} {user?.fullName || ""}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">{t("subscription")}</div>
            <div className="text-2xl font-bold text-green-400">{subscription?.planName || t("free")}</div>
            {subscription?.endDate && (
              <div className="text-gray-500 text-xs mt-1">{t("expires")}: {new Date(subscription.endDate).toLocaleDateString()}</div>
            )}
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">{t("scenarios")}</div>
            <div className="text-2xl font-bold text-blue-400">{scenarioCount}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">{t("tacticalIQ")}</div>
            <div className="text-2xl font-bold text-yellow-400">--</div>
            <div className="text-gray-500 text-xs mt-1">{t("tacticalIQDesc")}</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">{t("quickStart")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/scenarios" className="bg-green-600 hover:bg-green-700 rounded-lg p-6 text-left transition">
              <div className="font-bold text-lg mb-1">{t("browseScenarios")}</div>
              <div className="text-green-200 text-sm">{t("browseDesc")}</div>
            </Link>
            <Link href="/training/demo" className="bg-blue-600 hover:bg-blue-700 rounded-lg p-6 text-left transition">
              <div className="font-bold text-lg mb-1">{t("tryDemo")}</div>
              <div className="text-blue-200 text-sm">{t("tryDemoDesc")}</div>
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">{t("recentActivity")}</h3>
          <p className="text-gray-400 text-sm">{t("noActivity")}</p>
        </div>
      </main>
    </div>
  );
}
