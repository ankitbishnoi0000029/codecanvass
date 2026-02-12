"use client";
import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Code, Rocket, Zap, ArrowRight } from "lucide-react";

export default function WelcomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseVisible, setIsMouseVisible] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const heroRef = useRef<HTMLDivElement | null>(null); // ✅ Properly typed ref

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateWindowSize();

    // ✅ Properly typed mousemove handler
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();

      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (inside) {
        setMousePosition({ x: e.clientX, y: e.clientY });
        setIsMouseVisible(true);
      } else {
        setIsMouseVisible(false);
      }
    };

    const handleMouseLeave = () => setIsMouseVisible(false);

    window.addEventListener("resize", updateWindowSize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", updateWindowSize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-x-hidden">
      <main className="relative z-10 w-full">
        <div className="w-full">
          <div
            ref={heroRef}
            className="text-center min-h-[calc(100vh-120px)] flex flex-col justify-center relative overflow-hidden w-full py-8 sm:py-12 md:py-16"
          >
            {/* 🖱️ Mouse Tracker Circle */}
            {isMouseVisible && windowSize.width > 768 && (
              <>
                <div
                  className="fixed pointer-events-none z-50"
                  style={{
                    left: `${mousePosition.x}px`,
                    top: `${mousePosition.y}px`,
                    transform: "translate(-50%, -50%)",
                    width: "300px",
                    height: "300px",
                    background:
                      "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.1) 50%, transparent 70%)",
                    borderRadius: "50%",
                    transition: "all 0.3s ease-out",
                  }}
                />
                <div
                  className="fixed pointer-events-none z-50"
                  style={{
                    left: `${mousePosition.x}px`,
                    top: `${mousePosition.y}px`,
                    transform: "translate(-50%, -50%)",
                    width: "20px",
                    height: "20px",
                    border: "2px solid rgba(168, 85, 247, 0.5)",
                    borderRadius: "50%",
                    transition: "all 0.1s ease-out",
                  }}
                />
              </>
            )}

            {/* 🌈 Floating Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute w-80 h-80 bg-purple-400/30 rounded-full blur-3xl"
                style={{
                  top: "10%",
                  left: "5%",
                  animation: "float 15s ease-in-out infinite",
                }}
              />
              <div
                className="absolute w-96 h-96 bg-pink-400/30 rounded-full blur-3xl"
                style={{
                  bottom: "5%",
                  right: "5%",
                  animation: "float 20s ease-in-out infinite reverse",
                }}
              />
              <div
                className="absolute w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>

            {/* ✨ Hero Section */}
            <div className="relative z-10 px-4 sm:px-6 w-full max-w-7xl mx-auto">
              <div className="inline-block mb-3 sm:mb-4">
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-semibold">
                  ✨ Built for Developers
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight text-gray-800">
                <span className="inline-block animate-wave">👋</span> Welcome to
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  CodeBeauty
                </span>
              </h2>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 leading-relaxed">
                Empower your creativity — build, learn, and explore{" "}
                <span className="font-semibold text-purple-600">
                  powerful developer tools
                </span>{" "}
                with clean design and seamless experience.
              </p>

              {/* ⚡ Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <button className="group px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Try JSON Formatter
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 shadow-lg transform hover:-translate-y-1 transition-all flex items-center gap-2">
                  🖼️ Convert Image to Base64
                </button>
              </div>

              {/* 🚀 Floating Icons */}
              <div className="flex items-center justify-center gap-6 flex-wrap">
                {[Code, Rocket, Sparkles].map((Icon, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Icon
                      className={`w-7 h-7 ${
                        idx === 0
                          ? "text-purple-600"
                          : idx === 1
                          ? "text-pink-600"
                          : "text-blue-600"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 🌀 Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        .animate-wave {
          display: inline-block;
          animation: wave 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
