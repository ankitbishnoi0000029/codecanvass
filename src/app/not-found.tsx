"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  

  const progress = ((5 - countdown) / 5) * 100;

  return (
    <div className="relative min-h-screen bg-[#030303] flex items-center justify-center overflow-hidden">

      {/* Ambient orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-red-600 opacity-10 blur-[100px] animate-pulse" />
      <div className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-orange-500 opacity-10 blur-[100px] animate-pulse" />

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,60,60,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,60,60,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_#030303_80%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">

        {/* Label */}
        <p
          className="font-mono text-xs tracking-[0.3em] text-red-500 uppercase mb-6"
          style={{ animation: "fadeUp 0.6s 0.2s both" }}
        >
          ⚠ &nbsp; Page not found
        </p>

        {/* 404 glitch block */}
        <div className="relative select-none mb-4">
          {/* Base ghost */}
          <span
            className="block font-black leading-none text-[clamp(7rem,20vw,15rem)]"
            style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.06)" }}
          >
            404
          </span>

          {/* White top half */}
          <span
            aria-hidden
            className={`absolute inset-0 block font-black leading-none text-[clamp(7rem,20vw,15rem)] text-white/90 transition-transform duration-75 ${
              glitch ? "translate-x-[4px]" : ""
            }`}
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
          >
            404
          </span>

          {/* Red bottom half */}
          <span
            aria-hidden
            className={`absolute inset-0 block font-black leading-none text-[clamp(7rem,20vw,15rem)] text-red-500 transition-transform duration-75 ${
              glitch ? "-translate-x-[6px] translate-y-[2px]" : "translate-x-[2px]"
            }`}
            style={{
              clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
              mixBlendMode: "screen",
            }}
          >
            404
          </span>
        </div>

        {/* Divider */}
        <div
          className="w-20 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent mb-8"
          style={{ animation: "fadeUp 0.6s 0.6s both" }}
        />

        {/* Message */}
        <p
          className="text-white/40 text-base tracking-wide mb-10"
          style={{ animation: "fadeUp 0.6s 0.7s both" }}
        >
          The page you&apos;re looking for has{" "}
          <span className="text-white/75">vanished into the void.</span>
        </p>

        {/* Countdown + progress bar */}
        <div
          className="flex items-center gap-4 mb-8"
          style={{ animation: "fadeUp 0.6s 0.9s both" }}
        >
          <div className="w-40 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-[0.7rem] tracking-widest text-white/30 whitespace-nowrap">
            Redirecting in{" "}
            <strong className="text-red-500">{countdown}s</strong>
          </span>
        </div>

        {/* Home button */}
        <a
          href="/"
          className="group inline-flex items-center gap-2 px-8 py-3 border border-white/10 font-mono text-xs tracking-[0.15em] uppercase text-white/60 hover:text-white hover:border-red-500/50 bg-transparent hover:bg-red-500/10 transition-all duration-300"
          style={{ animation: "fadeUp 0.6s 1.1s both" }}
        >
          Back to Home
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </a>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}