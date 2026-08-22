"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  language: string;
}

export default function FaqPage() {
  const t = useTranslations("cms");
  const nav = useTranslations("nav");
  const router = useRouter();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5144/api"}/faqs`)
      .then((r) => r.json())
      .then(setFaqs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/")} className="text-white hover:text-green-400">{nav("home")}</button>
        <h1 className="text-xl font-bold">{t("faqTitle")}</h1>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No FAQs yet.</div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-gray-800 rounded-xl border border-gray-700">
                <button onClick={() => setOpenId(openId === faq.id ? null : faq.id)} className="w-full px-6 py-4 text-left flex justify-between items-center">
                  <span className="font-semibold">{faq.question}</span>
                  <span className="text-gray-400 text-xl">{openId === faq.id ? "-" : "+"}</span>
                </button>
                {openId === faq.id && (
                  <div className="px-6 pb-4 text-gray-300 text-sm border-t border-gray-700 pt-4">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
