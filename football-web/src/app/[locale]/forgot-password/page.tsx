"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Forgot Password</h1>
        <p className="text-center text-gray-400 mb-6">Enter your email to reset your password</p>

        {error && <div className="bg-red-900/50 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {submitted ? (
          <div className="text-center">
            <div className="bg-green-900/50 text-green-400 p-4 rounded-lg mb-4">
              If an account exists with that email, a reset link has been sent.
            </div>
            <button onClick={() => router.push("/login")} className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 mt-6 text-sm">
          Remember your password? <button onClick={() => router.push("/login")} className="text-green-400 font-semibold hover:text-green-300">Sign In</button>
        </p>
      </div>
    </div>
  );
}
