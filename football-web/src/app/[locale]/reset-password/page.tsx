"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Link } from "@/i18n/routing";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const e = searchParams.get("email") || "";
    const tok = searchParams.get("token") || "";
    setEmail(e);
    setToken(tok);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.resetPassword({ email, token, newPassword });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">{t("resetPassword")}</h1>
        <p className="text-center text-gray-400 mb-6">{t("newPassword")}</p>

        {error && <div className="bg-red-900/50 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {submitted ? (
          <div className="text-center">
            <div className="bg-green-900/50 text-green-400 p-4 rounded-lg mb-4">
              {t("resetComplete")}
            </div>
            <Link href="/login" className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 inline-block">
              {t("backToLogin")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t("token")}</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t("newPassword")}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
            >
              {loading ? t("resetting") : t("resetPassword")}
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 mt-6 text-sm">
          <Link href="/login" className="text-green-400 font-semibold hover:text-green-300">{t("backToLogin")}</Link>
        </p>
      </div>
    </div>
  );
}
