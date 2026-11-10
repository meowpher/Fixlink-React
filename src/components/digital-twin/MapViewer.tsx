"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";

interface MapViewerProps {
  children: React.ReactNode;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  title?: string;
}

export function MapViewer({
  children,
  initialScale = 1.3,
  minScale = 0.5,
  maxScale = 4.0,
  title = "Vyas Digital Twin Map",
}: MapViewerProps) {
  const [scale, setScale] = useState(initialScale);
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for smooth drag and pan tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(Number((prev + 0.25).toFixed(2)), maxScale));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(Number((prev - 0.25).toFixed(2)), minScale));
  };

  const handleReset = () => {
    setScale(initialScale);
    x.set(0);
    y.set(0);
  };

  // Support wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.002;
      setScale((prev) =>
        Math.min(Math.max(Number((prev + delta).toFixed(2)), minScale), maxScale)
      );
    }
  };

  return (
    <div className="relative w-full h-[680px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl select-none flex flex-col">
      {/* Blueprint Grid Ambient Layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.12) 0%, transparent 70%),
            linear-gradient(to right, #1e293b 1px, transparent 1px),
            linear-gradient(to bottom, #1e293b 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 32px 32px, 32px 32px",
        }}
      />

      {/* Floating Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-lg pointer-events-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold text-white tracking-wide">
            {title}
          </span>
          <span className="text-[10px] font-mono text-slate-400 border-l border-slate-700 pl-2">
            Pan & Zoom Active
          </span>
        </div>

        {/* Zoom & Reset Toolbar */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-lg pointer-events-auto flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= minScale}
            title="Zoom Out (-)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-medium text-slate-300 px-2 min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= maxScale}
            title="Zoom In (+)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />

          <button
            type="button"
            onClick={handleReset}
            title="Reset View"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Instructions Pill */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl text-[11px] text-slate-400 shadow-md">
        <Move className="w-3.5 h-3.5 text-blue-400" />
        <span>Click & drag to pan &bull; Pinch or Ctrl + Scroll to zoom</span>
      </div>

      {/* Interactive Framer Motion Pan & Zoom Canvas */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
      >
        <motion.div
          drag
          dragConstraints={containerRef}
          dragElastic={0.08}
          dragMomentum={true}
          style={{ x, y }}
          animate={{ scale }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex items-center justify-center p-8 origin-center"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
