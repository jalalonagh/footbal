"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  messageCount: number;
}

export default function TicketsPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const fetchTickets = isAdmin ? api.tickets.listAll : api.tickets.list;
    fetchTickets()
      .then(setTickets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, isAdmin, router]);

  const handleCreate = async () => {
    if (!subject.trim()) return;
    setCreating(true);
    setMessage("");
    try {
      const ticket = await api.tickets.create(subject.trim());
      setMessage(t("contact.ticketCreated"));
      setTickets(prev => [{ id: ticket.id, subject: ticket.subject, status: ticket.status, priority: "Normal", createdAt: new Date().toISOString(), messageCount: 0 }, ...prev]);
      setSubject("");
      setShowCreate(false);
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
          <h1 className="text-xl font-bold text-white">
            {isAdmin ? t("contact.adminTickets") : t("contact.yourTickets")}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/contact" className="text-gray-300 hover:text-white transition text-sm">
            {t("nav.contact")}
          </Link>
          {!isAdmin && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm">
              {t("contact.newTicket")}
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {showCreate && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">{t("contact.newTicket")}</h2>
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
                  onClick={handleCreate}
                  disabled={creating || !subject.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50">
                  {creating ? t("contact.creating") : t("contact.submit")}
                </button>
                <button
                  onClick={() => { setShowCreate(false); setSubject(""); setMessage(""); }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes("Error") ? "bg-red-900/50 text-red-300 border border-red-700" : "bg-green-900/50 text-green-300 border border-green-700"}`}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎫</span>
            </div>
            <p className="text-gray-400 mb-4">{t("contact.noTickets")}</p>
            {!isAdmin && (
              <button
                onClick={() => setShowCreate(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                {t("contact.createFirst")}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="block bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-green-500 transition group">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold group-hover:text-green-400 transition">{ticket.subject}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(ticket.createdAt).toLocaleDateString()} • {ticket.messageCount} {t("contact.messages").toLowerCase()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === "Open" ? "bg-green-900/50 text-green-300 border border-green-700" :
                    ticket.status === "Closed" ? "bg-gray-700 text-gray-300 border border-gray-600" :
                    "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                  }`}>
                    {t(`contact.${ticket.status.toLowerCase()}`)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
