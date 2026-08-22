"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [scenarios, setScenarios] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5144/api"}/scenarios?page=1&pageSize=6`)
      .then((r) => r.json())
      .then(setScenarios)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900">
      <nav className="flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-sm">
        <div className="text-2xl font-bold text-white">FootballTactics</div>
        <div className="flex gap-4">
          <Link href="/training" className="text-white hover:text-green-300 transition">Training</Link>
          <Link href="/scenarios" className="text-white hover:text-green-300 transition">Scenarios</Link>
          <Link href="/pricing" className="text-white hover:text-green-300 transition">Pricing</Link>
          <Link href="/login" className="px-4 py-2 bg-white text-green-800 rounded-lg font-semibold hover:bg-green-100 transition">Login</Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">Master Football Tactics</h1>
        <p className="text-xl text-green-200 mb-8 max-w-2xl mx-auto">
          Interactive 2D tactical training platform for players, coaches, and academies.
          Practice positioning, movement, and decision-making in real game scenarios.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/training" className="px-8 py-3 bg-white text-green-800 rounded-lg font-bold text-lg hover:bg-green-100 transition">
            Start Training
          </Link>
          <Link href="/register" className="px-8 py-3 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition">
            Sign Up Free
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "2D Tactical Simulation", desc: "Interactive pitch with real-time player movement and tactical analysis" },
            { title: "Decision Training", desc: "Make tactical decisions and get instant feedback with AI coaching" },
            { title: "Progress Tracking", desc: "Track your Tactical IQ, positioning, and movement scores over time" },
          ].map((f, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-green-200">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {scenarios.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Popular Scenarios</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {scenarios.map((s) => (
              <Link key={s.id} href={`/training/${s.id}`} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">{s.category}</span>
                  <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">{s.difficulty}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.name}</h3>
                <p className="text-green-200 text-sm line-clamp-2">{s.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="bg-black/30 text-center py-6 text-green-300 text-sm">
        Football Tactical Training Platform. All rights reserved.
      </footer>
    </div>
  );
}
