"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { TrainingSession } from "@/lib/types";

export default function TrainingListPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isAuthenticated) return;
    api.trainingSessions.getRecent(20)
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, router]);

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
          <button onClick={() => router.push("/")} className="text-white hover:text-green-400">Home</button>
          <h1 className="text-xl font-bold">Training Sessions</h1>
        </div>
        <button onClick={() => router.push("/scenarios")} className="text-sm bg-green-600 px-4 py-2 rounded hover:bg-green-700">Start New Training</button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-4">No training sessions yet.</div>
            <button onClick={() => router.push("/scenarios")} className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
              Start Your First Training
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s) => (
              <div key={s.id} className="bg-gray-800 rounded-xl p-4 flex items-center justify-between border border-gray-700 hover:border-green-500 transition cursor-pointer" onClick={() => router.push(`/training/${s.id}/result`)}>
                <div className="flex-1">
                  <div className="font-semibold">{s.scenarioName || "Training Session"}</div>
                  <div className="text-sm text-gray-400">{new Date(s.startedAt).toLocaleDateString()}</div>
                </div>
                <div className="text-center px-6">
                  <div className={`text-2xl font-bold ${s.overallScore >= 80 ? "text-green-400" : s.overallScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>{s.overallScore}</div>
                  <div className="text-xs text-gray-400">Score</div>
                </div>
                <div className={`text-sm font-medium ${statusColor(s.status)}`}>{s.status}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
