"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { api } from "@/lib/api";
import type { Article } from "@/lib/types";
import { Link } from "@/i18n/routing";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  const apiLang = locale === "fa" ? "Persian" : "English";

  useEffect(() => {
    if (!slug) return;
    api.articles.getBySlug(slug, apiLang)
      .then(setArticle)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, apiLang]);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  if (!article) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Article not found.</div>;

  const otherLang = locale === "fa" ? "English" : "Persian";
  const otherSlug = article.translations?.find((t) => t.language === otherLang)?.slug;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/articles" className="text-white hover:text-green-400">&larr; Back</Link>
        <h1 className="text-xl font-bold">Article</h1>
        {otherSlug && (
          <Link href={`/articles/${otherSlug}`} className="ml-auto text-sm text-green-400 hover:text-green-300">
            {locale === "fa" ? "English" : "فارسی"}
          </Link>
        )}
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
