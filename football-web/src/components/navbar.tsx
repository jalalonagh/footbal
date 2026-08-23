"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import LanguageSwitcher from "./language-switcher";

export default function Navbar() {
  const { user, logout, isAuthenticated, isCoach, isAdmin } = useAuth();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href={`/${locale}`} className="text-xl font-bold text-white hover:text-green-400 transition">
          FootballTactics
        </Link>

        <div className="flex items-center gap-6">
          <Link href={`/${locale}/scenarios`} className="text-gray-300 hover:text-white transition text-sm">
            Scenarios
          </Link>
          {isAuthenticated && (
            <>
              <Link href={`/${locale}/dashboard`} className="text-gray-300 hover:text-white transition text-sm">
                Dashboard
              </Link>
              <Link href={`/${locale}/training`} className="text-gray-300 hover:text-white transition text-sm">
                Training
              </Link>
            </>
          )}
          {isCoach && (
            <Link href={`/${locale}/teams`} className="text-gray-300 hover:text-white transition text-sm">
              Teams
            </Link>
          )}
          <Link href={`/${locale}/articles`} className="text-gray-300 hover:text-white transition text-sm">
            Articles
          </Link>
          <Link href={`/${locale}/faq`} className="text-gray-300 hover:text-white transition text-sm">
            FAQ
          </Link>
          <Link href={`/${locale}/pricing`} className="text-gray-300 hover:text-white transition text-sm">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <Link href={`/${locale}/profile`} className="text-gray-300 hover:text-white transition text-sm">
                {user?.fullName || user?.email}
              </Link>
          {isAdmin && (
            <Link href={`/${locale}/admin`} className="text-yellow-400 hover:text-yellow-300 transition text-sm font-semibold">
              Admin Panel
            </Link>
          )}
          {isAuthenticated && !isAdmin && (
            <Link href={`/${locale}/setup-admin`} className="text-gray-500 hover:text-gray-300 transition text-xs">
              Setup Admin
            </Link>
          )}
              <button onClick={logout} className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 transition">
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href={`/${locale}/login`} className="px-4 py-1.5 bg-white text-green-800 rounded font-semibold text-sm hover:bg-green-100 transition">
                Login
              </Link>
              <Link href={`/${locale}/register`} className="px-4 py-1.5 border border-white text-white rounded font-semibold text-sm hover:bg-white/10 transition">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
