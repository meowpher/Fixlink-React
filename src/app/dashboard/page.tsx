import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/auth/actions";
import { db } from "@/db";
import { rooms, assets, tickets } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import {
  Building2,
  Cpu,
  Ticket,
  PlusCircle,
  Layers,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const authData = await getCurrentUser();

  if (!authData || !authData.user) {
    redirect("/login");
  }

  const { profile } = authData;

  const [roomsCount] = await db.select({ value: count() }).from(rooms);
  const [assetsCount] = await db.select({ value: count() }).from(assets);
  const [openTicketsCount] = await db
    .select({ value: count() })
    .from(tickets)
    .where(eq(tickets.status, "open"));

  // Fetch rooms per floor for the Vyas Digital Twin preview
  const vyasRooms = await db.select().from(rooms);
  const floorMap = Array.from({ length: 8 }, (_, i) => ({
    floor: i,
    label: i === 0 ? "Ground (Level 0)" : `Level ${i}`,
    rooms: vyasRooms.filter((r) => r.floor === i),
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar userProfile={profile} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  MIT-WPU FixLink &bull; Level 0-7 Active Twin
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Welcome back, {profile?.fullName ?? "Colleague"}
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Interactive facility twin for the <span className="text-slate-200 font-medium">Vyas Building</span>. Real-time monitoring of classrooms, labs, equipment, and work orders.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/tickets/new"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Issue</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Live Facility KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Building Floors</span>
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">8 Levels</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Level 0 (Ground) to Level 7
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Mapped Spaces</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {roomsCount?.value ?? 33} Rooms
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Labs, Classes, Washrooms, Lounges
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Monitored Assets</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {assetsCount?.value ?? 12} Units
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              AC, Projectors, PCs, Lights, Benches
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Active Tickets</span>
              <Ticket className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {openTicketsCount?.value ?? 0} Open
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Zero-Trust RLS Protected
            </div>
          </div>
        </div>

        {/* Vyas Building Digital Twin - Floor Navigator */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                Vyas Building Architectural Twin (Levels 0 - 7)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select a floor to view mapped classrooms, computer labs, and IoT asset diagnostics.
              </p>
            </div>
            <Link
              href="/facilities"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition"
            >
              <span>Full Twin View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {floorMap.map((fl) => (
              <div
                key={fl.floor}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">
                    {fl.label}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                    {fl.rooms.length} spaces
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {fl.rooms.slice(0, 4).map((r) => (
                    <span
                      key={r.id}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono"
                    >
                      {r.roomNumber} ({r.type})
                    </span>
                  ))}
                  {fl.rooms.length > 4 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-500">
                      +{fl.rooms.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
