"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const IRANIAN_PROVINCES = [
  "Tehran", "Isfahan", "Fars", "Khorasan Razavi", "Khuzestan", "East Azerbaijan",
  "West Azerbaijan", "Mazandaran", "Kerman", "Lorestan", "Kermanshah", "Gilan",
  "Sistan and Baluchestan", "Hormozgan", "Kurdistan", "Hamadan", "Zanjan",
  "Ardabil", "Bushehr", "Ilam", "Chaharmahal and Bakhtiari", "South Khorasan",
  "North Khorasan", "Kohgiluyeh and Boyer-Ahmad", "Qazvin", "Qom", "Golestan", "Yazd"
];

export default function AddAcademyPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    logoUrl: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    province: "",
    country: "Iran",
    website: "",
    instagram: "",
    telegram: "",
    foundedYear: "",
    ageGroups: "",
    playingStyle: "",
    facilities: "",
    minAge: "",
    maxAge: "",
    monthlyFee: "",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Academy name is required"); return; }
    setSaving(true);
    setError("");
    try {
      await api.academies.create({
        name: form.name,
        description: form.description || undefined,
        logoUrl: form.logoUrl || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        province: form.province || undefined,
        country: form.country || undefined,
        website: form.website || undefined,
        instagram: form.instagram || undefined,
        telegram: form.telegram || undefined,
        foundedYear: form.foundedYear ? parseInt(form.foundedYear) : undefined,
        ageGroups: form.ageGroups || undefined,
        playingStyle: form.playingStyle || undefined,
        facilities: form.facilities || undefined,
        minAge: form.minAge ? parseInt(form.minAge) : undefined,
        maxAge: form.maxAge ? parseInt(form.maxAge) : undefined,
        monthlyFee: form.monthlyFee ? parseFloat(form.monthlyFee) : undefined,
      } as any);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit academy");
    } finally { setSaving(false); }
  };

  if (authLoading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div></div>;
  if (!isAuthenticated) { router.push("/login"); return null; }

  if (success) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white px-4">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-2">Academy Submitted!</h1>
      <p className="text-gray-400 mb-6 text-center max-w-md">
        Your academy has been submitted for review. An admin will review it shortly.
        {user?.role !== "Admin" && user?.role !== "SuperAdmin" && " You will be able to see it once it's approved."}
      </p>
      <div className="flex gap-4">
        <button onClick={() => router.push("/academies")} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">View Academies</button>
        <button onClick={() => { setSuccess(false); setForm({ name: "", description: "", logoUrl: "", contactEmail: "", contactPhone: "", address: "", city: "", province: "", country: "Iran", website: "", instagram: "", telegram: "", foundedYear: "", ageGroups: "", playingStyle: "", facilities: "", minAge: "", maxAge: "", monthlyFee: "" }); }} className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600">Add Another</button>
      </div>
    </div>
  );

  const inputClass = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent";
  const labelClass = "block text-sm text-gray-400 mb-1";

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-400">Add Football Academy</h1>
            <p className="text-gray-400 mt-1">Register your academy on the platform</p>
          </div>
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white px-4 py-2 border border-gray-600 rounded-lg">← Back</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">{error}</div>}

          {/* Required Fields */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-green-400">Required Information</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Academy Name *</label>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="e.g. Tehran Football Academy" required />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className={inputClass} rows={3} placeholder="Tell us about your academy..." />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City</label>
                  <input value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} placeholder="e.g. Tehran" />
                </div>
                <div>
                  <label className={labelClass}>Province</label>
                  <select value={form.province} onChange={(e) => update("province", e.target.value)} className={inputClass}>
                    <option value="">Select Province</option>
                    {IRANIAN_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-green-400">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone</label>
                <input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} className={inputClass} placeholder="0912..." />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} type="email" className={inputClass} placeholder="academy@example.com" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Address</label>
                <input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} placeholder="Full address" />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input value={form.website} onChange={(e) => update("website", e.target.value)} className={inputClass} placeholder="https://..." />
              </div>
              <div>
                <label className={labelClass}>Instagram</label>
                <input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} className={inputClass} placeholder="@academy" />
              </div>
              <div>
                <label className={labelClass}>Telegram</label>
                <input value={form.telegram} onChange={(e) => update("telegram", e.target.value)} className={inputClass} placeholder="@academy" />
              </div>
              <div>
                <label className={labelClass}>Logo URL</label>
                <input value={form.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} className={inputClass} placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Academy Details */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-green-400">Academy Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Founded Year</label>
                <input value={form.foundedYear} onChange={(e) => update("foundedYear", e.target.value)} type="number" className={inputClass} placeholder="e.g. 2015" />
              </div>
              <div>
                <label className={labelClass}>Age Groups</label>
                <input value={form.ageGroups} onChange={(e) => update("ageGroups", e.target.value)} className={inputClass} placeholder="e.g. U8, U12, U16, Senior" />
              </div>
              <div>
                <label className={labelClass}>Min Age</label>
                <input value={form.minAge} onChange={(e) => update("minAge", e.target.value)} type="number" className={inputClass} placeholder="6" />
              </div>
              <div>
                <label className={labelClass}>Max Age</label>
                <input value={form.maxAge} onChange={(e) => update("maxAge", e.target.value)} type="number" className={inputClass} placeholder="30" />
              </div>
              <div>
                <label className={labelClass}>Monthly Fee (Tomans)</label>
                <input value={form.monthlyFee} onChange={(e) => update("monthlyFee", e.target.value)} type="number" className={inputClass} placeholder="e.g. 500000" />
              </div>
              <div>
                <label className={labelClass}>Playing Style</label>
                <input value={form.playingStyle} onChange={(e) => update("playingStyle", e.target.value)} className={inputClass} placeholder="e.g. Tiki-taka, Direct, Counter-attack" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Facilities</label>
                <textarea value={form.facilities} onChange={(e) => update("facilities", e.target.value)} className={inputClass} rows={2} placeholder="e.g. 2 grass fields, gym, indoor hall..." />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving || !form.name.trim()}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-lg">
            {saving ? "Submitting..." : "🏟️ Submit Academy"}
          </button>

          <p className="text-center text-sm text-gray-500">
            {user?.role === "Admin" || user?.role === "SuperAdmin"
              ? "Your academy will be approved immediately."
              : "Your academy will be reviewed by an admin before being published."}
          </p>
        </form>
      </div>
    </div>
  );
}
