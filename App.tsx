import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useMotionValue,
  useTransform
} from "framer-motion";
import { Heart, Sparkles, Star } from "lucide-react";
import Background from "./components/Background";
import { WISHES_LIST, getHeartPosition3D } from "./constants";
import { AppState, FlyingWish, DecorationParticle } from "./types";

// Dreamy Palette
const DREAMY_COLORS = [
  "#FFB7B2", // Light Pink
  "#FFDAC1", // Peach
  "#E2F0CB", // Pale Green
  "#B5EAD7", // Mint
  "#C7CEEA", // Periwinkle
  "#E0BBE4", // Lavender
  "#F4D03F", // Soft Yellow
  "#89CFF0", // Baby Blue
  "#F8C8DC", // Pastel Rose
  "#D7BDE2", // Light Purple
  "#A9DFBF", // Pale Teal
  "#FFFFFF", // White
  "#FFD700" // Gold
];

const App: React.FC = () => {
  // 检测移动设备
  const isMobile = window.innerWidth < 768;

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [wishes, setWishes] = useState<FlyingWish[]>([]);
  const [decorations, setDecorations] = useState<DecorationParticle[]>([]);
  const [formationMode, setFormationMode] = useState<"scatter" | "heart">(
    "scatter"
  );

  // Store the shuffled text order
  const [activeWishList, setActiveWishList] = useState<string[]>([]);
  // Store the mapping of wish index -> heart position index
  const [positionMapping, setPositionMapping] = useState<number[]>([]);

  // 3D Rotation State
  const [isDragging, setIsDragging] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Smooth rotation springs
  const springConfig = { damping: 20, stiffness: 100 };
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);

  // Billboarding: Invert rotation for children so they face screen
  const negativeRotateX = useTransform(smoothRotateX, (v) => -v);
  const negativeRotateY = useTransform(smoothRotateY, (v) => -v);

  // Helper to shuffle array keeping first element fixed (Center text stays center)
  const getShuffledIndices = (length: number) => {
    const indices = Array.from({ length }, (_, i) => i);
    // Shuffle from index 1 to end
    for (let i = length - 1; i > 1; i--) {
      const j = 1 + Math.floor(Math.random() * i);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  };

  // Initialize randomized list once
  const prepareWishList = useCallback(() => {
    const center = WISHES_LIST[0];
    const others = [...WISHES_LIST.slice(1)];
    // Fisher-Yates shuffle for texts
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    const newList = [center, ...others];
    setActiveWishList(newList);
    // Initialize position mapping
    setPositionMapping(getShuffledIndices(newList.length));
  }, []);

  const initScene = useCallback(() => {
    if (activeWishList.length === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;

    // Determine Radius based on screen size (min dimension)
    const minDim = Math.min(width, height);
    // Reduced radius for mobile to fit better
    const radiusFactor = isMobile ? 0.34 : 0.45;
    const radius = minDim * radiusFactor;

    // VISUAL ADJUSTMENT: Shift everything slightly left
    // 10px shift to correct visual center bias
    const visualXOffset = -10;

    // --- Generate Wishes ---
    const newWishes: FlyingWish[] = activeWishList.map((text, i) => {
      // 1. Calculate Target Heart Position (3D) using the random mapping
      // If positionMapping is empty (first run), fallback to i
      const targetPosIndex =
        positionMapping[i] !== undefined ? positionMapping[i] : i;
      const heartPos = getHeartPosition3D(
        targetPosIndex,
        activeWishList.length,
        radius
      );

      // 2. Calculate Scatter Position
      const spreadX = width * 0.4;
      const spreadY = height * 0.4;
      const scatterX = (Math.random() - 0.5) * spreadX * 2.2;
      const scatterY = (Math.random() - 0.5) * spreadY * 2.2;
      const scatterZ = (Math.random() - 0.5) * (isMobile ? 500 : 800); // Less depth on mobile

      // Color logic
      const isCenter = i === 0;
      const randomColor =
        DREAMY_COLORS[Math.floor(Math.random() * DREAMY_COLORS.length)];
      const color = isCenter ? "#ff4d4d" : randomColor;

      // Scale Adjustment for Mobile
      let scale = 1;
      if (isCenter) {
        scale = isMobile ? 1.4 : 2.0;
      } else {
        const baseScale = text.length > 2 ? 1.1 : 0.8 + Math.random() * 0.4;
        scale = isMobile ? baseScale * 0.75 : baseScale;
      }

      return {
        id: `wish-${i}`, // ID stays bound to the specific text
        text,
        x: formationMode === "heart" ? heartPos.x + visualXOffset : scatterX,
        y: formationMode === "heart" ? heartPos.y : scatterY,
        z: formationMode === "heart" ? heartPos.z : scatterZ,
        scale,
        delay: i * 0.01,
        color,
        isCenter
      };
    });
    setWishes(newWishes);

    // --- Generate Decorations (Bling) ---
    // Decrease count on mobile significantly
    const numDecorations = isMobile ? 40 : 100;
    const newDecorations: DecorationParticle[] = Array.from({
      length: numDecorations
    }).map((_, i) => {
      // Create a more dispersed cloud

      let heartX, heartY, heartZ;

      if (Math.random() < 0.4) {
        // Heart shape influence
        const heartBase = getHeartPosition3D(
          i % activeWishList.length,
          activeWishList.length,
          radius * (0.9 + Math.random() * 0.6)
        );
        const noise = isMobile ? 60 : 120; // Less noise on mobile to keep it cleaner
        heartX = heartBase.x + (Math.random() - 0.5) * noise + visualXOffset;
        heartY = heartBase.y + (Math.random() - 0.5) * noise;
        heartZ = heartBase.z + (Math.random() - 0.5) * noise;
      } else {
        // Random Cloud influence
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = radius * (1.2 + Math.random() * 0.8);

        heartX = r * Math.sin(phi) * Math.cos(theta) + visualXOffset;
        heartY = r * Math.sin(phi) * Math.sin(theta);
        heartZ = r * Math.cos(phi) * 0.5; // Flatten Z slightly
      }

      // Scatter position (Exploded view)
      const spreadX = width * 0.5;
      const spreadY = height * 0.5;
      const scatterX = (Math.random() - 0.5) * spreadX * 2.5;
      const scatterY = (Math.random() - 0.5) * spreadY * 2.5;
      const scatterZ = (Math.random() - 0.5) * 1000;

      // Types
      const types: DecorationParticle["type"][] = [
        "star",
        "sparkle",
        "pearl",
        "diamond"
      ];
      const type = types[Math.floor(Math.random() * types.length)];

      // Colors
      const decoColors = [
        "#FFFFFF",
        "#FFD700",
        "#E0E0E0",
        "#FFFACD",
        "#E6E6FA",
        "#B5EAD7",
        "#FFB7B2"
      ];
      const color = decoColors[Math.floor(Math.random() * decoColors.length)];

      const baseScale = 0.3 + Math.random() * 1.0;

      return {
        id: `deco-${i}`,
        type,
        x: formationMode === "heart" ? heartX : scatterX,
        y: formationMode === "heart" ? heartY : scatterY,
        z: formationMode === "heart" ? heartZ : scatterZ,
        scale: isMobile ? baseScale * 0.6 : baseScale, // Smaller particles on mobile
        color,
        delay: i * 0.002,
        rotation: Math.random() * 360
      };
    });
    setDecorations(newDecorations);
  }, [formationMode, activeWishList, positionMapping]);

  // Handle Resize
  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      // Debounce slightly
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (appState === AppState.SHOWING) {
          initScene();
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [appState, initScene]);

  // Recalculate positions when formation mode changes
  useEffect(() => {
    if (appState === AppState.SHOWING) {
      initScene();
    }
  }, [formationMode, appState, initScene]);

  const startExperience = () => {
    prepareWishList();
    setAppState(AppState.SHOWING);
    setFormationMode("scatter");

    // Gather into heart
    setTimeout(() => {
      setFormationMode("heart");
      // Reset rotation just in case
      rotateX.set(0);
      rotateY.set(0);
    }, 800);
  };

  const toggleFormation = useCallback(() => {
    if (appState !== AppState.SHOWING) return;

    const nextMode = formationMode === "heart" ? "scatter" : "heart";

    if (nextMode === "heart") {
      // Re-shuffle positions when gathering so text lands in new spots
      setPositionMapping(getShuffledIndices(activeWishList.length));
      // Reset view to front
      rotateX.set(0);
      rotateY.set(0);
    }

    setFormationMode(nextMode);
  }, [appState, formationMode, rotateX, rotateY, activeWishList.length]);

  // Drag Handlers with Click Detection
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const sensitivity = 0.5;
    rotateY.set(rotateY.get() + e.movementX * sensitivity);
    rotateX.set(rotateX.get() - e.movementY * sensitivity);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);

    if (dragStartRef.current) {
      const dist = Math.sqrt(
        Math.pow(e.clientX - dragStartRef.current.x, 2) +
          Math.pow(e.clientY - dragStartRef.current.y, 2)
      );
      if (dist < 5) {
        toggleFormation();
      }
    }
    dragStartRef.current = null;
  };

  // Helper to render decoration icon
  const renderDecorationIcon = (d: DecorationParticle) => {
    const size = 16 * d.scale;
    const style = {
      filter: `drop-shadow(0 0 ${4 * d.scale}px ${d.color})`, // stronger glow
      color: d.color
    };

    switch (d.type) {
      case "star":
        return (
          <Star
            size={size}
            fill={d.color}
            style={style}
            className={isMobile ? "" : "animate-pulse"}
          />
        );
      case "sparkle":
        return (
          <Sparkles
            size={size}
            style={style}
            className={isMobile ? "" : "animate-ping"}
          />
        );
      case "pearl":
        return (
          <div
            style={{
              width: size,
              height: size,
              backgroundColor: "#fff",
              borderRadius: "50%",
              boxShadow:
                "inset -2px -2px 4px rgba(0,0,0,0.1), 0 0 10px rgba(255,255,255,0.9)"
            }}
          />
        );
      case "diamond":
        return (
          <div
            style={{
              width: size * 0.8,
              height: size * 0.8,
              backgroundColor: "#F0FFFF",
              transform: "rotate(45deg)",
              boxShadow: "0 0 10px rgba(200, 255, 255, 0.9)"
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden font-serif text-white selection:bg-transparent touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Background />

      {/* Intro Screen */}
      <AnimatePresence>
        {appState === AppState.IDLE && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-4xl font-cursive tracking-wider text-pink-100 mb-12 text-center px-4 leading-relaxed drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]"
            >
              点击开启接收
              <br />
              来自{" "}
              <span className="text-pink-400 text-3xl md:text-5xl">
                苏
              </span>{" "}
              的2026新年祝福
            </motion.h1>

            <motion.button
              onClick={startExperience}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <Heart
                fill="#ec4899"
                stroke="none"
                size={80}
                className="relative z-10 drop-shadow-2xl animate-bounce"
                style={{ animationDuration: "2s" }}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 text-xs font-bold tracking-widest pointer-events-none z-20">
                OPEN
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Scene Container */}
      <div className="absolute inset-0 flex items-center justify-center perspective-[1000px] pointer-events-none">
        {appState === AppState.SHOWING && (
          <motion.div
            style={{
              rotateX: smoothRotateX,
              rotateY: smoothRotateY,
              transformStyle: "preserve-3d"
            }}
            className="relative w-0 h-0 pointer-events-auto"
          >
            {/* 1. Decorations Layer (Back) */}
            {decorations.map((deco) => (
              <motion.div
                key={deco.id}
                initial={false}
                animate={{
                  x: deco.x,
                  y: deco.y,
                  z: deco.z,
                  opacity: 1,
                  rotate: deco.rotation
                }}
                transition={{
                  type: "spring",
                  stiffness: isMobile ? 60 : 40,
                  damping: isMobile ? 20 : 15,
                  mass: 0.6,
                  delay: formationMode === "scatter" ? 0 : deco.delay
                }}
                className="absolute flex items-center justify-center"
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div
                  style={{ rotateX: negativeRotateX, rotateY: negativeRotateY }}
                >
                  {renderDecorationIcon(deco)}
                </motion.div>
              </motion.div>
            ))}

            {/* 2. Wishes Layer (Text) */}
            {wishes.map((wish) => (
              <motion.div
                key={wish.id}
                initial={false}
                animate={{
                  x: wish.x,
                  y: wish.y,
                  z: wish.z,
                  scale: wish.scale,
                  opacity: 1
                }}
                transition={{
                  type: "spring",
                  stiffness: isMobile ? 60 : 45,
                  damping: isMobile ? 18 : 15,
                  mass: 0.8,
                  delay: formationMode === "scatter" ? 0 : wish.delay * 0.5
                }}
                className="absolute flex items-center justify-center"
                style={{
                  transformStyle: "preserve-3d"
                }}
              >
                <motion.div
                  style={{
                    rotateX: negativeRotateX,
                    rotateY: negativeRotateY
                  }}
                  className={`whitespace-nowrap font-art drop-shadow-[0_0_5px_rgba(0,0,0,0.8)] ${
                    wish.isCenter ? "z-50" : ""
                  }`}
                >
                  <span
                    style={{
                      color: wish.color,
                      fontSize: wish.isCenter ? "2.0rem" : "1.2rem",
                      fontWeight: wish.isCenter ? "bold" : "normal",
                      textShadow: wish.isCenter
                        ? "0 0 20px rgba(255,50,50,0.8)"
                        : `0 0 8px ${wish.color}90`
                    }}
                  >
                    {wish.text}
                  </span>
                </motion.div>
              </motion.div>
            ))}

            {/* Center Decoration Pulse (Heart Mode Only) */}
            {formationMode === "heart" && (
              <motion.div
                style={{ rotateX: negativeRotateX, rotateY: negativeRotateY }}
                className="absolute inset-0 pointer-events-none"
              >
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500/20 w-[200px] h-[200px] blur-xl animate-pulse" />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Helper UI */}
      <AnimatePresence>
        {appState === AppState.SHOWING && formationMode === "heart" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-8 left-0 right-0 text-center pointer-events-none z-40"
          >
            <div className="flex flex-col gap-1 items-center justify-center text-white/40 text-xs tracking-[0.2em] font-sans">
              <p>滑动旋转 • SWIPE TO ROTATE</p>
              <p>点击散开 • TAP TO SCATTER</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
