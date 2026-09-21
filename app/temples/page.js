

// correct code 

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TempleCard from "@/components/TempleCard";

/* ─────────────────────────────────────────────────────────────
   Bezier arc:
   P0 = behind temple base (bottom-centre of left column)
   P1 = control – sweeps high above centre
   P2 = top-right corner
   Sun z-index (8) is kept BELOW temple z-index (10) so it
   literally rises from behind the gopuram.
───────────────────────────────────────────────────────────── */
function bezierPoints(steps = 60) {
  const P0 = { x: 24, y: 102 }; // behind temple base
  const P1 = { x: 48, y: -8 }; // high arc control
  const P2 = { x: 88, y: 12 }; // top-right rest point
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const x = (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x;
    const y = (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y;
    return { x: `${x}vw`, y: `${y}vh` };
  });
}

const ARC = bezierPoints(60);
const X_KEYS = ARC.map(p => p.x);
const Y_KEYS = ARC.map(p => p.y);
const T_KEYS = ARC.map((_, i) => i / (ARC.length - 1));
// Final resting position of the sun after arc
const ARC_FINAL_LEFT = X_KEYS[X_KEYS.length - 1]; // "88vw"
const ARC_FINAL_TOP  = Y_KEYS[Y_KEYS.length - 1];  // "12vh"

/* ── Animated counter ── */
function AnimatedNumber({ target, suffix = "", delay = 0 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now(), dur = 1600;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        setVal(Math.floor((1 - (1 - p) ** 3) * target));
        if (p < 1) raf.current = requestAnimationFrame(tick);
        else setVal(target);
      };
      raf.current = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current); };
  }, [target, delay]);
  return <span>{val}{suffix}</span>;
}

/* ─────────────────────────────────────────────────
   COLOUR TOKENS  – one place to control everything
───────────────────────────────────────────────── */
const DAY = {
  celestialColor: "#ffe566",
  celestialShadow: "0 0 55px 18px rgba(255,210,60,.75), 0 0 110px 38px rgba(255,160,0,.35)",
  templeGlow: "drop-shadow(0 0 22px rgba(245,166,35,.55)) drop-shadow(0 0 65px rgba(245,120,0,.25))",
  groundGlow: "radial-gradient(ellipse, rgba(245,166,35,.50) 0%, rgba(200,80,0,.20) 55%, transparent 75%)",
  sky: "radial-gradient(ellipse 80% 60% at 20% 80%, #2d1500 0%, #1a0800 40%, #0d0400 100%)",
  statusColor: "rgba(245,166,35,.55)",
  dotColor: "#ffd700",
  dotShadow: "0 0 8px 3px rgba(255,215,0,.6)",
};

const NIGHT = {
  celestialColor: "#e8f0ff",
  celestialShadow: "inset -8px -6px 0 0 #b0bec5, 0 0 28px 10px rgba(200,220,255,.30)",
  templeGlow: "drop-shadow(0 0 24px rgba(210,230,255,.70)) drop-shadow(0 0 70px rgba(180,200,255,.30))",
  groundGlow: "radial-gradient(ellipse, rgba(200,220,255,.30) 0%, rgba(150,180,255,.10) 55%, transparent 75%)",
  sky: "radial-gradient(ellipse 80% 55% at 75% 15%, #0a1628 0%, #060d1e 50%, #040810 100%)",
  statusColor: "rgba(180,200,255,.55)",
  dotColor: "#c8d8ff",
  dotShadow: "0 0 8px 3px rgba(180,200,255,.55)",
};



// Filter category keys → API param mapping
const FILTER_KEYS = {
  Location: 'state',
  Deity: 'deity',
  Benefits: 'tag',
};

export default function Home() {
  /* ── Client-only random data (avoids SSR hydration mismatch) ── */
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState([]);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: `${5 + Math.random() * 44}%`,
        bottom: `${5 + Math.random() * 45}%`,
        size: `${3 + Math.random() * 5}px`,
        duration: `${4 + Math.random() * 5}s`,
        delay: `${Math.random() * 5}s`,
      }))
    );
    setStars(
      Array.from({ length: 55 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 70}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() > 0.8 ? "2px" : "1px",
        delay: `${Math.random() * 3}s`,
      }))
    );
    setMounted(true);
  }, []);

  const [riseComplete, setRiseComplete] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [clicked, setClicked] = useState(false);
  const templesListRef = useRef(null);

  const C = isNight ? NIGHT : DAY;

  const toggle = useCallback(() => {
    setClicked(true);
    setIsNight(n => !n);
  }, []);


  // ── Filter & Temple data state ──────────────────────────────
  const [temples, setTemples] = useState([]);
  const [loadingT, setLoadingT] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ Location: '', Deity: '', Benefits: '' });
  const [filterOpts, setFilterOpts] = useState({ Location: [], Deity: [], Benefits: [] });
  const [openDropdown, setOpenDropdown] = useState(null);
  const debounceRef = useRef(null);

  // Build dynamic filter options from DB data
  const buildOptions = (data) => {
    const states = [...new Set(data.map(t => t.state).filter(Boolean))].sort();
    const deities = [...new Set(data.map(t => t.mainDeity).filter(Boolean))].sort();
    const tags = [...new Set(data.flatMap(t => t.blessingTags || []))].sort();
    setFilterOpts({ Location: states, Deity: deities, Benefits: tags });
  };

  // Fetch all temples once on mount for options, then re-fetch on filter change
  const fetchTemples = async (s, f) => {
    setLoadingT(true);
    try {
      const params = new URLSearchParams();
      if (s) params.set('search', s);
      if (f.Location) params.set('state', f.Location);
      if (f.Deity) params.set('deity', f.Deity);
      if (f.Benefits) params.set('tag', f.Benefits);
      const res = await fetch(`/api/temple/temples?${params}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.temples || []);
      setTemples(list);
      // Build options only when no filter active (full dataset)
      if (!s && !f.Location && !f.Deity && !f.Benefits) buildOptions(list);
    } catch { setTemples([]); }
    finally { setLoadingT(false); }
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchTemples(search, filters), 350);
    return () => clearTimeout(debounceRef.current);
  }, [search, filters]);

  const setFilter = (cat, val) => {
    setFilters(prev => ({ ...prev, [cat]: prev[cat] === val ? '' : val }));
    setOpenDropdown(null);
  };

  const clearAllFilters = () => {
    setFilters({ Location: '', Deity: '', Benefits: '' });
    setSearch('');
  };

  const removeFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: '' }));
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (search ? 1 : 0);

  // Dropdown component
  const Dropdown = ({ name }) => {
    const opts = filterOpts[name] || [];
    const current = filters[name];
    const isOpen = openDropdown === name;
    return (
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : name)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${isOpen
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
            }`}
        >
          {name}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {isOpen && opts.length > 0 && (
          <div className="absolute top-full mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            <div className="p-2 max-h-64 overflow-y-auto">
              {opts.map(item => (
                <button
                  key={item}
                  onClick={() => setFilter(name, item)}
                  className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors ${current === item
                    ? 'bg-orange-100 text-orange-700 font-semibold'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
        {isOpen && opts.length === 0 && (
          <div className="absolute top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4 text-sm text-gray-400">
            Loading options…
          </div>
        )}
      </div>
    );
  };


  return (
    <>
      <motion.div
        className="relative w-full temple-hero-root"
        animate={{ background: C.sky }}
        transition={{ duration: 2.2, ease: "easeInOut" }}
      >

        {/* ── Stars (night only, client-side only via state) ── */}
        <motion.div className="absolute inset-0 pointer-events-none z-[1]"
          animate={{ opacity: isNight ? 1 : 0 }} transition={{ duration: 2 }}>
          {stars.map(s => (
            <div key={s.id} style={{
              position: "absolute", top: s.top, left: s.left,
              width: s.size, height: s.size, borderRadius: "50%",
              background: "#e8f0ff",
              boxShadow: "0 0 3px 1px rgba(220,230,255,.5)",
              animation: `starTwinkle 2.5s ease-in-out infinite ${s.delay}`,
            }} />
          ))}
        </motion.div>

        {/* ── Ambient base orb ── */}
        <motion.div
          className="absolute pointer-events-none z-0"
          style={{
            bottom: "-10%", left: "-5%", width: "55%", height: "70%",
            borderRadius: "50%", animation: "orbPulse 6s ease-in-out infinite"
          }}
          animate={{
            background: isNight
              ? "radial-gradient(circle, rgba(60,80,160,.20) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(180,80,0,.22) 0%, transparent 70%)"
          }}
          transition={{ duration: 2.2 }}
        />

        {/* ── Gold particles (day only) ── */}
        <motion.div className="absolute inset-0 pointer-events-none z-[2]"
          animate={{ opacity: isNight ? 0 : 1 }} transition={{ duration: 1.8 }}>
          {particles.map(p => (
            <div key={p.id} className="particle" style={{
              left: p.left, bottom: p.bottom, width: p.size, height: p.size,
              animationDuration: p.duration, animationDelay: p.delay,
            }} />
          ))}
        </motion.div>

        {/* ══════════════════════════════════════
          SUN / MOON — MOBILE: static fixed button (no arc)
                        DESKTOP: arc animation
      ══════════════════════════════════════ */}

        {/* ── Mobile-only: static sun button (no arc animation) ── */}
        <motion.div
          className="md:hidden"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 20,
            translateX: "0%", translateY: "0%",
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          onAnimationComplete={() => setRiseComplete(true)}
        >
          <motion.div
            onClick={toggle}
            animate={{
              backgroundColor: C.celestialColor,
              boxShadow: C.celestialShadow,
            }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            style={{
              width: "48px", height: "48px", borderRadius: "50%",
              cursor: "pointer", position: "relative",
            }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence>
              {!clicked && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ delay: .6 }}
                  style={{
                    position: "absolute", bottom: "-28px", left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(0,0,0,.75)",
                    color: isNight ? "#c8d8ff" : "#ffd700",
                    fontSize: ".5rem", padding: "2px 7px", borderRadius: "20px",
                    whiteSpace: "nowrap", fontFamily: "var(--font-cinzel),serif",
                    letterSpacing: "1px", pointerEvents: "none",
                    border: `1px solid ${isNight ? "rgba(200,220,255,.3)" : "rgba(255,215,0,.3)"}`,
                  }}>
                  Tap to toggle
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* ── Desktop-only: arc-animated sun ── */}
        <DesktopArcSun
          C={C}
          isNight={isNight}
          clicked={clicked}
          toggle={toggle}
        />

        {/* Arc trail (very subtle) — desktop only */}
        <svg
          className="hidden md:block"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            zIndex: 3, pointerEvents: "none", opacity: .05
          }}
          viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 24 102 Q 48 -8 88 12" fill="none"
            stroke={isNight ? "#c8d8ff" : "#ffd700"}
            strokeWidth=".3" strokeDasharray="1 2" />
        </svg>

        {/* Night vignette */}
        <motion.div className="absolute inset-0 pointer-events-none z-[4]"
          animate={{ opacity: isNight ? 1 : 0 }} transition={{ duration: 2 }}
          style={{ background: "radial-gradient(ellipse at center,transparent 35%,rgba(4,6,18,.60) 100%)" }}
        />

        {/* ══════════════════════════════════════════════════════
          HERO — no wrapper, columns are absolute with z:10
          Sun (z:8) is behind both columns automatically
      ══════════════════════════════════════════════════════ */}

        {/* ── LEFT: Temple column ── */}
        <motion.div
          className="temple-left-col"
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Ground glow pool */}
          <motion.div
            animate={{ background: C.groundGlow }}
            transition={{ duration: 2 }}
            style={{
              position: "absolute", bottom: 0, left: "50%",
              transform: "translateX(-50%)",
              width: "85%", height: "70px",
              pointerEvents: "none", filter: "blur(18px)",
            }}
          />

          {/* Temple image */}
          <img
            src="/images/temples/temple.png"
            alt="South Indian Temple Gopuram"
            style={{
              maxHeight: "100%", width: "auto", maxWidth: "100%",
              objectFit: "contain", objectPosition: "bottom center",
              display: "block", position: "relative",
              transition: "filter 2.2s ease",
              filter: C.templeGlow,
            }}
          />
        </motion.div>

        {/* ── RIGHT: Content column ── */}
        <motion.div
          className="temple-right-col"
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: .2, ease: [0.22, 1, 0.36, 1] }}
        >

          {/* Headline */}
          <motion.h1
            className="font-cinzel font-black leading-tight"
            style={{ fontSize: "clamp(2rem,3.8vw,3.5rem)", marginBottom: "16px" }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .65, duration: .9 }}
          >
            <span style={{ color: "#fff8f0", display: "block" }}>Next Level</span>
            <span className="golden-text" style={{ display: "block" }}>Spiritual</span>
            <span style={{ color: "#fff8f0", display: "block" }}>Experience</span>
          </motion.h1>

          {/* Gold divider */}
          <motion.div
            style={{
              height: "2px", width: "72px",
              background: "linear-gradient(90deg,#f5a623,transparent)",
              marginBottom: "16px", transformOrigin: "left"
            }}
            initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1, duration: .7 }}
          />

          {/* Description */}
          <motion.p
            style={{
              color: "rgba(255,248,240,.62)", fontSize: ".92rem",
              lineHeight: 1.7, maxWidth: "400px", marginBottom: "24px"
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: .8 }}
          >
            Discover the divine. Explore ancient temples, sacred rituals, and
            spiritual destinations across India — all in one place.
          </motion.p>

          {/* Stats */}
          <motion.div className="flex gap-8"
            style={{ marginBottom: "36px" }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: .7 }}>
            {[
              { value: 1, suffix: "+", label: "TEMPLES" },
              { value: 14, suffix: "+", label: "SACRED CITIES" },
              { symbol: "∞", label: "BLESSINGS" },
            ].map((stat, i) => (
              <div key={stat.label} className="stat-card">
                <div className="font-cinzel font-bold"
                  style={{
                    fontSize: "1.8rem", color: "#f5a623",
                    animation: "goldenGlow 3s ease-in-out infinite",
                    animationDelay: `${i * .4}s`
                  }}>
                  {stat.symbol
                    ? stat.symbol
                    : <AnimatedNumber target={stat.value} suffix={stat.suffix}
                      delay={1400 + i * 200} />}
                </div>
                <div className="font-cinzel tracking-widest"
                  style={{
                    fontSize: ".6rem", color: "rgba(255,248,240,.42)",
                    marginTop: "4px"
                  }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Explore Temples CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: .7 }}
            style={{ marginBottom: "28px" }}
          >
            <button
              className="cta-btn font-cinzel tracking-wider"
              style={{ padding: "16px 44px", fontSize: "1rem" }}
              onClick={() => templesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Explore Temples
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>

          {/* Day / Night status */}
          <AnimatePresence mode="wait">
            <motion.div key={isNight ? "n" : "d"}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: .4 }}
              className="flex items-center gap-2">
              <motion.div
                animate={{ background: C.dotColor, boxShadow: C.dotShadow }}
                transition={{ duration: 1.4 }}
                style={{ width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0 }}
              />
              <motion.span
                animate={{ color: C.statusColor }}
                transition={{ duration: 1.4 }}
                className="font-cinzel tracking-widest"
                style={{ fontSize: ".55rem" }}>
              </motion.span>
            </motion.div>
          </AnimatePresence>

        </motion.div>

        {/* Bottom gradient */}
        <motion.div className="absolute bottom-0 left-0 w-full pointer-events-none z-10"
          style={{ height: "80px" }}
          animate={{
            background: isNight
              ? "linear-gradient(to top,rgba(4,6,18,.90) 0%,transparent 100%)"
              : "linear-gradient(to top,rgba(13,4,0,.85) 0%,transparent 100%)"
          }}
          transition={{ duration: 2.2 }} />

        {/* Side decorative line */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 z-20">
          <div style={{
            width: "1px", height: "50px",
            background: "linear-gradient(to bottom,transparent,#f5a623,transparent)"
          }} />
          <span className="font-cinzel"
            style={{
              fontSize: ".5rem", writingMode: "vertical-rl",
              letterSpacing: "3px", color: "rgba(245,166,35,.4)"
            }}>DIVINE INDIA</span>
          <div style={{
            width: "1px", height: "50px",
            background: "linear-gradient(to bottom,transparent,#f5a623,transparent)"
          }} />
        </div>

        <style>{`
        /* ── Scoped only to this temple hero page ── */

        .temple-hero-root {
          min-height: 100svh;
          overflow: hidden;
          font-family: var(--font-inter), 'Inter', sans-serif;
          color: #fff8f0;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 768px) {
          .temple-hero-root {
            height: 100svh;
            display: block;
          }
        }

        /* ── HERO RESPONSIVE COLUMNS ── */

        /* Mobile only (< 768px): blended stacked layout */
        @media (max-width: 767px) {
          .temple-left-col {
            position: relative;
            width: 100%;
            height: 52vh;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            z-index: 10;
            overflow: hidden;
          }
          .temple-left-col::before {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 2;
            pointer-events: none;
            background:
              linear-gradient(to right, rgba(13,4,0,0.85) 0%, transparent 28%, transparent 72%, rgba(13,4,0,0.85) 100%),
              linear-gradient(to bottom, rgba(13,4,0,0.55) 0%, transparent 30%);
          }
          .temple-left-col::after {
            content: '';
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 55%;
            z-index: 3;
            pointer-events: none;
            background: linear-gradient(to top, rgba(13,4,0,1) 0%, rgba(13,4,0,0.55) 40%, transparent 100%);
          }
          .temple-right-col {
            position: relative;
            width: 100%;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            padding: 1rem clamp(16px, 6vw, 40px) 3rem;
            z-index: 10;
            margin-top: -48px;
            background: linear-gradient(to top, rgba(13,4,0,0.75) 0%, transparent 60%);
          }
        }

        /* Desktop / Tablet (768px+): original layout unchanged */
        @media (min-width: 768px) {
          .temple-left-col {
            position: absolute;
            top: 0; left: 0;
            width: 50%; height: 100%;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            z-index: 10;
          }
          .temple-right-col {
            position: absolute;
            top: 0; right: 0;
            width: 50%; height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 clamp(24px, 5vw, 72px);
            z-index: 10;
            background: none;
          }
        }


        /* Keyframes */
        @keyframes starTwinkle {
          0%,100% { opacity:.35; transform:scale(1); }
          50%      { opacity:1;   transform:scale(1.7); }
        }
        @keyframes orbPulse {
          0%,100% { opacity:.15; transform:scale(1); }
          50%      { opacity:.30; transform:scale(1.08); }
        }
        @keyframes particleDrift {
          0%   { transform:translateY(0) translateX(0) scale(1); opacity:.6; }
          50%  { transform:translateY(-60px) translateX(20px) scale(1.3); opacity:1; }
          100% { transform:translateY(-120px) translateX(-10px) scale(.6); opacity:0; }
        }
        @keyframes goldenGlow {
          0%,100% { opacity:.9; }
          50%      { opacity:1; }
        }
        @keyframes templeGlowAnim {
          0%,100% { filter:drop-shadow(0 0 20px rgba(245,166,35,.35)) drop-shadow(0 0 60px rgba(245,166,35,.15)); }
          50%      { filter:drop-shadow(0 0 40px rgba(255,215,0,.55)) drop-shadow(0 0 100px rgba(245,166,35,.30)); }
        }

        /* Particles */
        .particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, #ffd700, #f5a623);
          animation: particleDrift linear infinite;
          pointer-events: none;
        }

        /* Stat card — no box, just slide-in underline on hover */
        .stat-card {
          position: relative;
          cursor: default;
        }
        .stat-card::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: linear-gradient(90deg, #f5a623, #ffd700);
          transition: width 0.35s ease;
        }
        .stat-card:hover::after { width: 100%; }

        /* CTA button */
        .cta-btn {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f5a623, #ff8c00);
          border: none;
          border-radius: 50px;
          padding: 14px 36px;
          color: #fff;
          font-family: var(--font-cinzel), 'Cinzel', serif;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 20px rgba(245,166,35,.45), 0 2px 8px rgba(0,0,0,.4);
        }
        .cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,.25) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        .cta-btn:hover::before { transform: translateX(100%); }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(245,166,35,.6); }
        .cta-btn:active { transform: translateY(0); }
      `}</style>


      </motion.div>



      {/* ── Filter Bar ── */}
      <div ref={templesListRef} className="w-full px-4 md:px-8 py-4 relative z-20 bg-[#FFF8F0]">
        {/* The Gray Card Container */}
        <div className="max-w-7xl mx-auto bg-gray-800 rounded-3xl border border-white/10 shadow-2xl p-5 md:p-6">

          {/* Filter row */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">

            {/* Search box (Left Side) */}
            <div className="relative flex-1 max-w-sm w-full">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search temples, deity, city…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/10 text-white placeholder-gray-300 border border-white/10 rounded-full text-sm focus:outline-none focus:border-orange-400/50 focus:bg-white/20 transition-colors"
              />
            </div>

            {/* Dropdown filters (Right Side) */}
            <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end">
              <span className="text-xs font-cinzel font-bold text-gray-300 uppercase tracking-widest hidden md:block mr-1">Filter by:</span>
              <Dropdown name="Location" />
              <Dropdown name="Deity" />
              <Dropdown name="Benefits" />

              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 text-sm font-cinzel font-semibold text-white rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:scale-105 transition-transform shadow-md shadow-orange-500/20"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Chips */}
          {(activeFilterCount > (search ? 1 : 0)) && (
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider mr-2">Active:</span>
              {Object.entries(filters).map(([key, value]) =>
                value ? (
                  <div
                    key={key}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-300 rounded-full text-xs font-medium"
                  >
                    {value}
                    <button
                      onClick={() => removeFilter(key)}
                      className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-orange-500/20 transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>


      {/* ── Temple Cards Grid ── */}
      <div className="w-full px-4 py-6" style={{ background: '#FFF8F0', minHeight: '400px' }}>
        <div className="max-w-7xl mx-auto">

          {/* Loading skeletons */}
          {loadingT && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden bg-zinc-900/80 border border-white/10 animate-pulse">
                  <div className="h-56 bg-zinc-800" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-zinc-700 rounded w-3/4" />
                    <div className="h-3 bg-zinc-700 rounded w-1/2" />
                    <div className="h-3 bg-zinc-700 rounded w-5/6" />
                    <div className="flex gap-2 mt-2">
                      <div className="h-6 w-16 bg-zinc-700 rounded-full" />
                      <div className="h-6 w-20 bg-zinc-700 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingT && temples.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <div className="text-6xl mb-4">🛕</div>
              <p className="text-lg font-semibold text-gray-300 mb-2">No temples found</p>
              <p className="text-sm mb-6">Try changing your filters or search term</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Cards */}
          {!loadingT && temples.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {temples.map((temple, index) => (
                <TempleCard key={temple._id || index} temple={temple} />
              ))}
            </div>
          )}
        </div>
      </div>

    </>
  );

}

/* ─────────────────────────────────────────────────────────────
   DesktopArcSun
   Arc = pure rAF loop. React re-renders cannot affect it.
   Tooltip uses LOCAL state — no parent prop round-trip needed.
───────────────────────────────────────────────────────────── */
function DesktopArcSun({ C, isNight, clicked, toggle }) {
  const wrapRef  = useRef(null);
  const firedRef = useRef(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const P0 = { x: 24, y: 102 };
    const P1 = { x: 48, y: -8  };
    const P2 = { x: 88, y: 12  };
    const DELAY    = 500;
    const DURATION = 5000;
    const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    // Set imperatively — React must NOT control left/top/zIndex
    el.style.left   = "24vw";
    el.style.top    = "102vh";
    el.style.zIndex = "8";   // behind temple during arc

    let raf;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime - DELAY;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }

      const raw = Math.min(elapsed / DURATION, 1);
      const t   = ease(raw);

      const x = (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x;
      const y = (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y;

      el.style.left = `${x}vw`;
      el.style.top  = `${y}vh`;

      if (raw < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        if (!firedRef.current) {
          firedRef.current = true;
          el.style.zIndex = "20";  // above columns — now clickable
          setShowHint(true);       // show tooltip directly (local state)
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="hidden md:block"
      style={{
        position: "absolute",
        transform: "translate(-50%, -50%)",
        // left / top / zIndex: managed imperatively above
      }}
    >
      <motion.div
        onClick={toggle}
        animate={{
          backgroundColor: C.celestialColor,
          boxShadow: C.celestialShadow,
        }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        style={{
          width: "62px", height: "62px", borderRadius: "50%",
          cursor: "pointer",
          position: "relative",
        }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Tooltip — local state, shows after arc ends */}
        <AnimatePresence>
          {showHint && !clicked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ delay: 0.3 }}
              style={{
                position: "absolute", bottom: "-32px", left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,.75)",
                color: isNight ? "#c8d8ff" : "#ffd700",
                fontSize: ".55rem", padding: "3px 9px", borderRadius: "20px",
                whiteSpace: "nowrap", fontFamily: "var(--font-cinzel),serif",
                letterSpacing: "1px", pointerEvents: "none",
                border: `1px solid ${isNight ? "rgba(200,220,255,.3)" : "rgba(255,215,0,.3)"}`,
              }}>
              Click to toggle night
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
