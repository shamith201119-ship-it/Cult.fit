import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, Shield, ChevronDown, ArrowRight } from "lucide-react";
import Preloader from "./components/Preloader";
import ScrollFramePlayer from "./components/ScrollFramePlayer";
import CultBranchesMap from "./components/CultBranchesMap";

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothScrollProgress, setSmoothScrollProgress] = useState(0);
  const targetScrollProgressRef = useRef(0);
  
  // Membership form state
  const [email, setEmail] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Audio state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{
    osc1: OscillatorNode;
    osc2: OscillatorNode;
    gain: GainNode;
    filter: BiquadFilterNode;
  } | null>(null);

  // Track mouse coordinates for subtle cursor-influenced atmospheric effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2); // -1 to 1
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2); // -1 to 1
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Soft inertia scroll tracking for butter-smooth Awwwards transitions
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = document.documentElement.clientHeight || window.innerHeight || 1;
      // 6 scenes total = scroll distance of 500vh
      targetScrollProgressRef.current = Math.min(Math.max(scrollY / vh, 0), 5.0);
    };

    let animId: number;
    const update = () => {
      setSmoothScrollProgress((prev) => {
        const diff = targetScrollProgressRef.current - prev;
        const absDiff = Math.abs(diff);
        if (absDiff < 0.0001) {
          if (prev === targetScrollProgressRef.current) return prev;
          return targetScrollProgressRef.current;
        }
        // Adaptive inertia factor: on mobile screens (width < 640), speed up drastically (0.28+)
        // so touch scrolling responds instantly and never feels stuck or lagging behind!
        const isMobile = window.innerWidth < 640;
        const baseFactor = isMobile ? 0.28 : 0.12;
        const factor = baseFactor + Math.min(absDiff * 0.2, 0.4);
        return prev + diff * factor;
      });
      animId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Also trigger on touchmove to ensure instantaneous feedback on mobile
    window.addEventListener("touchmove", handleScroll, { passive: true });
    animId = requestAnimationFrame(update);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Safe Web Audio API synthesizer for an immersive low-frequency cinematic ambient pulse
  const toggleAudio = () => {
    if (isAudioPlaying) {
      // Fade out and stop
      if (synthNodesRef.current) {
        const { gain } = synthNodesRef.current;
        if (audioCtxRef.current) {
          gain.gain.setValueAtTime(gain.gain.value, audioCtxRef.current.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 1.2);
          setTimeout(() => {
            try {
              synthNodesRef.current?.osc1.stop();
              synthNodesRef.current?.osc2.stop();
              audioCtxRef.current?.close();
            } catch (e) {
              console.warn("Audio stop error:", e);
            }
            synthNodesRef.current = null;
            audioCtxRef.current = null;
          }, 1300);
        }
      }
      setIsAudioPlaying(false);
    } else {
      // Initialize premium analog synth drone
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Sub-bass sine wave (55Hz - A1)
        const osc1 = ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.value = 55;

        // Warm triangle wave slightly detuned for stereo chorus width (110.3Hz)
        const osc2 = ctx.createOscillator();
        osc2.type = "triangle";
        osc2.frequency.value = 110.3;

        // Biquad filter to cut high frequencies and make it deep & cinematic
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 150;
        filter.Q.value = 1.0;

        // Subdued ambient volume
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.5); // safe volume

        // Connect nodes
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        // Slow cinematic modulation (LFO) to filter frequency to simulate breathing rhythm
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.22; // 0.22Hz (similar to 4.5s breathe cycle)
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 35; // modulate filter by 35Hz

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        osc1.start();
        osc2.start();
        lfo.start();

        synthNodesRef.current = { osc1, osc2, gain, filter };
        setIsAudioPlaying(true);
      } catch (e) {
        console.error("Web Audio failed to start:", e);
      }
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (synthNodesRef.current && audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  // Scene elements calculation helpers
  const getSceneOpacity = (sceneIndex: number, progress: number) => {
    const dist = Math.abs(progress - sceneIndex);
    if (dist < 0.25) return 1;
    if (dist > 0.75) return 0;
    return 1 - (dist - 0.25) / 0.5;
  };

  const getSceneTranslationY = (sceneIndex: number, progress: number) => {
    const dist = progress - sceneIndex;
    return dist * -60; // parallax vertical slide
  };

  const scrollToScene = (index: number) => {
    window.scrollTo({
      top: index * window.innerHeight,
      behavior: "smooth",
    });
  };

  const currentDiscreteScene = Math.min(Math.max(Math.round(smoothScrollProgress), 0), 5);

  return (
    <div className="relative min-h-[600vh] bg-white text-zinc-950 selection:bg-orange-electric selection:text-white font-sans overflow-x-hidden transition-colors duration-500">
      {/* 1. Preloader */}
      <AnimatePresence>
        {!loaded && (
          <Preloader onComplete={() => setLoaded(true)} />
        )}
      </AnimatePresence>

      {/* 2. Real-time 3D Scroll Video Frame / Skeletal Athlete Canvas Layer */}
      <ScrollFramePlayer
        scrollProgress={smoothScrollProgress}
        mouse={mousePosition}
      />

      {/* 3. Global Minimal Navigation - Permanent once loaded for absolute minimalism */}
      <AnimatePresence>
        {loaded && (
          <motion.header
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-6 pointer-events-auto"
          >
            {/* Minimal Logo */}
            <button
              onClick={() => scrollToScene(0)}
              className="flex items-center gap-2 tracking-[0.3em] text-zinc-950 uppercase font-bold text-xs font-sans"
            >
              CULT<span className="text-orange-electric">.FIT</span>
            </button>

            {/* Right Controls */}
            <div className="flex items-center gap-6">
              {/* Cinematic Sound Toggle */}
              <button
                onClick={toggleAudio}
                className="flex items-center gap-2 font-mono text-[8px] text-zinc-500 hover:text-zinc-950 tracking-[0.2em] uppercase transition-colors cursor-pointer"
                title={isAudioPlaying ? "Mute Drone" : "Unmute Drone"}
              >
                {isAudioPlaying ? (
                  <>
                    <Volume2 className="w-3 h-3 text-orange-electric animate-pulse" />
                    <span className="hidden sm:inline">SOUND ACTIVE</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3 h-3 text-zinc-400" />
                    <span className="hidden sm:inline">SOUND OFF</span>
                  </>
                )}
              </button>

              <button
                onClick={() => scrollToScene(5)}
                className="px-4 py-2 bg-zinc-950 text-white font-semibold text-[9px] tracking-widest font-mono uppercase transition-all hover:bg-orange-electric hover:text-white duration-300 cursor-pointer"
              >
                JOIN CULT
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* 5. Pure Overlay Text Content Layout */}
      {loaded && (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-30 select-none">

          {/* ==================== SCENE 1: FORGE YOUR LEGACY (0 to 100vh) ==================== */}
          <div
            className="absolute inset-0 flex flex-col justify-between items-center py-24 px-6 pointer-events-auto"
            style={{
              opacity: getSceneOpacity(0, smoothScrollProgress),
              transform: `translateY(${getSceneTranslationY(0, smoothScrollProgress)}px)`,
            }}
          >
            {/* Elegant minimalist heading */}
            <div className="flex flex-col items-center mt-8">
              <span className="text-[10px] tracking-[0.5em] uppercase text-zinc-400 font-mono">
                WELCOME TO CULT.FIT
              </span>
            </div>

            {/* Giant Center Typography */}
            <div className="text-center flex flex-col items-center px-4">
              <motion.h1
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-[14vw] xs:text-[12vw] sm:text-8xl md:text-[11rem] lg:text-[13rem] xl:text-[15rem] font-black tracking-[0.3em] uppercase text-zinc-950 translate-x-[0.15em] leading-none"
              >
                FORGE
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-[9px] xs:text-[10px] sm:text-xs tracking-[0.5em] xs:tracking-[0.75em] uppercase text-zinc-400 mt-4 xs:mt-5 font-mono"
              >
                START YOUR FITNESS JOURNEY
              </motion.p>
            </div>

            {/* Scroll CTA */}
            <button
              onClick={() => scrollToScene(1)}
              className="flex flex-col items-center gap-2.5 cursor-pointer group text-zinc-400 hover:text-orange-electric transition-colors duration-300 mb-4"
            >
              <span className="text-[9px] tracking-[0.5em] uppercase font-mono">
                SCROLL TO ENTER
              </span>
              <ChevronDown className="w-4 h-4 animate-bounce text-orange-electric group-hover:scale-125 transition-transform" />
            </button>
          </div>

          {/* ==================== SCENE 2: STRENGTH (100 to 200vh) ==================== */}
          <div
            className="absolute inset-y-0 left-0 w-full flex flex-col justify-center px-4 xs:px-6 md:px-24 xl:px-32 pointer-events-auto"
            style={{
              opacity: getSceneOpacity(1, smoothScrollProgress),
              transform: `translateY(${getSceneTranslationY(1, smoothScrollProgress)}px)`,
            }}
          >
            <div className="space-y-4 xs:space-y-5 max-w-sm bg-white/75 backdrop-blur-xl p-5 xs:p-6 border border-white/40 sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:border-none shadow-xl sm:shadow-none">
              <span className="text-[8px] xs:text-[9px] tracking-[0.3em] xs:tracking-[0.50em] font-mono text-orange-electric uppercase block">
                02 // TRAIN HARD
              </span>
              
              <h2 className="text-3xl xs:text-4xl md:text-6xl font-black tracking-tight text-zinc-950 uppercase leading-none">
                STRENGTH.
              </h2>
              
              <div className="w-12 xs:w-16 h-[1px] bg-orange-electric" />

              <p className="text-zinc-700 sm:text-zinc-500 font-normal sm:font-light text-[11px] xs:text-xs md:text-sm leading-relaxed tracking-wider">
                High-energy workout sessions designed around your body. Join Cult.fit to build stamina, gain power, and reach your goals.
              </p>
            </div>
          </div>

          {/* ==================== SCENE 3: PRECISION (200 to 300vh) ==================== */}
          <div
            className="absolute inset-y-0 left-0 w-full flex flex-col justify-center px-4 xs:px-6 md:px-24 xl:px-32 pointer-events-auto"
            style={{
              opacity: getSceneOpacity(2, smoothScrollProgress),
              transform: `translateY(${getSceneTranslationY(2, smoothScrollProgress)}px)`,
            }}
          >
            <div className="space-y-4 xs:space-y-6 max-w-sm bg-white/75 backdrop-blur-xl p-5 xs:p-6 border border-white/40 sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:border-none shadow-xl sm:shadow-none">
              <span className="text-[8px] xs:text-[9px] tracking-[0.3em] xs:tracking-[0.50em] font-mono text-orange-electric uppercase block">
                03 // TRACK PROGRESS
              </span>

              <h2 className="text-3xl xs:text-4xl md:text-6xl font-black tracking-tight text-zinc-950 uppercase leading-none">
                PRECISION.
              </h2>

              <div className="w-12 xs:w-16 h-[1px] bg-orange-electric" />

              <p className="text-zinc-700 sm:text-zinc-500 font-normal sm:font-light text-[11px] xs:text-xs md:text-sm leading-relaxed tracking-wider mb-2 xs:mb-4">
                We track your repetition, heart rate, and improvements. Our training programs are simple, fun, and easy to follow.
              </p>

              <div className="space-y-2 xs:space-y-3 font-mono text-[8px] xs:text-[9px] sm:text-[10px] tracking-[0.2em] xs:tracking-[0.25em] text-zinc-800 sm:text-zinc-600 uppercase">
                <div className="flex items-center gap-2.5 xs:gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-electric" />
                  <span>EVERY REPETITION TRACKED.</span>
                </div>
                <div className="flex items-center gap-2.5 xs:gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-electric" />
                  <span>EVERY SET CALCULATED.</span>
                </div>
                <div className="flex items-center gap-2.5 xs:gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-electric" />
                  <span>CULT.FIT QUALITY ASSURED.</span>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== SCENE 4: DISCIPLINE (300 to 400vh) ==================== */}
          <div
            className="absolute inset-y-0 left-0 w-full flex flex-col justify-center px-4 xs:px-6 md:px-24 xl:px-32 pointer-events-auto"
            style={{
              opacity: getSceneOpacity(3, smoothScrollProgress),
              transform: `translateY(${getSceneTranslationY(3, smoothScrollProgress)}px)`,
            }}
          >
            <div className="space-y-4 xs:space-y-5 max-w-sm bg-white/75 backdrop-blur-xl p-5 xs:p-6 border border-white/40 sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:border-none shadow-xl sm:shadow-none">
              <span className="text-[8px] xs:text-[9px] tracking-[0.3em] xs:tracking-[0.50em] font-mono text-orange-electric uppercase block">
                04 // SMART TRAINING
              </span>

              <h2 className="text-3xl xs:text-4xl md:text-6xl font-black tracking-tight text-zinc-950 uppercase leading-none">
                SCIENCE &<br />DISCIPLINE.
              </h2>

              <div className="w-12 xs:w-16 h-[1px] bg-orange-electric" />

              <p className="text-zinc-700 sm:text-zinc-500 font-normal sm:font-light text-[11px] xs:text-xs md:text-sm leading-relaxed tracking-wider">
                Smart workouts designed by top fitness experts. Experience a fun, scientific, and healthy way to stay fit with Cult.fit.
              </p>
            </div>
          </div>

          {/* ==================== SCENE 5: BUILT FOR CHAMPIONS (400 to 500vh) ==================== */}
          <div
            className="absolute inset-y-0 left-0 w-full flex flex-col justify-center px-4 xs:px-6 md:px-24 xl:px-32 pointer-events-auto"
            style={{
              opacity: getSceneOpacity(4, smoothScrollProgress),
              transform: `translateY(${getSceneTranslationY(4, smoothScrollProgress)}px)`,
            }}
          >
            <div className="space-y-4 xs:space-y-5 max-w-sm bg-white/75 backdrop-blur-xl p-5 xs:p-6 border border-white/40 sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:border-none shadow-xl sm:shadow-none">
              <span className="text-[8px] xs:text-[9px] tracking-[0.3em] xs:tracking-[0.50em] font-mono text-orange-electric uppercase block">
                05 // OUR COMMUNITY
              </span>

              <h2 className="text-3xl xs:text-4xl md:text-6xl font-black tracking-tight text-zinc-950 uppercase leading-none">
                BUILT FOR<br />CHAMPIONS.
              </h2>

              <div className="w-12 xs:w-16 h-[1px] bg-orange-electric" />

              <p className="text-zinc-700 sm:text-zinc-500 font-normal sm:font-light text-[11px] xs:text-xs md:text-sm leading-relaxed tracking-wider">
                Cult.fit is made for everyone who wants a healthier life. Join a friendly community of workouts, expert trainers, and friends.
              </p>
            </div>
          </div>

          {/* ==================== SCENE 6: BECOME CULT.FIT (500 to 600vh) ==================== */}
          <div
            className="absolute inset-0 flex flex-col lg:justify-center items-center overflow-y-auto py-24 lg:py-0 px-4 xs:px-6 md:px-12 pointer-events-auto text-center"
            style={{
              opacity: getSceneOpacity(5, smoothScrollProgress),
              transform: `translateY(${getSceneTranslationY(5, smoothScrollProgress)}px)`,
            }}
          >
            <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 pointer-events-auto pb-24 lg:pb-0">
              {/* Left Column: Form and content */}
              <div className="space-y-4 xs:space-y-6 max-w-md w-full flex flex-col items-center lg:items-start lg:text-left bg-white/75 backdrop-blur-xl p-6 border border-white/40 lg:bg-transparent lg:backdrop-blur-none lg:p-0 lg:border-none lg:shadow-none shadow-xl">
                <span className="text-[8px] xs:text-[9px] tracking-[0.4em] xs:tracking-[0.6em] font-mono text-orange-electric uppercase">
                  06 // JOIN THE CULT
                </span>

                <h2 className="text-4xl xs:text-5xl sm:text-7xl font-black tracking-tight text-zinc-950 uppercase leading-none">
                  JOIN<br className="hidden xs:inline" /> CULT.FIT.
                </h2>

                <div className="w-12 xs:w-16 h-[1px] bg-orange-electric" />

                <p className="text-zinc-700 lg:text-zinc-500 font-normal lg:font-light text-[11px] xs:text-xs sm:text-sm leading-relaxed tracking-wider max-w-sm">
                  Ready to start your fitness journey? Enter your email address below to get your free workout pass today.
                </p>

                {/* Elegant, secure input and private membership request form */}
                <div className="w-full max-w-md mt-2 xs:mt-4 pointer-events-auto">
                  {!formSubmitted ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!email) return;
                        setIsSubmitting(true);
                        setTimeout(() => {
                          setIsSubmitting(false);
                          setFormSubmitted(true);
                        }, 1200);
                      }}
                      className="flex flex-col gap-2 w-full"
                    >
                      <input
                        type="email"
                        required
                        placeholder="ENTER YOUR EMAIL"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full bg-white border border-zinc-200 px-4 py-3 text-xs tracking-widest font-mono text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-electric transition-colors rounded-none text-center sm:text-left uppercase"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-3 bg-zinc-950 text-white hover:bg-orange-electric transition-all duration-300 font-mono text-[10px] tracking-[0.2em] font-bold uppercase rounded-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span>JOINING NOW...</span>
                        ) : (
                          <>
                            <span>JOIN CULT</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-orange-electric/5 border border-orange-electric/25 p-4 xs:p-5 text-center lg:text-left space-y-2 rounded-none w-full"
                    >
                      <div className="text-[9px] xs:text-[10px] tracking-[0.3em] font-mono text-orange-electric font-bold">
                        WELCOME TO CULT // PASS ISSUED
                      </div>
                      <p className="text-[10px] xs:text-[11px] tracking-wider text-zinc-500 font-mono uppercase">
                        WE HAVE SENT YOUR WORKOUT PASS TO: <br />
                        <span className="text-zinc-900 font-bold lowercase truncate block">{email}</span>
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Right Column: Google Branches Map */}
              <div className="w-full lg:w-auto flex justify-center">
                <CultBranchesMap />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 6. Ambient Dust/Spark overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(255,255,255,0.4)_100%)]" />

      {/* 7. Bottom Horizontal Progress Bar Container */}
      <AnimatePresence>
        {loaded && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 w-full z-40 px-4 sm:px-12 pb-4 sm:pb-6 pointer-events-none select-none"
          >
            <div className="max-w-7xl mx-auto w-full flex flex-col gap-2">
              {/* Scene Indicators & Current State */}
              <div className="flex justify-between items-end text-[8px] sm:text-[9px] font-mono tracking-[0.2em] sm:tracking-[0.3em] uppercase">
                {/* Left Active Scene Label with responsive truncating and naming */}
                <span className="text-orange-electric font-bold transition-all duration-300 truncate max-w-[190px] xs:max-w-none">
                  S0{currentDiscreteScene + 1} <span className="hidden xs:inline">//</span> <span className="inline-block xs:inline">{[
                    "GET STARTED",
                    "STRENGTH",
                    "TRACK PROGRESS",
                    "SMART TRAINING",
                    "COMMUNITY",
                    "JOIN CULT.FIT"
                  ][currentDiscreteScene]}</span>
                </span>

                {/* Percentage Progress */}
                <span className="text-zinc-400 font-light whitespace-nowrap">
                  {Math.round((smoothScrollProgress / 5.0) * 100)}%
                </span>
              </div>

              {/* Progress Bar Track & Fill */}
              <div className="relative w-full h-[2.5px] bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-electric to-orange-500 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(255,59,0,0.85)]"
                  style={{ width: `${Math.min(100, Math.max(0, (smoothScrollProgress / 5.0) * 100))}%` }}
                />
              </div>

              {/* Segment markers inside or below the track to represent the 6 scenes */}
              <div className="flex justify-between w-full px-0.5">
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const isPassed = smoothScrollProgress >= index;
                  const isActive = currentDiscreteScene === index;
                  return (
                    <button
                      key={index}
                      onClick={() => scrollToScene(index)}
                      className="group flex flex-col items-center pointer-events-auto cursor-pointer"
                      style={{ width: '16px' }}
                      title={`Go to Scene ${index + 1}`}
                    >
                      {/* A subtle tick above or below */}
                      <div
                        className={`w-[1px] h-1.5 transition-all duration-300 ${
                          isActive
                            ? "bg-orange-electric h-2.5"
                            : isPassed
                            ? "bg-orange-electric/55"
                            : "bg-zinc-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invisible dummy sections to provide native scroll height and trigger the scroll progress */}
      <div className="chapter-section h-screen w-full" data-id="1" />
      <div className="chapter-section h-screen w-full" data-id="2" />
      <div className="chapter-section h-screen w-full" data-id="3" />
      <div className="chapter-section h-screen w-full" data-id="4" />
      <div className="chapter-section h-screen w-full" data-id="5" />
      <div className="chapter-section h-screen w-full" data-id="6" />
    </div>
  );
}
