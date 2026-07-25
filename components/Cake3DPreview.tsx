"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BlueprintLayer } from "@/types/api";
import {
  tierLayoutsTo3D,
  tierIndexForY,
  type TierConfig,
  type TierShape,
} from "@/lib/cakeLayout";

function hexOrDefault(hex: string | undefined, fallback: string) {
  return hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : fallback;
}

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
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
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
  // Approximation, not true surface decaling: maps normalized canvas x
  // (0-1) onto a front-facing 140-degree arc around the tier. Good
  // enough for a preview; wrapping a sticker properly onto a curved
  // surface (UV-mapped decals) is a separate, bigger project.
  const angle = ((x - 0.5) * 140 * Math.PI) / 180;
  const px = Math.sin(angle) * (radius + 0.03);
  const pz = Math.cos(angle) * (radius + 0.03);
  const py = baseY + height / 2;

  return (
    <mesh position={[px, py, pz]} rotation={[0, angle, 0]}>
      <circleGeometry args={[0.16, 24]} />
      <meshStandardMaterial color="#D4A537" side={THREE.DoubleSide} />
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

  useFrame((_, delta) => {
    if (!group.current) return;
    if (autoRotate) {
      group.current.rotation.y += delta * 0.4;
    } else {
      group.current.rotation.y = rotationY;
    }
  });

  const tiers3D = tierLayoutsTo3D(tiers);

  const tierColors = tiers.map((_, i) =>
    hexOrDefault(
      layers.find(
        (l): l is BlueprintLayer & { hex: string } =>
          l.type === "color_fill" && l.target === `tier_${i + 1}_body`,
      )?.hex,
      "#FFF3DE",
    ),
  );

  const stickers = layers.filter(
    (l): l is BlueprintLayer & { x: number; y: number } =>
      l.type === "sticker" &&
      typeof l.x === "number" &&
      typeof l.y === "number",
  );

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 2]} intensity={0.9} castShadow />
      <group ref={group}>
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
    </>
  );
}

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
    setRotationY((prev) => prev + deltaX * 0.01);
    lastX.current = e.clientX;
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div className="rounded-2xl bg-cocoa/5 overflow-hidden">
      <div
        style={{ height: 320, touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <Canvas camera={{ position: [0, 2.4, 5.5], fov: 40 }} shadows>
          <Scene
            layers={layers}
            tiers={tiers}
            rotationY={rotationY}
            autoRotate={autoRotate}
          />
        </Canvas>
      </div>
      <p className="text-center text-xs text-cocoa/40 py-2">Drag to rotate</p>
    </div>
  );
}
