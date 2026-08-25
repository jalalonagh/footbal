"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function PaymentSettingsPage() {
  const t = useTranslations("admin");
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const [isSandbox, setIsSandbox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) window.location.href = "/login";
  }, [authLoading, isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      api.paymentSettings.get()
        .then((r) => setIsSandbox(r.isSandbox))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isSuperAdmin]);

  const handleToggle = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await api.paymentSettings.update(!isSandbox);
      setIsSandbox(res.isSandbox);
      setMessage(res.message);
    } catch {
      setMessage("Error updating settings");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isSuperAdmin) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t("paymentSettings")}</h1>

      {loading ? (
        <p className="text-gray-400">{t("loading")}</p>
      ) : (
        <div className="max-w-2xl">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">ZarinPal Sandbox</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {isSandbox
                    ? "Sandbox mode is active. Payments use ZarinPal test environment."
                    : "Production mode is active. Real payments will be processed."}
                </p>
              </div>
              <button
                onClick={handleToggle}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  isSandbox ? "bg-green-500" : "bg-gray-600"
                } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isSandbox ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-gray-700/50">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isSandbox ? "bg-yellow-400" : "bg-green-400"}`} />
                <span className="text-white font-medium">
                  {isSandbox ? "Sandbox" : "Production"}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {isSandbox
                  ? "In sandbox mode, payments are simulated. Use ZarinPal test card numbers for testing."
                  : "In production mode, real payments are processed through ZarinPal."}
              </p>
            </div>

            {message && (
              <div className="mt-4 p-3 rounded-lg bg-green-500/20 text-green-400 text-sm">
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
