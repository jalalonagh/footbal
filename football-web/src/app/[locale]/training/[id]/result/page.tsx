"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { TrainingDecision } from "@/lib/types";

interface TrainingResult {
  overallScore: number;
  positionScore: number;
  timingScore: number;
  movementScore: number;
  decisions: TrainingDecision[];
}

export default function TrainingResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [result, setResult] = useState<TrainingResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.trainingSessions.getResult(id)
      .then(setResult)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;

  const scoreColor = (s: number) => s >= 80 ? "text-green-400" : s >= 60 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/training")} className="text-white hover:text-green-400">&larr; Back</button>
        <h1 className="text-xl font-bold">Training Result</h1>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {result ? (
          <>
            <div className="text-center mb-8">
              <div className={`text-7xl font-bold mb-2 ${scoreColor(result.overallScore)}`}>{result.overallScore}</div>
              <div className="text-gray-400">Overall Score</div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Position", value: result.positionScore },
                { label: "Timing", value: result.timingScore },
                { label: "Movement", value: result.movementScore },
              ].map((s) => (
                <div key={s.label} className="bg-gray-800 rounded-xl p-4 text-center">
                  <div className={`text-3xl font-bold ${scoreColor(s.value)}`}>{s.value}</div>
                  <div className="text-gray-400 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {result.decisions && result.decisions.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-bold mb-4">Decisions</h2>
                <div className="flex flex-col gap-3">
                  {result.decisions.map((d, i) => (
                    <div key={d.id || i} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold">{d.actionType.replace(/_/g, " ")}</span>
                        <span className={`font-bold ${scoreColor(d.score)}`}>{d.score}</span>
                      </div>
                      {d.feedback && <p className="text-gray-300 text-sm">{d.feedback}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => router.push("/training")} className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
              Back to Training
            </button>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">Result not available.</div>
        )}
      </main>
    </div>
  );
}
