"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import {
  Wrench,
  Building2,
  Ticket,
  Cpu,
  LogOut,
  Shield,
  GraduationCap,
  Briefcase,
  Layers,
} from "lucide-react";

interface NavbarProps {
  userProfile?: {
    id: string;
    email: string;
    fullName: string;
    role: "student" | "faculty" | "admin" | "professional" | "super_admin";
    department?: string | null;
  } | null;
}

export function Navbar({ userProfile }: NavbarProps) {
  const pathname = usePathname();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "super_admin":
        return {
          label: "Super Admin",
          color: "bg-red-500/10 text-red-400 border-red-500/30",
          icon: Shield,
        };
      case "admin":
        return {
          label: "Admin",
          color: "bg-orange-500/10 text-orange-400 border-orange-500/30",
          icon: Shield,
        };
      case "faculty":
        return {
          label: "Faculty",
          color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          icon: Briefcase,
        };
      case "professional":
        return {
          label: "Professional",
          color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: Wrench,
        };
      default:
        return {
          label: "Student",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: GraduationCap,
        };
    }
  };

  const roleInfo = getRoleBadge(userProfile?.role);
  const RoleIcon = roleInfo.icon;

  const navLinks = [
    { href: "/dashboard", label: "Overview", icon: Layers },
    { href: "/tickets", label: "Tickets", icon: Ticket },
    { href: "/assets", label: "Assets", icon: Cpu },
    { href: "/facilities", label: "Vyas Twin (8 Floors)", icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
                FixLink
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Vyas MIT-WPU
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                Digital Twin Facility
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {userProfile && (
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                      isActive
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* User Session Info / Controls */}
        <div className="flex items-center gap-3">
          {userProfile ? (
            <>
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-semibold text-white">
                  {userProfile.fullName}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded border flex items-center gap-1 ${roleInfo.color}`}
                  >
                    <RoleIcon className="w-2.5 h-2.5" />
                    {roleInfo.label}
                  </span>
                  {userProfile.department && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      &bull; {userProfile.department}
                    </span>
                  )}
                </div>
              </div>

              <form action={signOut}>
                <button
                  type="submit"
                  title="Sign Out"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-red-400 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
