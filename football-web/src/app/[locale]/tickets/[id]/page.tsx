"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl";

interface TicketMessage {
  id: string;
  senderId?: string;
  message: string;
  isFromAdmin: boolean;
  createdAt: string;
}

interface Ticket {
  id: string;
  userId: string;
  subject: string;
  status: string;
  priority: string;
  createdAt?: string;
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    Promise.all([api.tickets.get(id), api.tickets.getMessages(id)])
      .then(([t, m]) => { setTicket(t); setMessages(m); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, user, router]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    setMessage("");
    try {
      const msg = await api.tickets.sendMessage(id, newMessage.trim());
      setMessages(prev => [...prev, msg]);
      setNewMessage("");
    } catch {
      setMessage(t("contact.ticketError"));
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    try {
      await api.tickets.updateStatus(id, "Closed");
      setTicket(prev => prev ? { ...prev, status: "Closed" } : null);
    } catch {
      setMessage(t("contact.ticketError"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="bg-gray-800 px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-green-400 transition">
            Football Tactics
          </Link>
        </nav>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="bg-gray-800 px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-green-400 transition">
            Football Tactics
          </Link>
        </nav>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-gray-400">Ticket not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-green-400 transition">
            Football Tactics
          </Link>
          <h1 className="text-xl font-bold text-white truncate max-w-md">{ticket.subject}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/tickets" className="text-gray-300 hover:text-white transition text-sm">
            {t("contact.yourTickets")}
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Ticket Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sticky top-6">
              <h2 className="text-lg font-bold text-white mb-4">{t("contact.ticketInfo")}</h2>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-700">
                  <p className="text-gray-400 text-xs mb-1">{t("contact.status")}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === "Open" ? "bg-green-900/50 text-green-300 border border-green-700" :
                    ticket.status === "Closed" ? "bg-gray-700 text-gray-300 border border-gray-600" :
                    "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                  }`}>
                    {t(`contact.${ticket.status.toLowerCase()}`)}
                  </span>
                </div>
                <div className="pb-3 border-b border-gray-700">
                  <p className="text-gray-400 text-xs mb-1">{t("contact.subject")}</p>
                  <p className="text-white text-sm">{ticket.subject}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">{t("contact.createdAt")}</p>
                  <p className="text-white text-sm">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "-"}</p>
                </div>
              </div>

              {isAdmin && ticket.status !== "Closed" && (
                <button
                  onClick={handleClose}
                  className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition">
                  {t("contact.closeTicket")}
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Messages */}
          <div className="lg:col-span-2">
            {message && (
              <div className={`p-4 rounded-lg mb-6 ${message.includes("Error") ? "bg-red-900/50 text-red-300 border border-red-700" : "bg-green-900/50 text-green-300 border border-green-700"}`}>
                {message}
              </div>
            )}

            {/* Messages List */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4">{t("contact.messages")}</h2>
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">💬</span>
                  </div>
                  <p className="text-gray-400">{t("contact.noMessages")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`p-4 rounded-xl ${msg.isFromAdmin ? "bg-blue-900/20 border border-blue-700/50 ml-8" : "bg-gray-700/50 border border-gray-600/50 mr-8"}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${msg.isFromAdmin ? "bg-blue-600/30 text-blue-300" : "bg-green-600/30 text-green-300"}`}>
                          {msg.isFromAdmin ? t("contact.adminReply") : t("contact.userMessage")}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-white text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Form */}
            {ticket.status !== "Closed" && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">{t("contact.reply")}</h2>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t("contact.messagePlaceholder")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:border-green-500 transition min-h-[120px] resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50">
                  {sending ? t("contact.creating") : t("contact.sendMessage")}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
