"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl";

interface Device {
  id: string;
  deviceInfo: string;
  ipAddress?: string;
  lastActiveAt: string;
  createdAt: string;
}

function parseDeviceInfo(ua: string): string {
  if (!ua || ua === "Unknown Device") return "Unknown Device";

  let os = "Unknown OS";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  let browser = "Unknown Browser";
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  return `${browser} on ${os}`;
}

export default function DevicesPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    api.auth.getDevices()
      .then(setDevices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleRemoveDevice = async (deviceId: string) => {
    if (!confirm(t("devices.confirmRemove"))) return;
    try {
      await api.auth.removeDevice(deviceId);
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      setMessage(t("devices.removed"));
    } catch {
      setMessage(t("devices.removeError"));
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm(t("devices.confirmLogoutAll"))) return;
    try {
      await api.auth.logoutAllDevices();
      setDevices([]);
      setMessage(t("devices.loggedOutAll"));
    } catch {
      setMessage(t("devices.logoutError"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="bg-gray-800 px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-green-400 transition">Football Tactics</Link>
        </nav>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-green-400 transition">Football Tactics</Link>
          <h1 className="text-xl font-bold text-white">{t("devices.title")}</h1>
        </div>
        <Link href="/profile" className="text-gray-300 hover:text-white transition text-sm">
          {t("nav.profile")}
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {message && (
          <div className="p-4 rounded-lg mb-6 bg-green-900/50 text-green-300 border border-green-700">
            {message}
          </div>
        )}

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">{t("devices.activeDevices")}</h2>
              <p className="text-gray-400 text-sm">{t("devices.maxDevices", { count: 2 })}</p>
            </div>
            {devices.length > 1 && (
              <button
                onClick={handleLogoutAll}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                {t("devices.logoutAll")}
              </button>
            )}
          </div>

          {devices.length === 0 ? (
            <p className="text-gray-400 text-center py-8">{t("devices.noDevices")}</p>
          ) : (
            <div className="space-y-3">
              {devices.map(device => (
                <div key={device.id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-white font-medium">{parseDeviceInfo(device.deviceInfo)}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {t("devices.lastActive")}: {new Date(device.lastActiveAt).toLocaleString()}
                    </p>
                    {device.ipAddress && (
                      <p className="text-gray-500 text-xs">IP: {device.ipAddress}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveDevice(device.id)}
                    className="text-red-400 hover:text-red-300 text-sm font-medium transition ml-4">
                    {t("devices.remove")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-6">
          <h3 className="text-yellow-300 font-bold mb-2">{t("devices.limitTitle")}</h3>
          <p className="text-yellow-200/80 text-sm">{t("devices.limitDesc")}</p>
        </div>
      </main>
    </div>
  );
}
