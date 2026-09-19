import React from 'react';
import { motion } from 'motion/react';

interface ArtisticSkyLanternProps {
  wishText: string;
  recipientName: string;
  onEditWish: () => void;
  className?: string;
}

/**
 * Luminous 8-pointed celestial star (Octagram) with warm golden halo
 */
const EightPointedStar: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.15, 1],
        filter: [
          'drop-shadow(0 0 10px rgba(255,255,255,0.95)) drop-shadow(0 0 22px rgba(251,191,36,0.85)) drop-shadow(0 0 35px rgba(245,158,11,0.6))',
          'drop-shadow(0 0 16px rgba(255,255,255,1)) drop-shadow(0 0 32px rgba(251,191,36,1)) drop-shadow(0 0 45px rgba(245,158,11,0.8))',
          'drop-shadow(0 0 10px rgba(255,255,255,0.95)) drop-shadow(0 0 22px rgba(251,191,36,0.85)) drop-shadow(0 0 35px rgba(245,158,11,0.6))',
        ],
      }}
      transition={{
        repeat: Infinity,
        duration: 2.8,
        ease: 'easeInOut',
      }}
      className={`relative flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-130 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
      title="Klik bintang untuk menulis doa"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="eightStarGold" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#FFFBEB" />
            <stop offset="60%" stopColor="#FDE68A" />
            <stop offset="85%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <linearGradient id="eightStarDiag" x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="25%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="75%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Outer Aura Ring */}
        <circle cx="50" cy="50" r="30" fill="#FEF08A" opacity="0.3" />
        <circle cx="50" cy="50" r="16" fill="#FFFFFF" opacity="0.45" />

        {/* 1. Diagonal 4-point secondary star (rotated 45deg) */}
        <path
          d="M50 12 L58 42 L88 50 L58 58 L50 88 L42 58 L12 50 L42 42 Z"
          fill="url(#eightStarDiag)"
          transform="rotate(45 50 50)"
          opacity="0.95"
        />

        {/* 2. Cardinal 4-point primary star (longer rays) */}
        <path
          d="M50 0 L59 41 L100 50 L59 59 L50 100 L41 59 L0 50 L41 41 Z"
          fill="url(#eightStarGold)"
        />

        {/* 3. Central Brilliant White Diamond Core */}
        <path
          d="M50 30 L58 50 L50 70 L42 50 Z"
          fill="#FFFFFF"
        />
        <circle cx="50" cy="50" r="5" fill="#FFFFFF" />
      </svg>
    </motion.div>
  );
};

/**
 * An artistic, high-craft 3D Sky Lantern (Khom Loi / Kongming Lantern).
 * Features:
 * - Authentic rice paper translucency with multi-layered fire diffusion
 * - Structural bamboo ribs, collar hoops, and bottom fuel burner with wire crossbars
 * - Animated multi-stage flickering flame with dynamic inner glow
 * - Ascending warm ember sparks
 * - Glowing calligraphy typography on translucent paper
 */
export const ArtisticSkyLantern: React.FC<ArtisticSkyLanternProps> = ({
  wishText,
  recipientName,
  onEditWish,
  className = '',
}) => {
  const hasWish = Boolean(wishText && wishText.trim());

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 1. Large Ambient Radiance Bloom (Warm Golden Halo) */}
      <div className="absolute -inset-14 bg-gradient-to-t from-orange-500/35 via-amber-400/25 to-yellow-200/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-6 w-52 h-36 bg-amber-500/30 rounded-full blur-2xl pointer-events-none" />

      {/* 2. Floating Wind Sway & Bobbing Motion */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
          rotate: [-1.8, 1.8, -1.8],
          x: [-3, 3, -3],
        }}
        transition={{
          repeat: Infinity,
          duration: 5.5,
          ease: 'easeInOut',
        }}
        className="relative flex flex-col items-center cursor-pointer group"
        onClick={onEditWish}
      >
        {/* Main Lantern Silhouette Container */}
        <div className="relative w-56 h-72 sm:w-64 sm:h-84 flex flex-col items-center">
          <svg
            viewBox="0 0 280 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full filter drop-shadow-[0_0_35px_rgba(251,191,36,0.65)] overflow-visible"
          >
            <defs>
              {/* Rice Paper Body Gradients */}
              <linearGradient id="lanternPaper" x1="140" y1="20" x2="140" y2="310" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.95" />
                <stop offset="25%" stopColor="#FEF3C7" stopOpacity="0.92" />
                <stop offset="60%" stopColor="#FDE68A" stopOpacity="0.94" />
                <stop offset="85%" stopColor="#F59E0B" stopOpacity="0.96" />
                <stop offset="100%" stopColor="#D97706" stopOpacity="0.98" />
              </linearGradient>

              {/* Internal Flame Core Radial Glow */}
              <radialGradient id="fireCoreGlow" cx="140" cy="285" r="140" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="20%" stopColor="#FEF08A" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.75" />
                <stop offset="75%" stopColor="#EA580C" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#9A3412" stopOpacity="0" />
              </radialGradient>

              {/* Shading on Left & Right Curves (Volume Illusion) */}
              <linearGradient id="sideCurvatureShade" x1="20" y1="160" x2="260" y2="160" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#B45309" stopOpacity="0.45" />
                <stop offset="15%" stopColor="#D97706" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#FEF3C7" stopOpacity="0" />
                <stop offset="85%" stopColor="#D97706" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#B45309" stopOpacity="0.45" />
              </linearGradient>

              {/* Bamboo Hoops and Collar */}
              <linearGradient id="bambooRim" x1="70" y1="0" x2="210" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#78350F" />
                <stop offset="30%" stopColor="#D97706" />
                <stop offset="70%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>

              {/* Realistic Flame Gradients */}
              <linearGradient id="innerFlameGrad" x1="140" y1="290" x2="140" y2="245" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#FEF08A" />
                <stop offset="80%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </linearGradient>

              <filter id="flameBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* -------------------------------------------------------------
                1. RICE PAPER LANTERN BODY (Organic curved silhouette)
               ------------------------------------------------------------- */}
            {/* Base paper shape: narrow mouth at bottom, bulging center, dome top */}
            <path
              d="M75 310 C60 250 28 190 32 110 C36 40 85 18 140 18 C195 18 244 40 248 110 C252 190 220 250 205 310 Z"
              fill="url(#lanternPaper)"
            />

            {/* Internal Volumetric Light Diffusion */}
            <path
              d="M75 310 C60 250 28 190 32 110 C36 40 85 18 140 18 C195 18 244 40 248 110 C252 190 220 250 205 310 Z"
              fill="url(#fireCoreGlow)"
            />

            {/* Side 3D Cylindrical Volume Shading */}
            <path
              d="M75 310 C60 250 28 190 32 110 C36 40 85 18 140 18 C195 18 244 40 248 110 C252 190 220 250 205 310 Z"
              fill="url(#sideCurvatureShade)"
            />

            {/* -------------------------------------------------------------
                2. DELICATE BAMBOO RIBS & STRUCTURAL HOOPS
               ------------------------------------------------------------- */}
            {/* Center Rib */}
            <path
              d="M140 18 L140 310"
              stroke="#B45309"
              strokeWidth="1.2"
              strokeOpacity="0.35"
            />
            {/* Inner Left Rib */}
            <path
              d="M140 18 C105 50 85 170 102 310"
              stroke="#B45309"
              strokeWidth="1.2"
              strokeOpacity="0.3"
            />
            {/* Inner Right Rib */}
            <path
              d="M140 18 C175 50 195 170 178 310"
              stroke="#B45309"
              strokeWidth="1.2"
              strokeOpacity="0.3"
            />
            {/* Outer Left Rib */}
            <path
              d="M140 18 C70 50 50 170 82 310"
              stroke="#B45309"
              strokeWidth="1.2"
              strokeOpacity="0.25"
            />
            {/* Outer Right Rib */}
            <path
              d="M140 18 C210 50 230 170 198 310"
              stroke="#B45309"
              strokeWidth="1.2"
              strokeOpacity="0.25"
            />

            {/* Horizontal Bamboo Hoops (curved perspective) */}
            <path
              d="M48 85 Q140 105 232 85"
              stroke="#B45309"
              strokeWidth="1"
              strokeOpacity="0.2"
              fill="none"
            />
            <path
              d="M34 150 Q140 178 246 150"
              stroke="#B45309"
              strokeWidth="1.2"
              strokeOpacity="0.25"
              fill="none"
            />
            <path
              d="M45 225 Q140 255 235 225"
              stroke="#B45309"
              strokeWidth="1.2"
              strokeOpacity="0.3"
              fill="none"
            />

            {/* Top Crown Bamboo Cap */}
            <ellipse
              cx="140"
              cy="20"
              rx="32"
              ry="6"
              fill="url(#bambooRim)"
              stroke="#78350F"
              strokeWidth="1"
            />
            <ellipse cx="140" cy="19" rx="14" ry="3" fill="#FEF3C7" opacity="0.8" />

            {/* -------------------------------------------------------------
                3. BOTTOM BAMBOO RING & FUEL BURNER
               ------------------------------------------------------------- */}
            {/* Wire Crossbars (holds burner) */}
            <line x1="82" y1="310" x2="198" y2="310" stroke="#78350F" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="140" y1="295" x2="140" y2="320" stroke="#78350F" strokeWidth="1.5" strokeOpacity="0.7" />

            {/* Bottom Bamboo Rim Hoop */}
            <ellipse
              cx="140"
              cy="310"
              rx="68"
              ry="11"
              fill="none"
              stroke="url(#bambooRim)"
              strokeWidth="5"
            />
            <ellipse
              cx="140"
              cy="310"
              rx="68"
              ry="11"
              fill="none"
              stroke="#451A03"
              strokeWidth="1"
              strokeOpacity="0.6"
            />

            {/* Fuel Block in Center of Crossbar */}
            <rect
              x="128"
              y="298"
              width="24"
              height="10"
              rx="3"
              fill="#451A03"
              stroke="#D97706"
              strokeWidth="1"
            />

            {/* -------------------------------------------------------------
                4. DANCING INNER FLAME (Multi-layer flickering torch)
               ------------------------------------------------------------- */}
            {/* Outer Flame Aura */}
            <motion.path
              animate={{
                d: [
                  'M140 240 Q156 265 154 295 Q140 305 126 295 Q124 265 140 240 Z',
                  'M140 236 Q160 263 152 297 Q140 306 128 297 Q120 263 140 236 Z',
                  'M140 242 Q153 268 155 294 Q140 304 125 294 Q127 268 140 242 Z',
                ],
                scale: [1, 1.06, 0.98, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                ease: 'easeInOut',
              }}
              fill="url(#innerFlameGrad)"
              filter="url(#flameBlur)"
            />

            {/* White-Hot Flame Core */}
            <motion.path
              animate={{
                d: [
                  'M140 258 Q148 275 147 296 Q140 300 133 296 Q132 275 140 258 Z',
                  'M140 255 Q150 273 146 297 Q140 301 134 297 Q130 273 140 255 Z',
                  'M140 260 Q147 276 148 295 Q140 299 132 295 Q133 276 140 260 Z',
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.5,
                ease: 'easeInOut',
              }}
              fill="#FFFFFF"
            />
          </svg>

          {/* Floating Embers Rising inside/around the lantern */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{
                y: [80, -120],
                x: [0, 8, -6, 4],
                opacity: [0, 1, 0.8, 0],
                scale: [0.6, 1.2, 0.5],
              }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeOut', delay: 0.2 }}
              className="absolute bottom-20 left-[48%] w-1.5 h-1.5 bg-yellow-200 rounded-full blur-[0.5px] shadow-[0_0_8px_#fef08a]"
            />
            <motion.div
              animate={{
                y: [90, -100],
                x: [0, -10, 8, -4],
                opacity: [0, 0.9, 0.7, 0],
                scale: [0.5, 1.4, 0.4],
              }}
              transition={{ repeat: Infinity, duration: 3.4, ease: 'easeOut', delay: 1.1 }}
              className="absolute bottom-16 left-[53%] w-2 h-2 bg-amber-300 rounded-full blur-[0.5px] shadow-[0_0_10px_#f59e0b]"
            />
            <motion.div
              animate={{
                y: [70, -140],
                x: [0, 12, -8],
                opacity: [0, 1, 0.5, 0],
                scale: [0.4, 1.1, 0.3],
              }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeOut', delay: 1.9 }}
              className="absolute bottom-24 left-[46%] w-1.5 h-1.5 bg-orange-200 rounded-full blur-[0.5px]"
            />
          </div>

          {/* -------------------------------------------------------------
              5. LUMINOUS 8-POINTED CELESTIAL STAR (CLICKABLE)
             ------------------------------------------------------------- */}
          <div className="absolute inset-x-5 top-14 bottom-20 flex flex-col items-center justify-center p-3 text-center pointer-events-auto">
            <div
              onClick={(e) => {
                e.stopPropagation();
                onEditWish();
              }}
              className="flex flex-col items-center justify-center cursor-pointer group/star active:scale-95 transition-transform"
              title="Klik bintang untuk menulis doa"
            >
              <EightPointedStar size={hasWish ? 50 : 64} />

              {/* If wish is inscribed, render seamless borderless golden calligraphy directly on paper */}
              {hasWish && (
                <div className="mt-2.5 px-2 text-center max-w-[210px]">
                  <p className="text-xs sm:text-sm font-serif italic text-amber-950 font-bold leading-relaxed line-clamp-3 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
                    "{wishText}"
                  </p>
                  <span className="text-[10px] font-sans font-extrabold text-amber-900/90 block mt-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                    ❤️ {recipientName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            6. LANTERN BOTTOM TETHER NODE
           ------------------------------------------------------------- */}
        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-500 border-2 border-white shadow-md -mt-1 z-20 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-amber-950 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};
