"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";

export interface PlayerData {
  id: string;
  teamId: number;
  number: number;
  x: number;
  y: number;
  hasBall: boolean;
  isTarget: boolean;
  isDefender: boolean;
  position: string;
}

export interface BallData {
  x: number;
  y: number;
}

interface FootballPitchProps {
  players: PlayerData[];
  ball: BallData;
  onPlayerMove?: (playerId: string, x: number, y: number) => void;
  onBallMove?: (x: number, y: number) => void;
  onPitchClick?: (x: number, y: number) => void;
  showMovementPath?: boolean;
  movementPath?: { x: number; y: number }[];
  optimalPath?: { x: number; y: number }[];
  highlightZone?: { x: number; y: number; radius: number; color: string }[];
  disabled?: boolean;
  width?: number;
  height?: number;
}

export default function FootballPitch({
  players,
  ball,
  onPlayerMove,
  onBallMove,
  onPitchClick,
  showMovementPath = false,
  movementPath = [],
  optimalPath = [],
  highlightZone = [],
  disabled = false,
  width = 800,
  height = 520,
}: FootballPitchProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const toSvgX = (x: number) => (x / 100) * width;
  const toSvgY = (y: number) => (y / 100) * height;
  const toPitchX = (svgX: number) => (svgX / width) * 100;
  const toPitchY = (svgY: number) => (svgY / height) * 100;

  const getMousePos = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      let clientX: number, clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      return {
        x: toPitchX(clientX - rect.left),
        y: toPitchY(clientY - rect.top),
      };
    },
    [width, height]
  );

  const handleMouseDown = useCallback(
    (playerId: string, e: React.MouseEvent) => {
      if (disabled) return;
      e.stopPropagation();
      const pos = getMousePos(e);
      const player = players.find((p) => p.id === playerId);
      if (player) {
        setDragging(playerId);
        setDragOffset({ x: pos.x - player.x, y: pos.y - player.y });
      }
    },
    [disabled, getMousePos, players]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const pos = getMousePos(e);
      const newX = Math.max(0, Math.min(100, pos.x - dragOffset.x));
      const newY = Math.max(0, Math.min(100, pos.y - dragOffset.y));
      onPlayerMove?.(dragging, newX, newY);
    },
    [dragging, dragOffset, getMousePos, onPlayerMove]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handlePitchClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || dragging) return;
      const pos = getMousePos(e);
      onPitchClick?.(pos.x, pos.y);
    },
    [disabled, dragging, getMousePos, onPitchClick]
  );

  useEffect(() => {
    const handleGlobalMouseUp = () => setDragging(null);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const pathToD = (path: { x: number; y: number }[]) => {
    if (path.length < 2) return "";
    return path.map((p, i) => `${i === 0 ? "M" : "L"} ${toSvgX(p.x)} ${toSvgY(p.y)}`).join(" ");
  };

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="rounded-lg shadow-lg cursor-crosshair select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handlePitchClick}
      onTouchEnd={handleMouseUp}
    >
      <defs>
        <pattern id="grass" patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="20" height="20" fill="#2d8a4e" />
          <rect width="10" height="20" fill="#34a853" />
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width={width} height={height} fill="url(#grass)" />

      <rect x="2" y="2" width={width - 4} height={height - 4} fill="none" stroke="white" strokeWidth="2" />

      <line x1={width / 2} y1="2" x2={width / 2} y2={height - 2} stroke="white" strokeWidth="2" />
      <circle cx={width / 2} cy={height / 2} r="50" fill="none" stroke="white" strokeWidth="2" />
      <circle cx={width / 2} cy={height / 2} r="3" fill="white" />

      <rect x="2" y={height / 2 - 80} width="110" height="160" fill="none" stroke="white" strokeWidth="2" rx="5" />
      <rect x="2" y={height / 2 - 35} width="45" height="70" fill="none" stroke="white" strokeWidth="2" rx="3" />
      <circle cx="70" cy={height / 2} r="3" fill="white" />

      <rect x={width - 112} y={height / 2 - 80} width="110" height="160" fill="none" stroke="white" strokeWidth="2" rx="5" />
      <rect x={width - 47} y={height / 2 - 35} width="45" height="70" fill="none" stroke="white" strokeWidth="2" rx="3" />
      <circle cx={width - 68} cy={height / 2} r="3" fill="white" />

      <line x1="2" y1="3" x2="20" y2="3" stroke="white" strokeWidth="4" />
      <line x1="2" y1={height - 3} x2="20" y2={height - 3} stroke="white" strokeWidth="4" />
      <line x1={width - 20} y1="3" x2={width - 2} y2="3" stroke="white" strokeWidth="4" />
      <line x1={width - 20} y1={height - 3} x2={width - 2} y2={height - 3} stroke="white" strokeWidth="4" />

      {highlightZone.map((zone, i) => (
        <circle
          key={`zone-${i}`}
          cx={toSvgX(zone.x)}
          cy={toSvgY(zone.y)}
          r={zone.radius * (width / 100)}
          fill={zone.color}
          opacity="0.3"
        />
      ))}

      {optimalPath.length > 1 && (
        <path
          d={pathToD(optimalPath)}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          strokeDasharray="8,4"
          opacity="0.8"
        />
      )}

      {showMovementPath && movementPath.length > 1 && (
        <path
          d={pathToD(movementPath)}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeDasharray="8,4"
          opacity="0.8"
        />
      )}

      {players.map((player) => (
        <g
          key={player.id}
          transform={`translate(${toSvgX(player.x)}, ${toSvgY(player.y)})`}
          onMouseDown={(e) => handleMouseDown(player.id, e)}
          className={disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
          filter={player.isTarget ? "url(#glow)" : undefined}
        >
          <circle
            r="14"
            fill={player.teamId === 1 ? (player.isTarget ? "#fbbf24" : "#3b82f6") : "#ef4444"}
            stroke="white"
            strokeWidth="2"
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="10"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            {player.number}
          </text>
          {player.hasBall && (
            <circle r="5" cx="10" cy="-10" fill="#f97316" stroke="white" strokeWidth="1" />
          )}
          <text
            textAnchor="middle"
            y="22"
            fill="white"
            fontSize="7"
            fontFamily="sans-serif"
            opacity="0.8"
          >
            {player.position}
          </text>
        </g>
      ))}

      <circle
        cx={toSvgX(ball.x)}
        cy={toSvgY(ball.y)}
        r="6"
        fill="white"
        stroke="#333"
        strokeWidth="1.5"
      />
      <circle cx={toSvgX(ball.x)} cy={toSvgY(ball.y)} r="2" fill="#333" />
    </svg>
  );
}
