"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Academy } from "@/lib/types";

export default function AdminAcademyApproval() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [academies, setAcademies] = useState<Academy[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState<Academy | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => { if (!authLoading && !isSuperAdmin) router.replace("/login"); }, [authLoading, isSuperAdmin, router]);
  useEffect(() => { if (isSuperAdmin) loadAcademies(); }, [isSuperAdmin, page, statusFilter, search]);

  const loadAcademies = async () => {
    setLoading(true);
    try {
      const data = await api.academies.adminList({ status: statusFilter, search, page, pageSize });
      setAcademies(data.academies);
      setTotal(data.total);
    } catch { } finally { setLoading(false); }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.academies.approve(id);
      setAcademies(prev => prev.filter(a => a.id !== id));
      setTotal(prev => prev - 1);
      if (selected?.id === id) setSelected(null);
    } catch { } finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await api.academies.reject(id, rejectNote || undefined);
      setAcademies(prev => prev.filter(a => a.id !== id));
      setTotal(prev => prev - 1);
      setRejectNote("");
      if (selected?.id === id) setSelected(null);
    } catch { } finally { setActionLoading(null); }
  };

  const handleSearch = () => { setSearch(searchInput); setPage(1); };
  const totalPages = Math.ceil(total / pageSize);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Draft: "bg-gray-700 text-gray-400",
      Pending: "bg-yellow-900/50 text-yellow-300",
      Approved: "bg-green-900/50 text-green-300",
      Rejected: "bg-red-900/50 text-red-300",
    };
    return colors[status] || "bg-gray-700 text-gray-400";
  };

  if (authLoading || !isSuperAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Academy Approval</h1>
            <p className="text-gray-400 text-sm mt-1">Review and approve user-submitted academies</p>
          </div>
          <button onClick={() => router.push("/admin")} className="text-gray-400 hover:text-white">← Back to Admin</button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search academies..." className="flex-1 min-w-[200px] px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value="">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Draft">Draft</option>
          </select>
          <button onClick={handleSearch} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Search</button>
        </div>

        <div className="mb-4 text-gray-400 text-sm">Total: {total} | Page {page} of {totalPages || 1}</div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>
        ) : academies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No academies found</div>
        ) : (
          <div className="grid gap-4">
            {academies.map((a) => (
              <div key={a.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition">
                <div className="flex items-start gap-4">
                  {a.logoUrl ? (
                    <img src={a.logoUrl} alt={a.name} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">🏟️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">{a.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusBadge(a.status)}`}>{a.status}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-1 mb-1">{a.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {a.city && <span className="px-2 py-0.5 bg-gray-700 rounded">📍 {a.city}</span>}
                      {a.contactPhone && <span className="px-2 py-0.5 bg-gray-700 rounded">📞 {a.contactPhone}</span>}
                      {a.foundedYear && <span className="px-2 py-0.5 bg-gray-700 rounded">📅 {a.foundedYear}</span>}
                      <span className="px-2 py-0.5 bg-gray-700 rounded">{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setSelected(a)} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">View</button>
                    {a.status !== "Approved" && (
                      <>
                        <button onClick={() => handleApprove(a.id)} disabled={actionLoading === a.id}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50">
                          {actionLoading === a.id ? "..." : "✓ Approve"}
                        </button>
                        <button onClick={() => { setSelected(a); setRejectNote(""); }} className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">✕ Reject</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50">Previous</button>
            <span className="text-gray-400 px-4">{page} / {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50">Next</button>
          </div>
        )}

        {/* Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
            <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold">{selected.name}</h2>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusBadge(selected.status)}`}>{selected.status}</span>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="p-6 space-y-4">
                {selected.logoUrl && <img src={selected.logoUrl} alt={selected.name} className="w-full h-48 object-cover rounded-lg" />}
                {selected.description && <p className="text-gray-300">{selected.description}</p>}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selected.city && <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">City</span>{selected.city}</div>}
                  {selected.province && <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Province</span>{selected.province}</div>}
                  {selected.contactPhone && <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Phone</span>{selected.contactPhone}</div>}
                  {selected.contactEmail && <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Email</span>{selected.contactEmail}</div>}
                  {selected.foundedYear && <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Founded</span>{selected.foundedYear}</div>}
                  {selected.ageGroups && <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Age Groups</span>{selected.ageGroups}</div>}
                  {selected.monthlyFee && <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Monthly Fee</span>{selected.monthlyFee.toLocaleString()} Tomans</div>}
                  {selected.playingStyle && <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Style</span>{selected.playingStyle}</div>}
                </div>

                {selected.facilities && <div><h3 className="text-sm font-semibold text-gray-300 mb-1">Facilities</h3><p className="text-sm text-gray-400">{selected.facilities}</p></div>}
                {selected.address && <div><h3 className="text-sm font-semibold text-gray-300 mb-1">Address</h3><p className="text-sm text-gray-400">{selected.address}</p></div>}

                {/* Reject note */}
                {selected.status !== "Approved" && (
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Rejection Reason (optional)</label>
                    <input value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm" placeholder="Reason for rejection..." />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {selected.status !== "Approved" && (
                    <>
                      <button onClick={() => handleApprove(selected.id)} disabled={actionLoading === selected.id}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
                        {actionLoading === selected.id ? "Processing..." : "✓ Approve"}
                      </button>
                      <button onClick={() => handleReject(selected.id)} disabled={actionLoading === selected.id}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
                        {actionLoading === selected.id ? "Processing..." : "✕ Reject"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
