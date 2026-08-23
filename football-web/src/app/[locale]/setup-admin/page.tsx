"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Link } from "@/i18n/routing";

export default function SetupAdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const t = useTranslations("auth");
  const tNav = useTranslations("nav");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.setupAdmin(email, password);
      setSuccess(true);
      setTimeout(() => router.push("/admin"), 2000);
    } catch (err: any) {
      setError(err.message || "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-yellow-800 to-yellow-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">{tNav("setupAdmin")}</h1>
        <p className="text-center text-gray-500 mb-6">ایمیل و رمز خود را وارد کنید</p>

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm text-center">
            شما اکنون SuperAdmin هستید! در حال انتقال...
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("email")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500" required />
          </div>
          <button type="submit" disabled={loading || success}
            className="w-full py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 disabled:opacity-50">
            {loading ? "..." : tNav("setupAdmin")}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          <Link href="/dashboard" className="text-yellow-600 font-semibold">بازگشت به داشبورد</Link>
        </p>
      </div>
    </div>
  );
}
