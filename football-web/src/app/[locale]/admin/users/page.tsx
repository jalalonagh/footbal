"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

const ROLES = ["Player", "Coach", "Admin", "SuperAdmin"];

export default function AdminUsers() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace("/login");
  }, [authLoading, isAdmin, router]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.auth.getUsers(1, 50);
      setUsers(res.items);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.auth.updateRole(userId, newRole);
      setMessage("Role updated successfully");
      setError("");
      await loadUsers();
    } catch {
      setError("Failed to update role");
      setMessage("");
    }
  };

  if (authLoading || !isAdmin) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>
      {message && <p className="text-green-400 mb-4">{message}</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Role</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-gray-400 text-sm font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-gray-400 text-center">No users found</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-white text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-white text-sm">{user.firstName} {user.lastName}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-gray-700 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${user.isActive ? "text-green-400" : "text-red-400"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
