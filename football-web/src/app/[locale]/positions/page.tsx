"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useTranslations, useLocale } from "next-intl";
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
  displayOrder?: number;
  isActive?: boolean;
  category?: string;
}

interface UserPosition {
  id: string;
  userId: string;
  positionId: string;
  selectedAt: string;
  position: Position;
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

export default function PositionsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { user } = useAuth();
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [myPosition, setMyPosition] = useState<UserPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const positionsData = await api.positions.list();
      setPositions(positionsData);
      if (user) {
        try {
          const myPositionData = await api.positions.getMyPosition();
          setMyPosition(myPositionData);
        } catch {}
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSelectPosition = async (positionId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    setSelecting(true);
    try {
      const result = await api.positions.selectPosition(positionId);
      setMyPosition(result);
      setMessage(t("positions.selected"));
      setTimeout(() => setMessage(""), 3000);
    } catch {} finally {
      setSelecting(false);
    }
  };

  const handleRemovePosition = async () => {
    if (!confirm(t("positions.confirmRemove"))) return;

    try {
      await api.positions.removeMyPosition();
      setMyPosition(null);
      setMessage(t("positions.removed"));
      setTimeout(() => setMessage(""), 3000);
    } catch {}
  };

  const getPositionName = (position: Position) => {
    if (locale === "fa" && position.nameFa) {
      return position.nameFa;
    }
    return position.name;
  };

  const getDescription = (position: Position) => {
    if (locale === "fa" && position.descriptionFa) {
      return position.descriptionFa;
    }
    return position.description;
  };

  const getRequirements = (position: Position) => {
    if (locale === "fa" && position.requirementsFa) {
      return position.requirementsFa;
    }
    return position.requirements;
  };

  const categories = ["Goalkeeper", "Defense", "Midfield", "Attack"];

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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-green-400 transition">Football Tactics</Link>
          <h1 className="text-xl font-bold text-white">{t("positions.title")}</h1>
        </div>
        <Link href="/profile" className="text-gray-300 hover:text-white transition text-sm">
          {t("nav.profile")}
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {message && (
          <div className="p-4 rounded-lg mb-6 bg-green-900/50 text-green-300 border border-green-700">
            {message}
          </div>
        )}

        {myPosition && (
          <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-700 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-700 rounded-full flex items-center justify-center text-3xl">
                  {CATEGORY_ICONS[myPosition.position.category || ""] || "⚽"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{t("positions.myPosition")}</h2>
                  <p className="text-green-300 text-lg">{getPositionName(myPosition.position)}</p>
                  <p className="text-gray-400 text-sm">
                    {t("positions.selectedAt")}: {new Date(myPosition.selectedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemovePosition}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                {t("positions.changePosition")}
              </button>
            </div>
          </div>
        )}

        {categories.map(category => {
          const categoryPositions = positions.filter(p => p.category === category);
          if (categoryPositions.length === 0) return null;

          return (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>{CATEGORY_ICONS[category] || "⚽"}</span>
                <span>{category}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryPositions.map(position => (
                  <Link
                    key={position.id}
                    href={`/positions/${position.id}`}
                    className={`block border rounded-xl p-6 cursor-pointer transition hover:scale-[1.02] ${
                      CATEGORY_COLORS[position.category || ""] || "bg-gray-800 border-gray-700"
                    } ${myPosition?.positionId === position.id ? "ring-2 ring-green-500" : ""}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-white">{position.code}</span>
                      {myPosition?.positionId === position.id && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">{t("positions.myPosition")}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{getPositionName(position)}</h3>
                    {getDescription(position) && (
                      <p className="text-gray-300 text-sm line-clamp-2">{getDescription(position)}</p>
                    )}
                    <div className="mt-4 text-sm text-gray-400">
                      {t("positions.clickToView")}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
