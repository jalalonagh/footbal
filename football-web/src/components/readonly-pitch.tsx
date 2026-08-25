"use client";

import React from "react";
import { PlayerData, BallData } from "@/components/football-pitch";

interface ReadOnlyPitchProps {
  players: PlayerData[];
  ball: BallData;
}

const ReadOnlyPitch: React.FC<ReadOnlyPitchProps> = ({ players, ball }) => {
  const w = 400;
  const h = 260;
  const scaleX = w / 100;
  const scaleY = h / 100;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto rounded-lg block">
      <defs>
        <pattern id="grass-home" patternUnits="userSpaceOnUse" width={45} height={h}>
          <rect width={45} height={h} fill="#1a7a3a" />
          <rect x={45} width={45} height={h} fill="#1e8c42" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill="url(#grass-home)" rx="8" />

      <rect x={2} y={2} width={w - 4} height={h - 4} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" rx="6" />
      <line x1={w / 2} y1={2} x2={w / 2} y2={h - 2} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <circle cx={w / 2} cy={h / 2} r={h * 0.15} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

      <rect x={2} y={h * 0.2} width={w * 0.15} height={h * 0.6} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <rect x={w - 2 - w * 0.15} y={h * 0.2} width={w * 0.15} height={h * 0.6} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

      <circle cx={ball.x * scaleX} cy={ball.y * scaleY} r={5} fill="white" stroke="#333" strokeWidth="1" />

      {players.map((p) => {
        const cx = p.x * scaleX;
        const cy = p.y * scaleY;
        const fillColor = p.teamId === 1 ? "#2563eb" : "#dc2626";
        return (
          <g key={p.id}>
            <circle cx={cx} cy={cy} r={9} fill={fillColor} stroke="white" strokeWidth="1.5" opacity="0.9" />
            <text x={cx} y={cy + 3.5} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">
              {p.number}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default ReadOnlyPitch;
