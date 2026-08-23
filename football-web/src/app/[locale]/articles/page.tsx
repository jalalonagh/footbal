"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import type { Article } from "@/lib/types";

export default function ArticlesPage() {
  const t = useTranslations("cms");
  const nav = useTranslations("nav");
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.articles.list(1, 20)
      .then((d) => setArticles(d.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/")} className="text-white hover:text-green-400">{nav("home")}</button>
        <h1 className="text-xl font-bold">{t("articlesTitle")}</h1>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">{t("noArticles")}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <div key={a.id} className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition cursor-pointer border border-gray-700 hover:border-green-500">
                {a.coverImageUrl && <div className="h-48 bg-gray-700"><img src={a.coverImageUrl} alt={a.title} className="w-full h-full object-cover" /></div>}
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">{a.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{a.summary}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{new Date(a.publishedAt).toLocaleDateString()}</span>
                    <span>{a.viewCount} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
