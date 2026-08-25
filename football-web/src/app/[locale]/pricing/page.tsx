"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Link } from "@/i18n/routing";

interface Plan {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  price: number;
  discountPrice: number;
  currency: string;
}

const formatPrice = (p: number) => p.toLocaleString("fa-IR");

export default function PricingPage() {
  const { isAuthenticated } = useAuth();
  const t = useTranslations("pricing");
  const tNav = useTranslations("nav");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.subscription.plans().then(setPlans).catch(() => setPlans([])).finally(() => setLoading(false));
  }, []);

  const handleSelect = async (planId: string) => {
    if (!isAuthenticated) { window.location.href = "/login"; return; }
    try {
      const result = await api.subscription.createPayment(planId);
      const url = result.redirectUrl || (result as any).RedirectUrl;
      if (url) {
        window.location.href = url;
      } else {
        window.location.href = "/payment/success";
      }
    } catch (e: any) {
      const msg = e?.message || t("paymentError");
      alert(msg);
    }
  };

  const playerPlans = plans.filter((p) => p.name.includes("Player"));
  const coachPlans = plans.filter((p) => p.name.includes("Coach"));

  const getDurationLabel = (days: number) => {
    if (days <= 30) return t("monthly");
    if (days <= 100) return t("quarterly");
    if (days <= 200) return t("semiAnnual");
    return t("annual");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white hover:text-green-400">{tNav("home")}</Link>
          <h1 className="text-xl font-bold">{tNav("pricing")}</h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{t("title")}</h2>
          <p className="text-gray-400 text-lg">{t("subtitle")}</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">{t("loading")}</div>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-6 text-center">{t("playerPlans")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {playerPlans.map((plan) => {
                const hasDiscount = plan.discountPrice < plan.price;
                const monthly = plan.durationDays <= 30 ? 1 : plan.durationDays <= 100 ? 3 : plan.durationDays <= 200 ? 6 : 12;
                return (
                  <div key={plan.id} className={`rounded-xl p-6 border ${monthly === 12 ? "border-green-500 bg-green-900/20" : "border-gray-700 bg-gray-800"}`}>
                    {monthly === 12 && <div className="text-green-400 text-xs font-bold mb-2">{t("bestValue")}</div>}
                    <div className="text-lg font-bold mb-2">{getDurationLabel(plan.durationDays)}</div>
                    <div className="mb-4">
                      {hasDiscount && <div className="text-gray-500 line-through text-sm">{formatPrice(plan.price)} {plan.currency}</div>}
                      <div className="text-3xl font-bold text-green-400">{formatPrice(hasDiscount ? plan.discountPrice : plan.price)} <span className="text-sm text-gray-400">{plan.currency}</span></div>
                    </div>
                    <button onClick={() => handleSelect(plan.id)} className={`w-full py-3 rounded-lg font-semibold transition ${monthly === 12 ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-500"}`}>
                      {t("selectPlan")}
                    </button>
                  </div>
                );
              })}
            </div>

            <h3 className="text-2xl font-bold mb-6 text-center">{t("coachPlans")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {coachPlans.map((plan) => {
                const hasDiscount = plan.discountPrice < plan.price;
                const monthly = plan.durationDays <= 30 ? 1 : plan.durationDays <= 100 ? 3 : plan.durationDays <= 200 ? 6 : 12;
                return (
                  <div key={plan.id} className={`rounded-xl p-6 border ${monthly === 12 ? "border-blue-500 bg-blue-900/20" : "border-gray-700 bg-gray-800"}`}>
                    {monthly === 12 && <div className="text-blue-400 text-xs font-bold mb-2">{t("bestValue")}</div>}
                    <div className="text-lg font-bold mb-2">{getDurationLabel(plan.durationDays)}</div>
                    <div className="mb-4">
                      {hasDiscount && <div className="text-gray-500 line-through text-sm">{formatPrice(plan.price)} {plan.currency}</div>}
                      <div className="text-3xl font-bold text-blue-400">{formatPrice(hasDiscount ? plan.discountPrice : plan.price)} <span className="text-sm text-gray-400">{plan.currency}</span></div>
                    </div>
                    <button onClick={() => handleSelect(plan.id)} className={`w-full py-3 rounded-lg font-semibold transition ${monthly === 12 ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-500"}`}>
                      {t("selectPlan")}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold mb-2">{t("freePlan")}</h3>
              <p className="text-gray-400 mb-4">{t("freeDesc")}</p>
              <Link href="/register" className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-semibold inline-block">{t("getStarted")}</Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
