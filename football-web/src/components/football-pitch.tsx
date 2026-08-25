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
  isGoalkeeper: boolean;
  position: string;
  role?: string;
  direction: { x: number; y: number } | null;
  suggestedDirection: { x: number; y: number } | null;
  wrongDirection: { x: number; y: number } | null;
}

export interface BallData {
  x: number;
  y: number;
  holderId: string | null;
  direction: { x: number; y: number } | null;
  suggestedDirection: { x: number; y: number } | null;
  wrongDirection: { x: number; y: number } | null;
}

export type DirectionMode = "current" | "suggested" | "wrong" | "all";

export interface AISuggestion {
  playerId: string;
  moveX: number;
  moveY: number;
  action: string;
  reason: string;
}

interface FootballPitchProps {
  players: PlayerData[];
  ball: BallData;
  selectedPlayerId: string | null;
  directionMode: DirectionMode;
  passMode?: boolean;
  onPlayerMove?: (playerId: string, x: number, y: number) => void;
  onBallMove?: (x: number, y: number, clearHolder?: boolean) => void;
  onPlayerSelect?: (playerId: string | null) => void;
  onDirectionSet?: (playerId: string, dx: number, dy: number) => void;
  onBallDirectionSet?: (dx: number, dy: number) => void;
  onBallClaimed?: (playerId: string) => void;
  onPass?: (fromPlayerId: string, toPlayerId: string) => void;
  disabled?: boolean;
  width?: number;
  height?: number;
  aiSuggestions?: AISuggestion[];
  showAISuggestions?: boolean;
}

const DIR_LEN = 18;

export default function FootballPitch({
  players, ball, selectedPlayerId, directionMode, passMode = false,
  onPlayerMove, onBallMove, onPlayerSelect, onDirectionSet, onBallDirectionSet, onBallClaimed, onPass,
  disabled = false, width = 800, height = 520,
  aiSuggestions = [], showAISuggestions = false,
}: FootballPitchProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const [passTarget, setPassTarget] = useState<string | null>(null);

  const toSvgX = (x: number) => (x / 100) * width;
  const toSvgY = (y: number) => (y / 100) * height;
  const toPitchX = (svgX: number) => (svgX / width) * 100;
  const toPitchY = (svgY: number) => (svgY / height) * 100;

  const getMousePos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    let cx: number, cy: number;
    if ("touches" in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = e.clientX; cy = e.clientY; }
    return { x: toPitchX(cx - rect.left), y: toPitchY(cy - rect.top) };
  }, [width, height]);

  const handlePlayerMouseDown = useCallback((playerId: string, e: React.MouseEvent) => {
    if (disabled || directionMode === "all") return;
    e.stopPropagation();
    e.preventDefault();
    didDrag.current = false;

    const clickedPlayer = players.find((p) => p.id === playerId);
    const holderPlayer = players.find((p) => p.hasBall);

    if (passMode && holderPlayer && holderPlayer.id !== playerId) {
      onPass?.(holderPlayer.id, playerId);
      return;
    }

    const pos = getMousePos(e);
    if (clickedPlayer) {
      onPlayerSelect?.(playerId === selectedPlayerId ? null : playerId);
      setDragging(playerId);
      setDragOffset({ x: pos.x - clickedPlayer.x, y: pos.y - clickedPlayer.y });
    }
  }, [disabled, directionMode, getMousePos, players, selectedPlayerId, onPlayerSelect, onPass, passMode]);

  const handleBallMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || directionMode === "all") return;
    e.stopPropagation();
    const pos = getMousePos(e);
    onPlayerSelect?.(null);
    setDragging("ball");
    setDragOffset({ x: pos.x - ball.x, y: pos.y - ball.y });
  }, [disabled, directionMode, getMousePos, ball, onPlayerSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    didDrag.current = true;
    const pos = getMousePos(e);
    const nx = Math.max(2, Math.min(98, pos.x - dragOffset.x));
    const ny = Math.max(2, Math.min(98, pos.y - dragOffset.y));
    if (dragging === "ball") {
      onBallMove?.(nx, ny);
    } else {
      onPlayerMove?.(dragging, nx, ny);
      if (ball.holderId === dragging) {
        onBallMove?.(nx, ny, false);
      }
    }
  }, [dragging, dragOffset, getMousePos, onPlayerMove, onBallMove, ball.holderId]);

  const handleMouseUp = useCallback(() => {
    if (dragging === "ball") {
      const nearest = players.find((p) => {
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        return Math.sqrt(dx * dx + dy * dy) < 8;
      });
      if (nearest && !disabled) {
        onBallClaimed?.(nearest.id);
      }
    }
    setDragging(null);
  }, [dragging, players, ball.x, ball.y, disabled, onBallClaimed]);

  const handlePitchClick = useCallback((e: React.MouseEvent) => {
    if (disabled || dragging || directionMode === "all") return;
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    const pos = getMousePos(e);
    const clickedOnPlayer = players.some((p) => {
      const dx = pos.x - p.x;
      const dy = pos.y - p.y;
      return Math.sqrt(dx * dx + dy * dy) < 5;
    });
    if (clickedOnPlayer) return;
    if (selectedPlayerId) {
      const player = players.find((p) => p.id === selectedPlayerId);
      if (player) {
        const dx = pos.x - player.x;
        const dy = pos.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 3) {
          const ndx = (dx / dist) * DIR_LEN;
          const ndy = (dy / dist) * DIR_LEN;
          onDirectionSet?.(selectedPlayerId, ndx, ndy);
          return;
        }
      }
    }
    onPlayerSelect?.(null);
  }, [disabled, dragging, directionMode, selectedPlayerId, getMousePos, players, onDirectionSet, onPlayerSelect]);

  useEffect(() => {
    const h = () => setDragging(null);
    window.addEventListener("mouseup", h);
    return () => window.removeEventListener("mouseup", h);
  }, []);

  const arrowPts = (ex: number, ey: number, dx: number, dy: number) => {
    const sx = toSvgX(ex), sy = toSvgY(ey);
    const endX = toSvgX(ex + dx * 0.7), endY = toSvgY(ey + dy * 0.7);
    const a = Math.atan2(endY - sy, endX - sx);
    const s = 10;
    return { sx, sy, endX, endY,
      a1x: endX - s * Math.cos(a - Math.PI / 6), a1y: endY - s * Math.sin(a - Math.PI / 6),
      a2x: endX - s * Math.cos(a + Math.PI / 6), a2y: endY - s * Math.sin(a + Math.PI / 6),
    };
  };

  const renderArrow = (ex: number, ey: number, dx: number, dy: number, color: string, key: string, dashed = false) => {
    const p = arrowPts(ex, ey, dx, dy);
    return (
      <g key={key}>
        <line x1={p.sx} y1={p.sy} x2={p.endX} y2={p.endY} stroke={color} strokeWidth="4" opacity="0.9" strokeDasharray={dashed ? "8,4" : "none"} />
        <polygon points={`${p.endX},${p.endY} ${p.a1x},${p.a1y} ${p.a2x},${p.a2y}`} fill={color} opacity="0.9" />
      </g>
    );
  };

  return (
    <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      className="rounded-lg shadow-lg cursor-crosshair select-none"
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onClick={handlePitchClick} onTouchEnd={handleMouseUp}>
      <defs>
        <pattern id="grass" patternUnits="userSpaceOnUse" width="45" height="45">
          <rect width="45" height="45" fill="#2d8a4e" />
          <rect width="22" height="45" fill="#34a853" />
        </pattern>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="selGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <rect width={width} height={height} fill="url(#grass)" />
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
      <path d="M 2 15 A 15 15 0 0 1 15 2" fill="none" stroke="white" strokeWidth="2" />
      <path d={`M ${width - 15} 2 A 15 15 0 0 1 ${width - 2} 15`} fill="none" stroke="white" strokeWidth="2" />
      <path d={`M 2 ${height - 15} A 15 15 0 0 0 15 ${height - 2}`} fill="none" stroke="white" strokeWidth="2" />
      <path d={`M ${width - 15} ${height - 2} A 15 15 0 0 0 ${width - 2} ${height - 15}`} fill="none" stroke="white" strokeWidth="2" />

      {players.filter((p) => p.hasBall).map((holder) => {
        const target = players.find((p) => p.id === passTarget);
        if (!target) return null;
        return (
          <g key={`pass-${holder.id}-${target.id}`}>
            <line
              x1={toSvgX(holder.x)} y1={toSvgY(holder.y)}
              x2={toSvgX(target.x)} y2={toSvgY(target.y)}
              stroke="#fbbf24" strokeWidth="3" strokeDasharray="8,4" opacity="0.8"
            />
            <circle cx={toSvgX(target.x)} cy={toSvgY(target.y)} r="20" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.6" />
          </g>
        );
      })}

      {players.map((p) => {
        if (directionMode === "all") {
          return (
            <g key={`dirs-${p.id}`}>
              {p.direction && renderArrow(p.x, p.y, p.direction.x, p.direction.y, "#fff", `c-${p.id}`)}
              {p.suggestedDirection && renderArrow(p.x, p.y, p.suggestedDirection.x, p.suggestedDirection.y, "#22c55e", `s-${p.id}`)}
              {p.wrongDirection && renderArrow(p.x, p.y, p.wrongDirection.x, p.wrongDirection.y, "#ef4444", `w-${p.id}`, true)}
            </g>
          );
        }
        const dir = directionMode === "current" ? p.direction : directionMode === "suggested" ? p.suggestedDirection : p.wrongDirection;
        if (!dir) return null;
        const c = directionMode === "current" ? "#fff" : directionMode === "suggested" ? "#22c55e" : "#ef4444";
        return renderArrow(p.x, p.y, dir.x, dir.y, c, `d-${p.id}`, directionMode === "wrong");
      })}
      {(() => {
        if (directionMode === "all") {
          return (
            <g key="dirs-ball">
              {ball.direction && renderArrow(ball.x, ball.y, ball.direction.x, ball.direction.y, "#fff", "bc")}
              {ball.suggestedDirection && renderArrow(ball.x, ball.y, ball.suggestedDirection.x, ball.suggestedDirection.y, "#22c55e", "bs")}
              {ball.wrongDirection && renderArrow(ball.x, ball.y, ball.wrongDirection.x, ball.wrongDirection.y, "#ef4444", "bw", true)}
            </g>
          );
        }
        const dir = directionMode === "current" ? ball.direction : directionMode === "suggested" ? ball.suggestedDirection : ball.wrongDirection;
        if (!dir) return null;
        const c = directionMode === "current" ? "#fff" : directionMode === "suggested" ? "#22c55e" : "#ef4444";
        return renderArrow(ball.x, ball.y, dir.x, dir.y, c, "bd", directionMode === "wrong");
      })()}

      {showAISuggestions && aiSuggestions.map((suggestion) => {
        const player = players.find((p) => p.id === suggestion.playerId);
        if (!player) return null;
        const color = "#a855f7";
        return renderArrow(player.x, player.y, suggestion.moveX, suggestion.moveY, color, `ai-${suggestion.playerId}`, false);
      })}

      {players.map((p) => {
        const sel = p.id === selectedPlayerId;
        const gk = p.isGoalkeeper;
        const fill = p.teamId === 1 ? (gk ? "#f59e0b" : "#3b82f6") : (gk ? "#dc2626" : "#ef4444");
        const holder = players.find((pl) => pl.hasBall);
        const canReceivePass = holder && holder.id !== p.id;
        return (
          <g key={p.id} transform={`translate(${toSvgX(p.x)}, ${toSvgY(p.y)})`}
            onMouseDown={(e) => handlePlayerMouseDown(p.id, e)}
            onMouseEnter={() => canReceivePass && setPassTarget(p.id)}
            onMouseLeave={() => setPassTarget(null)}
            className={disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
            filter={sel ? "url(#selGlow)" : undefined}>
            {sel && <rect x="-16" y="-24" width="32" height="6" rx="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />}
            <circle r="14" fill={fill} stroke={sel ? "#eab308" : "white"} strokeWidth={sel ? 3 : 2} />
            {gk && <><line x1="-6" y1="-6" x2="6" y2="6" stroke="white" strokeWidth="2" /><line x1="6" y1="-6" x2="-6" y2="6" stroke="white" strokeWidth="2" /></>}
            <text textAnchor="middle" dominantBaseline="central" fill="white" fontSize="13" fontWeight="bold">{p.number}</text>
            <text textAnchor="middle" y="22" fill="white" fontSize="8" opacity="0.8">{p.position}</text>
            {ball.holderId === p.id && <circle r="6" cx="12" cy="-12" fill="white" stroke="#333" strokeWidth="1.5" />}
          </g>
        );
      })}

      <g onMouseDown={handleBallMouseDown}
        className={disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
        style={{ display: ball.holderId ? "none" : "block" }}>
        <circle cx={toSvgX(ball.x)} cy={toSvgY(ball.y)} r="7" fill="white" stroke="#333" strokeWidth="1.5" />
        <circle cx={toSvgX(ball.x)} cy={toSvgY(ball.y)} r="2" fill="#333" />
      </g>
    </svg>
  );
}
