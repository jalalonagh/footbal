"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
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
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm">{user?.fullName || user?.email}</span>
          <button onClick={() => router.push("/scenarios")} className="text-sm bg-green-600 px-4 py-2 rounded hover:bg-green-700">Scenarios</button>
          <button onClick={() => router.push("/pricing")} className="text-sm bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Upgrade</button>
          <button onClick={() => router.push("/profile")} className="text-sm bg-gray-600 px-4 py-2 rounded hover:bg-gray-500">Profile</button>
          <button onClick={logout} className="text-sm text-red-400 hover:text-red-300">Logout</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">Welcome back</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Subscription</div>
            <div className="text-2xl font-bold text-green-400">{subscription?.planName || "Free"}</div>
            {subscription?.endDate && (
              <div className="text-gray-500 text-xs mt-1">Expires: {new Date(subscription.endDate).toLocaleDateString()}</div>
            )}
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Available Scenarios</div>
            <div className="text-2xl font-bold text-blue-400">{scenarioCount}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Tactical IQ</div>
            <div className="text-2xl font-bold text-yellow-400">--</div>
            <div className="text-gray-500 text-xs mt-1">Complete training to see your score</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">Quick Start</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => router.push("/scenarios")} className="bg-green-600 hover:bg-green-700 rounded-lg p-6 text-left transition">
              <div className="font-bold text-lg mb-1">Browse Scenarios</div>
              <div className="text-green-200 text-sm">Explore 50 tactical scenarios across 5 categories</div>
            </button>
            <button onClick={() => router.push("/training/demo")} className="bg-blue-600 hover:bg-blue-700 rounded-lg p-6 text-left transition">
              <div className="font-bold text-lg mb-1">Try Demo Training</div>
              <div className="text-blue-200 text-sm">Experience the interactive tactical training</div>
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <p className="text-gray-400 text-sm">No recent activity yet. Start training to see your progress here.</p>
        </div>
      </main>
    </div>
  );
}
