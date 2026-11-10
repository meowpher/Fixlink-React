"use client";

import React from "react";

export type RoomStatus = "normal" | "issue" | "in-progress" | "assigned";

export interface RoomPolygonProps {
  roomId: string;
  roomType: string;
  status?: RoomStatus;
  d?: string;
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  labelPath?: string;
  isSelected?: boolean;
  onSelect?: (roomId: string, roomType: string) => void;
}

export function RoomPolygon({
  roomId,
  roomType,
  status = "normal",
  d,
  x,
  y,
  width,
  height,
  labelPath,
  isSelected = false,
  onSelect,
}: RoomPolygonProps) {
  // Dynamic Tailwind styling matching the requested MIT-WPU dark mode aesthetic
  const getStatusClasses = (st: RoomStatus) => {
    switch (st) {
      case "issue":
        return "fill-red-500/20 stroke-red-500 animate-pulse hover:fill-red-500/30";
      case "in-progress":
        return "fill-amber-500/20 stroke-amber-500 hover:fill-amber-500/30";
      case "assigned":
        return "fill-blue-500/20 stroke-blue-500 hover:fill-blue-500/30";
      case "normal":
      default:
        return "fill-slate-800/40 stroke-slate-600 hover:fill-emerald-500/20 hover:stroke-emerald-400";
    }
  };

  const statusClasses = getStatusClasses(status);
  const selectedClasses = isSelected
    ? "stroke-cyan-400 stroke-[2.5] filter drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
    : "stroke-[1.2]";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(roomId, roomType);
  };

  return (
    <g
      id={`${roomId}_container`}
      className="cursor-pointer transition-all duration-200 group"
      onClick={handleClick}
    >
      {/* Geometry: Render path or rect */}
      {d ? (
        <path
          id={roomId}
          d={d}
          className={`transition-colors duration-200 ${statusClasses} ${selectedClasses}`}
        />
      ) : (
        <rect
          id={roomId}
          x={x}
          y={y}
          width={width}
          height={height}
          className={`transition-colors duration-200 ${statusClasses} ${selectedClasses}`}
        />
      )}

      {/* Room Label */}
      {labelPath && (
        <path
          id={`${roomId}_label`}
          d={labelPath}
          className="fill-slate-300 group-hover:fill-white pointer-events-none transition-colors select-none"
        />
      )}
    </g>
  );
}
