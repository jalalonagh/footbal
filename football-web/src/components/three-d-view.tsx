"use client";

import React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

interface Player3D {
  id: string;
  x: number;
  y: number;
  teamId: number;
  number: number;
  position: string;
  isGoalkeeper: boolean;
  hasBall: boolean;
}

interface Ball3D {
  x: number;
  y: number;
  holderId: string | null;
}

interface ThreeDViewProps {
  players: Player3D[];
  ball: Ball3D;
  selectedPlayerId: string | null;
  width?: number;
  height?: number;
}

const FIELD_SIZE = 100;
const SCALE_X = 0.5;
const SCALE_Y = 0.325;

function toWorldX(x: number): number {
  return (x - FIELD_SIZE / 2) * SCALE_X;
}

function toWorldZ(y: number): number {
  return (y - FIELD_SIZE / 2) * SCALE_Y;
}

function Stickman({ player, isSelected }: { player: Player3D; isSelected: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const worldX = toWorldX(player.x);
  const worldZ = toWorldZ(player.y);

  const color = player.teamId === 1
    ? (player.isGoalkeeper ? "#f59e0b" : "#3b82f6")
    : (player.isGoalkeeper ? "#dc2626" : "#ef4444");

  return (
    <group ref={groupRef} position={[worldX, 0, worldZ]} rotation={[0, Math.PI / 2, 0]}>
      {/* Head */}
      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[0.38, 10, 10]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.22, 0.2, 1.2, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Left Arm - pointing down */}
      <mesh position={[-0.45, 1.6, 0]} rotation={[0, 0, Math.PI / 3]}>
        <cylinderGeometry args={[0.1, 0.08, 0.8, 5]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Right Arm - pointing down */}
      <mesh position={[0.45, 1.6, 0]} rotation={[0, 0, -Math.PI / 3]}>
        <cylinderGeometry args={[0.1, 0.08, 0.8, 5]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.2, 0.65, 0]} rotation={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.13, 0.11, 1.1, 5]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.2, 0.65, 0]} rotation={[0, 0, -0.08]}>
        <cylinderGeometry args={[0.13, 0.11, 1.1, 5]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Number label */}
      <Text
        position={[0, 2.7, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
        rotation={[0, -Math.PI / 2, 0]}
      >
        {player.number}
      </Text>

      {/* Position label */}
      <Text
        position={[0, 2.9, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="black"
        rotation={[0, -Math.PI / 2, 0]}
      >
        {player.position}
      </Text>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1, 16]} />
          <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
}

function Ball({ ball }: { ball: Ball3D }) {
  const worldX = toWorldX(ball.x);
  const worldZ = toWorldZ(ball.y);
  const ballRef = useRef<THREE.Mesh>(null);

  const footballTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 512, 512);

    const drawPentagon = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = "#1a1a1a";
      ctx.fill();
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const drawHexagon = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    drawPentagon(256, 256, 60);
    drawPentagon(128, 128, 45);
    drawPentagon(384, 128, 45);
    drawPentagon(128, 384, 45);
    drawPentagon(384, 384, 45);

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = 256 + 130 * Math.cos(angle);
      const y = 256 + 130 * Math.sin(angle);
      drawHexagon(x, y, 40);
    }

    drawHexagon(256, 100, 35);
    drawHexagon(256, 412, 35);
    drawHexagon(100, 256, 35);
    drawHexagon(412, 256, 35);

    ctx.strokeStyle = "#999999";
    ctx.lineWidth = 2;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  return (
    <group position={[worldX, 0.25, worldZ]}>
      <mesh ref={ballRef} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial
          map={footballTexture}
          roughness={0.3}
          metalness={0.1}
          envMapIntensity={0.5}
        />
      </mesh>
      <mesh castShadow>
        <sphereGeometry args={[0.225, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          roughness={0.1}
        />
      </mesh>
      <pointLight color="#ffffff" intensity={0.3} distance={2} />
    </group>
  );
}

function Goal({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Left post */}
      <mesh position={[-2.5, 1.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 3, 6]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Right post */}
      <mesh position={[2.5, 1.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 3, 6]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Crossbar */}
      <mesh position={[0, 3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 5, 6]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Net - simplified as a plane */}
      <mesh position={[0, 1.5, -0.5]}>
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial color="white" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Field() {
  const lines = useMemo(() => {
    const elements: React.ReactNode[] = [];

    // Field outline
    const fieldW = FIELD_SIZE * SCALE_X;
    const fieldH = FIELD_SIZE * SCALE_Y;
    const halfW = fieldW / 2;
    const halfH = fieldH / 2;

    // Center line
    elements.push(
      <mesh key="center-line" position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, fieldH]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );

    // Center circle
    elements.push(
      <mesh key="center-circle" position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5 * SCALE_X - 0.05, 5 * SCALE_X, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );

    // Center dot
    elements.push(
      <mesh key="center-dot" position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );

    // Penalty areas (left)
    elements.push(
      <mesh key="penalty-left" position={[-halfW + 8 * SCALE_X, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 0, 0]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );

    // Goal areas - simplified as lines
    const penaltyW = 16 * SCALE_X;
    const penaltyH = 30 * SCALE_X;
    const goalW = 6 * SCALE_X;
    const goalH = 14 * SCALE_X;

    // Left penalty area outline
    const leftPenaltyPoints = [
      new THREE.Vector3(-halfW + 8 * SCALE_X, 0.02, -penaltyH / 2),
      new THREE.Vector3(-halfW + 8 * SCALE_X, 0.02, penaltyH / 2),
    ];

    // Right penalty area outline
    const rightPenaltyPoints = [
      new THREE.Vector3(halfW - 8 * SCALE_X, 0.02, -penaltyH / 2),
      new THREE.Vector3(halfW - 8 * SCALE_X, 0.02, penaltyH / 2),
    ];

    // Penalty area boxes - using thin boxes as lines
    // Left penalty area
    elements.push(
      <mesh key="left-penalty-top" position={[-halfW + 4 * SCALE_X, 0.02, -penaltyH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8 * SCALE_X, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="left-penalty-bottom" position={[-halfW + 4 * SCALE_X, 0.02, penaltyH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8 * SCALE_X, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="left-penalty-left" position={[-halfW, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[penaltyH, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="left-penalty-right" position={[-halfW + 8 * SCALE_X, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[penaltyH, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );

    // Right penalty area
    elements.push(
      <mesh key="right-penalty-top" position={[halfW - 4 * SCALE_X, 0.02, -penaltyH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8 * SCALE_X, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="right-penalty-bottom" position={[halfW - 4 * SCALE_X, 0.02, penaltyH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8 * SCALE_X, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="right-penalty-left" position={[halfW - 8 * SCALE_X, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[penaltyH, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="right-penalty-right" position={[halfW, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[penaltyH, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );

    // Goal areas
    elements.push(
      <mesh key="left-goal-top" position={[-halfW + 3 * SCALE_X, 0.02, -goalH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3 * SCALE_X, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="left-goal-bottom" position={[-halfW + 3 * SCALE_X, 0.02, goalH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3 * SCALE_X, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="left-goal-left" position={[-halfW, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[goalH, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="left-goal-right" position={[-halfW + 3 * SCALE_X, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[goalH, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );

    elements.push(
      <mesh key="right-goal-top" position={[halfW - 3 * SCALE_X, 0.02, -goalH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3 * SCALE_X, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="right-goal-bottom" position={[halfW - 3 * SCALE_X, 0.02, goalH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3 * SCALE_X, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="right-goal-left" position={[halfW - 3 * SCALE_X, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[goalH, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="right-goal-right" position={[halfW, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[goalH, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );

    // Field outline
    elements.push(
      <mesh key="outline-top" position={[0, 0.02, -halfH]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[fieldW, 0.15]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="outline-bottom" position={[0, 0.02, halfH]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[fieldW, 0.15]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="outline-left" position={[-halfW, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[fieldH, 0.15]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
    elements.push(
      <mesh key="outline-right" position={[halfW, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[fieldH, 0.15]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );

    return elements;
  }, []);

  return (
    <group>
      {/* Grass */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[FIELD_SIZE * SCALE_X, FIELD_SIZE * SCALE_Y]} />
        <meshStandardMaterial color="#3a9d5e" />
      </mesh>

      {/* Grass stripes */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={`stripe-${i}`}
          position={[-(FIELD_SIZE * SCALE_X) / 2 + (i * FIELD_SIZE * SCALE_X) / 10 + (FIELD_SIZE * SCALE_X) / 20, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[(FIELD_SIZE * SCALE_X) / 10, FIELD_SIZE * SCALE_Y]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#3a9d5e" : "#45b36d"} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Field lines */}
      {lines}

      {/* Goals */}
      <Goal position={[-(FIELD_SIZE * SCALE_X) / 2 - 0.5, 0, 0]} rotation={Math.PI / 2} />
      <Goal position={[(FIELD_SIZE * SCALE_X) / 2 + 0.5, 0, 0]} rotation={-Math.PI / 2} />
    </group>
  );
}

function Stadium() {
  const fieldW = FIELD_SIZE * SCALE_X;
  const fieldH = FIELD_SIZE * SCALE_Y;

  return (
    <group>
      {/* Ground plane */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[fieldW + 30, fieldH + 30]} />
        <meshStandardMaterial color="#2a2a3e" />
      </mesh>

      {/* Stands - left */}
      <mesh position={[-fieldW / 2 - 5, 1.5, 0]} rotation={[0, Math.PI / 6, 0]}>
        <boxGeometry args={[6, 3, fieldH + 10]} />
        <meshStandardMaterial color="#4b5563" transparent opacity={0.8} />
      </mesh>

      {/* Stands - right */}
      <mesh position={[fieldW / 2 + 5, 1.5, 0]} rotation={[0, -Math.PI / 6, 0]}>
        <boxGeometry args={[6, 3, fieldH + 10]} />
        <meshStandardMaterial color="#4b5563" transparent opacity={0.8} />
      </mesh>

      {/* Stands - top */}
      <mesh position={[0, 1.5, -fieldH / 2 - 5]} rotation={[Math.PI / 6, 0, 0]}>
        <boxGeometry args={[fieldW + 10, 3, 6]} />
        <meshStandardMaterial color="#4b5563" transparent opacity={0.8} />
      </mesh>

      {/* Stands - bottom */}
      <mesh position={[0, 1.5, fieldH / 2 + 5]} rotation={[-Math.PI / 6, 0, 0]}>
        <boxGeometry args={[fieldW + 10, 3, 6]} />
        <meshStandardMaterial color="#4b5563" transparent opacity={0.8} />
      </mesh>

      {/* Floodlights */}
      {[
        [-fieldW / 2 - 3, 0, -fieldH / 2 - 3],
        [fieldW / 2 + 3, 0, -fieldH / 2 - 3],
        [-fieldW / 2 - 3, 0, fieldH / 2 + 3],
        [fieldW / 2 + 3, 0, fieldH / 2 + 3],
      ].map((pos, i) => (
        <group key={`light-${i}`} position={pos as [number, number, number]}>
          <mesh position={[0, 6, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 12, 6]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
          <mesh position={[0, 12, 0]}>
            <boxGeometry args={[1, 0.5, 1]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
          </mesh>
          <pointLight position={[0, 11, 0]} intensity={1} distance={40} color="#ffffff" />
        </group>
      ))}
    </group>
  );
}

function CameraController({ selectedPlayerId, players }: { selectedPlayerId: string | null; players: Player3D[] }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!selectedPlayerId || !controlsRef.current) return;

    const player = players.find((p) => p.id === selectedPlayerId);
    if (!player) return;

    const worldX = toWorldX(player.x);
    const worldZ = toWorldZ(player.y);

    controlsRef.current.target.set(worldX, 1.5, worldZ);

    const angle = Math.PI / 4;
    const distance = 8;
    camera.position.set(
      worldX + Math.sin(angle) * distance,
      6,
      worldZ + Math.cos(angle) * distance
    );
    camera.lookAt(worldX, 1.5, worldZ);
    controlsRef.current.update();
  }, [selectedPlayerId, players, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={20}
      maxPolarAngle={Math.PI / 2.2}
      minPolarAngle={0.1}
      target={[0, 0, 0]}
    />
  );
}

export default function ThreeDView({
  players,
  ball,
  selectedPlayerId,
  width = 800,
  height = 500,
}: ThreeDViewProps) {
  return (
    <div style={{ width, height }} className="rounded-lg overflow-hidden border border-gray-600">
      <Canvas
        camera={{ position: [0, 10, 15], fov: 50 }}
        style={{ background: "#1a1a2e" }}
      >
        <ambientLight intensity={0.8} />
        <hemisphereLight args={["#ffffff", "#444444", 0.6]} />
        <directionalLight position={[10, 20, 10]} intensity={0.7} />
        <directionalLight position={[-10, 20, -10]} intensity={0.7} />
        <directionalLight position={[0, 15, -15]} intensity={0.5} />
        <directionalLight position={[0, 15, 15]} intensity={0.5} />
        <directionalLight position={[-15, 10, 0]} intensity={0.4} />
        <directionalLight position={[15, 10, 0]} intensity={0.4} />

        <Field />
        <Stadium />

        {players.map((p) => (
          <Stickman
            key={p.id}
            player={p}
            isSelected={p.id === selectedPlayerId}
          />
        ))}

        <Ball ball={ball} />

        <CameraController
          selectedPlayerId={selectedPlayerId}
          players={players}
        />
      </Canvas>
    </div>
  );
}
