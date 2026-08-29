"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface AnalysisResult {
  scenarioName: string;
  description: string;
  category: string;
  difficulty: string;
  gamePhase: string;
  gameMinute: number;
  homeScore: number;
  awayScore: number;
  formation: string;
  trainingMode: string;
  players: Array<{
    number: number;
    position: string;
    x: number;
    y: number;
    teamId: number;
    hasBall: boolean;
    description: string;
  }>;
  explanation: string;
}

export default function ScenarioFromImagePage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const guidelines = [
    { icon: "⚽", title: "Clear Player Visibility", desc: "Ensure all players are visible on the pitch with clear jersey numbers" },
    { icon: "📐", title: "Full Pitch View", desc: "The image should show the full or most of the football pitch from above or side angle" },
    { icon: "🎯", title: "Ball Position Visible", desc: "The ball should be clearly visible in the image" },
    { icon: "📷", title: "High Resolution", desc: "Use HD or high-quality images (min 720p) for best AI analysis" },
    { icon: "🏷️", title: "Match or Training", desc: "Works best with actual match footage or training session screenshots" },
    { icon: "✅", title: "Good Lighting", desc: "Well-lit images produce better analysis results" },
  ];

  const badExamples = [
    "Blurry or low-resolution images",
    "Images where players are not visible",
    "Abstract diagrams (not real images)",
    "Images without a football pitch",
    "Dark or poorly lit screenshots",
  ];

  const handleFile = useCallback((file: File) => {
    setError("");
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload JPG, PNG, or WebP images only.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image must be under 10MB.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e?.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    setError("");
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e?.target?.result as string;
          resolve(result.split(",")[1]);
        };
        reader.readAsDataURL(imageFile);
      });

      const data = await api.ai.extractScenario({ imageBase64: base64 });
      setResult(data);
      setName(data.scenarioName);
      setDescription(data.description);
      setAnalyzed(true);
    } catch (err: any) {
      setError(err?.message || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result || !name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const r = e?.target?.result as string;
          resolve(r.split(",")[1]);
        };
        reader.readAsDataURL(imageFile!);
      });

      await api.scenarioImage.create({
        name,
        description,
        category: result.category,
        difficulty: result.difficulty,
        formation: result.formation,
        gamePhase: result.gamePhase,
        gameMinute: result.gameMinute,
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        trainingMode: result.trainingMode,
        sourceImageBase64: base64,
        players: result.players,
      });

      router.push("/scenarios");
    } catch (err: any) {
      setError(err?.message || "Failed to save scenario.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-400">Create Scenario from Image</h1>
            <p className="text-gray-400 mt-1">Upload a football image and AI will extract the tactical scenario</p>
          </div>
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white px-4 py-2 border border-gray-600 rounded-lg">
            ← Back
          </button>
        </div>

        {/* Guidelines */}
        {!analyzed && (
          <div className="mb-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-green-400">📋 Image Upload Guidelines</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {guidelines.map((g, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-750 rounded-lg">
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <div className="font-medium text-white">{g.title}</div>
                    <div className="text-sm text-gray-400">{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <h3 className="text-sm font-semibold text-red-400 mb-2">❌ Images that won&apos;t work well:</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                {badExamples.map((ex, i) => (
                  <li key={i}>• {ex}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Upload Area */}
        {!analyzed && (
          <div
            className={`mb-8 border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragActive ? "border-green-500 bg-green-900/10" : "border-gray-600 hover:border-gray-500"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {imagePreview ? (
              <div className="space-y-4">
                <img src={imagePreview} alt="Preview" className="max-h-80 mx-auto rounded-lg shadow-lg" />
                <p className="text-gray-400 text-sm">Click to change image</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-5xl">📸</div>
                <p className="text-lg text-gray-300">Drop your football image here or click to browse</p>
                <p className="text-sm text-gray-500">JPG, PNG, WebP • Max 10MB</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">{error}</div>
        )}

        {/* Analyze Button */}
        {!analyzed && imageFile && (
          <div className="text-center">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {analyzing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Analyzing with AI...
                </span>
              ) : (
                "🤖 Analyze Image with AI"
              )}
            </button>
          </div>
        )}

        {/* Analysis Result */}
        {analyzed && result && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-green-400">🎯 AI Analysis Result</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img src={imagePreview!} alt="Uploaded" className="w-full rounded-lg shadow-lg" />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Scenario Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-750 p-2 rounded"><span className="text-gray-400">Category:</span> {result.category}</div>
                    <div className="bg-gray-750 p-2 rounded"><span className="text-gray-400">Difficulty:</span> {result.difficulty}</div>
                    <div className="bg-gray-750 p-2 rounded"><span className="text-gray-400">Formation:</span> {result.formation}</div>
                    <div className="bg-gray-750 p-2 rounded"><span className="text-gray-400">Phase:</span> {result.gamePhase}</div>
                    <div className="bg-gray-750 p-2 rounded"><span className="text-gray-400">Minute:</span> {result.gameMinute}'</div>
                    <div className="bg-gray-750 p-2 rounded"><span className="text-gray-400">Score:</span> {result.homeScore} - {result.awayScore}</div>
                    <div className="bg-gray-750 p-2 rounded"><span className="text-gray-400">Players:</span> {result.players.length}</div>
                  </div>
                </div>
              </div>

              {result.explanation && (
                <div className="mt-4 p-4 bg-gray-750 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Tactical Analysis</h3>
                  <p className="text-sm text-gray-400 whitespace-pre-line">{result.explanation}</p>
                </div>
              )}

              {result.players.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Detected Players ({result.players.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {result.players.map((p, i) => (
                      <div key={i} className={`p-2 rounded ${p.teamId === 1 ? "bg-blue-900/30 border border-blue-800" : "bg-red-900/30 border border-red-800"}`}>
                        <span className="font-bold">#{p.number}</span> {p.position} {p.hasBall && "⚽"} <span className="text-gray-500">T{p.teamId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => { setAnalyzed(false); setResult(null); setImageFile(null); setImagePreview(null); }}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Upload New Image
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
              >
                {saving ? "Saving..." : "💾 Save Scenario"}
              </button>
            </div>

            <p className="text-center text-sm text-gray-500">
              Your scenario will be saved as a Draft. An admin will review and publish it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
