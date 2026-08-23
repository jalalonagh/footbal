"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Scenario } from "@/lib/types";

export default function HomePage() {
  const t = useTranslations("home");
  const nav = useTranslations("nav");
  const router = useRouter();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    api.scenarios.list({ page: 1, pageSize: 6 }).then((r) => setScenarios(r.items)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900">
      <nav className="flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-sm">
        <div className="text-2xl font-bold text-white">FootballTactics</div>
        <div className="flex gap-4">
          <Link href="/scenarios" className="text-white hover:text-green-300 transition">{nav("scenarios")}</Link>
          <Link href="/pricing" className="text-white hover:text-green-300 transition">{nav("pricing")}</Link>
          <Link href="/login" className="px-4 py-2 bg-white text-green-800 rounded-lg font-semibold hover:bg-green-100 transition">{nav("login")}</Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">{t("title")}</h1>
        <p className="text-xl text-green-200 mb-8 max-w-2xl mx-auto">{t("subtitle")}</p>
        <div className="flex gap-4 justify-center">
          <Link href="/scenarios" className="px-8 py-3 bg-white text-green-800 rounded-lg font-bold text-lg hover:bg-green-100 transition">{t("startTraining")}</Link>
          <Link href="/register" className="px-8 py-3 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition">{t("signUpFree")}</Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">{t("features")}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: t("feature1Title"), desc: t("feature1Desc") },
            { title: t("feature2Title"), desc: t("feature2Desc") },
            { title: t("feature3Title"), desc: t("feature3Desc") },
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
          <h2 className="text-3xl font-bold text-white text-center mb-12">{t("popularScenarios")}</h2>
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

      <footer className="bg-black/30 text-center py-6 text-green-300 text-sm">{t("footer")}</footer>
    </div>
  );
}
