import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface TargetConfig {
  x: number; // percentage
  y: number; // percentage
  label: string;
  metric: string;
  value: string;
  status: string;
  color: string;
  details: string[];
}

const TARGETS: Record<number, TargetConfig> = {
  1: {
    x: 50,
    y: 15,
    label: "OCULAR ALIGNMENT",
    metric: "FOCAL STATE",
    value: "ENGAGED / EYE-LOCK",
    status: "LOCKED",
    color: "#ff5500",
    details: ["REFLEX: 120ms", "ALPHA WAVE: COHERENT", "INTENT: 98.4%"],
  },
  2: {
    x: 50,
    y: 35,
    label: "PULMONARY EXPANSION",
    metric: "BREATH RATE",
    value: "14 BPM (CONTROLLED)",
    status: "STABILIZED",
    color: "#ffaa00",
    details: ["O2 SAT: 99.2%", "DIAPHRAGM DEPTH: MAX", "LUNG CAP: 6.4L"],
  },
  3: {
    x: 48,
    y: 12,
    label: "CORTICAL SYNCHRONY",
    metric: "NEURAL COGNITION",
    value: "42 Hz (GAMMA ACCEL)",
    status: "OPTIMIZED",
    color: "#00d2ff",
    details: ["FOCUS DEPTH: 9.8/10", "DOPAMINE LEVEL: SUSTAINED", "STRESS CORTISOL: LOW"],
  },
  4: {
    x: 50,
    y: 45,
    label: "METABOLIC THERMOREGULATION",
    metric: "CORE TEMPERATURE",
    value: "37.2 °C (STEADY STATE)",
    status: "BALANCED",
    color: "#ffaa00",
    details: ["HYDRATION INDEX: 94%", "GLUCOSE RATE: SHIFTING", "DIGESTION EFFICIENCY: 97%"],
  },
  5: {
    x: 35,
    y: 25,
    label: "GLENOHUMERAL MOBILITY",
    metric: "SHOULDER SCAPULAR",
    value: "165° RANGE",
    status: "STRETCHED",
    color: "#ff5500",
    details: ["TRAPEZIUS LOAD: COMPLIANT", "TORQUE LEVEL: ZERO", "ALIGNMENT: BALANCED"],
  },
  6: {
    x: 48,
    y: 30,
    label: "CARDIAC CHRONOTROPY",
    metric: "HEART PULSE",
    value: "135 BPM (AEROBIC ZONE)",
    status: "PEAK RUNNING",
    color: "#ff5500",
    details: ["HRV: 92ms", "STROKE VOL: 145ml", "LACTATE DEP: 1.2 mmol/L"],
  },
  7: {
    x: 28,
    y: 52,
    label: "CARPAL APPARATUS STABILITY",
    metric: "WRIST STRAP REINFORCE",
    value: "TENSION: 450N",
    status: "ENFORCED",
    color: "#ffaa00",
    details: ["GRIP INTEGRITY: 100%", "PRONATION ANGLE: neutral", "TENDON SHEATH STRESS: LOW"],
  },
  8: {
    x: 53,
    y: 78,
    label: "KINETIC PATELLAR TORQUE",
    metric: "KNEE VECTOR",
    value: "120° FLEXION ANGLE",
    status: "KINETIC SHIELDED",
    color: "#00d2ff",
    details: ["QUADRICEP FORCE: 1800N", "HAMSTRING RATIO: 0.65", "JOINT CLEARANCE: OPTIMAL"],
  },
  9: {
    x: 50,
    y: 40,
    label: "EPIDERMAL INFLAMMATION SHIELD",
    metric: "CRYO CONTRAST REPAIR",
    value: "T-SKIN: -4 °C (THERMOGENIC)",
    status: "CRYO-ACTIVE",
    color: "#00d2ff",
    details: ["VASOCONSTRICTION: FULL", "NITRIC OXIDE: SPIKING", "INFLAMMATORY PATH: SUPPRESSED"],
  },
  10: {
    x: 50,
    y: 50,
    label: "TOTAL KINETIC INTEGRATION",
    metric: "BIO-MECHANICAL STATE",
    value: "PEAK OUTPUT ENGAGED",
    status: "SYNCHRONIZED",
    color: "#ff5500",
    details: ["TOTAL KINETIC ENERGY: 100%", "NEURAL RECRUIT: MAX", "OVERALL STRENGTH INDEX: ELITE"],
  },
};

interface BiometricHUDProps {
  activeChapter: number;
}

export default function BiometricHUD({ activeChapter }: BiometricHUDProps) {
  const [pulse, setPulse] = useState(false);
  const target = TARGETS[activeChapter] || TARGETS[1];

  // Subtle pulsing ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeChapter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Target Reticle */}
          <div
            className="absolute transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ left: `${target.x}%`, top: `${target.y}%` }}
          >
            {/* Pulsing Core Circle */}
            <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              {/* Outer rotating brackets */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="absolute w-14 h-14 border border-dashed rounded-full"
                style={{ borderColor: target.color, opacity: 0.4 }}
              />

              {/* Middle pulsing glow ring */}
              <motion.div
                animate={{ scale: pulse ? [1, 1.15, 1] : 1 }}
                transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
                className="absolute w-10 h-10 border rounded-full"
                style={{ borderColor: target.color, opacity: 0.6 }}
              />

              {/* Core solid reticle point */}
              <div
                className="w-3 h-3 rounded-full shadow-[0_0_12px_rgba(255,85,0,0.8)]"
                style={{ backgroundColor: target.color }}
              />

              {/* Scanning laser line sweeping */}
              <motion.div
                animate={{ top: ["-10px", "40px", "-10px"] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute left-1/2 -translate-x-1/2 w-10 h-[1px] opacity-75"
                style={{
                  background: `linear-gradient(90deg, transparent, ${target.color}, transparent)`,
                }}
              />

              {/* Vector connection HUD Line */}
              <svg className="absolute top-0 left-0 w-[240px] h-[160px] pointer-events-none overflow-visible">
                {/* Connection paths */}
                <motion.path
                  d="M 0 0 L 40 40 L 160 40"
                  fill="none"
                  stroke={target.color}
                  strokeWidth="1"
                  strokeDasharray="4 2"
                  opacity="0.6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6 }}
                />
              </svg>

              {/* Floating Data Window next to the reticle */}
              <motion.div
                initial={{ x: 30, y: 30, opacity: 0 }}
                animate={{ x: 45, y: 35, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="absolute flex flex-col p-2.5 rounded-sm border border-white/5 bg-black/75 backdrop-blur-md w-52 font-mono text-[9px] text-gray-400 gap-1"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                  <span className="font-bold text-white tracking-wide uppercase">{target.label}</span>
                  <span
                    className="px-1 text-[8px] font-bold rounded-xs tracking-wider animate-pulse uppercase"
                    style={{ backgroundColor: `${target.color}25`, color: target.color }}
                  >
                    {target.status}
                  </span>
                </div>

                {/* Main Metric */}
                <div className="flex justify-between items-center text-white">
                  <span>{target.metric}:</span>
                  <span className="font-bold" style={{ color: target.color }}>
                    {target.value}
                  </span>
                </div>

                {/* Sub Telemetry streams */}
                <div className="flex flex-col gap-0.5 border-t border-white/5 pt-1 mt-1 text-gray-500 text-[8px]">
                  {target.details.map((detail, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>• {detail.split(":")[0]}</span>
                      <span className="text-gray-300 font-semibold">
                        {detail.split(":")[1]}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Global biometric scanning scanlines overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/[0.01] to-transparent bg-[length:100%_4px] opacity-40 pointer-events-none" />
    </div>
  );
}
