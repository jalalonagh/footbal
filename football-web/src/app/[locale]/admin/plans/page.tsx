"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { SubscriptionPlan } from "@/lib/types";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDiscountPrice, setFormDiscountPrice] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formCurrency, setFormCurrency] = useState("IRR");

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await api.subscription.plans();
      setPlans(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormDesc("");
    setFormPrice("");
    setFormDiscountPrice("");
    setFormDuration("30");
    setFormCurrency("IRR");
    setShowForm(true);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditing(plan);
    setFormName(plan.name);
    setFormDesc(plan.description);
    setFormPrice(plan.price.toString());
    setFormDiscountPrice(plan.discountPrice?.toString() || "");
    setFormDuration(plan.durationDays.toString());
    setFormCurrency(plan.currency);
    setShowForm(true);
  };

  const handleSave = async () => {
    setMessage("");
    setError("");
    try {
      const data = {
        name: formName,
        description: formDesc,
        price: parseFloat(formPrice),
        discountPrice: formDiscountPrice ? parseFloat(formDiscountPrice) : null,
        durationDays: parseInt(formDuration),
        currency: formCurrency,
        isActive: true,
      };
      if (editing) {
        await fetch(`/api/Subscription/plans/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        setMessage("Plan updated successfully");
      } else {
        setMessage("Plan created (refresh to see)");
      }
      setShowForm(false);
      fetchPlans();
    } catch (e: any) {
      setError(e.message || "Failed to save plan");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Subscription Plans</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
          Create Plan
        </button>
      </div>

      {message && <div className="bg-green-900/50 border border-green-600 text-green-300 px-4 py-2 rounded-lg mb-4">{message}</div>}
      {error && <div className="bg-red-900/50 border border-red-600 text-red-300 px-4 py-2 rounded-lg mb-4">{error}</div>}

      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">{editing ? "Edit Plan" : "Create Plan"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Name</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Duration (days)</label>
              <input type="number" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Price</label>
              <input type="number" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Discount Price (optional)</label>
              <input type="number" step="0.01" value={formDiscountPrice} onChange={(e) => setFormDiscountPrice(e.target.value)} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Currency</label>
              <select value={formCurrency} onChange={(e) => setFormCurrency(e.target.value)} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none">
                <option value="IRR">IRR (تومان)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Description</label>
              <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="px-6 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition">
              {editing ? "Update" : "Create"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-6 py-3 text-gray-400 text-sm font-medium">Name</th>
                <th className="text-left px-6 py-3 text-gray-400 text-sm font-medium">Price</th>
                <th className="text-left px-6 py-3 text-gray-400 text-sm font-medium">Discount</th>
                <th className="text-left px-6 py-3 text-gray-400 text-sm font-medium">Duration</th>
                <th className="text-left px-6 py-3 text-gray-400 text-sm font-medium">Active</th>
                <th className="text-right px-6 py-3 text-gray-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b border-gray-700/50 hover:bg-gray-750">
                  <td className="px-6 py-4 text-white font-medium">{plan.name}</td>
                  <td className="px-6 py-4 text-gray-300">{plan.price.toLocaleString()} {plan.currency}</td>
                  <td className="px-6 py-4 text-green-400">{plan.discountPrice ? `${plan.discountPrice.toLocaleString()} ${plan.currency}` : "-"}</td>
                  <td className="px-6 py-4 text-gray-300">{plan.durationDays} days</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${plan.isActive ? "bg-green-600/20 text-green-400" : "bg-gray-600/20 text-gray-400"}`}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(plan)} className="text-blue-400 hover:text-blue-300 text-sm mr-3">Edit</button>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No plans found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
