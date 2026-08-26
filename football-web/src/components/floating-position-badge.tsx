"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface UserPosition {
  id: string;
  userId: string;
  positionId: string;
  position: {
    id: string;
    code: string;
    name: string;
    nameFa?: string;
    category?: string;
  };
  selectedAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Goalkeeper: "bg-yellow-600",
  Defense: "bg-blue-600",
  Midfield: "bg-green-600",
  Attack: "bg-red-600",
};

export default function FloatingPositionBadge() {
  const t = useTranslations();
  const locale = useLocale();
  const { user } = useAuth();
  const [myPosition, setMyPosition] = useState<UserPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyPosition();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadMyPosition = async () => {
    try {
      const data = await api.positions.getMyPosition();
      setMyPosition(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm(t("positions.confirmRemove"))) return;

    setRemoving(true);
    try {
      await api.positions.removeMyPosition();
      setMyPosition(null);
      setShowDetails(false);
    } catch {
    } finally {
      setRemoving(false);
    }
  };

  if (loading || !user || !myPosition) return null;

  const getPositionName = () => {
    return locale === 'fa' && myPosition.position.nameFa ? myPosition.position.nameFa : myPosition.position.name;
  };

  const categoryColor = CATEGORY_COLORS[myPosition.position.category || ""] || "bg-green-600";

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      {showDetails && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl min-w-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">{t("positions.myPosition")}</h3>
            <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-white transition">
              ✕
            </button>
          </div>
          <div className="mb-4">
            <p className="text-gray-400 text-sm">{t("positions.position")}:</p>
            <p className="text-white font-semibold text-lg">{getPositionName()}</p>
          </div>
          <div className="mb-4">
            <p className="text-gray-400 text-sm">{t("positions.code")}:</p>
            <p className="text-white font-mono">{myPosition.position.code}</p>
          </div>
          {myPosition.position.category && (
            <div className="mb-4">
              <p className="text-gray-400 text-sm">{t("positions.category")}:</p>
              <p className="text-white">{myPosition.position.category}</p>
            </div>
          )}
          <div className="mb-4">
            <p className="text-gray-400 text-sm">{t("positions.selectedAt")}:</p>
            <p className="text-white">{new Date(myPosition.selectedAt).toLocaleDateString()}</p>
          </div>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="w-full py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition">
            {removing ? "..." : t("positions.removePosition")}
          </button>
        </div>
      )}

      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`${categoryColor} text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3`}>
        <span className="text-xl">⚽</span>
        <span className="font-semibold">{getPositionName()}</span>
        <span className="text-sm opacity-80">({myPosition.position.code})</span>
      </button>
    </div>
  );
}
