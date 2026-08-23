"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const t = useTranslations("payment");

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-10 text-center max-w-md mx-4 border border-green-500">
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">{t("successTitle")}</h1>
        <p className="text-gray-400 mb-8">{t("successMessage")}</p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
            {t("goToDashboard")}
          </Link>
          <Link href="/scenarios" className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 transition">
            {t("startTraining")}
          </Link>
        </div>
      </div>
    </div>
  );
}
