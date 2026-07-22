import React, { useEffect, useRef } from "react";

interface InteractiveCanvasProps {
  intensity?: number;
}

export default function InteractiveCanvas({ intensity = 1 }: InteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, px: -1000, py: -1000, vx: 0, vy: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      const m = mouseRef.current;
      m.vx = mx - m.x;
      m.vy = my - m.y;
      m.px = m.x;
      m.py = m.y;
      m.x = mx;
      m.y = my;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Particles array
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      life: number;
      maxLife: number;
      weight: number;
      speedY: number;
    }> = [];

    const spawnParticle = (force = false) => {
      const isEmber = Math.random() < 0.25;
      const size = isEmber ? Math.random() * 2.2 + 0.8 : Math.random() * 1.2 + 0.3;
      particles.push({
        x: Math.random() * width,
        y: force ? Math.random() * height : height + 10,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.5 - Math.random() * 0.8,
        size,
        color: isEmber 
          ? Math.random() > 0.5 ? "#ff5500" : "#ffaa00" 
          : "#ffffff",
        alpha: Math.random() * 0.5 + 0.2,
        life: 0,
        maxLife: Math.random() * 300 + 150,
        weight: Math.random() * 0.02 - 0.01,
        speedY: isEmber ? -0.8 - Math.random() * 1.2 : -0.3 - Math.random() * 0.5,
      });
    };

    // Pre-populate particles
    for (let i = 0; i < 80; i++) {
      spawnParticle(true);
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Create a subtle atmospheric vignette/lens glow around the cursor
      const m = mouseRef.current;
      if (m.x !== -1000) {
        const gradient = ctx.createRadialGradient(m.x, m.y, 10, m.x, m.y, 250);
        gradient.addColorStop(0, "rgba(255, 85, 0, 0.05)");
        gradient.addColorStop(0.5, "rgba(255, 170, 0, 0.01)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Max active particles
      if (particles.length < 130 * intensity) {
        spawnParticle();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        if (p.life >= p.maxLife || p.x < -10 || p.x > width + 10 || p.y < -10) {
          particles.splice(i, 1);
          continue;
        }

        // Apply mouse interaction (airflow)
        if (m.x !== -1000) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            const force = (150 - dist) / 150;
            // Push away gently
            p.vx += (dx / dist) * force * 0.35;
            p.vy += (dy / dist) * force * 0.35;

            // Swirl swirl effect if mouse is moving fast
            const speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
            if (speed > 1) {
              p.vx += (m.vx / speed) * force * 0.4;
              p.vy += (m.vy / speed) * force * 0.4;
            }
          }
        }

        // Apply velocities and drift
        p.vx += p.weight;
        p.vx *= 0.95; // Friction
        p.vy += p.speedY * 0.01;
        p.vy = Math.max(-3, Math.min(-0.2, p.vy)); // Terminal upwards velocity

        p.x += p.vx;
        p.y += p.vy;

        // Render particle
        ctx.save();
        ctx.globalAlpha = p.alpha * (1 - p.life / p.maxLife);
        ctx.shadowColor = p.color === "#ffffff" ? "transparent" : p.color;
        ctx.shadowBlur = p.color === "#ffffff" ? 0 : 6;
        
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 pointer-events-none opacity-85"
    />
  );
}
