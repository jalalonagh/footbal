"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/plans", label: "Plans & Pricing", icon: "💰" },
  { href: "/admin/scenarios", label: "Scenarios", icon: "⚽" },
  { href: "/admin/discounts", label: "Discounts", icon: "🏷️" },
  { href: "/admin/coupons", label: "Coupons", icon: "🎫" },
  { href: "/admin/articles", label: "Articles", icon: "📝" },
  { href: "/admin/faqs", label: "FAQs", icon: "❓" },
  { href: "/admin/payment", label: "Payment Settings", icon: "💳", superAdminOnly: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const { isSuperAdmin } = useAuth();

  const visibleLinks = links.filter((l) => !l.superAdminOnly || isSuperAdmin);

  return (
    <aside className="w-64 bg-gray-800 min-h-screen p-4">
      <div className="text-lg font-bold text-white mb-6 px-3">Admin Panel</div>
      <nav className="space-y-1">
        {visibleLinks.map((link) => {
          const isActive = pathname === `/${locale}${link.href}` || (link.href !== "/admin" && pathname.startsWith(`/${locale}${link.href}`));
          return (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive ? "bg-green-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 px-3">
        <Link href={`/${locale}/dashboard`} className="text-gray-500 hover:text-gray-300 text-sm">
          ← Back to Dashboard
        </Link>
      </div>
    </aside>
  );
}
