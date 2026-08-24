"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Article } from "@/lib/types";

interface LangForm {
  title: string;
  content: string;
  summary: string;
  slug: string;
}

interface ArticleForm {
  coverImageUrl: string;
  en: LangForm;
  fa: LangForm;
}

const EMPTY_LANG: LangForm = { title: "", content: "", summary: "", slug: "" };
const EMPTY_FORM: ArticleForm = { coverImageUrl: "", en: { ...EMPTY_LANG }, fa: { ...EMPTY_LANG } };

export default function AdminArticles() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Article | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [activeLang, setActiveLang] = useState<"en" | "fa">("en");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace("/login");
  }, [authLoading, isAdmin, router]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await api.articles.list(1, 50);
      setItems(res.items);
    } catch {
      setError("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadItems();
  }, [isAdmin]);

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setActiveLang("en"); setShowForm(true); };

  const openEdit = (item: Article) => {
    setEditingItem(item);
    const faTr = item.translations?.find((t) => t.language === "Persian");
    setForm({
      coverImageUrl: item.coverImageUrl || "",
      en: { title: item.title, content: item.content, summary: item.summary || "", slug: item.slug },
      fa: { title: faTr?.title || "", content: faTr?.content || "", summary: faTr?.summary || "", slug: faTr?.slug || "" },
    });
    setActiveLang("en");
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingItem(null); };

  const updateLang = (lang: "en" | "fa", field: keyof LangForm, value: string) => {
    setForm((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const translations: { language: string; title: string; content: string; summary: string; slug: string }[] = [];
      if (form.fa.title || form.fa.content) {
        translations.push({ language: "Persian", title: form.fa.title, content: form.fa.content, summary: form.fa.summary, slug: form.fa.slug });
      }

      const payload = {
        title: form.en.title,
        content: form.en.content,
        summary: form.en.summary,
        slug: form.en.slug,
        coverImageUrl: form.coverImageUrl,
        translations,
      };

      if (editingItem) {
        await api.articles.update(editingItem.id, payload);
        setMessage("Article updated");
      } else {
        await api.articles.create(payload);
        setMessage("Article created");
      }
      setError("");
      closeForm();
      await loadItems();
    } catch {
      setError("Failed to save article");
      setMessage("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    try {
      await api.articles.delete(id);
      setMessage("Article deleted");
      setError("");
      await loadItems();
    } catch {
      setError("Failed to delete article");
    }
  };

  const togglePublish = async (item: Article) => {
    try {
      await api.articles.publish(item.id);
      setMessage(item.isPublished ? "Article unpublished" : "Article published");
      setError("");
      await loadItems();
    } catch {
      setError("Failed to toggle publish");
    }
  };

  if (authLoading || !isAdmin) return null;

  const currentLang = form[activeLang];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Article Management</h1>
        <button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Create Article
        </button>
      </div>
      {message && <p className="text-green-400 mb-4">{message}</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {showForm && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">{editingItem ? "Edit Article" : "Create Article"}</h2>

          <div className="flex gap-2 mb-4">
            <button type="button" onClick={() => setActiveLang("en")} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeLang === "en" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
              English
            </button>
            <button type="button" onClick={() => setActiveLang("fa")} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeLang === "fa" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
              فارسی
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Cover Image URL</label>
              <input type="text" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Title ({activeLang === "en" ? "English" : "فارسی"})</label>
                <input type="text" required value={currentLang.title} onChange={(e) => updateLang(activeLang, "title", e.target.value)} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Slug ({activeLang === "en" ? "English" : "فارسی"})</label>
                <input type="text" required value={currentLang.slug} onChange={(e) => updateLang(activeLang, "slug", e.target.value)} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Summary ({activeLang === "en" ? "English" : "فارسی"})</label>
              <input type="text" value={currentLang.summary} onChange={(e) => updateLang(activeLang, "summary", e.target.value)} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Content ({activeLang === "en" ? "English" : "فارسی"})</label>
              <textarea rows={6} required value={currentLang.content} onChange={(e) => updateLang(activeLang, "content", e.target.value)} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                {editingItem ? "Update" : "Create"}
              </button>
              <button type="button" onClick={closeForm} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Title</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Slug</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Published</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Views</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Published At</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-gray-400 text-center">No articles found</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-white text-sm font-medium">{item.title}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{item.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${item.isPublished ? "text-green-400" : "text-yellow-400"}`}>
                      {item.isPublished ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white text-sm">{item.viewCount}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "--"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => togglePublish(item)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm">
                      {item.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => openEdit(item)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
