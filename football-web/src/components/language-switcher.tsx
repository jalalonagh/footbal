"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const languages = [
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "fa", label: "FA", flag: "🇮🇷" },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  // Extract current locale from pathname (e.g., /en/scenarios → en)
  const segments = pathname.split("/");
  const currentLocale = segments[1] || "en";

  const switchLocale = (locale: string) => {
    // Replace the locale segment in the pathname
    const pathWithoutLocale = segments.slice(2).join("/") || "/";
    router.push(`/${locale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLocale(lang.code)}
          className={`px-2 py-1 rounded text-xs font-medium transition ${
            currentLocale === lang.code
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
