"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { usePathname } from "@/i18n/routing";
import { useAuth } from "@/lib/auth-context";
import LanguageSwitcher from "./language-switcher";

export default function Navbar() {
  const { user, logout, isAuthenticated, isCoach, isAdmin } = useAuth();
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white hover:text-green-400 transition">
          FootballTactics
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/scenarios" className="text-gray-300 hover:text-white transition text-sm">
            {t("scenarios")}
          </Link>
          {isAuthenticated && (
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition text-sm">
              {t("dashboard")}
            </Link>
          )}
          {isCoach && (
            <Link href="/teams" className="text-gray-300 hover:text-white transition text-sm">
              {t("teams")}
            </Link>
          )}
          <Link href="/articles" className="text-gray-300 hover:text-white transition text-sm">
            {t("articles")}
          </Link>
          <Link href="/faq" className="text-gray-300 hover:text-white transition text-sm">
            {t("faq")}
          </Link>
          <Link href="/pricing" className="text-gray-300 hover:text-white transition text-sm">
            {t("pricing")}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="text-gray-300 hover:text-white transition text-sm">
                {user?.fullName || user?.email}
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 transition text-sm font-semibold">
                  {t("admin")}
                </Link>
              )}
              {!isAdmin && (
                <Link href="/setup-admin" className="text-gray-500 hover:text-gray-300 transition text-xs">
                  {t("setupAdmin")}
                </Link>
              )}
              <button onClick={logout} className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 transition">
                {t("logout")}
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className="px-4 py-1.5 bg-white text-green-800 rounded font-semibold text-sm hover:bg-green-100 transition">
                {t("login")}
              </Link>
              <Link href="/register" className="px-4 py-1.5 border border-white text-white rounded font-semibold text-sm hover:bg-white/10 transition">
                {t("register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
