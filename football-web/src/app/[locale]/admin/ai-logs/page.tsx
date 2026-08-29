"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface AiLogEntry {
  id: string;
  endpoint: string;
  requestBody: string;
  responseBody: string;
  statusCode: number;
  durationMs: number;
  errorMessage?: string;
  model?: string;
  createdAt: string;
}

export default function AdminAiLogs() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<AiLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [endpointFilter, setEndpointFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<AiLogEntry | null>(null);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) router.replace("/login");
  }, [authLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (isSuperAdmin) loadLogs();
  }, [isSuperAdmin, page, search, endpointFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.aiLogs.list({
        page,
        pageSize,
        search: search || undefined,
        endpoint: endpointFilter || undefined,
      });
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return "text-green-400";
    if (code >= 400 && code < 500) return "text-yellow-400";
    if (code >= 500) return "text-red-400";
    return "text-gray-400";
  };

  const formatJson = (json: string) => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  const truncate = (str: string, len: number) => str.length > len ? str.substring(0, len) + "..." : str;

  if (authLoading || !isSuperAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">AI Logs</h1>
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
              placeholder="Search in requests/responses..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={endpointFilter}
            onChange={(e) => { setEndpointFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value="">All Endpoints</option>
            <option value="chat">Chat</option>
            <option value="tactical">Tactical Suggestion</option>
            <option value="performance">Performance Eval</option>
            <option value="article">Article Generation</option>
          </select>
          <button onClick={handleSearch} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Search
          </button>
        </div>

        <div className="mb-4 text-gray-400 text-sm">
          Total: {total} logs | Page {page} of {totalPages || 1}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No logs found</div>
        ) : (
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-750 border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Endpoint</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Model</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Request</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-750 transition">
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs font-mono">
                        {log.endpoint}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${getStatusColor(log.statusCode)}`}>
                      {log.statusCode || "ERR"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {log.durationMs}ms
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {log.model || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {truncate(log.requestBody, 80)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <span className="text-gray-400 px-4">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        )}

        {selectedLog && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
            <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-sm font-mono">{selectedLog.endpoint}</span>
                  <span className={`text-sm font-semibold ${getStatusColor(selectedLog.statusCode)}`}>{selectedLog.statusCode}</span>
                  <span className="text-sm text-gray-400">{selectedLog.durationMs}ms</span>
                  <span className="text-sm text-gray-500">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Request</h3>
                  <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap break-words">
                    {formatJson(selectedLog.requestBody)}
                  </pre>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Response</h3>
                  <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap break-words">
                    {formatJson(selectedLog.responseBody)}
                  </pre>
                </div>
                {selectedLog.errorMessage && (
                  <div>
                    <h3 className="text-sm font-semibold text-red-400 mb-2">Error</h3>
                    <pre className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-sm text-red-300 overflow-x-auto whitespace-pre-wrap break-words">
                      {selectedLog.errorMessage}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
