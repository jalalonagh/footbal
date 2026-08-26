"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl";

interface ContactSettings {
  mobilePhone?: string;
  officePhone?: string;
  email?: string;
  fax?: string;
  address?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  telegram?: string;
  whatsapp?: string;
  linkedIn?: string;
  youTube?: string;
}

export default function ContactPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.contact.getSettings().then(setSettings).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreateTicket = async () => {
    if (!subject.trim()) return;
    setCreating(true);
    setMessage("");
    try {
      await api.tickets.create(subject.trim());
      setMessage(t("contact.ticketCreated"));
      setSubject("");
      setShowTicketForm(false);
    } catch {
      setMessage(t("contact.ticketError"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-green-400 transition">
            Football Tactics
          </Link>
          <h1 className="text-xl font-bold text-white">{t("contact.title")}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-300 hover:text-white transition text-sm">
            {t("nav.home")}
          </Link>
          {user && (
            <Link href="/tickets" className="text-gray-300 hover:text-white transition text-sm">
              {t("contact.yourTickets")}
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Cards */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">{t("contact.contactInfo")}</h2>
                <div className="space-y-4">
                  {settings?.mobilePhone && (
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
                      <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                        <span className="text-green-400 text-lg">📱</span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">{t("contact.mobile")}</p>
                        <p className="text-white text-sm font-medium">{settings.mobilePhone}</p>
                      </div>
                    </div>
                  )}
                  {settings?.officePhone && (
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 text-lg">📞</span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">{t("contact.office")}</p>
                        <p className="text-white text-sm font-medium">{settings.officePhone}</p>
                      </div>
                    </div>
                  )}
                  {settings?.email && (
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
                      <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-400 text-lg">✉️</span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">{t("contact.email")}</p>
                        <p className="text-white text-sm font-medium">{settings.email}</p>
                      </div>
                    </div>
                  )}
                  {settings?.fax && (
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
                      <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-400 text-lg">📠</span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">{t("contact.fax")}</p>
                        <p className="text-white text-sm font-medium">{settings.fax}</p>
                      </div>
                    </div>
                  )}
                  {settings?.address && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                        <span className="text-red-400 text-lg">📍</span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">{t("contact.address")}</p>
                        <p className="text-white text-sm font-medium">{settings.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Media */}
              {settings && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">{t("contact.socialMedia")}</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {settings.instagram && (
                      <a href={settings.instagram} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition">
                        <span className="text-pink-400">📷</span>
                        <span className="text-sm">Instagram</span>
                      </a>
                    )}
                    {settings.twitter && (
                      <a href={settings.twitter} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition">
                        <span className="text-blue-400">🐦</span>
                        <span className="text-sm">Twitter</span>
                      </a>
                    )}
                    {settings.facebook && (
                      <a href={settings.facebook} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition">
                        <span className="text-blue-500">📘</span>
                        <span className="text-sm">Facebook</span>
                      </a>
                    )}
                    {settings.telegram && (
                      <a href={settings.telegram} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition">
                        <span className="text-blue-400">✈️</span>
                        <span className="text-sm">Telegram</span>
                      </a>
                    )}
                    {settings.whatsapp && (
                      <a href={settings.whatsapp} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition">
                        <span className="text-green-400">💬</span>
                        <span className="text-sm">WhatsApp</span>
                      </a>
                    )}
                    {settings.linkedIn && (
                      <a href={settings.linkedIn} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition">
                        <span className="text-blue-400">💼</span>
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                    {settings.youTube && (
                      <a href={settings.youTube} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition">
                        <span className="text-red-500">▶️</span>
                        <span className="text-sm">YouTube</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Ticket Form */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-2">{t("contact.support")}</h2>
                <p className="text-gray-400 text-sm mb-6">{t("contact.supportDesc")}</p>

                {!user ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-4">{t("contact.loginRequired")}</p>
                    <Link href="/login" className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                      {t("nav.login")}
                    </Link>
                  </div>
                ) : (
                  <>
                    {message && (
                      <div className={`p-4 rounded-lg mb-6 ${message.includes("Error") ? "bg-red-900/50 text-red-300 border border-red-700" : "bg-green-900/50 text-green-300 border border-green-700"}`}>
                        {message}
                      </div>
                    )}

                    {!showTicketForm ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-3xl">🎫</span>
                        </div>
                        <p className="text-gray-400 mb-4">{t("contact.supportDesc")}</p>
                        <button
                          onClick={() => setShowTicketForm(true)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                          {t("contact.newTicket")}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">{t("contact.ticketSubject")}</label>
                          <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder={t("contact.ticketSubject")}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleCreateTicket}
                            disabled={creating || !subject.trim()}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50">
                            {creating ? t("contact.creating") : t("contact.submit")}
                          </button>
                          <button
                            onClick={() => { setShowTicketForm(false); setSubject(""); setMessage(""); }}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                            {t("common.cancel")}
                          </button>
                        </div>
                      </div>
                    )}

                    {user && (
                      <div className="mt-6 pt-6 border-t border-gray-700">
                        <Link href="/tickets" className="text-green-400 hover:text-green-300 text-sm font-medium transition">
                          {t("contact.yourTickets")} →
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
