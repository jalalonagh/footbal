"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Faq } from "@/lib/types";

const EMPTY_FORM: Partial<Faq> = {
  question: "",
  answer: "",
  category: "",
  language: "en",
  isActive: true,
  displayOrder: 0,
};

export default function AdminFaqs() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Faq | null>(null);
  const [form, setForm] = useState<Partial<Faq>>(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace("/login");
  }, [authLoading, isAdmin, router]);

  const loadItems = async () => {
    setLoading(true);
    try {
      setItems(await api.faqs.list());
    } catch {
      setError("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadItems();
  }, [isAdmin]);

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (item: Faq) => { setEditingItem(item); setForm(item); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingItem(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.faqs.update(editingItem.id, form);
        setMessage("FAQ updated");
      } else {
        await api.faqs.create(form);
        setMessage("FAQ created");
      }
      setError("");
      closeForm();
      await loadItems();
    } catch {
      setError("Failed to save FAQ");
      setMessage("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await api.faqs.delete(id);
      setMessage("FAQ deleted");
      setError("");
      await loadItems();
    } catch {
      setError("Failed to delete FAQ");
    }
  };

  if (authLoading || !isAdmin) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">FAQ Management</h1>
        <button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Create FAQ
        </button>
      </div>
      {message && <p className="text-green-400 mb-4">{message}</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {showForm && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">{editingItem ? "Edit FAQ" : "Create FAQ"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Question</label>
                <input type="text" required value={form.question || ""} onChange={(e) => setForm({ ...form, question: e.target.value })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Category</label>
                <input type="text" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Language</label>
                <input type="text" value={form.language || "en"} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Display Order</label>
                <input type="number" value={form.displayOrder || 0} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Answer</label>
              <textarea rows={4} required value={form.answer || ""} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-white text-sm">
                <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500" />
                Active
              </label>
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
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Question</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Category</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Language</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Active</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Order</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-gray-400 text-center">No FAQs found</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-white text-sm font-medium max-w-xs truncate">{item.question}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{item.category}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{item.language}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${item.isActive ? "text-green-400" : "text-red-400"}`}>
                      {item.isActive ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white text-sm">{item.displayOrder}</td>
                  <td className="px-4 py-3 flex gap-2">
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
