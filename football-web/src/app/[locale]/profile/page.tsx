"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    api.subscription.active().then(setSubscription).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-white hover:text-green-400">Dashboard</button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
        <button onClick={logout} className="text-sm text-red-400 hover:text-red-300">Logout</button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Account Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-700 pb-3">
              <span className="text-gray-400">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-3">
              <span className="text-gray-400">Name</span>
              <span className="font-medium">{user?.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-3">
              <span className="text-gray-400">Role</span>
              <span className="font-medium capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Subscription</h2>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : subscription ? (
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-700 pb-3">
                <span className="text-gray-400">Plan</span>
                <span className="font-medium text-green-400">{subscription.planName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-3">
                <span className="text-gray-400">Expires</span>
                <span className="font-medium">{new Date(subscription.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 mb-4">You are on the Free plan</p>
              <button onClick={() => router.push("/pricing")} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold">Upgrade Plan</button>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Settings</h2>
          <div className="space-y-4">
            <button onClick={() => { logout(); router.push("/"); }} className="w-full text-left text-red-400 hover:text-red-300 py-3 border-b border-gray-700">Sign Out</button>
          </div>
        </div>
      </main>
    </div>
  );
}
