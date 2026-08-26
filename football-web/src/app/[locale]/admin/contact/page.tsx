"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function AdminContactPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState({
    mobilePhone: "",
    officePhone: "",
    email: "",
    fax: "",
    address: "",
    instagram: "",
    twitter: "",
    facebook: "",
    telegram: "",
    whatsapp: "",
    linkedIn: "",
    youTube: "",
  });

  useEffect(() => {
    api.contact.getSettings()
      .then(s => {
        if (s) setSettings({
          mobilePhone: s.mobilePhone || "",
          officePhone: s.officePhone || "",
          email: s.email || "",
          fax: s.fax || "",
          address: s.address || "",
          instagram: s.instagram || "",
          twitter: s.twitter || "",
          facebook: s.facebook || "",
          telegram: s.telegram || "",
          whatsapp: s.whatsapp || "",
          linkedIn: s.linkedIn || "",
          youTube: s.youTube || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.contact.updateSettings(settings);
      setMessage("Settings saved successfully!");
    } catch {
      setMessage("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Contact Settings</h1>

      {message && (
        <div className={`p-3 rounded-lg mb-4 ${message.includes("Error") ? "bg-red-900/50 text-red-300" : "bg-green-900/50 text-green-300"}`}>
          {message}
        </div>
      )}

      {/* Contact Info */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Mobile Phone</label>
            <input
              type="text"
              value={settings.mobilePhone}
              onChange={(e) => handleChange("mobilePhone", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Office Phone</label>
            <input
              type="text"
              value={settings.officePhone}
              onChange={(e) => handleChange("officePhone", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Fax</label>
            <input
              type="text"
              value={settings.fax}
              onChange={(e) => handleChange("fax", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-400 text-sm mb-1">Office Address</label>
            <textarea
              value={settings.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 min-h-[80px] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Social Media Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Instagram</label>
            <input
              type="url"
              value={settings.instagram}
              onChange={(e) => handleChange("instagram", e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Twitter</label>
            <input
              type="url"
              value={settings.twitter}
              onChange={(e) => handleChange("twitter", e.target.value)}
              placeholder="https://twitter.com/..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Facebook</label>
            <input
              type="url"
              value={settings.facebook}
              onChange={(e) => handleChange("facebook", e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Telegram</label>
            <input
              type="url"
              value={settings.telegram}
              onChange={(e) => handleChange("telegram", e.target.value)}
              placeholder="https://t.me/..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">WhatsApp</label>
            <input
              type="url"
              value={settings.whatsapp}
              onChange={(e) => handleChange("whatsapp", e.target.value)}
              placeholder="https://wa.me/..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">LinkedIn</label>
            <input
              type="url"
              value={settings.linkedIn}
              onChange={(e) => handleChange("linkedIn", e.target.value)}
              placeholder="https://linkedin.com/..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">YouTube</label>
            <input
              type="url"
              value={settings.youTube}
              onChange={(e) => handleChange("youTube", e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium disabled:opacity-50">
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
