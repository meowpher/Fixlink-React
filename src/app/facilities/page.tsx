"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { MapViewer } from "@/components/digital-twin/MapViewer";
import { Floor1 } from "@/components/digital-twin/floors/Floor1";
import { RoomStatus } from "@/components/digital-twin/RoomPolygon";
import {
  Building2,
  Wrench,
  Radio,
  Cpu,
} from "lucide-react";

const INITIAL_STATUSES: Record<string, RoomStatus> = {
  VY101: "normal",
  VY102: "issue", // Test pulse
  VY103: "normal",
  VY104: "in-progress", // Technician working
  VY114: "normal",
  VY115: "assigned", // Work order assigned
  VY124: "normal",
  VY126: "normal",
  VY127: "in-progress",
  VY128: "normal",
  VY129: "issue",
  VY113: "normal",
  VY112: "normal",
  VY123: "normal",
  VY111: "normal",
  VY117: "normal",
  VY119: "normal",
  VY118: "normal",
  VY116: "normal",
  VY120: "normal",
  VY110: "normal",
  lift_1: "normal",
  lift_2: "normal",
  lift_3: "normal",
  lift_4: "normal",
  lift_5: "normal",
  lift_6: "normal",
  lift_7: "normal",
  lift_8: "normal",
};

export default function FacilitiesPage() {
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [statuses, setStatuses] = useState<Record<string, RoomStatus>>(INITIAL_STATUSES);
  const [selectedRoom, setSelectedRoom] = useState<{ id: string; type: string } | null>({
    id: "VY102",
    type: "class",
  });

  const handleSelectRoom = (id: string, type: string) => {
    setSelectedRoom({ id, type });
  };

  const toggleRoomStatus = (newStatus: RoomStatus) => {
    if (!selectedRoom) return;
    setStatuses((prev) => ({
      ...prev,
      [selectedRoom.id]: newStatus,
    }));
  };

  const floors = [
    { num: 0, label: "Level 0 (Ground)" },
    { num: 1, label: "Level 1 (Active)" },
    { num: 2, label: "Level 2" },
    { num: 3, label: "Level 3" },
    { num: 4, label: "Level 4" },
    { num: 5, label: "Level 5" },
    { num: 6, label: "Level 6" },
    { num: 7, label: "Level 7" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header & Floor Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Interactive Digital Twin
              </span>
              <span className="text-xs text-slate-400">
                MIT-WPU Vyas Building &bull; 8 Floors
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Floor Plan & Asset Diagnostics
            </h1>
          </div>

          {/* Level Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {floors.map((fl) => (
              <button
                key={fl.num}
                type="button"
                onClick={() => setActiveFloor(fl.num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  activeFloor === fl.num
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {fl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>Telemetry Status Legend:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-800/60 border border-slate-600" />
              <span className="text-slate-300">Normal / Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-500/20 border border-red-500 animate-pulse" />
              <span className="text-red-300 font-medium">Active Issue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500" />
              <span className="text-amber-300">In-Progress Work</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500" />
              <span className="text-blue-300">Technician Assigned</span>
            </div>
          </div>
        </div>

        {/* Map Canvas & Room Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Main Map Viewer Canvas (3 Columns) */}
          <div className="lg:col-span-3">
            {activeFloor === 1 ? (
              <MapViewer
                title="Vyas Building &bull; Level 1 Floor Plan"
                initialScale={1.25}
              >
                <Floor1
                  roomStatusMap={statuses}
                  selectedRoomId={selectedRoom?.id}
                  onSelectRoom={handleSelectRoom}
                />
              </MapViewer>
            ) : (
              <div className="h-[680px] rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <Building2 className="w-12 h-12 text-slate-600" />
                <h3 className="text-lg font-bold text-white">
                  Level {activeFloor} Digital Twin Model
                </h3>
                <p className="text-sm text-slate-400 max-w-md">
                  Floor 1 is currently active for interactive testing. Floors 0, 2, 3, 4, 5, 6, and 7 SVG maps will be linked sequentially in the next phase.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveFloor(1)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
                >
                  Return to Level 1 Interactive Map
                </button>
              </div>
            )}
          </div>

          {/* Interactive Room Inspector Drawer (1 Column) */}
          <div className="lg:col-span-1 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Space Telemetry</span>
                <span className="font-mono text-blue-400">Level 1</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>{selectedRoom ? selectedRoom.id : "Select a Room"}</span>
                {selectedRoom && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                    {selectedRoom.type}
                  </span>
                )}
              </h2>
            </div>

            {selectedRoom ? (
              <>
                {/* Live Status Switcher (for user testing) */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">
                    Live Status Simulation:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { id: "normal", label: "Normal", color: "hover:border-slate-500" },
                        { id: "issue", label: "Issue", color: "hover:border-red-500" },
                        { id: "in-progress", label: "In-Progress", color: "hover:border-amber-500" },
                        { id: "assigned", label: "Assigned", color: "hover:border-blue-500" },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => toggleRoomStatus(st.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition text-left ${
                          statuses[selectedRoom.id] === st.id
                            ? "bg-slate-800 text-white border-blue-500 ring-1 ring-blue-500"
                            : `bg-slate-950 text-slate-400 border-slate-800 ${st.color}`
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Click any status above to see the polygon update dynamically on the SVG map!
                  </p>
                </div>

                {/* Sample Equipment in Room */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      IoT Equipment:
                    </span>
                    <span className="text-[10px] text-slate-500">Vyas Asset Tag</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          {selectedRoom.id === "VY102" ? "AC-SOUTH (Split 2.0T)" : "Ceiling Light Row A"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {selectedRoom.id === "VY102" ? "Daikin Inverter &bull; Degraded" : "Philips LED 40W"}
                        </div>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono border ${
                          selectedRoom.id === "VY102"
                            ? "bg-red-500/20 text-red-300 border-red-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {selectedRoom.id === "VY102" ? "Fault" : "OK"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          Classroom Projector 4K
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Epson Laser &bull; PRJ-VY102-01
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        OK
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action */}
                <div className="pt-2">
                  <a
                    href={`/tickets/new?roomId=${selectedRoom.id}`}
                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Report Issue in {selectedRoom.id}</span>
                  </a>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Click any classroom, lab, or washroom on the floor map to inspect details.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
