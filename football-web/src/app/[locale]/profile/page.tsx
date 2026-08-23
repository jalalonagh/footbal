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

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    api.subscription.active().then(setSubscription).catch(() => {}).finally(() => setLoading(false));
    api.auth.getMe().then((u) => {
      setFirstName(u.firstName || "");
      setLastName(u.lastName || "");
      setPhoneNumber((u as any).phoneNumber || "");
    }).catch(() => {});
  }, [isAuthenticated, router]);

  const handleSaveProfile = async () => {
    setSaveMsg("");
    try {
      await api.auth.updateProfile({ firstName, lastName, phoneNumber });
      setSaveMsg("Profile updated successfully");
      setEditing(false);
    } catch (e: any) {
      setSaveMsg(e.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    setPwMsg("");
    setPwError("");
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("Password must be at least 6 characters");
      return;
    }
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      setPwMsg("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setPwError(e.message || "Failed to change password");
    }
  };

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
        {/* Account Info */}
        <div className="bg-gray-800 rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Account Information</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-sm text-green-400 hover:text-green-300">Edit</button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">First Name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Last Name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Phone Number</label>
                <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveProfile} className="px-6 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition">Save</button>
                <button onClick={() => setEditing(false)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition">Cancel</button>
              </div>
              {saveMsg && <p className="text-green-400 text-sm mt-2">{saveMsg}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-700 pb-3">
                <span className="text-gray-400">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-3">
                <span className="text-gray-400">Name</span>
                <span className="font-medium">{firstName} {lastName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-3">
                <span className="text-gray-400">Phone</span>
                <span className="font-medium">{phoneNumber || "Not set"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-3">
                <span className="text-gray-400">Role</span>
                <span className="font-medium capitalize">{user?.role}</span>
              </div>
            </div>
          )}
        </div>

        {/* Subscription */}
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
                <span className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 mb-4">You are on the Free plan</p>
              <button onClick={() => router.push("/pricing")} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold">Upgrade Plan</button>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <button onClick={handleChangePassword} className="px-6 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition">Change Password</button>
            {pwMsg && <p className="text-green-400 text-sm mt-2">{pwMsg}</p>}
            {pwError && <p className="text-red-400 text-sm mt-2">{pwError}</p>}
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Settings</h2>
          <button onClick={() => { logout(); router.push("/"); }} className="w-full text-left text-red-400 hover:text-red-300 py-3 border-b border-gray-700">Sign Out</button>
        </div>
      </main>
    </div>
  );
}
