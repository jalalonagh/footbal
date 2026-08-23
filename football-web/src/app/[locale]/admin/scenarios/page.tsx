"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Scenario, ScenarioPlayer } from "@/lib/types";
import { Link } from "@/i18n/routing";

export default function AdminScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Scenario | null>(null);
  const [players, setPlayers] = useState<ScenarioPlayer[]>([]);
  const [message, setMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "", category: "Attack", difficulty: "Medium", formation: "4-4-2", gamePhase: "Build-up" });

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const data = await api.scenarios.list({ pageSize: 100 });
      setScenarios(data.items);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchScenarios(); }, []);

  const selectScenario = async (s: Scenario) => {
    setSelected(s);
    setEditMode(false);
    setEditForm({ name: s.name, description: s.description || "", category: s.category, difficulty: s.difficulty, formation: s.formation || "4-4-2", gamePhase: s.gamePhase || "Build-up" });
    try {
      const p = await api.scenarios.getPlayers(s.id);
      setPlayers(p);
    } catch { setPlayers([]); }
  };

  const handleCreate = async () => {
    setMessage("");
    try {
      const newScenario = await api.scenarios.create(editForm);
      setMessage(`Created "${editForm.name}"`);
      setShowCreateModal(false);
      fetchScenarios();
      selectScenario(newScenario);
    } catch (e: any) {
      setMessage(e.message || "Failed to create scenario");
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setMessage("");
    try {
      await api.scenarios.update(selected.id, editForm);
      setMessage(`Updated "${editForm.name}"`);
      setEditMode(false);
      fetchScenarios();
      setSelected({ ...selected, ...editForm });
    } catch (e: any) {
      setMessage(e.message || "Failed to update scenario");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scenario?")) return;
    setMessage("");
    try {
      await api.scenarios.delete(id);
      setMessage("Scenario deleted");
      setSelected(null);
      fetchScenarios();
    } catch (e: any) {
      setMessage(e.message || "Failed to delete");
    }
  };

  const updatePlayerCount = async (scenarioId: string, count: number) => {
    setMessage("");
    try {
      if (players.length < count) {
        const toAdd = count - players.length;
        for (let i = 0; i < toAdd; i++) {
          await api.scenarios.addPlayer(scenarioId, {
            number: players.length + i + 1,
            position: "CM",
            startX: 50,
            startY: 50,
            teamId: 1,
            speed: 5,
          });
        }
        setMessage(`Added ${toAdd} players`);
      } else if (players.length > count) {
        const toRemove = players.slice(count);
        for (const p of toRemove) {
          await api.scenarios.deletePlayer(p.id);
        }
        setMessage(`Removed ${toRemove.length} players`);
      }
      const updated = await api.scenarios.getPlayers(scenarioId);
      setPlayers(updated);
    } catch (e: any) {
      setMessage(e.message || "Failed to update players");
    }
  };

  const togglePublish = async (s: Scenario) => {
    setMessage("");
    try {
      if (s.status === "Published") {
        await api.scenarios.archive(s.id);
        setMessage(`Archived "${s.name}"`);
      } else {
        await api.scenarios.publish(s.id);
        setMessage(`Published "${s.name}"`);
      }
      fetchScenarios();
      if (selected?.id === s.id) selectScenario({ ...s, status: s.status === "Published" ? "Archived" : "Published" });
    } catch (e: any) {
      setMessage(e.message || "Failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Scenario Management</h1>
        <button onClick={() => { setEditForm({ name: "", description: "", category: "Attack", difficulty: "Medium", formation: "4-4-2", gamePhase: "Build-up" }); setShowCreateModal(true); }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm">
          + New Scenario
        </button>
      </div>

      {message && <div className="bg-blue-900/50 border border-blue-600 text-blue-300 px-4 py-2 rounded-lg mb-4">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700 text-gray-400 text-sm font-medium">
              Scenarios ({scenarios.length})
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-gray-500">Loading...</div>
              ) : scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectScenario(s)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-700/50 hover:bg-gray-750 transition ${
                    selected?.id === s.id ? "bg-gray-700 border-l-2 border-l-green-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium">{s.name}</div>
                      <div className="text-gray-500 text-xs">{s.category} · {s.difficulty}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      s.status === "Published" ? "bg-green-600/20 text-green-400" :
                      s.status === "Draft" ? "bg-yellow-600/20 text-yellow-400" :
                      "bg-gray-600/20 text-gray-400"
                    }`}>
                      {s.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scenario Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                {editMode ? (
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="text-xl font-bold text-white bg-gray-700 rounded px-3 py-1 w-full mr-4" />
                ) : (
                  <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                )}
                <div className="flex gap-2">
                  {editMode ? (
                    <>
                      <button onClick={handleUpdate} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Save</button>
                      <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 text-sm">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Edit</button>
                      <Link href={`/training/${selected.id}`} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">Open in Trainer</Link>
                      <button onClick={() => togglePublish(selected)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                          selected.status === "Published" ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
                        }`}>
                        {selected.status === "Published" ? "Archive" : "Publish"}
                      </button>
                      <button onClick={() => handleDelete(selected.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Delete</button>
                    </>
                  )}
                </div>
              </div>

              {editMode ? (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Category</label>
                    <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm">
                      {["Attack", "Defense", "Transition", "Set Piece", "Build-up"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Difficulty</label>
                    <select value={editForm.difficulty} onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                      className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm">
                      {["Easy", "Medium", "Hard"].map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Formation</label>
                    <input value={editForm.formation} onChange={(e) => setEditForm({ ...editForm, formation: e.target.value })}
                      className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Game Phase</label>
                    <input value={editForm.gamePhase} onChange={(e) => setEditForm({ ...editForm, gamePhase: e.target.value })}
                      className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-400 text-xs mb-1 block">Description</label>
                    <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm h-24" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400 text-xs">Category</div>
                      <div className="text-white font-medium">{selected.category}</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400 text-xs">Difficulty</div>
                      <div className="text-white font-medium">{selected.difficulty}</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400 text-xs">Formation</div>
                      <div className="text-white font-medium">{selected.formation || "N/A"}</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="text-gray-400 text-xs">Game Phase</div>
                      <div className="text-white font-medium">{selected.gamePhase}</div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-gray-400 text-sm">{selected.description}</p>
                  </div>
                </>
              )}

              {/* Players Management */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Players ({players.length})</h3>
                  <div className="flex items-center gap-2">
                    <label className="text-gray-400 text-sm">Target count:</label>
                    <input
                      type="number"
                      min="0"
                      max="22"
                      defaultValue={players.length}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val !== players.length) updatePlayerCount(selected.id, val);
                      }}
                      className="w-20 bg-gray-700 rounded px-3 py-1 text-white text-center text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>

                <div className="bg-gray-700/30 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left px-4 py-2 text-gray-400 text-xs">#</th>
                        <th className="text-left px-4 py-2 text-gray-400 text-xs">Position</th>
                        <th className="text-left px-4 py-2 text-gray-400 text-xs">Team</th>
                        <th className="text-left px-4 py-2 text-gray-400 text-xs">Ball</th>
                        <th className="text-left px-4 py-2 text-gray-400 text-xs">Target</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((p) => (
                        <tr key={p.id} className="border-b border-gray-700/30">
                          <td className="px-4 py-2 text-white text-sm">{p.number}</td>
                          <td className="px-4 py-2 text-gray-300 text-sm">{p.position}</td>
                          <td className="px-4 py-2 text-gray-300 text-sm">Team {p.teamId}</td>
                          <td className="px-4 py-2 text-sm">{p.hasBall ? "⚽" : ""}</td>
                          <td className="px-4 py-2 text-sm">{p.isTarget ? "🎯" : ""}</td>
                        </tr>
                      ))}
                      {players.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500 text-sm">No players</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
              <p className="text-gray-500">← Select a scenario to manage</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-white mb-4">Create New Scenario</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Name *</label>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm" placeholder="Scenario name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Category</label>
                  <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm">
                    {["Attack", "Defense", "Transition", "Set Piece", "Build-up"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Difficulty</label>
                  <select value={editForm.difficulty} onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                    className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm">
                    {["Easy", "Medium", "Hard"].map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Formation</label>
                  <input value={editForm.formation} onChange={(e) => setEditForm({ ...editForm, formation: e.target.value })}
                    className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm" placeholder="4-4-2" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Game Phase</label>
                  <input value={editForm.gamePhase} onChange={(e) => setEditForm({ ...editForm, gamePhase: e.target.value })}
                    className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm" placeholder="Build-up" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm h-24" placeholder="Scenario description..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 text-sm">Cancel</button>
              <button onClick={handleCreate} disabled={!editForm.name} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
