"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Rotate3d, MousePointer2, Maximize, RefreshCw } from "lucide-react";
import type { BlueprintLayer } from "@/types/api";
import {
  tierLayoutsTo3D,
  tierIndexForY,
  type TierConfig,
  type TierShape,
} from "@/lib/cakeLayout";

// --- Helper Utilities ---

function hexOrDefault(hex: string | undefined, fallback: string) {
  return hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : fallback;
}

// --- 3D Scene Components ---

function Tier3D({
  shape,
  radius,
  height,
  baseY,
  color,
}: {
  shape: TierShape;
  radius: number;
  height: number;
  baseY: number;
  color: string;
}) {
  return (
    <mesh position={[0, baseY + height / 2, 0]} castShadow receiveShadow>
      {shape === "round" ? (
        <cylinderGeometry args={[radius, radius, height, 48]} />
      ) : (
        <boxGeometry args={[radius * 1.7, height, radius * 1.7]} />
      )}
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

function Sticker({
  x,
  radius,
  baseY,
  height,
}: {
  x: number;
  radius: number;
  baseY: number;
  height: number;
}) {
  const angle = ((x - 0.5) * 140 * Math.PI) / 180;
  const px = Math.sin(angle) * (radius + 0.035); // Slight push out to avoid z-fighting
  const pz = Math.cos(angle) * (radius + 0.035);
  const py = baseY + height / 2;

  return (
    <mesh position={[px, py, pz]} rotation={[0, angle, 0]}>
      <circleGeometry args={[0.16, 24]} />
      <meshStandardMaterial
        color="#D4A537"
        side={THREE.DoubleSide}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

function Scene({
  layers,
  tiers,
  rotationY,
  autoRotate,
}: {
  layers: BlueprintLayer[];
  tiers: TierConfig[];
  rotationY: number;
  autoRotate: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  // 1. Calculate Geometry & Total Height
  const tiers3D = useMemo(() => tierLayoutsTo3D(tiers), [tiers]);

  // Calculate the absolute total height of the cake stack
  const totalHeight = useMemo(() => {
    if (tiers3D.length === 0) return 0;
    const lastTier = tiers3D[tiers3D.length - 1];
    return lastTier.baseY + lastTier.height;
  }, [tiers3D]);

  // 2. Prepare Colors & Stickers
  const tierColors = useMemo(
    () =>
      tiers.map((_, i) =>
        hexOrDefault(
          layers.find(
            (l): l is BlueprintLayer & { hex: string } =>
              l.type === "color_fill" && l.target === `tier_${i + 1}_body`,
          )?.hex,
          "#FFF3DE",
        ),
      ),
    [tiers, layers],
  );

  const stickers = useMemo(
    () =>
      layers.filter(
        (l): l is BlueprintLayer & { x: number; y: number } =>
          l.type === "sticker" &&
          typeof l.x === "number" &&
          typeof l.y === "number",
      ),
    [layers],
  );

  // 3. Animation Frame Loop
  useFrame((_, delta) => {
    if (!group.current) return;
    // Smooth damping for rotation could be added here, keeping it simple for now
    if (autoRotate) {
      group.current.rotation.y += delta * 0.4;
    } else {
      group.current.rotation.y = rotationY;
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#fff0d0" />

      {/* 
         CENTERING MAGIC:
         We offset the Y position by negative half of the total height.
         This keeps the visual center of the cake at the scene's (0,0,0).
      */}
      <group ref={group} position={[0, -totalHeight / 2, 0]}>
        {tiers3D.map((t, i) => (
          <Tier3D
            key={i}
            shape={t.shape}
            radius={t.radius}
            height={t.height}
            baseY={t.baseY}
            color={tierColors[i]}
          />
        ))}
        {stickers.map((s, i) => {
          const tierIndex = tierIndexForY(tiers, s.y);
          const t = tiers3D[tierIndex] ?? tiers3D[0];
          return (
            <Sticker
              key={i}
              x={s.x}
              radius={t.radius}
              baseY={t.baseY}
              height={t.height}
            />
          );
        })}
      </group>

      {/* Optional: Floor shadow catcher to ground the model visually */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -totalHeight / 2 - 0.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.15} />
      </mesh>
    </>
  );
}

// --- Main Export ---

export default function Cake3DPreview({
  layers,
  tiers,
}: {
  layers: BlueprintLayer[];
  tiers: TierConfig[];
}) {
  const [rotationY, setRotationY] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const dragging = useRef(false);
  const lastX = useRef(0);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    setAutoRotate(false);
    lastX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const deltaX = e.clientX - lastX.current;
    setRotationY((prev) => prev + deltaX * 0.015); // Slightly increased sensitivity
    lastX.current = e.clientX;
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden flex flex-col">
      {/* Toolbar / Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50/50">
        <div className="flex items-center gap-2 text-xs font-semibold text-cocoa/70">
          <Rotate3d className="w-4 h-4 text-berry" />
          <span>Live Viewport</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide transition-all ${autoRotate ? "bg-berry/10 text-berry" : "bg-stone-200 text-cocoa/40 hover:bg-stone-300"}`}
          >
            <RefreshCw
              className={`w-3 h-3 ${autoRotate ? "animate-spin-slow" : ""}`}
            />
            {autoRotate ? "Auto" : "Manual"}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative group bg-stone-100/50">
        <div
          className="h-[340px] w-full touch-none cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Increased FOV slightly to handle taller cakes better from fixed distance */}
          <Canvas camera={{ position: [0, 1.5, 6], fov: 45 }} shadows>
            {/* 
                Use 'preserveDrawingBuffer' if you ever need to take screenshots, 
                otherwise default settings are fine.
             */}
            <Scene
              layers={layers}
              tiers={tiers}
              rotationY={rotationY}
              autoRotate={autoRotate}
            />
          </Canvas>
        </div>

        {/* Floating Interaction Hint */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur shadow-sm border border-stone-200/50 text-xs font-medium text-cocoa transition-opacity duration-300 pointer-events-none ${dragging.current ? "opacity-0" : "opacity-70 group-hover:opacity-100"}`}
        >
          <MousePointer2 className="w-3.5 h-3.5" />
          <span>Drag to rotate</span>
        </div>
      </div>
    </div>
  );
}
