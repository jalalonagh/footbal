"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Academy } from "@/lib/types";

export default function AcademyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const id = params.id as string;

  const [academy, setAcademy] = useState<Academy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadAcademy();
  }, [id]);

  const loadAcademy = async () => {
    setLoading(true);
    try {
      const data = await api.academies.get(id);
      setAcademy(data);
    } catch { } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
    </div>
  );

  if (!academy) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <p className="text-xl mb-4">Academy not found</p>
      <button onClick={() => router.push("/academies")} className="text-green-400 hover:underline">← Back to Academies</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="text-white hover:text-green-400">🏠 Home</button>
          <button onClick={() => router.push("/academies")} className="text-white hover:text-green-400">← Academies</button>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button onClick={() => router.push("/academies/add")} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              + Add Academy
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {academy.logoUrl && (
          <img src={academy.logoUrl} alt={academy.name} className="w-full h-64 object-cover rounded-xl mb-6" />
        )}
        {!academy.logoUrl && (
          <div className="w-full h-64 bg-gradient-to-br from-green-900/50 to-gray-800 rounded-xl flex items-center justify-center text-8xl mb-6">🏟️</div>
        )}

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{academy.name}</h1>
            {academy.city && <p className="text-green-400 text-lg">📍 {academy.city}{academy.province ? `, ${academy.province}` : ""}{academy.country ? `, ${academy.country}` : ""}</p>}
          </div>
          {academy.foundedYear && <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">Est. {academy.foundedYear}</span>}
        </div>

        {academy.description && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-3 text-green-400">About</h2>
            <p className="text-gray-300 whitespace-pre-line">{academy.description}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Details */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-green-400">Details</h2>
            <div className="space-y-3 text-sm">
              {academy.ageGroups && <div><span className="text-gray-400">Age Groups:</span> {academy.ageGroups}</div>}
              {academy.minAge && academy.maxAge && <div><span className="text-gray-400">Age Range:</span> {academy.minAge} - {academy.maxAge} years</div>}
              {academy.playingStyle && <div><span className="text-gray-400">Playing Style:</span> {academy.playingStyle}</div>}
              {academy.monthlyFee && academy.monthlyFee > 0 && <div><span className="text-gray-400">Monthly Fee:</span> <span className="text-green-400 font-semibold">{academy.monthlyFee.toLocaleString()} Tomans</span></div>}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-green-400">Contact</h2>
            <div className="space-y-3 text-sm">
              {academy.address && <div><span className="text-gray-400">Address:</span> {academy.address}</div>}
              {academy.contactPhone && <div><span className="text-gray-400">Phone:</span> {academy.contactPhone}</div>}
              {academy.contactEmail && <div><span className="text-gray-400">Email:</span> {academy.contactEmail}</div>}
              {academy.website && <div><span className="text-gray-400">Website:</span> <a href={academy.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{academy.website}</a></div>}
              {academy.instagram && <div><span className="text-gray-400">Instagram:</span> {academy.instagram}</div>}
              {academy.telegram && <div><span className="text-gray-400">Telegram:</span> {academy.telegram}</div>}
            </div>
          </div>
        </div>

        {academy.facilities && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-3 text-green-400">Facilities</h2>
            <p className="text-gray-300 whitespace-pre-line">{academy.facilities}</p>
          </div>
        )}
      </main>
    </div>
  );
}
