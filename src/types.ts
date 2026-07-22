export interface Chapter {
  id: number;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  metrics: {
    label: string;
    value: string;
    subtext?: string;
    trend?: "up" | "down" | "stable";
  }[];
  cta: string;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    number: "01",
    title: "Elite Coaching",
    subtitle: "WORLD-CLASS TRAINING DESIGNED FOR CHAMPIONS",
    description: "Connect with certified Olympic-level trainers who build bespoke periodized training blocks around your biomechanics. Every repetition is audited; every metric is optimized for maximum mechanical advantage.",
    metrics: [
      { label: "COACH TO ATHLETE RATIO", value: "1 : 1" },
      { label: "WEEKLY VIDEO ANALYSIS", value: "FULL INTEGRATION" },
    ],
    cta: "SECURE PRIVATE COACHING",
  },
  {
    id: 2,
    number: "02",
    title: "Science-Based Programs",
    subtitle: "NEUROMUSCULAR PERFORMANCE ENHANCEMENT",
    description: "Say goodbye to generic workout templates. Our programs utilize direct neuromuscular stimulation, velocity-based training, and volume-load periodization models verified by current clinical research in sports medicine.",
    metrics: [
      { label: "METABOLIC PATHWAY ACCEL", value: "STRENGTH / HYPERTROPHY" },
      { label: "VBT FORCE MEASUREMENT", value: "REAL-TIME TRACKED" },
    ],
    cta: "EXPLORE THE TRAINING MATRIX",
  },
  {
    id: 3,
    number: "03",
    title: "Performance Analytics",
    subtitle: "CONTINUOUS REAL-TIME BIOMECHANICAL AUDITING",
    description: "Your training is recorded via high-speed visual cameras, digital barbell sensors, and force plates. Review detailed metrics of your kinetic chain power spikes, power-to-weight ratios, and metabolic efficiency curves.",
    metrics: [
      { label: "KINETIC ENERGY EFFICIENCY", value: "94.6%", trend: "up" },
      { label: "ATP SYSTEM RECOVERY RATE", value: "+18.2s SAVED", trend: "up" },
    ],
    cta: "LAUNCH INTEGRATED DASHBOARD",
  },
  {
    id: 4,
    number: "04",
    title: "Recovery & Nutrition",
    subtitle: "OPTIMIZED CELLULAR RESYNTHESIS & FUEL",
    description: "Muscle is broken down in the gym and constructed during sleep. Our metabolic clinical experts customize hydration algorithms, hyper-targeted amino loads, and daily circadian-linked deep recovery protocols.",
    metrics: [
      { label: "CELLULAR RE-HYDRATION INDEX", value: "98.2%", trend: "stable" },
      { label: "DEEP SLEEP INTEGRATION", value: "7.8 HR AVG", trend: "up" },
    ],
    cta: "BESPOKE FUELING PROTOCOLS",
  },
  {
    id: 5,
    number: "05",
    title: "Community & Environment",
    subtitle: "AN EXCLUSIVE INDUSTRIAL TRAINING SANCTUARY",
    description: "Train among dedicated high-performers, elite corporate leaders, and competitive pro athletes. A noise-engineered, state-of-the-art facility featuring custom custom-welded steel rigs, dust-filtered oxygenated air, and dark luxury vibes.",
    metrics: [
      { label: "FACILITY OXYGEN LEVEL", value: "21.4% CONSTANT" },
      { label: "MAX ATHLETES ACTIVE", value: "35 AT ANY TIME" },
    ],
    cta: "ARRANGE PRIVATE TOUR",
  },
  {
    id: 6,
    number: "06",
    title: "Transformation Mindset",
    subtitle: "THE UNBREAKABLE SYNERGY OF MIND & IRON",
    description: "True peak physical transformation begins when mental resistance is completely shattered. Master breathing loops under maximum load, enter the flow state effortlessly, and cultivate a standard of elite discipline.",
    metrics: [
      { label: "FLOW-STATE BRAIN COHERENCE", value: "ALPHA-THETA HYBRID" },
      { label: "MENTAL FOCUS EFFICIENCY", value: "98.5%" },
    ],
    cta: "INITIATE COGNITIVE WORK",
  },
  {
    id: 7,
    number: "07",
    title: "Advanced Biometrics",
    subtitle: "SUB-DERMAL AUTONOMIC TELEMETRY STREAM",
    description: "Simulate advanced biological monitoring. Track heart rate variability (HRV), pulse wave velocity, and instant blood-lactate curves to precisely locate your muscular threshold. Never under-train; never over-reach.",
    metrics: [
      { label: "TARGET WORKOUT VO2 MAX", value: "62.4 ml/kg" },
      { label: "HRV LEVEL (REST)", value: "92 ms", trend: "up" },
    ],
    cta: "SYNC WEARABLE TELEMETRY",
  },
  {
    id: 8,
    number: "08",
    title: "Kinetic Assessment",
    subtitle: "DYNAMIC MUSCLE BALANCING & GAIT SCANNING",
    description: "Identify subtle strength deficiencies before they manifest as chronic inflammation. Our twin high-speed multi-axis force plates evaluate concentric muscle imbalances, ground contact symmetry, and lateral torque spikes.",
    metrics: [
      { label: "LATERAL TORQUE SYMMETRY", value: "99.1% ALIGNED" },
      { label: "JOINT ANGLE EFFICIENCY", value: "+3.5° GREATER", trend: "up" },
    ],
    cta: "SCHEDULE BIOMECHANICAL RUN",
  },
  {
    id: 9,
    number: "09",
    title: "Hyperbaric & Cryo",
    subtitle: "ACTIVE CONTRAST THERMOGENIC PROTOCOLS",
    description: "Plunge into hyperbaric chamber recovery followed immediately by extreme sub-zero dry thermoregulation. Triggers profound vasoconstriction, surging natural nitric oxide, and rapid muscular cellular repair cycles.",
    metrics: [
      { label: "RECOVERY TIME ACCELERATION", value: "-48 HR DECREASE" },
      { label: "EPIDERMAL THERMAL DELTA", value: "32°C SWING" },
    ],
    cta: "ENTER THERMAL PROTOCOLS",
  },
  {
    id: 10,
    number: "10",
    title: "Peak Performance",
    subtitle: "THE ABSOLUTE SYNCHRONIZATION OF POWER",
    description: "You have arrived. Raw, unfettered human potential matched with world-class engineering. Welcome to the elite tier of IronPulse Fitness. The bar is loaded. Step up and claim your physical peak.",
    metrics: [
      { label: "TOTAL FORCE COHERENCE", value: "100% MAXIMUM" },
      { label: "OVERALL KINETIC RATING", value: "ELITE tier" },
    ],
    cta: "SECURE PRIVATE MEMBERSHIP",
  },
];
