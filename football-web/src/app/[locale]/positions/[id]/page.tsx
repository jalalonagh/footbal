"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

interface Position {
  id: string;
  code: string;
  name: string;
  nameFa?: string;
  description?: string;
  descriptionFa?: string;
  requirements?: string;
  requirementsFa?: string;
  iconUrl?: string;
  displayOrder: number;
  isActive: boolean;
  category?: string;
  userPositions?: any[];
}

interface PositionVideo {
  id: string;
  title: string;
  titleFa?: string;
  description?: string;
  descriptionFa?: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Goalkeeper: "bg-yellow-900/50 border-yellow-700",
  Defense: "bg-blue-900/50 border-blue-700",
  Midfield: "bg-green-900/50 border-green-700",
  Attack: "bg-red-900/50 border-red-700",
};

const CATEGORY_ICONS: Record<string, string> = {
  Goalkeeper: "🧤",
  Defense: "🛡️",
  Midfield: "⚽",
  Attack: "⚡",
};

export default function PositionDetailPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [position, setPosition] = useState<Position | null>(null);
  const [myPosition, setMyPosition] = useState<any>(null);
  const [videos, setVideos] = useState<PositionVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [message, setMessage] = useState("");
  const [playingVideo, setPlayingVideo] = useState<PositionVideo | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const positionData = await api.positions.get(id);
      setPosition(positionData);

      try {
        const videosData = await api.positionVideos.listByPosition(id);
        setVideos(videosData);
      } catch {
        // Videos endpoint may fail - ignore
      }

      if (user) {
        try {
          const myPositionData = await api.positions.getMyPosition();
          setMyPosition(myPositionData);
        } catch {
          // Not logged in or no position selected - ignore
        }
      }
    } catch {
      router.push("/positions");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPosition = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setSelecting(true);
    try {
      const result = await api.positions.selectPosition(id);
      setMyPosition(result);
      setMessage(t("positions.selected"));
    } catch {
    } finally {
      setSelecting(false);
    }
  };

  const handleRemovePosition = async () => {
    if (!confirm(t("positions.confirmRemove"))) return;

    try {
      await api.positions.removeMyPosition();
      setMyPosition(null);
      setMessage(t("positions.removed"));
    } catch {
    }
  };

  const getPositionName = (pos: Position) => {
    const lang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en';
    return lang === 'fa' && pos.nameFa ? pos.nameFa : pos.name;
  };

  const getDescription = (pos: Position) => {
    const lang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en';
    return lang === 'fa' && pos.descriptionFa ? pos.descriptionFa : pos.description;
  };

  const getRequirements = (pos: Position) => {
    const lang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en';
    return lang === 'fa' && pos.requirementsFa ? pos.requirementsFa : pos.requirements;
  };

  const getVideoTitle = (video: PositionVideo) => {
    const lang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en';
    return lang === 'fa' && video.titleFa ? video.titleFa : video.title;
  };

  const getVideoDescription = (video: PositionVideo) => {
    const lang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en';
    return lang === 'fa' && video.descriptionFa ? video.descriptionFa : video.description;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?#]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="bg-gray-800 px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-green-400 transition">Football Tactics</Link>
        </nav>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!position) return null;

  const isSelected = myPosition?.positionId === position.id;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-green-400 transition">Football Tactics</Link>
          <Link href="/positions" className="text-gray-400 hover:text-white transition">
            ← {t("positions.title")}
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {message && (
          <div className="p-4 rounded-lg mb-6 bg-green-900/50 text-green-300 border border-green-700">
            {message}
          </div>
        )}

        <div className={`border rounded-xl p-8 ${CATEGORY_COLORS[position.category || ""] || "bg-gray-800 border-gray-700"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-5xl">
              {CATEGORY_ICONS[position.category || ""] || "⚽"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{getPositionName(position)}</h1>
                <span className="px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300 font-mono">{position.code}</span>
              </div>
              {position.category && (
                <span className="px-3 py-1 rounded-full text-sm bg-gray-700/50 text-gray-300 mt-2 inline-block">
                  {position.category}
                </span>
              )}
            </div>
          </div>

          {getDescription(position) && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-3">{t("positions.aboutPosition")}</h2>
              <p className="text-gray-300 leading-relaxed text-lg">{getDescription(position)}</p>
            </div>
          )}

          {getRequirements(position) && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-3">{t("positions.requirements")}</h2>
              <div className="bg-gray-700/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed">{getRequirements(position)}</p>
              </div>
            </div>
          )}

          {videos.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🎬</span>
                <span>{t("positions.trainingVideos")}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setPlayingVideo(video)}
                    className="bg-gray-700/50 rounded-xl overflow-hidden cursor-pointer group hover:ring-2 hover:ring-green-500 transition-all"
                  >
                    <div className="aspect-video bg-gray-900 relative">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-600 group-hover:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 bg-green-600/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-1">{getVideoTitle(video)}</h3>
                      {getVideoDescription(video) && (
                        <p className="text-gray-400 text-sm line-clamp-2">{getVideoDescription(video)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {position.userPositions && position.userPositions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-3">{t("positions.playersCount")}</h2>
              <p className="text-gray-400">
                {t("positions.playersSelected", { count: position.userPositions.length })}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            {isSelected ? (
              <div className="flex-1">
                <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 mb-4 text-center">
                  <p className="text-green-300 font-semibold">{t("positions.thisIsYourPosition")}</p>
                </div>
                <button
                  onClick={handleRemovePosition}
                  className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
                  {t("positions.removePosition")}
                </button>
              </div>
            ) : (
              <button
                onClick={handleSelectPosition}
                disabled={selecting}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition">
                {selecting ? "..." : t("positions.selectThisPosition")}
              </button>
            )}
          </div>
        </div>
      </main>

      {playingVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setPlayingVideo(null)}>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <iframe
                src={getYouTubeEmbedUrl(playingVideo.videoUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-white mb-2">{getVideoTitle(playingVideo)}</h3>
              {getVideoDescription(playingVideo) && (
                <p className="text-gray-400">{getVideoDescription(playingVideo)}</p>
              )}
              <button
                onClick={() => setPlayingVideo(null)}
                className="mt-4 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
