import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "shatter" | "done">("loading");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    // 0 to 100 Counter over 2 seconds
    const duration = 2000;
    const intervalTime = 30;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(prev + step, 100);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress === 100 && phase === "loading") {
      // Trigger shatter phase after loading completes
      setPhase("shatter");
      const doneTimer = setTimeout(() => {
        setPhase("done");
        onCompleteRef.current();
      }, 1000);
      return () => clearTimeout(doneTimer);
    }
  }, [progress]);

  // Particle assembly background canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particles array
    const particlesCount = 120;
    const particles: Array<{
      x: number;
      y: number;
      originX: number;
      originY: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
    }> = [];

    // Target logo zone (approx center)
    const logoX = width / 2;
    const logoY = height / 2 - 20;

    for (let i = 0; i < particlesCount; i++) {
      // Random starting positions
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 300 + 100;
      particles.push({
        x: logoX + Math.cos(angle) * distance,
        y: logoY + Math.sin(angle) * distance,
        originX: logoX + (Math.random() - 0.5) * 220,
        originY: logoY + (Math.random() - 0.5) * 60,
        vx: 0,
        vy: 0,
        radius: Math.random() * 2 + 0.5,
        color: i % 3 === 0 ? "#ff5500" : i % 3 === 1 ? "#ffaa00" : "#ffffff",
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    let frame = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(5, 5, 5, 0.2)";
      ctx.fillRect(0, 0, width, height);
      frame++;

      // Assemble logo particles
      particles.forEach((p) => {
        if (phase === "loading") {
          // Attract to origin (assemble logo)
          const dx = p.originX - p.x;
          const dy = p.originY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = Math.min(dist / 120, 3);
          p.vx += (dx / dist) * force * 0.08;
          p.vy += (dy / dist) * force * 0.08;
          p.vx *= 0.88;
          p.vy *= 0.88;
        } else if (phase === "shatter") {
          // Explode particles outward
          const dx = p.x - logoX;
          const dy = p.y - logoY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          p.vx = (dx / dist) * 18 + (Math.random() - 0.5) * 5;
          p.vy = (dy / dist) * 18 + (Math.random() - 0.5) * 5;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Render particle
        ctx.save();
        ctx.globalAlpha = phase === "shatter" ? Math.max(0, p.alpha - 0.02) : p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      });

      // Slowly drift background smoke
      ctx.fillStyle = "rgba(255, 85, 0, 0.005)";
      ctx.beginPath();
      ctx.arc(
        width / 2 + Math.sin(frame * 0.005) * 100,
        height / 2 + Math.cos(frame * 0.003) * 80,
        350,
        0,
        Math.PI * 2
      );
      ctx.fill();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <motion.div
      id="preloader-overlay"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.15 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] select-none transition-all duration-700 ${
        phase === "shatter" ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      {/* Particles Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Glowing sweeping line */}
      {phase === "loading" && (
        <motion.div
          id="glowing-sweep"
          initial={{ left: "-100%" }}
          animate={{ left: "100%" }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-orange-electric/10 to-transparent pointer-events-none"
        />
      )}

      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo container */}
        <motion.div
          id="preloader-logo-container"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold tracking-[0.25em] text-white uppercase font-sans">
              CULT<span className="text-orange-electric text-glow">.FIT</span>
            </span>
          </div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 font-mono mt-2">
            HIGH-PERFORMANCE SANCTUARY
          </p>
        </motion.div>

        {/* Percentage counter */}
        <div className="flex flex-col items-center">
          <span className="text-5xl font-bold font-mono tracking-tight text-white/90">
            {Math.floor(progress)}<span className="text-xs text-orange-electric ml-0.5">%</span>
          </span>

          {/* Loader line track */}
          <div className="w-48 h-[2px] bg-white/10 rounded-full mt-4 overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-electric to-amber-glow shadow-[0_0_10px_#ff5500]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 text-[9px] tracking-[0.3em] text-gray-600 font-mono uppercase">
        ESTABLISHED MMXXVI • SYSTEM INTEGRITY STABLE
      </div>
    </motion.div>
  );
}
