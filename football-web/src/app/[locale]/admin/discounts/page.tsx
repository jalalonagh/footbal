"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Discount } from "@/lib/types";

const EMPTY_FORM: Partial<Discount> = {
  code: "",
  description: "",
  percentage: 0,
  fixedAmount: 0,
  startDate: "",
  endDate: "",
  isActive: true,
  usageLimit: 0,
};

export default function AdminDiscounts() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Discount | null>(null);
  const [form, setForm] = useState<Partial<Discount>>(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace("/login");
  }, [authLoading, isAdmin, router]);

  const loadItems = async () => {
    setLoading(true);
    try {
      setItems(await api.discounts.list());
    } catch {
      setError("Failed to load discounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadItems();
  }, [isAdmin]);

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (item: Discount) => { setEditingItem(item); setForm(item); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingItem(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.discounts.update(editingItem.id, form);
        setMessage("Discount updated");
      } else {
        await api.discounts.create(form);
        setMessage("Discount created");
      }
      setError("");
      closeForm();
      await loadItems();
    } catch {
      setError("Failed to save discount");
      setMessage("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this discount?")) return;
    try {
      await api.discounts.delete(id);
      setMessage("Discount deleted");
      setError("");
      await loadItems();
    } catch {
      setError("Failed to delete discount");
    }
  };

  if (authLoading || !isAdmin) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Discount Management</h1>
        <button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Create Discount
        </button>
      </div>
      {message && <p className="text-green-400 mb-4">{message}</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {showForm && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">{editingItem ? "Edit Discount" : "Create Discount"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Code</label>
                <input type="text" required value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Description</label>
                <input type="text" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Percentage</label>
                <input type="number" value={form.percentage || 0} onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Fixed Amount</label>
                <input type="number" value={form.fixedAmount || 0} onChange={(e) => setForm({ ...form, fixedAmount: Number(e.target.value) })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Start Date</label>
                <input type="datetime-local" value={form.startDate || ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">End Date</label>
                <input type="datetime-local" value={form.endDate || ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Usage Limit</label>
                <input type="number" value={form.usageLimit || 0} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-white text-sm">
                  <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500" />
                  Active
                </label>
              </div>
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
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Code</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Description</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Discount</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Start</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">End</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Active</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Usage</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-6 text-gray-400 text-center">No discounts found</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-white text-sm font-medium">{item.code}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{item.description}</td>
                  <td className="px-4 py-3 text-white text-sm">
                    {item.percentage > 0 ? `${item.percentage}%` : item.fixedAmount > 0 ? `$${item.fixedAmount}` : "--"}
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{item.startDate ? new Date(item.startDate).toLocaleDateString() : "--"}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{item.endDate ? new Date(item.endDate).toLocaleDateString() : "--"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${item.isActive ? "text-green-400" : "text-red-400"}`}>
                      {item.isActive ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{item.usedCount} / {item.usageLimit}</td>
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
