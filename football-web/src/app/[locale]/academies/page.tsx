"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Academy } from "@/lib/types";

const IRANIAN_PROVINCES = [
  "Tehran", "Isfahan", "Fars", "Khorasan Razavi", "Khuzestan", "East Azerbaijan",
  "West Azerbaijan", "Mazandaran", "Kerman", "Lorestan", "Kermanshah", "Gilan",
  "Sistan and Baluchestan", "Hormozgan", "Kurdistan", "Hamadan", "Zanjan",
  " Ardabil", "Bushehr", "Ilam", "Chaharmahal and Bakhtiari", "South Khorasan",
  "North Khorasan", "Kohgiluyeh and Boyer-Ahmad", "Qazvin", "Qom", "Golestan", "Yazd"
];

export default function AcademiesPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [academies, setAcademies] = useState<Academy[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");

  useEffect(() => { loadAcademies(); }, [page, search, city, province]);

  const loadAcademies = async () => {
    setLoading(true);
    try {
      const data = await api.academies.list({ page, pageSize, search, city, province });
      setAcademies(data.academies);
      setTotal(data.total);
    } catch { } finally { setLoading(false); }
  };

  const handleSearch = () => { setSearch(searchInput); setPage(1); };
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="text-white hover:text-green-400">🏠 Home</button>
          <h1 className="text-xl font-bold text-green-400">⚽ Football Academies</h1>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button onClick={() => router.push("/academies/add")} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">
              + Add Academy
            </button>
          )}
          {isAuthenticated && <button onClick={() => router.push("/dashboard")} className="text-sm bg-gray-600 px-4 py-2 rounded hover:bg-gray-500">Dashboard</button>}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-4 mb-8 border border-gray-700">
          <div className="flex flex-wrap gap-3">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search academies..."
              className="flex-1 min-w-[200px] px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
            />
            <select value={province} onChange={(e) => { setProvince(e.target.value); setCity(""); setPage(1); }}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
              <option value="">All Provinces</option>
              {IRANIAN_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button onClick={handleSearch} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              🔍 Search
            </button>
          </div>
        </div>

        <div className="mb-4 text-gray-400 text-sm">{total} academies found</div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>
        ) : academies.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏟️</div>
            <p className="text-gray-400 text-lg">No academies found</p>
            <p className="text-gray-500 text-sm mt-2">Try different search criteria or add your academy!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academies.map((a) => (
              <div key={a.id} onClick={() => router.push(`/academies/${a.id}`)}
                className="bg-gray-800 rounded-xl border border-gray-700 hover:border-green-500 transition cursor-pointer overflow-hidden group">
                {a.logoUrl ? (
                  <img src={a.logoUrl} alt={a.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-green-900/50 to-gray-800 flex items-center justify-center text-6xl">🏟️</div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-green-400 transition">{a.name}</h3>
                  {a.city && <p className="text-green-400 text-sm mb-2">📍 {a.city}{a.province ? `, ${a.province}` : ""}</p>}
                  {a.description && <p className="text-gray-400 text-sm line-clamp-2 mb-3">{a.description}</p>}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {a.foundedYear && <span className="px-2 py-1 bg-gray-700 rounded">Est. {a.foundedYear}</span>}
                    {a.ageGroups && <span className="px-2 py-1 bg-gray-700 rounded">{a.ageGroups}</span>}
                    {a.monthlyFee && a.monthlyFee > 0 && <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded">{a.monthlyFee.toLocaleString()} Tomans/mo</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50">← Previous</button>
            <span className="text-gray-400 px-4">{page} / {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50">Next →</button>
          </div>
        )}
      </main>
    </div>
  );
}
