import React, { useEffect, useRef, useState, useMemo } from "react";

interface ScrollFramePlayerProps {
  scrollProgress: number; // 0 to 5 for the 6 scenes
  mouse: { x: number; y: number };
}

// Keyframes for the high-fidelity vector skeletal athlete (representing the 6 scenes)
// Coordinates are normalized from -1 to 1 (where 0,0 is center of the canvas area)
interface JointState {
  x: number;
  y: number;
}

interface SkeletonPose {
  head: JointState;
  chest: JointState;
  pelvis: JointState;
  lShoulder: JointState;
  lElbow: JointState;
  lHand: JointState;
  rShoulder: JointState;
  rElbow: JointState;
  rHand: JointState;
  lHip: JointState;
  lKnee: JointState;
  lFoot: JointState;
  rHip: JointState;
  rKnee: JointState;
  rFoot: JointState;
}

const POSES: SkeletonPose[] = [
  // Scene 1: FORGE YOUR LEGACY (Balanced, centered upright posture, open arms)
  {
    head: { x: 0, y: -0.55 },
    chest: { x: 0, y: -0.25 },
    pelvis: { x: 0, y: 0.15 },
    lShoulder: { x: -0.22, y: -0.25 },
    lElbow: { x: -0.38, y: -0.05 },
    lHand: { x: -0.32, y: 0.15 },
    rShoulder: { x: 0.22, y: -0.25 },
    rElbow: { x: 0.38, y: -0.05 },
    rHand: { x: 0.32, y: 0.15 },
    lHip: { x: -0.12, y: 0.22 },
    lKnee: { x: -0.15, y: 0.52 },
    lFoot: { x: -0.13, y: 0.82 },
    rHip: { x: 0.12, y: 0.22 },
    rKnee: { x: 0.15, y: 0.52 },
    rFoot: { x: 0.13, y: 0.82 },
  },
  // Scene 2: STRENGTH SPECTRUM (Shifted right, powerful flex crouch)
  {
    head: { x: 0.22, y: -0.42 },
    chest: { x: 0.18, y: -0.15 },
    pelvis: { x: 0.12, y: 0.25 },
    lShoulder: { x: -0.02, y: -0.12 },
    lElbow: { x: -0.12, y: 0.05 },
    lHand: { x: -0.02, y: -0.08 }, // flexed up
    rShoulder: { x: 0.36, y: -0.15 },
    rElbow: { x: 0.48, y: 0.05 },
    rHand: { x: 0.38, y: -0.08 }, // flexed up
    lHip: { x: -0.02, y: 0.32 },
    lKnee: { x: -0.12, y: 0.58 },
    lFoot: { x: -0.08, y: 0.85 },
    rHip: { x: 0.26, y: 0.32 },
    rKnee: { x: 0.38, y: 0.58 },
    rFoot: { x: 0.32, y: 0.85 },
  },
  // Scene 3: METRIC PRECISION (Standing on the right, arms folded in a thoughtful pose)
  {
    head: { x: 0.25, y: -0.55 },
    chest: { x: 0.2, y: -0.25 },
    pelvis: { x: 0.15, y: 0.15 },
    lShoulder: { x: 0.02, y: -0.25 },
    lElbow: { x: -0.08, y: -0.1 },
    lHand: { x: 0.05, y: -0.08 }, // crossed
    rShoulder: { x: 0.38, y: -0.25 },
    rElbow: { x: 0.45, y: -0.1 },
    rHand: { x: 0.3, y: -0.08 }, // crossed
    lHip: { x: 0.04, y: 0.22 },
    lKnee: { x: 0.02, y: 0.52 },
    lFoot: { x: 0.05, y: 0.82 },
    rHip: { x: 0.24, y: 0.22 },
    rKnee: { x: 0.26, y: 0.52 },
    rFoot: { x: 0.24, y: 0.82 },
  },
  // Scene 4: ATHLETIC SCIENCE (Deep athletic squat, centralized compression)
  {
    head: { x: -0.15, y: -0.18 },
    chest: { x: -0.15, y: 0.1 },
    pelvis: { x: -0.15, y: 0.4 },
    lShoulder: { x: -0.38, y: 0.1 },
    lElbow: { x: -0.48, y: 0.28 },
    lHand: { x: -0.38, y: 0.42 },
    rShoulder: { x: 0.08, y: 0.1 },
    rElbow: { x: 0.18, y: 0.28 },
    rHand: { x: 0.08, y: 0.42 },
    lHip: { x: -0.28, y: 0.46 },
    lKnee: { x: -0.44, y: 0.65 },
    lFoot: { x: -0.34, y: 0.85 },
    rHip: { x: -0.02, y: 0.46 },
    rKnee: { x: 0.14, y: 0.65 },
    rFoot: { x: 0.04, y: 0.85 },
  },
  // Scene 5: STATUS CHAMPIONS (Dynamic extension, elevated diagonal lean)
  {
    head: { x: 0.08, y: -0.6 },
    chest: { x: 0.04, y: -0.3 },
    pelvis: { x: 0.0, y: 0.1 },
    lShoulder: { x: -0.2, y: -0.3 },
    lElbow: { x: -0.35, y: -0.48 },
    lHand: { x: -0.3, y: -0.68 }, // reach high
    rShoulder: { x: 0.28, y: -0.3 },
    rElbow: { x: 0.42, y: -0.2 },
    rHand: { x: 0.38, y: -0.1 },
    lHip: { x: -0.12, y: 0.18 },
    lKnee: { x: -0.18, y: 0.48 },
    lFoot: { x: -0.16, y: 0.78 },
    rHip: { x: 0.12, y: 0.18 },
    rKnee: { x: 0.18, y: 0.48 },
    rFoot: { x: 0.16, y: 0.78 },
  },
  // Scene 6: BECOME IRONPULSE (Massive focal close-up, walking forward)
  {
    head: { x: 0, y: -0.85 },
    chest: { x: 0, y: -0.45 },
    pelvis: { x: 0, y: 0.15 },
    lShoulder: { x: -0.45, y: -0.45 },
    lElbow: { x: -0.58, y: -0.15 },
    lHand: { x: -0.52, y: 0.15 },
    rShoulder: { x: 0.45, y: -0.45 },
    rElbow: { x: 0.58, y: -0.15 },
    rHand: { x: 0.52, y: 0.15 },
    lHip: { x: -0.22, y: 0.25 },
    lKnee: { x: -0.25, y: 0.65 },
    lFoot: { x: -0.23, y: 1.05 },
    rHip: { x: 0.22, y: 0.25 },
    rKnee: { x: 0.25, y: 0.65 },
    rFoot: { x: 0.23, y: 1.05 },
  },
];

// Mouse-generated smoke particle interface
interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number; // 1.0 down to 0.0
  decay: number;
  color: string;
  angle: number;
  spin: number;
}

export default function ScrollFramePlayer({ scrollProgress, mouse }: ScrollFramePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const [hasAnyImages, setHasAnyImages] = useState(false);

  // Mouse trajectory tracking for smooth smoke generation
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const mouseVelRef = useRef({ x: 0, y: 0 });
  const smokeParticlesRef = useRef<SmokeParticle[]>([]);

  // 175 frames in total
  const TOTAL_FRAMES = 175;

  const scrollProgressRef = useRef(scrollProgress);
  const mouseRef = useRef(mouse);
  const hasAnyImagesRef = useRef(hasAnyImages);
  const lastRenderedImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    mouseRef.current = mouse;
  }, [mouse]);

  useEffect(() => {
    hasAnyImagesRef.current = hasAnyImages;
  }, [hasAnyImages]);

  // Helper to find the best loaded frame image so fast scrolling on mobile never stutters or drops frames
  const getBestFrameImage = (targetIdx: number): HTMLImageElement | null => {
    const primary = imagesRef.current[targetIdx];
    if (primary && primary.complete && primary.naturalWidth !== 0) {
      return primary;
    }
    // Search outward for closest loaded image
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = imagesRef.current[targetIdx - offset];
      if (prev && prev.complete && prev.naturalWidth !== 0) return prev;
      const next = imagesRef.current[targetIdx + offset];
      if (next && next.complete && next.naturalWidth !== 0) return next;
    }
    return lastRenderedImgRef.current;
  };

  // Initialize and preload the images sequence without triggering 175 React re-renders
  useEffect(() => {
    const frameIndexes = Array.from({ length: TOTAL_FRAMES }, (_, i) => i + 1);
    
    let loadedCount = 0;
    const images = frameIndexes.map((index) => {
      const img = new Image();
      const paddedIndex = String(index).padStart(3, "0");
      img.src = `/ezgif-frame-${paddedIndex}.jpg`;
      
      img.onload = () => {
        loadedCount++;
        if (loadedCount >= 5) {
          setHasAnyImages(true);
        }
      };

      img.onerror = () => {
        console.error(`Failed to load frame ${paddedIndex}`);
      };
      
      return img;
    });

    imagesRef.current = images;

    return () => {
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  // Soft interpolation for physical mouse tracking in canvas pixels
  const targetMousePixels = useRef({ x: 0, y: 0 });
  const currentMousePixels = useRef({ x: 0, y: 0 });

  // Poses interpolation helper
  const interpolateJoints = (prog: number): SkeletonPose => {
    const stage = Math.min(Math.max(prog, 0), 5);
    const baseIdx = Math.floor(stage);
    const nextIdx = Math.min(baseIdx + 1, 5);
    const ratio = stage - baseIdx;

    const basePose = POSES[baseIdx];
    const nextPose = POSES[nextIdx];

    const lerpJoint = (j1: JointState, j2: JointState): JointState => {
      return {
        x: j1.x + (j2.x - j1.x) * ratio,
        y: j1.y + (j2.y - j1.y) * ratio,
      };
    };

    return {
      head: lerpJoint(basePose.head, nextPose.head),
      chest: lerpJoint(basePose.chest, nextPose.chest),
      pelvis: lerpJoint(basePose.pelvis, nextPose.pelvis),
      lShoulder: lerpJoint(basePose.lShoulder, nextPose.lShoulder),
      lElbow: lerpJoint(basePose.lElbow, nextPose.lElbow),
      lHand: lerpJoint(basePose.lHand, nextPose.lHand),
      rShoulder: lerpJoint(basePose.rShoulder, nextPose.rShoulder),
      rElbow: lerpJoint(basePose.rElbow, nextPose.rElbow),
      rHand: lerpJoint(basePose.rHand, nextPose.rHand),
      lHip: lerpJoint(basePose.lHip, nextPose.lHip),
      lKnee: lerpJoint(basePose.lKnee, nextPose.lKnee),
      lFoot: lerpJoint(basePose.lFoot, nextPose.lFoot),
      rHip: lerpJoint(basePose.rHip, nextPose.rHip),
      rKnee: lerpJoint(basePose.rKnee, nextPose.rKnee),
      rFoot: lerpJoint(basePose.rFoot, nextPose.rFoot),
    };
  };

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      // Only resize canvas buffer if width changes or height changes significantly (> 80px),
      // preventing mobile browser URL bar collapse/expand from resetting canvas context during scroll!
      if (Math.abs(newW - width) > 5 || Math.abs(newH - height) > 80) {
        width = canvas.width = newW;
        height = canvas.height = newH;
      }
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      // Clear with elegant solid white to match full white background requirement
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // --- 1. MOUSE COORDINATES DAMPING & SMOKE GENERATION ---
      // Map normalized mouse (-1 to 1) to canvas pixels
      targetMousePixels.current = {
        x: (mouseRef.current.x + 1) * (width / 2),
        y: (mouseRef.current.y + 1) * (height / 2),
      };

      // Smooth lag for premium cinematic feel
      currentMousePixels.current.x += (targetMousePixels.current.x - currentMousePixels.current.x) * 0.15;
      currentMousePixels.current.y += (targetMousePixels.current.y - currentMousePixels.current.y) * 0.15;

      const mX = currentMousePixels.current.x;
      const mY = currentMousePixels.current.y;

      // Calculate mouse physical movement velocity
      const dX = mX - lastMousePosRef.current.x;
      const dY = mY - lastMousePosRef.current.y;
      mouseVelRef.current = { x: dX, y: dY };
      lastMousePosRef.current = { x: mX, y: mY };

      const speed = Math.sqrt(dX * dX + dY * dY);

      // Spawn smoke trail particles when dragging mouse
      if (speed > 1.2) {
        const numToSpawn = Math.min(4, Math.floor(speed * 0.2) + 1);
        for (let i = 0; i < numToSpawn; i++) {
          const ratio = i / numToSpawn;
          const px = mX - dX * ratio + (Math.random() - 0.5) * 8;
          const py = mY - dY * ratio + (Math.random() - 0.5) * 8;

          smokeParticlesRef.current.push({
            x: px,
            y: py,
            vx: dX * 0.12 + (Math.random() - 0.5) * 1.5,
            vy: dY * 0.12 - 0.8 - Math.random() * 1.2, // always drift upwards
            size: Math.random() * 18 + 12,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.025, // decays in ~40 to 80 frames
            color: Math.random() > 0.85 ? "#ff5500" : "#d4d4d8", // elegant premium warm grey / electric orange smoke
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.04,
          });
        }
      } else if (Math.random() < 0.08) {
        // Emit tiny ambient mist puffs when idle
        smokeParticlesRef.current.push({
          x: mX + (Math.random() - 0.5) * 12,
          y: mY + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.4 - Math.random() * 0.6,
          size: Math.random() * 10 + 6,
          life: 0.8,
          decay: 0.015 + Math.random() * 0.015,
          color: "#e4e4e7",
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.02,
        });
      }

      // --- 2. RENDER THE CURRENT VIDEO FRAME IMAGE ---
      // Map scrollProgress (0 to 4.0) smoothly to frame index (1 to 175) so that video ends exactly at Built for Champions
      const clampedProgress = Math.min(scrollProgressRef.current, 4.0);
      const targetFrameFloat = (clampedProgress / 4.0) * (TOTAL_FRAMES - 1);
      const frameIndex = Math.min(Math.max(Math.round(targetFrameFloat) + 1, 1), TOTAL_FRAMES);

      // On mobile views (width < 640), smoothly shift the frames/joints to the left (negative offset)
      // as the user scrolls past the first scene (Forge, scrollProgress = 0) towards the second scene (Strength, scrollProgress = 1).
      // This centers the right-half of the frame (where the athlete is positioned) perfectly behind the glass text card.
      const progressFactor = Math.min(Math.max(scrollProgressRef.current, 0), 1);
      const mobileOffsetX = width < 640 ? -progressFactor * (width * 0.35) : 0;

      let imageRendered = false;
      if (hasAnyImagesRef.current) {
        const img = getBestFrameImage(frameIndex - 1);
        if (img && img.complete && img.naturalWidth !== 0) {
          // Calculate cover scale centered safely to handle various aspect ratios perfectly
          const imgW = img.naturalWidth || img.width || width;
          const imgH = img.naturalHeight || img.height || height;
          const scale = Math.max(width / imgW, height / imgH);
          const drawW = imgW * scale;
          const drawH = imgH * scale;
          const drawX = (width - drawW) / 2;
          const drawY = (height - drawH) / 2;

          ctx.drawImage(img, drawX + mobileOffsetX, drawY, drawW, drawH);
          imageRendered = true;
          lastRenderedImgRef.current = img;
        }
      }

      // --- 3. RENDER THE HIGH-FIDELITY VECTOR ATHLETE (FALLBACK OR OVERLAY) ---
      // If the real frames didn't load, render the gorgeous interactive wireframe athlete!
      if (!imageRendered) {
        // Draw a premium technical coordinate grid background
        ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
        ctx.lineWidth = 1;
        const gridSize = 60;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw elegant concentric alignment rings behind the athlete
        ctx.strokeStyle = "rgba(255, 85, 0, 0.05)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(width / 2 + mobileOffsetX, height / 2, 280, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(0, 0, 0, 0.02)";
        ctx.beginPath();
        ctx.arc(width / 2 + mobileOffsetX, height / 2, 400, 0, Math.PI * 2);
        ctx.stroke();

        // Interpolate current posture joints
        const pose = interpolateJoints(clampedProgress);

        // Slow biological breathing cycle (continuous)
        const breatheCycle = Math.sin(Date.now() * 0.0016) * 0.02;

        // Apply a multiplier to fit joints within comfortable central bounds
        const scaleJoint = (j: JointState) => {
          // Adjust base scale according to screen width
          const baseScale = Math.min(width, height) * 0.45;
          const breatheFactor = j === pose.head || j === pose.chest ? breatheCycle : breatheCycle * 0.5;
          return {
            x: width / 2 + j.x * baseScale + mobileOffsetX,
            y: height / 2 + (j.y + breatheFactor) * baseScale,
          };
        };

        const head = scaleJoint(pose.head);
        const chest = scaleJoint(pose.chest);
        const pelvis = scaleJoint(pose.pelvis);
        const lShoulder = scaleJoint(pose.lShoulder);
        const lElbow = scaleJoint(pose.lElbow);
        const lHand = scaleJoint(pose.lHand);
        const rShoulder = scaleJoint(pose.rShoulder);
        const rElbow = scaleJoint(pose.rElbow);
        const rHand = scaleJoint(pose.rHand);
        const lHip = scaleJoint(pose.lHip);
        const lKnee = scaleJoint(pose.lKnee);
        const lFoot = scaleJoint(pose.lFoot);
        const rHip = scaleJoint(pose.rHip);
        const rKnee = scaleJoint(pose.rKnee);
        const rFoot = scaleJoint(pose.rFoot);

        // Connect the physical joints with crisp, dark-grey skeletal lines
        const drawSegment = (p1: { x: number; y: number }, p2: { x: number; y: number }, glow = false) => {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          if (glow) {
            ctx.strokeStyle = "rgba(255, 85, 0, 0.45)";
            ctx.lineWidth = 3.5;
            ctx.stroke();
            ctx.strokeStyle = "rgba(24, 24, 27, 0.95)";
            ctx.lineWidth = 1.5;
          } else {
            ctx.strokeStyle = "rgba(39, 39, 42, 0.7)";
            ctx.lineWidth = 1.5;
          }
          ctx.stroke();
        };

        // Torso Spine
        drawSegment(head, chest, true);
        drawSegment(chest, pelvis, true);

        // Arms
        drawSegment(chest, lShoulder);
        drawSegment(lShoulder, lElbow);
        drawSegment(lElbow, lHand);

        drawSegment(chest, rShoulder);
        drawSegment(rShoulder, rElbow);
        drawSegment(rElbow, rHand);

        // Legs
        drawSegment(pelvis, lHip);
        drawSegment(lHip, lKnee);
        drawSegment(lKnee, lFoot);

        drawSegment(pelvis, rHip);
        drawSegment(rHip, rKnee);
        drawSegment(rKnee, rFoot);

        // Draw muscle mass outline geometry (representing PBR muscle catching the light)
        const drawMuscleMass = (p1: { x: number; y: number }, p2: { x: number; y: number }, thickness = 28) => {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const nx = -dy / length;
          const ny = dx / length;

          const cx = p1.x + dx * 0.5;
          const cy = p1.y + dy * 0.5;

          // Draw double Bezier capsule
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(cx + nx * thickness, cy + ny * thickness, p2.x, p2.y);
          ctx.quadraticCurveTo(cx - nx * thickness, cy - ny * thickness, p1.x, p1.y);
          ctx.fillStyle = "rgba(0, 0, 0, 0.015)";
          ctx.fill();
          ctx.strokeStyle = "rgba(0, 0, 0, 0.04)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        };

        // Draw upper arm muscle profiles
        drawMuscleMass(lShoulder, lElbow, 20);
        drawMuscleMass(rShoulder, rElbow, 20);
        // Draw thigh muscle profiles
        drawMuscleMass(lHip, lKnee, 26);
        drawMuscleMass(rHip, rKnee, 26);

        // Render precision circular joints with a high-tech reticle look
        const drawJointNode = (pt: { x: number; y: number }, label: string, isAccent = false) => {
          // Pulse size based on continuous timeline
          const radiusPulse = Math.sin(Date.now() * 0.003 + pt.x * 0.05) * 1.5;

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, (isAccent ? 7.5 : 4.5) + radiusPulse, 0, Math.PI * 2);
          ctx.fillStyle = isAccent ? "#ff5500" : "#27272a";
          ctx.fill();

          // Outer reticle circle
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, (isAccent ? 16 : 10) + radiusPulse * 1.2, 0, Math.PI * 2);
          ctx.strokeStyle = isAccent ? "rgba(255, 85, 0, 0.35)" : "rgba(39, 39, 42, 0.18)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Label text
          ctx.fillStyle = "rgba(9, 9, 11, 0.35)";
          ctx.font = "bold 7px monospace";
          ctx.letterSpacing = "0.2em";
          ctx.fillText(label, pt.x + 15, pt.y + 3);
        };

        drawJointNode(head, "CRANIAL-01", true);
        drawJointNode(chest, "CORE-02", true);
        drawJointNode(lShoulder, "SCAPULAR-L");
        drawJointNode(rShoulder, "SCAPULAR-R");
        drawJointNode(lElbow, "CUBITAL-L");
        drawJointNode(rElbow, "CUBITAL-R");
        drawJointNode(lHand, "CARPAL-L");
        drawJointNode(rHand, "CARPAL-R");
        drawJointNode(pelvis, "PELVIS-03", true);
        drawJointNode(lKnee, "PATELLAR-L");
        drawJointNode(rKnee, "PATELLAR-R");

        // Overlay a glowing tech HUD around the active head node
        ctx.strokeStyle = "rgba(255, 85, 0, 0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 45, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(9, 9, 11, 0.7)";
        ctx.font = "bold 8px monospace";
        ctx.letterSpacing = "0.15em";
        ctx.fillText("BIOMECHANICAL ALIGNMENT // PERFECT", head.x - 90, head.y - 60);

        ctx.beginPath();
        ctx.moveTo(head.x - 90, head.y - 54);
        ctx.lineTo(head.x + 90, head.y - 54);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.stroke();
      }

      // --- 4. UPDATE AND DRAW SMOKE PARTICLES ---
      ctx.save();
      for (let i = smokeParticlesRef.current.length - 1; i >= 0; i--) {
        const p = smokeParticlesRef.current[i];
        p.life -= p.decay;

        if (p.life <= 0) {
          smokeParticlesRef.current.splice(i, 1);
          continue;
        }

        // Apply velocities and continuous air friction
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;

        // Apply light thermal float acceleration
        p.vy -= 0.05;

        // Spin puff
        p.angle += p.spin;

        // Billow outwards as life decreases
        const currentRadius = p.size * (1.0 + (1.0 - p.life) * 1.5);

        // Draw translucent smoke puff with premium soft radial gradient
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius);
        // Translucent colors depending on particle color
        const colorHex = p.color === "#ff5500" ? "255, 85, 0" : "113, 113, 122";
        grad.addColorStop(0, `rgba(${colorHex}, ${p.life * 0.15})`);
        grad.addColorStop(0.5, `rgba(${colorHex}, ${p.life * 0.06})`);
        grad.addColorStop(1, `rgba(${colorHex}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Fade out smoothly between scrollProgress 4.0 and 4.6 (approaching Become Ironpulse)
  const opacity = scrollProgress <= 4.0 
    ? 1 
    : Math.max(0, 1 - (scrollProgress - 4.0) * 1.66);

  return (
    <div 
      className="fixed inset-0 w-screen h-screen pointer-events-none select-none z-10 overflow-hidden"
      style={{ 
        opacity,
        visibility: opacity <= 0 ? "hidden" : "visible",
        transition: "opacity 0.1s ease-out, visibility 0.1s ease-out"
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-none"
      />
    </div>
  );
}
