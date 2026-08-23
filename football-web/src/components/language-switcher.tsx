"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";

const languages = [
  { code: "en", label: "EN" },
  { code: "fa", label: "FA" },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLocale(lang.code)}
          className={`px-2 py-1 rounded text-xs font-medium transition ${
            locale === lang.code
              ? "bg-green-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
