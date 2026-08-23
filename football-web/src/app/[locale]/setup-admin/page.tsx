"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function SetupAdminPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSetup = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await api.auth.setupAdmin(email, password);
      localStorage.setItem("token", response.token);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response));
      setSuccess(true);
      setTimeout(() => router.push("/admin"), 1500);
    } catch (e: any) {
      setError(e.message || "Failed to setup admin");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-10 max-w-md w-full mx-4 border border-yellow-500">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Setup Admin</h1>
        <p className="text-gray-400 text-sm text-center mb-8">
          Promote your account to SuperAdmin. Only works if no admin exists yet.
        </p>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-400 font-semibold">Admin setup successful!</p>
            <p className="text-gray-400 text-sm mt-2">Redirecting to admin panel...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="••••••"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleSetup}
              disabled={loading || !email || !password}
              className="w-full py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition disabled:opacity-50"
            >
              {loading ? "Setting up..." : "Make Me Admin"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
