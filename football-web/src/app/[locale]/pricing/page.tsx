"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

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
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.subscription.plans().then(setPlans).catch(() => setPlans([])).finally(() => setLoading(false));
  }, []);

  const handleSelect = async (planId: string) => {
    if (!isAuthenticated) { router.push("/login"); return; }
    try {
      const result = await api.subscription.createPayment(planId);
      if (result.paymentUrl) window.location.href = result.paymentUrl;
    } catch {
      alert("Failed to initiate payment. Please try again.");
    }
  };

  const playerPlans = plans.filter((p) => p.name.includes("Player"));
  const coachPlans = plans.filter((p) => p.name.includes("Coach"));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="text-white hover:text-green-400">Home</button>
          <h1 className="text-xl font-bold">Pricing</h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-gray-400 text-lg">Unlock full tactical training features</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading plans...</div>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-6 text-center">Player Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {playerPlans.map((plan) => {
                const hasDiscount = plan.discountPrice < plan.price;
                const monthly = plan.durationDays <= 30 ? 1 : plan.durationDays <= 100 ? 3 : plan.durationDays <= 200 ? 6 : 12;
                return (
                  <div key={plan.id} className={`rounded-xl p-6 border ${monthly === 12 ? "border-green-500 bg-green-900/20" : "border-gray-700 bg-gray-800"}`}>
                    {monthly === 12 && <div className="text-green-400 text-xs font-bold mb-2">BEST VALUE</div>}
                    <div className="text-lg font-bold mb-2">{monthly === 1 ? "Monthly" : monthly === 3 ? "Quarterly" : monthly === 6 ? "6 Months" : "Annual"}</div>
                    <div className="mb-4">
                      {hasDiscount && <div className="text-gray-500 line-through text-sm">{formatPrice(plan.price)} {plan.currency}</div>}
                      <div className="text-3xl font-bold text-green-400">{formatPrice(hasDiscount ? plan.discountPrice : plan.price)} <span className="text-sm text-gray-400">{plan.currency}</span></div>
                    </div>
                    <button onClick={() => handleSelect(plan.id)} className={`w-full py-3 rounded-lg font-semibold transition ${monthly === 12 ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-500"}`}>
                      Select Plan
                    </button>
                  </div>
                );
              })}
            </div>

            <h3 className="text-2xl font-bold mb-6 text-center">Coach Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {coachPlans.map((plan) => {
                const hasDiscount = plan.discountPrice < plan.price;
                const monthly = plan.durationDays <= 30 ? 1 : plan.durationDays <= 100 ? 3 : plan.durationDays <= 200 ? 6 : 12;
                return (
                  <div key={plan.id} className={`rounded-xl p-6 border ${monthly === 12 ? "border-blue-500 bg-blue-900/20" : "border-gray-700 bg-gray-800"}`}>
                    {monthly === 12 && <div className="text-blue-400 text-xs font-bold mb-2">BEST VALUE</div>}
                    <div className="text-lg font-bold mb-2">{monthly === 1 ? "Monthly" : monthly === 3 ? "Quarterly" : monthly === 6 ? "6 Months" : "Annual"}</div>
                    <div className="mb-4">
                      {hasDiscount && <div className="text-gray-500 line-through text-sm">{formatPrice(plan.price)} {plan.currency}</div>}
                      <div className="text-3xl font-bold text-blue-400">{formatPrice(hasDiscount ? plan.discountPrice : plan.price)} <span className="text-sm text-gray-400">{plan.currency}</span></div>
                    </div>
                    <button onClick={() => handleSelect(plan.id)} className={`w-full py-3 rounded-lg font-semibold transition ${monthly === 12 ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-500"}`}>
                      Select Plan
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold mb-2">Free Plan</h3>
              <p className="text-gray-400 mb-4">Start with limited access to basic scenarios</p>
              <button onClick={() => router.push("/register")} className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-semibold">Get Started Free</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
