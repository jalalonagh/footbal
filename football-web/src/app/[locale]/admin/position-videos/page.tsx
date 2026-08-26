"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useTranslations, useLocale } from "next-intl";

interface Position {
  id: string;
  code: string;
  name: string;
  nameFa?: string;
}

interface PositionVideo {
  id: string;
  positionId: string;
  title: string;
  titleFa?: string;
  description?: string;
  descriptionFa?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

const EMPTY_FORM: Partial<PositionVideo> = {
  title: "",
  titleFa: "",
  description: "",
  descriptionFa: "",
  videoUrl: "",
  thumbnailUrl: "",
  displayOrder: 0,
  isActive: true,
};

export default function AdminPositionVideos() {
  const t = useTranslations();
  const locale = useLocale();
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [videos, setVideos] = useState<PositionVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PositionVideo | null>(null);
  const [form, setForm] = useState<Partial<PositionVideo>>(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [videoSource, setVideoSource] = useState<"url" | "upload">("url");

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace("/login");
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) loadPositions();
  }, [isAdmin]);

  const loadPositions = async () => {
    try {
      const data = await api.positions.list(true);
      setPositions(data);
      if (data.length > 0 && !selectedPositionId) {
        setSelectedPositionId(data[0].id);
      }
    } catch {
      setError("Failed to load positions");
    }
  };

  useEffect(() => {
    if (selectedPositionId) loadVideos();
  }, [selectedPositionId]);

  const loadVideos = async () => {
    if (!selectedPositionId) return;
    setLoading(true);
    try {
      const data = await api.positionVideos.listByPosition(selectedPositionId);
      setVideos(data);
    } catch {
      setError("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm({ ...EMPTY_FORM, positionId: selectedPositionId });
    setVideoSource("url");
    setShowForm(true);
  };

  const openEdit = (item: PositionVideo) => {
    setEditingItem(item);
    setForm({ ...item });
    setVideoSource(item.videoUrl.includes("/uploads/") ? "upload" : "url");
    setShowForm(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const result = await api.positionVideos.upload(file);
      setForm({ ...form, videoUrl: result.url });
    } catch {
      setError("Failed to upload video");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.videoUrl) {
      setError("Title and Video are required");
      return;
    }
    try {
      if (editingItem) {
        await api.positionVideos.update(editingItem.id, { ...form, positionId: selectedPositionId });
        setMessage("Video updated");
      } else {
        await api.positionVideos.create({ ...form, positionId: selectedPositionId });
        setMessage("Video created");
      }
      setShowForm(false);
      loadVideos();
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setError("Failed to save video");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    try {
      await api.positionVideos.delete(id);
      setMessage("Video deleted");
      loadVideos();
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setError("Failed to delete video");
    }
  };

  const getPositionName = (p: Position) => {
    if (locale === "fa" && p.nameFa) return p.nameFa;
    return p.name;
  };

  if (authLoading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Position Videos</h1>
          <button onClick={() => router.push("/admin")} className="text-gray-400 hover:text-white">
            ← Back to Admin
          </button>
        </div>

        {message && <div className="p-3 rounded bg-green-900/50 text-green-300 border border-green-700 mb-4">{message}</div>}
        {error && <div className="p-3 rounded bg-red-900/50 text-red-300 border border-red-700 mb-4">{error}</div>}

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Select Position</label>
          <select
            value={selectedPositionId}
            onChange={(e) => setSelectedPositionId(e.target.value)}
            className="w-full md:w-96 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500">
            {positions.map((p) => (
              <option key={p.id} value={p.id}>{p.code} - {getPositionName(p)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Videos ({videos.length})</h2>
          <button onClick={openCreate} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            + Add Video
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No videos for this position</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                  ) : video.videoUrl.includes("/uploads/") ? (
                    <video src={video.videoUrl} className="w-full h-full object-cover" muted />
                  ) : (
                    <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white truncate">{video.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${video.isActive ? "bg-green-900/50 text-green-300" : "bg-gray-700 text-gray-400"}`}>
                      {video.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {video.description && <p className="text-gray-400 text-sm line-clamp-2 mb-3">{video.description}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(video)} className="flex-1 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(video.id)} className="py-1.5 bg-red-600/80 text-white rounded text-sm hover:bg-red-700 px-3">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">{editingItem ? "Edit Video" : "Add Video"}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title *</label>
                  <input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title (FA)</label>
                  <input value={form.titleFa || ""} onChange={(e) => setForm({ ...form, titleFa: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" dir="rtl" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white h-20" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description (FA)</label>
                  <textarea value={form.descriptionFa || ""} onChange={(e) => setForm({ ...form, descriptionFa: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white h-20" dir="rtl" />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Video Source *</label>
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setVideoSource("url")}
                      className={`px-4 py-2 rounded-lg text-sm transition ${videoSource === "url" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                      URL (YouTube)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSource("upload")}
                      className={`px-4 py-2 rounded-lg text-sm transition ${videoSource === "upload" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                      Upload File
                    </button>
                  </div>

                  {videoSource === "url" ? (
                    <input value={form.videoUrl || ""} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                  ) : (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition ${
                          uploading ? "border-green-500 bg-green-900/20" : "border-gray-600 bg-gray-700 hover:border-gray-500"
                        }`}>
                        {uploading ? (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                            <p className="text-green-400 text-sm">Uploading...</p>
                          </div>
                        ) : form.videoUrl && form.videoUrl.includes("/uploads/") ? (
                          <div className="text-center">
                            <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-green-400 text-sm">Video uploaded!</p>
                            <p className="text-gray-500 text-xs mt-1">Click to replace</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-gray-400 text-sm">Click to upload video</p>
                            <p className="text-gray-500 text-xs mt-1">MP4, WebM, MOV (max 100MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Thumbnail URL</label>
                  <input value={form.thumbnailUrl || ""} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Display Order</label>
                    <input type="number" value={form.displayOrder || 0} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-green-600 focus:ring-green-500" />
                      <span className="text-sm text-gray-300">Active</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} disabled={uploading} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {editingItem ? "Update" : "Create"}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
