"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl";

interface Position {
  id: string;
  code: string;
  name: string;
  nameFa?: string;
  description?: string;
  descriptionFa?: string;
  requirements?: string;
  requirementsFa?: string;
  iconUrl?: string;
  displayOrder: number;
  isActive: boolean;
  category?: string;
  userPositions?: any[];
}

const EMPTY_FORM: Partial<Position> = {
  code: "",
  name: "",
  nameFa: "",
  description: "",
  descriptionFa: "",
  requirements: "",
  requirementsFa: "",
  iconUrl: "",
  displayOrder: 0,
  isActive: true,
  category: "",
};

export default function AdminPositions() {
  const t = useTranslations();
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Position | null>(null);
  const [form, setForm] = useState<Partial<Position>>(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace("/login");
  }, [authLoading, isAdmin, router]);

  const loadPositions = async () => {
    setLoading(true);
    try {
      setPositions(await api.positions.list(true));
    } catch {
      setError("Failed to load positions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadPositions();
  }, [isAdmin]);

  const openCreate = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item: Position) => {
    setEditingItem(item);
    setForm({ ...item });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.code || !form.name) {
      setError("Code and Name are required");
      return;
    }

    try {
      if (editingItem) {
        await api.positions.update(editingItem.id, form);
        setMessage("Position updated");
      } else {
        await api.positions.create(form);
        setMessage("Position created");
      }
      closeForm();
      loadPositions();
    } catch (err: any) {
      setError(err.message || "Error saving position");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return;
    try {
      await api.positions.delete(id);
      setMessage("Position deleted");
      loadPositions();
    } catch {
      setError("Error deleting position");
    }
  };

  if (authLoading || !isAdmin) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("positions.title")}</h1>
        <button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition">
          {t("positions.addNew")}
        </button>
      </div>

      {message && <div className="bg-green-900/50 text-green-300 p-4 rounded-lg mb-4 border border-green-700">{message}</div>}
      {error && <div className="bg-red-900/50 text-red-300 p-4 rounded-lg mb-4 border border-red-700">{error}</div>}

      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{editingItem ? t("positions.edit") : t("positions.addNew")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">{t("positions.code")} *</label>
              <input value={form.code || ""} onChange={e => setForm({ ...form, code: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">{t("positions.name")} *</label>
              <input value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">{t("positions.nameFa")}</label>
              <input value={form.nameFa || ""} onChange={e => setForm({ ...form, nameFa: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">{t("positions.category")}</label>
              <select value={form.category || ""} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none">
                <option value="">---</option>
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Defense">Defense</option>
                <option value="Midfield">Midfield</option>
                <option value="Attack">Attack</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">{t("positions.description")}</label>
              <textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" rows={3} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">{t("positions.descriptionFa")}</label>
              <textarea value={form.descriptionFa || ""} onChange={e => setForm({ ...form, descriptionFa: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" rows={3} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">{t("positions.requirements")}</label>
              <textarea value={form.requirements || ""} onChange={e => setForm({ ...form, requirements: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" rows={3} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">{t("positions.requirementsFa")}</label>
              <textarea value={form.requirementsFa || ""} onChange={e => setForm({ ...form, requirementsFa: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" rows={3} />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">{t("positions.displayOrder")}</label>
              <input type="number" value={form.displayOrder || 0} onChange={e => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">{t("positions.iconUrl")}</label>
              <input value={form.iconUrl || ""} onChange={e => setForm({ ...form, iconUrl: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive ?? true} onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-green-600 focus:ring-green-500" />
              <label className="text-gray-400 text-sm">{t("positions.isActive")}</label>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition">
              {editingItem ? t("common.save") : t("common.create")}
            </button>
            <button onClick={closeForm} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition">
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">{t("positions.code")}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">{t("positions.name")}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">{t("positions.category")}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">{t("positions.displayOrder")}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">{t("positions.usersCount")}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">{t("common.status")}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((item) => (
                <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="px-6 py-4 text-white font-mono">{item.code}</td>
                  <td className="px-6 py-4 text-white">{item.name}</td>
                  <td className="px-6 py-4 text-gray-300">{item.category || "---"}</td>
                  <td className="px-6 py-4 text-gray-300">{item.displayOrder}</td>
                  <td className="px-6 py-4 text-gray-300">{item.userPositions?.length || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.isActive ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}`}>
                      {item.isActive ? t("common.active") : t("common.inactive")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-blue-400 hover:text-blue-300 transition text-sm">
                        {t("common.edit")}
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 transition text-sm">
                        {t("common.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
