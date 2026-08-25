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

  useEffect(() => {
    if (!article) return;

    document.title = article.metaTitle || article.title;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };

    const setProperty = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };

    if (article.metaDescription) setMeta("description", article.metaDescription);
    if (article.keywords) setMeta("keywords", article.keywords);

    setProperty("og:title", article.metaTitle || article.title);
    if (article.metaDescription) setProperty("og:description", article.metaDescription);
    if (article.coverImageUrl) setProperty("og:image", article.coverImageUrl);
    setProperty("og:type", "article");
    setProperty("og:locale", locale === "fa" ? "fa_IR" : "en_US");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", article.metaTitle || article.title);
    if (article.metaDescription) setMeta("twitter:description", article.metaDescription);
    if (article.coverImageUrl) setMeta("twitter:image", article.coverImageUrl);

    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.metaDescription || article.summary,
      image: article.coverImageUrl,
      datePublished: article.publishedAt,
      dateModified: article.publishedAt,
      author: { "@type": "Organization", name: "Football Tactical Training" },
      publisher: { "@type": "Organization", name: "Football Tactical Training" },
      keywords: article.keywords || article.focusKeyword,
      wordCount: article.content?.split(/\s+/).length || 0,
      timeRequired: `PT${article.readingTimeMinutes || 5}M`,
      mainEntityOfPage: { "@type": "WebPage", "@id": window.location.href },
    };

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) { script = document.createElement("script"); script.setAttribute("type", "application/ld+json"); document.head.appendChild(script); }
    script.textContent = JSON.stringify(schema);

    return () => {
      document.querySelectorAll('meta[property^="og:"]').forEach((el) => el.remove());
      document.querySelectorAll('meta[name="twitter:"]').forEach((el) => el.remove());
      if (script) script.remove();
    };
  }, [article, locale]);

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

      <article className="max-w-3xl mx-auto px-6 py-8" itemScope itemType="https://schema.org/Article">
        {article.coverImageUrl && (
          <div className="rounded-xl overflow-hidden mb-6">
            <img src={article.coverImageUrl} alt={article.coverImageAlt || article.title} className="w-full h-64 object-cover" itemProp="image" />
          </div>
        )}
        <h1 className="text-3xl font-bold mb-4" itemProp="headline">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
          <time dateTime={article.publishedAt} itemProp="datePublished">{new Date(article.publishedAt).toLocaleDateString()}</time>
          <span itemProp="author">Football Tactical Training</span>
          {article.readingTimeMinutes && <span>{article.readingTimeMinutes} min read</span>}
          <span>{article.viewCount} views</span>
        </div>
        {article.excerpt && (
          <p className="text-gray-300 text-lg mb-6 italic" itemProp="description">{article.excerpt}</p>
        )}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="prose prose-invert max-w-none whitespace-pre-wrap" itemProp="articleBody" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
        {article.focusKeyword && (
          <div className="mt-6 text-xs text-gray-500">
            <span>Keywords: </span>
            <span itemProp="keywords">{article.keywords || article.focusKeyword}</span>
          </div>
        )}
      </article>
    </div>
  );
}
