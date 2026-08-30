"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("payment");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState(t("processing"));

  useEffect(() => {
    const authority = searchParams.get("Authority");
    const zpStatus = searchParams.get("Status");
    const paymentId = searchParams.get("id");

    if (!authority || !zpStatus) {
      setStatus("error");
      setMessage(t("invalidResponse"));
      return;
    }

    if (zpStatus !== "OK" && zpStatus !== "100" && zpStatus !== "101") {
      setStatus("error");
      setMessage(t("cancelled"));
      return;
    }

    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.footiq.ir/api";
        const response = await fetch(
          `${apiUrl}/subscription/callback?Authority=${authority}&Status=${zpStatus}${paymentId ? `&id=${paymentId}` : ""}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (response.ok || response.redirected) {
          setStatus("success");
          setMessage(t("verified"));
          setTimeout(() => router.push("/payment/success"), 1500);
        } else {
          const text = await response.text();
          setStatus("error");
          setMessage(text || t("verificationFailed"));
        }
      } catch (err) {
        setStatus("error");
        setMessage(t("couldNotVerify"));
      }
    };

    verifyPayment();
  }, [searchParams, router, t]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-10 text-center max-w-md mx-4 border border-gray-700">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-xl font-bold text-white mb-2">{t("processingPayment")}</h1>
            <p className="text-gray-400">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">{t("successTitle")}</h1>
            <p className="text-gray-400">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">{t("paymentError")}</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <button onClick={() => router.push("/pricing")} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
              {t("tryAgain")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
