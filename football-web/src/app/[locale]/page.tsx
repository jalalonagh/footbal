"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/navbar";
import ReadOnlyPitch from "@/components/readonly-pitch";
import type { PlayerData, BallData } from "@/components/football-pitch";
import type { Article } from "@/lib/types";

interface RecentScenario {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  formation: string;
  gamePhase: string;
  gameMinute: number;
  players: Array<{
    id: string;
    number: number;
    position: string;
    role: string;
    startX: number;
    startY: number;
    teamId: number;
    speed: number;
    hasBall: boolean;
    isTarget: boolean;
  }>;
}

function scenarioToPlayersAndBall(players: RecentScenario["players"]): { playerData: PlayerData[]; ballData: BallData } {
  const playerData: PlayerData[] = players.map((p) => ({
    id: p.id,
    teamId: p.teamId,
    number: p.number,
    x: p.startX,
    y: p.startY,
    hasBall: p.hasBall,
    isTarget: p.isTarget,
    isDefender: p.teamId === 2,
    isGoalkeeper: p.position === "GK",
    position: p.position,
    direction: null,
    suggestedDirection: null,
    wrongDirection: null,
  }));

  const holder = players.find((p) => p.hasBall);
  const ballData: BallData = {
    x: holder ? holder.startX : 50,
    y: holder ? holder.startY : 50,
    holderId: holder ? holder.id : null,
    direction: null,
    suggestedDirection: null,
    wrongDirection: null,
  };

  return { playerData, ballData };
}

const HERO_IMG = "/images/hero.svg";
const ABOUT_IMG = "/images/about.svg";
const AUDIENCE_IMGS = [
  "/images/players.svg",
  "/images/coaches.svg",
  "/images/academy.svg",
];

export default function HomePage() {
  const t = useTranslations("home");
  const tSeo = useTranslations("seo");
  const locale = useLocale();
  const { isAuthenticated } = useAuth();
  const [recentScenarios, setRecentScenarios] = useState<RecentScenario[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [origin, setOrigin] = useState("");

  const apiLang = locale === "fa" ? "Persian" : "English";

  useEffect(() => {
    setOrigin(window.location.origin);
    api.scenarios.recent(3).then(setRecentScenarios).catch(() => {});
    api.articles.list(1, 2, apiLang).then((r) => setRecentArticles(r.items)).catch(() => {});
  }, [apiLang]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Football Tactical Training",
    applicationCategory: "SportsApplication",
    operatingSystem: "Web",
    description: tSeo("metaDescription"),
    url: origin,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">{t("title")}</h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto drop-shadow">{t("subtitle")}</p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard" className="px-8 py-3 bg-white text-green-800 rounded-lg font-bold text-lg hover:bg-green-100 transition shadow-lg">{t("startTraining")}</Link>
            ) : (
              <>
                <Link href="/scenarios" className="px-8 py-3 bg-white text-green-800 rounded-lg font-bold text-lg hover:bg-green-100 transition shadow-lg">{t("startTraining")}</Link>
                <Link href="/register" className="px-8 py-3 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition shadow-lg">{t("signUpFree")}</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          <img src={ABOUT_IMG} alt="" className="w-full md:w-80 h-64 object-cover rounded-xl shadow-xl flex-shrink-0" />
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">{t("aboutTitle")}</h2>
            <p className="text-green-200 text-lg leading-relaxed">{t("aboutDesc")}</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">{t("howItWorks")}</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "1", title: t("step1Title"), desc: t("step1Desc") },
            { step: "2", title: t("step2Title"), desc: t("step2Desc") },
            { step: "3", title: t("step3Title"), desc: t("step3Desc") },
            { step: "4", title: t("step4Title"), desc: t("step4Desc") },
          ].map((s) => (
            <div key={s.step} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg">{s.step}</div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-green-200 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Free Features Highlight */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-r from-green-600/30 to-blue-600/30 backdrop-blur-sm rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-full mb-4 shadow-lg">FREE</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("freeFeaturesTitle")}</h2>
            <p className="text-green-100 text-lg max-w-2xl mx-auto">{t("freeFeaturesDesc")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition">
              <div className="w-16 h-16 bg-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚽</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t("freeTrainingTitle")}</h3>
              <p className="text-green-200 text-sm mb-4">{t("freeTrainingDesc")}</p>
              <Link href="/scenarios" className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition">
                {t("startTraining")}
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition">
              <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎮</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t("free3DTitle")}</h3>
              <p className="text-green-200 text-sm mb-4">{t("free3DDesc")}</p>
              <Link href="/scenarios" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
                {t("try3D")}
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition">
              <div className="w-16 h-16 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t("freeAITitle")}</h3>
              <p className="text-green-200 text-sm mb-4">{t("freeAIDesc")}</p>
              <Link href="/scenarios" className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition">
                {t("tryAI")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
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

      {/* Who is this for */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">{t("whoIsFor")}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: t("audience1Title"), desc: t("audience1Desc"), img: AUDIENCE_IMGS[0] },
            { title: t("audience2Title"), desc: t("audience2Desc"), img: AUDIENCE_IMGS[1] },
            { title: t("audience3Title"), desc: t("audience3Desc"), img: AUDIENCE_IMGS[2] },
          ].map((a, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden text-center">
              <img src={a.img} alt="" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-3">{a.title}</h3>
                <p className="text-green-200 text-sm">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Scenarios */}
      {recentScenarios.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">{t("popularScenarios")}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {recentScenarios.map((s) => {
              const { playerData, ballData } = scenarioToPlayersAndBall(s.players);
              return (
                <Link key={s.id} href={`/training/${s.id}`} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/20 transition group">
                  <div className="p-3 bg-black/20">
                    <ReadOnlyPitch players={playerData} ball={ballData} />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">{s.category}</span>
                      <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">{s.difficulty}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-green-300 transition">{s.name}</h3>
                    <p className="text-green-200 text-xs">{s.formation} &middot; {s.gamePhase} &middot; {s.gameMinute}&#8243;</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Articles */}
      {recentArticles.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">{t("latestArticles")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {recentArticles.map((a) => (
              <Link key={a.id} href={`/articles/${a.slug}`} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/20 transition group">
                {a.coverImageUrl && (
                  <div className="h-48 bg-gray-700 overflow-hidden">
                    <img src={a.coverImageUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-300 transition">{a.title}</h3>
                  <p className="text-green-200 text-sm line-clamp-2 mb-3">{a.summary}</p>
                  <div className="flex items-center justify-between text-xs text-green-300/60">
                    <span>{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ""}</span>
                    <span>{a.viewCount} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">{t("faqTitle")}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { q: t("faq1Q"), a: t("faq1A") },
            { q: t("faq2Q"), a: t("faq2A") },
            { q: t("faq3Q"), a: t("faq3A") },
            { q: t("faq4Q"), a: t("faq4A") },
          ].map((f, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">{f.q}</h3>
              <p className="text-green-200 text-sm">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-black/30 text-center py-6 text-green-300 text-sm">{t("footer")}</footer>
    </div>
  );
}
