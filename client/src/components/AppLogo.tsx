import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AppLogoProps {
  size?: number; // logo card size, default 96
  showHalo?: boolean; // show outer glow halo, default true
}

export function AppLogo({ size = 96, showHalo = true }: AppLogoProps) {
  const svgSize = size * 0.604; // 58/96
  const cardRadius = size * 0.27; // 26/96

  // Animation controls
  const sweepControls = useAnimation();
  const haloControls = useAnimation();

  useEffect(() => {
    // Sweep Animation
    sweepControls.start({
      rotate: [0, 360],
      transition: {
        duration: 3,
        ease: "linear",
        repeat: Infinity,
      }
    });

    // Halo Pulse
    haloControls.start({
      scale: [1, 1.15, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
      }
    });
  }, [sweepControls, haloControls]);

  // Ping Dot Animation Component
  const PingDot = ({ cx, cy, delay, r, color }: { cx: number, cy: number, delay: number, r: number, color: string }) => (
    <>
      <motion.circle
        cx={cx} cy={cy} r={r} fill={color}
        animate={{ opacity: [0, 1, 0], r: [r, r * 1.5, r] }}
        transition={{
          duration: 3,
          times: [0, 0.1, 0.3], // fast ping, slow fade
          delay: delay,
          repeat: Infinity,
          repeatDelay: 0
        }}
      />
      <circle cx={cx} cy={cy} r={r * 1.5} stroke={color} strokeOpacity="0.2" strokeWidth="0.8" fill="none" />
    </>
  );

  return (
    <div 
      style={{ width: size + 40, height: size + 40 }}
      className="flex items-center justify-center relative"
    >
      {/* Outer halo glow */}
      {showHalo && (
        <motion.div
          animate={haloControls}
          style={{ 
            width: size + 40, 
            height: size + 40, 
            borderRadius: (size + 40) / 2,
            background: 'radial-gradient(circle, rgba(91,108,248,0.4) 0%, rgba(91,108,248,0) 70%)',
          }}
          className="absolute"
        />
      )}

      {/* Glass card */}
      <div 
        style={{
          width: size,
          height: size,
          borderRadius: cardRadius,
          background: 'linear-gradient(135deg, #1C1F4A 0%, #1A2E5A 40%, #0F3B4A 80%, #0D3040 100%)',
          boxShadow: '0 8px 32px 0 rgba(91, 108, 248, 0.3)',
          border: '1px solid rgba(91, 108, 248, 0.25)',
        }}
        className="relative overflow-hidden flex items-center justify-center z-10"
      >
        {/* Top sheen overlay */}
        <div 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '48%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0))',
            borderRadius: `${cardRadius}px ${cardRadius}px 0 0`
          }}
        />
        
        {/* Corner reflection */}
        <div 
          style={{
            position: 'absolute',
            top: 8, right: 10,
            width: 18, height: 18,
            borderRadius: 9,
            backgroundColor: 'rgba(255,255,255,0.12)',
          }}
        />

        {/* SVG Icon */}
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 58 58"
          style={{ zIndex: 1 }}
        >
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5B8BF8" />
              <stop offset="50%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="sweepGrad" x1="50%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5B6CF8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.2" />
            </linearGradient>
            <radialGradient id="centerGlow" cx="50%" cy="72%" r="40%">
              <stop offset="0%" stopColor="#5B6CF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#5B6CF8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Center glow */}
          <ellipse cx="29" cy="42" rx="18" ry="10" fill="url(#centerGlow)" opacity="0.5" />

          {/* ── 3 CONCENTRIC RADAR ARCS ── */}
          <path d="M 14 42 A 18 18 0 0 1 32 24" stroke="url(#arcGrad)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.25" />
          <path d="M 17 42 A 13 13 0 0 1 30 29" stroke="url(#arcGrad)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
          <path d="M 20 42 A 8 8 0 0 1 28 34" stroke="url(#arcGrad)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8" />

          {/* ── ANIMATED SWEEP LINE ── */}
          <motion.g animate={sweepControls} style={{ originX: "29px", originY: "42px" }}>
            <g transform="translate(29, 42)">
              {/* Sector fill */}
              <path d="M 0 0 L -15 -20 A 25 25 0 0 1 -2 -25 Z" fill="url(#sweepGrad)" opacity="0.15" />
              {/* Sweep line */}
              <line x1="0" y1="0" x2="-6" y2="-22" stroke="url(#arcGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
            </g>
          </motion.g>

          {/* ── BASE PLATFORM ── */}
          <line x1="11" y1="42" x2="47" y2="42" stroke="rgba(91,139,248,0.35)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="29" y1="42" x2="29" y2="48" stroke="rgba(91,139,248,0.5)" strokeWidth="2" strokeLinecap="round" />
          <line x1="22" y1="48" x2="36" y2="48" stroke="rgba(91,139,248,0.4)" strokeWidth="2" strokeLinecap="round" />

          {/* ── PIVOT POINT ── */}
          <circle cx="29" cy="42" r="2.5" fill="#5B8BF8" />
          <circle cx="29" cy="42" r="1.2" fill="#A0C4FF" />

          {/* ── PING DOTS — pulse when sweep passes over ── */}
          <PingDot cx={21} cy={30} r={1.5} color="#2DD4BF" delay={0} />
          <PingDot cx={35} cy={26} r={1.5} color="#5B8BF8" delay={1} />
          <PingDot cx={26} cy={24} r={1.2} color="#38BDF8" delay={2} />

          {/* ── TOP FOCAL POINT ── */}
          <circle cx="29" cy="17" r="2.5" fill="#2DD4BF" opacity="0.5" />
          <circle cx="29" cy="17" r="1.2" fill="#E0FFFE" opacity="0.8" />
        </svg>
      </div>
    </div>
  );
}
