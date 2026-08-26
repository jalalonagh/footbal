"use client";

import { useState, useEffect, useRef } from "react";

interface PassSimulation {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  targetPlayerNumber: number;
  targetPlayerName: string;
  passType: string;
  reason: string;
  trajectory: string;
}

interface AnimatedPassBallProps {
  simulation: PassSimulation;
  onComplete: () => void;
  onDismiss: () => void;
}

export default function AnimatedPassBall({ simulation, onComplete, onDismiss }: AnimatedPassBallProps) {
  const [progress, setProgress] = useState(0);
  const [showTrail, setShowTrail] = useState(true);
  const [showTarget, setShowTarget] = useState(true);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const DURATION = 1500;

  useEffect(() => {
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) return;
      
      const elapsed = currentTime - startTimeRef.current;
      const newProgress = Math.min(elapsed / DURATION, 1);
      
      setProgress(newProgress);

      if (newProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setShowTrail(false);
          onComplete();
        }, 500);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onComplete]);

  const eased = 1 - Math.pow(1 - progress, 3);

  let currentX: number;
  let currentY: number;

  if (simulation.trajectory === "curved") {
    const midX = (simulation.fromX + simulation.toX) / 2;
    const midY = Math.min(simulation.fromY, simulation.toY) - 15;
    currentX = (1 - eased) * (1 - eased) * simulation.fromX + 2 * (1 - eased) * eased * midX + eased * eased * simulation.toX;
    currentY = (1 - eased) * (1 - eased) * simulation.fromY + 2 * (1 - eased) * eased * midY + eased * eased * simulation.toY;
  } else if (simulation.trajectory === "through") {
    const overshoot = 1.1;
    currentX = simulation.fromX + (simulation.toX - simulation.fromX) * Math.min(eased * overshoot, 1);
    currentY = simulation.fromY + (simulation.toY - simulation.fromY) * Math.min(eased * overshoot, 1);
  } else {
    currentX = simulation.fromX + (simulation.toX - simulation.fromX) * eased;
    currentY = simulation.fromY + (simulation.toY - simulation.fromY) * eased;
  }

  const trailPoints: string[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const trailEased = 1 - Math.pow(1 - t * progress, 3);
    
    let tx: number, ty: number;
    if (simulation.trajectory === "curved") {
      const midX = (simulation.fromX + simulation.toX) / 2;
      const midY = Math.min(simulation.fromY, simulation.toY) - 15;
      tx = (1 - trailEased) * (1 - trailEased) * simulation.fromX + 2 * (1 - trailEased) * trailEased * midX + trailEased * trailEased * simulation.toX;
      ty = (1 - trailEased) * (1 - trailEased) * simulation.fromY + 2 * (1 - trailEased) * trailEased * midY + trailEased * trailEased * simulation.toY;
    } else {
      tx = simulation.fromX + (simulation.toX - simulation.fromX) * trailEased;
      ty = simulation.fromY + (simulation.toY - simulation.fromY) * trailEased;
    }
    trailPoints.push(`${tx},${ty}`);
  }

  const toSvgX = (x: number) => (x / 100) * 800;
  const toSvgY = (y: number) => (y / 100) * 520;

  return (
    <g>
      {showTrail && (
        <polyline
          points={trailPoints.map(p => {
            const [x, y] = p.split(",").map(Number);
            return `${toSvgX(x)},${toSvgY(y)}`;
          }).join(" ")}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="8,4"
          opacity={0.6}
        />
      )}

      {showTrail && (
        <circle
          cx={toSvgX(currentX)}
          cy={toSvgY(currentY)}
          r="20"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2"
          opacity={0.3 * (1 - progress)}
        />
      )}

      <circle
        cx={toSvgX(currentX)}
        cy={toSvgY(currentY)}
        r="8"
        fill="#ffffff"
        stroke="#fbbf24"
        strokeWidth="2"
        filter="url(#ballGlow)"
      />

      {progress >= 1 && showTarget && (
        <g>
          <circle
            cx={toSvgX(simulation.toX)}
            cy={toSvgY(simulation.toY)}
            r="25"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeDasharray="6,3"
            opacity={0.8}
          >
            <animate
              attributeName="r"
              values="25;35;25"
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.8;0.3;0.8"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>

          <text
            x={toSvgX(simulation.toX)}
            y={toSvgY(simulation.toY) - 30}
            textAnchor="middle"
            fill="#22c55e"
            fontSize="12"
            fontWeight="bold"
          >
            #{simulation.targetPlayerNumber}
          </text>
        </g>
      )}

      <defs>
        <filter id="ballGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {progress >= 1 && (
        <foreignObject
          x={toSvgX(simulation.toX) - 120}
          y={toSvgY(simulation.toY) + 30}
          width="240"
          height="80"
        >
          <div
            style={{
              background: "rgba(0,0,0,0.85)",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "white",
              fontSize: "11px",
              textAlign: "center",
              border: "1px solid #22c55e",
              cursor: "pointer"
            }}
            onClick={onDismiss}
          >
            <div style={{ fontWeight: "bold", color: "#22c55e", marginBottom: "4px" }}>
              {simulation.passType.toUpperCase()} PASS
            </div>
            <div style={{ fontSize: "10px", color: "#d1d5db" }}>
              {simulation.reason}
            </div>
            <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "4px" }}>
              Click to dismiss
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
}
