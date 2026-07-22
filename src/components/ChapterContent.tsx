import React, { useEffect, useState } from "react";
import { Chapter } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Shield, TrendingUp, Zap, Radio, ZapOff, RefreshCw, BarChart2 } from "lucide-react";

interface ChapterContentProps {
  chapter: Chapter;
  isActive: boolean;
}

export default function ChapterContent({ chapter, isActive }: ChapterContentProps) {
  const [pulse, setPulse] = useState(0);

  // Simple ticking timer for interactive charts
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setPulse((p) => (p + 1) % 100);
    }, 1500);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-16 px-6 md:px-12 xl:px-20 border-b border-white/5 relative">
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 max-w-xl"
          >
            {/* Chapter Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-orange-electric font-semibold tracking-[0.3em]">
                  CHAPTER {chapter.number}
                </span>
                <span className="h-[1px] w-8 bg-orange-electric/40" />
                <span className="font-mono text-[9px] text-gray-500 tracking-widest uppercase">
                  IRONPULSE LABS
                </span>
              </div>
              
              {/* Massive Reveal Title */}
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-sans uppercase">
                {chapter.title}
              </h2>
              
              <p className="text-[10px] md:text-xs text-amber-glow font-mono tracking-widest font-semibold uppercase mt-1">
                {chapter.subtitle}
              </p>
            </div>

            {/* Description Text with line height and spacing */}
            <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light">
              {chapter.description}
            </p>

            {/* Custom Interactive Dynamic Widgets depending on Chapter ID */}
            <div className="py-4">
              {chapter.id === 3 ? (
                /* Chapter 3: Performance Analytics - Real-time animated vector chart */
                <div className="glass-card p-4 rounded-md border border-white/5 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-orange-electric animate-pulse" />
                      KINETIC POWER CURVE (WATT)
                    </span>
                    <span className="text-gray-500">LIVE CHRONOLOGY</span>
                  </div>
                  
                  {/* Grid Graphic */}
                  <div className="h-28 relative flex items-end border-b border-l border-white/10">
                    <svg className="absolute inset-0 w-full h-full">
                      {/* Grid Background Lines */}
                      <line x1="0" y1="25%" x2="100%" y2="25%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="0" y1="75%" x2="100%" y2="75%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                      
                      {/* Animating Waveform */}
                      <motion.path
                        d={`M 0 80 Q 40 ${60 - Math.sin(pulse) * 20} 80 ${90 + Math.cos(pulse) * 10} T 160 ${40 + Math.sin(pulse) * 30} T 240 ${70 + Math.cos(pulse) * 15} T 320 ${50 - Math.sin(pulse) * 25} T 400 ${90}`}
                        fill="none"
                        stroke="url(#chart-glow)"
                        strokeWidth="2.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                      />
                      
                      {/* Gradients */}
                      <defs>
                        <linearGradient id="chart-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ff5500" />
                          <stop offset="100%" stopColor="#ffaa00" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Peak Dot indicator */}
                    <div className="absolute right-[40px] bottom-[65px] flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-orange-electric animate-ping" />
                      <span className="font-mono text-[9px] text-orange-electric bg-orange-electric/10 px-1 border border-orange-electric/20 rounded-xs">
                        984W PEAK
                      </span>
                    </div>
                  </div>
                  
                  {/* Small Metrics Row */}
                  <div className="flex justify-between font-mono text-[9px] text-gray-500 pt-1">
                    <span>X-AXIS: VELOCITY LOAD</span>
                    <span>Y-AXIS: TORQUE SPECTRUM</span>
                  </div>
                </div>
              ) : chapter.id === 8 ? (
                /* Chapter 8: Kinetic Assessment - Dynamic Muscle Balance/Torque Circle Diagram */
                <div className="glass-card p-4 rounded-md border border-white/5 flex items-center gap-5 relative overflow-hidden">
                  <div className="relative w-20 h-20 flex items-center justify-center border border-white/5 rounded-full">
                    {/* Rotating alignment gauge */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      className="absolute inset-0.5 border border-dashed border-orange-electric/40 rounded-full"
                    />
                    {/* Inner secure lock */}
                    <div className="w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-amber-glow animate-pulse" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <span className="font-mono text-[9px] text-orange-electric uppercase tracking-widest block font-bold">
                      FORCE SYMMETRY PROFILE
                    </span>
                    <p className="text-xs text-white font-semibold">99.1% BILATERAL COHERENCE</p>
                    <p className="text-[10px] text-gray-400">
                      Concentric quad force perfectly matched. Zero knee displacement detected on deep squat vector.
                    </p>
                  </div>
                </div>
              ) : chapter.id === 7 ? (
                /* Chapter 7: Advanced Biometrics - Simulated Heart rate ticker */
                <div className="glass-card p-4 rounded-md border border-white/5 space-y-3">
                  <div className="flex justify-between items-center font-mono text-[9px]">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-orange-electric animate-pulse" />
                      SUB-DERMAL AUTONOMIC STREAM
                    </span>
                    <span className="text-green-500 tracking-wider">ACTIVE SIGNAL</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold font-mono text-white flex items-baseline">
                      132
                      <span className="text-xs text-orange-electric ml-1 uppercase font-semibold">BPM</span>
                    </div>

                    <div className="flex-1 h-5 bg-white/[0.02] rounded-sm relative overflow-hidden border border-white/5 flex items-center">
                      {/* Pulse graph line overlay */}
                      <svg className="absolute inset-0 w-full h-full">
                        <path
                          d="M 0 10 L 20 10 L 25 2 L 30 18 L 35 10 L 60 10 L 65 10 L 70 2 L 75 18 L 80 10 L 120 10 L 125 2 L 130 18 L 135 10 L 180 10"
                          fill="none"
                          stroke="#ff5500"
                          strokeWidth="1.5"
                          strokeDasharray="240"
                          className="animate-[dash_2.5s_linear_infinite]"
                          style={{
                            strokeDashoffset: 240,
                          }}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                /* Default Chapter Metrics Grid */
                <div className="grid grid-cols-2 gap-4">
                  {chapter.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="glass-card p-3 rounded-md border border-white/5 space-y-1 hover:border-orange-electric/20 transition-colors"
                    >
                      <span className="block font-mono text-[9px] text-gray-500 uppercase tracking-widest font-semibold">
                        {metric.label}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg md:text-xl font-semibold font-sans tracking-tight text-white uppercase">
                          {metric.value}
                        </span>
                        {metric.trend && (
                          <span
                            className={`text-[9px] font-mono font-bold ${
                              metric.trend === "up" ? "text-green-500" : "text-amber-glow"
                            }`}
                          >
                            {metric.trend === "up" ? "▲" : "■"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Premium Interactive Action CTA Button with magnetic and glowing effects */}
            <div className="pt-2">
              <motion.button
                id={`cta-btn-${chapter.id}`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3.5 bg-white text-black font-semibold text-xs tracking-widest font-mono uppercase transition-all flex items-center gap-2 group cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.08)] glow-btn-orange"
              >
                <span>{chapter.cta}</span>
                <span className="group-hover:translate-x-1.5 transition-transform duration-300">
                  →
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
