"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface AdminScenario {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  formation: string;
  gamePhase: string;
  gameMinute: number;
  homeScore: number;
  awayScore: number;
  status: string;
  trainingMode: string;
  imageUrl: string | null;
  createdByCoachId: string | null;
  createdAt: string;
  updatedAt: string | null;
  playerCount: number;
}

export default function AdminScenarioApproval() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [scenarios, setScenarios] = useState<AdminScenario[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState("Draft");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<AdminScenario | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) router.replace("/login");
  }, [authLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (isSuperAdmin) loadScenarios();
  }, [isSuperAdmin, page, statusFilter, search]);

  const loadScenarios = async () => {
    setLoading(true);
    try {
      const data = await api.scenarioImage.adminList({ status: statusFilter, search, page, pageSize });
      setScenarios(data.scenarios);
      setTotal(data.total);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.scenarioImage.approve(id);
      setScenarios((prev) => prev.filter((s) => s.id !== id));
      setTotal((prev) => prev - 1);
      if (selectedScenario?.id === id) setSelectedScenario(null);
    } catch {
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await api.scenarioImage.reject(id);
      setScenarios((prev) => prev.filter((s) => s.id !== id));
      setTotal((prev) => prev - 1);
      if (selectedScenario?.id === id) setSelectedScenario(null);
    } catch {
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Draft: "bg-yellow-900/50 text-yellow-300",
      Review: "bg-blue-900/50 text-blue-300",
      Published: "bg-green-900/50 text-green-300",
      Archived: "bg-gray-700 text-gray-400",
    };
    return colors[status] || "bg-gray-700 text-gray-400";
  };

  if (authLoading || !isSuperAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Scenario Approval</h1>
            <p className="text-gray-400 text-sm mt-1">Review and approve user-created scenarios from images</p>
          </div>
          <button onClick={() => router.push("/admin")} className="text-gray-400 hover:text-white">
            ← Back to Admin
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[200px]">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search scenarios..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value="">All Statuses</option>
            <option value="Draft">Draft (Pending Review)</option>
            <option value="Review">In Review</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived/Rejected</option>
          </select>
          <button onClick={handleSearch} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Search
          </button>
        </div>

        <div className="mb-4 text-gray-400 text-sm">
          Total: {total} scenarios | Page {page} of {totalPages || 1}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : scenarios.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No scenarios found</div>
        ) : (
          <div className="grid gap-4">
            {scenarios.map((s) => (
              <div key={s.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition">
                <div className="flex items-start gap-4">
                  {s.imageUrl && (
                    <img src={s.imageUrl} alt={s.name} className="w-32 h-20 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">{s.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusBadge(s.status)}`}>{s.status}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">{s.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-700 rounded">{s.category}</span>
                      <span className="px-2 py-0.5 bg-gray-700 rounded">{s.difficulty}</span>
                      {s.formation && <span className="px-2 py-0.5 bg-gray-700 rounded">{s.formation}</span>}
                      <span className="px-2 py-0.5 bg-gray-700 rounded">{s.gamePhase}</span>
                      <span className="px-2 py-0.5 bg-gray-700 rounded">{s.gameMinute}'</span>
                      <span className="px-2 py-0.5 bg-gray-700 rounded">{s.playerCount} players</span>
                      <span className="px-2 py-0.5 bg-gray-700 rounded">{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSelectedScenario(s)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                      View
                    </button>
                    {s.status !== "Published" && (
                      <>
                        <button
                          onClick={() => handleApprove(s.id)}
                          disabled={actionLoading === s.id}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50">
                          {actionLoading === s.id ? "..." : "✓ Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(s.id)}
                          disabled={actionLoading === s.id}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50">
                          {actionLoading === s.id ? "..." : "✕ Reject"}
                        </button>
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
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50">
              Previous
            </button>
            <span className="text-gray-400 px-4">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50">
              Next
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {selectedScenario && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedScenario(null)}>
            <div className="bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold">{selectedScenario.name}</h2>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusBadge(selectedScenario.status)}`}>{selectedScenario.status}</span>
                </div>
                <button onClick={() => setSelectedScenario(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="p-6 space-y-4">
                {selectedScenario.imageUrl && (
                  <img src={selectedScenario.imageUrl} alt={selectedScenario.name} className="w-full rounded-lg" />
                )}
                <p className="text-gray-300">{selectedScenario.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Category</span>{selectedScenario.category}</div>
                  <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Difficulty</span>{selectedScenario.difficulty}</div>
                  <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Formation</span>{selectedScenario.formation || "-"}</div>
                  <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Phase</span>{selectedScenario.gamePhase}</div>
                  <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Minute</span>{selectedScenario.gameMinute}'</div>
                  <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Score</span>{selectedScenario.homeScore} - {selectedScenario.awayScore}</div>
                  <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Players</span>{selectedScenario.playerCount}</div>
                  <div className="bg-gray-750 p-3 rounded"><span className="text-gray-400 block text-xs">Created</span>{new Date(selectedScenario.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-3 pt-4">
                  {selectedScenario.status !== "Published" && (
                    <>
                      <button
                        onClick={() => handleApprove(selectedScenario.id)}
                        disabled={actionLoading === selectedScenario.id}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
                        {actionLoading === selectedScenario.id ? "Processing..." : "✓ Approve & Publish"}
                      </button>
                      <button
                        onClick={() => handleReject(selectedScenario.id)}
                        disabled={actionLoading === selectedScenario.id}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
                        {actionLoading === selectedScenario.id ? "Processing..." : "✕ Reject"}
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
