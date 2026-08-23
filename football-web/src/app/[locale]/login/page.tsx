"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const t = useTranslations("auth");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">{t("loginTitle")}</h1>
        <p className="text-center text-gray-500 mb-6">{t("loginSubtitle")}</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("email")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
            {loading ? "..." : t("signIn")}
          </button>
        </form>
        <p className="text-center text-gray-500 mt-6 text-sm">
          {t("noAccount")} <Link href="/register" className="text-green-600 font-semibold">{t("signUp")}</Link>
        </p>
      </div>
    </div>
  );
}
