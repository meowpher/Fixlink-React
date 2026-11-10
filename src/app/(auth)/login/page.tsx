"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "@/app/auth/actions";
import { LogIn, AlertCircle, ArrowRight, UserCheck } from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    label: "Super Admin",
    email: "taha.piplodwala@mitwpu.edu.in",
    desc: "Taha Mustafa",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
  },
  {
    label: "Faculty",
    email: "dipalee.borse@mitwpu.edu.in",
    desc: "Prof. Dipalee Borse",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  {
    label: "Student",
    email: "vedant.khedkar@mitwpu.edu.in",
    desc: "Vedant Khedkar",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    label: "Professional",
    email: "professional@mitwpu.edu.in",
    desc: "Ramesh Shinde (Facilities)",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("FixLink@MIT2026");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await signIn(null, formData);

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    }
  };

  const selectDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("FixLink@MIT2026");
    setError(null);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Sign In to FixLink
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Vyas Building Digital Twin &bull; MIT World Peace University
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Demo Role Switcher */}
      <div className="mb-6 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Quick Demo Selectors:</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => selectDemoAccount(acc.email)}
              className="text-left p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold text-slate-200">
                  {acc.label}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${acc.badge}`}
                >
                  MIT-WPU
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate mt-0.5">
                {acc.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            MIT-WPU Email Address
          </label>
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@mitwpu.edu.in"
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <span className="text-[11px] text-slate-500">
              Default: <code className="text-slate-400 font-mono">FixLink@MIT2026</code>
            </span>
          </div>
          <input
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Enter FixLink Portal</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
        >
          Register for Campus Access <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
