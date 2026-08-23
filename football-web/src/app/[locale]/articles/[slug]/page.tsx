"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Article } from "@/lib/types";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api.articles.getBySlug(slug)
      .then(setArticle)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  if (!article) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Article not found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/articles")} className="text-white hover:text-green-400">&larr; Back</button>
        <h1 className="text-xl font-bold">Article</h1>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {article.coverImageUrl && (
          <div className="rounded-xl overflow-hidden mb-6">
            <img src={article.coverImageUrl} alt={article.title} className="w-full h-64 object-cover" />
          </div>
        )}
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          <span>{article.viewCount} views</span>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="prose prose-invert max-w-none whitespace-pre-wrap">{article.content}</div>
        </div>
      </main>
    </div>
  );
}
