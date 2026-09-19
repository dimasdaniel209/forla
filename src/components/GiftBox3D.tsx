import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface GiftBox3DProps {
  isUnlocked: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * High-craft, luxurious 3D Gift Box
 * - Deep velvet crimson red body with glossy beveled lid
 * - Radiant yellow satin ribbon adorned with delicate golden trim
 * - Opulent multi-loop 3D yellow satin bow with golden celestial gem knot
 * - Ambient floating golden spark particles and soft ground contact shadow
 * - Dynamic lid lifting animation with sunbeam rays upon unlocking
 */
export const GiftBox3D: React.FC<GiftBox3DProps> = ({
  isUnlocked,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center select-none cursor-pointer group ${className}`}
      title={isUnlocked ? 'Klik untuk membuka kado!' : 'Kotak Hadiah Ulang Tahun'}
    >
      {/* -------------------------------------------------------------
          1. AMBIENT GLOW & PARTICLES
         ------------------------------------------------------------- */}
      {/* Ambient Floor Ground Shadow */}
      <div className="absolute -bottom-5 inset-x-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: isUnlocked ? [1.15, 1.3, 1.15] : [0.95, 1.12, 0.95],
            opacity: isUnlocked ? [0.65, 0.85, 0.65] : [0.35, 0.55, 0.35],
          }}
          transition={{
            repeat: Infinity,
            duration: 3.4,
            ease: 'easeInOut',
          }}
          className={`rounded-full blur-xl transition-colors duration-500 ${
            isUnlocked ? 'w-60 h-14 bg-amber-400/45' : 'w-52 h-11 bg-black/60'
          }`}
        />
        <motion.div
          animate={{
            scale: [0.9, 1.06, 0.9],
            opacity: [0.55, 0.75, 0.55],
          }}
          transition={{
            repeat: Infinity,
            duration: 3.4,
            ease: 'easeInOut',
          }}
          className="absolute w-36 h-7 bg-black/80 rounded-full blur-[3px]"
        />
      </div>

      {/* Floating Magic Star Sparks */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {[
          { top: '15%', left: '12%', size: 10, delay: 0, dur: 2.8 },
          { top: '22%', right: '14%', size: 14, delay: 0.8, dur: 3.2 },
          { top: '65%', left: '8%', size: 8, delay: 1.4, dur: 2.5 },
          { top: '58%', right: '10%', size: 11, delay: 0.4, dur: 3.0 },
          { top: '8%', right: '35%', size: 9, delay: 1.8, dur: 2.7 },
        ].map((star, idx) => (
          <motion.div
            key={idx}
            animate={{
              y: [-4, 4, -4],
              scale: [0.7, 1.25, 0.7],
              opacity: [0.35, 0.9, 0.35],
            }}
            transition={{
              repeat: Infinity,
              duration: star.dur,
              delay: star.delay,
              ease: 'easeInOut',
            }}
            style={{
              top: star.top,
              left: star.left,
              right: star.right,
              width: star.size,
              height: star.size,
            }}
            className="absolute text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8Z" />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Magical Inner Light Rays (bursts when unlocked) */}
      <AnimatePresence>
        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute -top-12 inset-x-0 flex items-center justify-center pointer-events-none z-0"
          >
            <div className="w-72 h-72 bg-gradient-to-tr from-amber-400/40 via-yellow-200/60 to-emerald-300/40 rounded-full blur-3xl animate-pulse" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
              className="absolute w-80 h-80 opacity-40 flex items-center justify-center"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {Array.from({ length: 12 }).map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="50"
                    x2={50 + 46 * Math.cos((i * 30 * Math.PI) / 180)}
                    y2={50 + 46 * Math.sin((i * 30 * Math.PI) / 180)}
                    stroke="#FEF08A"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.75"
                  />
                ))}
              </svg>
            </motion.div>
            <div className="absolute flex items-center justify-center">
              <Sparkles className="w-14 h-14 text-amber-200 animate-spin opacity-90 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          2. FLOATING 3D BOX STAGE
         ------------------------------------------------------------- */}
      <motion.div
        animate={{
          y: isUnlocked ? [-4, 5, -4] : [-9, 9, -9],
          rotate: isUnlocked ? [-0.5, 0.5, -0.5] : [-1.5, 1.5, -1.5],
        }}
        transition={{
          repeat: Infinity,
          duration: 3.4,
          ease: 'easeInOut',
        }}
        className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 z-10"
      >
        <svg
          viewBox="0 0 320 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_24px_32px_rgba(0,0,0,0.55)] overflow-visible"
        >
          <defs>
            {/* Box Body Gradients (Rich Velvet Ruby Red) */}
            <linearGradient id="bodyLeftRed" x1="40" y1="110" x2="160" y2="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="35%" stopColor="#DC2626" />
              <stop offset="70%" stopColor="#B91C1C" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>

            <linearGradient id="bodyRightRed" x1="160" y1="120" x2="280" y2="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#B91C1C" />
              <stop offset="40%" stopColor="#881337" />
              <stop offset="85%" stopColor="#6B0A26" />
              <stop offset="100%" stopColor="#4C0519" />
            </linearGradient>

            {/* Lid Gradients (Vibrant Lacquered Scarlet) */}
            <linearGradient id="lidTopRed" x1="60" y1="35" x2="260" y2="145" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF6464" />
              <stop offset="30%" stopColor="#EF4444" />
              <stop offset="75%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>

            <linearGradient id="lidLeftRed" x1="35" y1="85" x2="160" y2="155" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF4D4D" />
              <stop offset="60%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#991B1B" />
            </linearGradient>

            <linearGradient id="lidRightRed" x1="160" y1="85" x2="285" y2="155" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#991B1B" />
              <stop offset="50%" stopColor="#7F1D1D" />
              <stop offset="100%" stopColor="#4C0519" />
            </linearGradient>

            {/* Radiant Golden Yellow Satin Ribbon Gradients */}
            <linearGradient id="ribbonTopCrossA" x1="70" y1="65" x2="250" y2="115" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF9C3" />
              <stop offset="30%" stopColor="#FDE047" />
              <stop offset="70%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>

            <linearGradient id="ribbonTopCrossB" x1="250" y1="65" x2="70" y2="115" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF9C3" />
              <stop offset="30%" stopColor="#FDE047" />
              <stop offset="70%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>

            <linearGradient id="ribbonBodyLeft" x1="90" y1="130" x2="120" y2="245" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF9C3" />
              <stop offset="25%" stopColor="#FDE047" />
              <stop offset="75%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>

            <linearGradient id="ribbonBodyRight" x1="200" y1="130" x2="230" y2="245" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EAB308" />
              <stop offset="45%" stopColor="#CA8A04" />
              <stop offset="85%" stopColor="#A16207" />
              <stop offset="100%" stopColor="#713F12" />
            </linearGradient>

            {/* Gold Trim Gradients */}
            <linearGradient id="goldTrimGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#FEF08A" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Bow Gradients */}
            <linearGradient id="bowLoopFront" x1="110" y1="35" x2="210" y2="105" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF9C3" />
              <stop offset="25%" stopColor="#FDE047" />
              <stop offset="65%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>

            <linearGradient id="bowLoopBack" x1="110" y1="25" x2="210" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EAB308" />
              <stop offset="55%" stopColor="#CA8A04" />
              <stop offset="100%" stopColor="#854D0E" />
            </linearGradient>

            <radialGradient id="knotGem" cx="160" cy="85" r="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#FEF08A" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="90%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </radialGradient>

            {/* Interior Treasure Glow */}
            <linearGradient id="interiorGold" x1="160" y1="90" x2="160" y2="185" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="40%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
          </defs>

          {/* =================================================================
              A. LOWER BOX BODY (Base)
             ================================================================= */}
          <g id="box-base">
            {/* Left Body Face */}
            <path
              d="M50 118 L160 168 L160 256 L50 206 Z"
              fill="url(#bodyLeftRed)"
            />

            {/* Right Body Face (Shaded side) */}
            <path
              d="M160 168 L270 118 L270 206 L160 256 Z"
              fill="url(#bodyRightRed)"
            />

            {/* Front Center Corner Highlight Spine */}
            <path
              d="M160 168 L160 256"
              stroke="#FCA5A5"
              strokeWidth="2"
              strokeOpacity="0.4"
            />

            {/* Outer Silhouette Edge Outline */}
            <path
              d="M50 118 L50 206 L160 256 L270 206 L270 118"
              stroke="#000000"
              strokeWidth="1.5"
              strokeOpacity="0.25"
            />

            {/* -------------------------------------------------------------
                VERTICAL RIBBON: LEFT BODY FACE (with Golden Trim)
               ------------------------------------------------------------- */}
            <path
              d="M94 138 L116 148 L116 236 L94 226 Z"
              fill="url(#ribbonBodyLeft)"
            />
            {/* Left Gold Trim Edges */}
            <path
              d="M94 138 L94 226"
              stroke="url(#goldTrimGrad)"
              strokeWidth="1.2"
              strokeOpacity="0.9"
            />
            <path
              d="M116 148 L116 236"
              stroke="url(#goldTrimGrad)"
              strokeWidth="1.2"
              strokeOpacity="0.9"
            />
            {/* Silky Center Sheen Line */}
            <path
              d="M105 143 L105 231"
              stroke="#FEF9C3"
              strokeWidth="2"
              strokeOpacity="0.75"
            />

            {/* -------------------------------------------------------------
                VERTICAL RIBBON: RIGHT BODY FACE (with Golden Trim)
               ------------------------------------------------------------- */}
            <path
              d="M204 148 L226 138 L226 226 L204 236 Z"
              fill="url(#ribbonBodyRight)"
            />
            {/* Right Gold Trim Edges */}
            <path
              d="M204 148 L204 236"
              stroke="url(#goldTrimGrad)"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />
            <path
              d="M226 138 L226 226"
              stroke="url(#goldTrimGrad)"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />
            {/* Subtle Sheen Line */}
            <path
              d="M215 143 L215 231"
              stroke="#FDE047"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />

            {/* Interior Radiant Gold Cavity (revealed when lid lifts) */}
            {isUnlocked && (
              <g id="box-interior-glow">
                <path
                  d="M54 120 L160 168 L266 120 L160 74 Z"
                  fill="url(#interiorGold)"
                />
                <circle cx="160" cy="120" r="42" fill="#FEF08A" opacity="0.65" filter="blur(10px)" />
                <circle cx="160" cy="120" r="16" fill="#FFFFFF" opacity="0.8" filter="blur(4px)" />
              </g>
            )}
          </g>

          {/* =================================================================
              B. 3D LID AND OPULENT BOW (Smoothly lifts when unlocked)
             ================================================================= */}
          <motion.g
            id="box-lid-and-bow"
            animate={{
              y: isUnlocked ? -52 : 0,
              rotate: isUnlocked ? -8 : 0,
              scale: isUnlocked ? 1.04 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 170,
              damping: 17,
            }}
            style={{ transformOrigin: '160px 85px' }}
          >
            {/* Soft Ambient Lid Underside Shadow onto Body */}
            <path
              d="M40 98 L160 152 L280 98 L272 114 L160 166 L48 114 Z"
              fill="#000000"
              opacity="0.42"
            />

            {/* Lid Rim Left */}
            <path
              d="M42 86 L160 140 L160 156 L42 102 Z"
              fill="url(#lidLeftRed)"
            />

            {/* Lid Rim Right (Shaded) */}
            <path
              d="M160 140 L278 86 L278 102 L160 156 Z"
              fill="url(#lidRightRed)"
            />

            {/* Lid Rim Ribbon Wrap Left */}
            <path
              d="M91 109 L113 119 L113 135 L91 125 Z"
              fill="url(#ribbonBodyLeft)"
            />
            <path d="M91 109 L91 125" stroke="url(#goldTrimGrad)" strokeWidth="1" />
            <path d="M113 119 L113 135" stroke="url(#goldTrimGrad)" strokeWidth="1" />

            {/* Lid Rim Ribbon Wrap Right */}
            <path
              d="M207 119 L229 109 L229 125 L207 135 Z"
              fill="url(#ribbonBodyRight)"
            />
            <path d="M207 119 L207 135" stroke="url(#goldTrimGrad)" strokeWidth="1" />
            <path d="M229 109 L229 125" stroke="url(#goldTrimGrad)" strokeWidth="1" />

            {/* Lid Top Face (Isometric Diamond) */}
            <path
              d="M160 30 L278 86 L160 140 L42 86 Z"
              fill="url(#lidTopRed)"
            />

            {/* Glossy Bevel Specular Highlight on Upper Lid Rim */}
            <path
              d="M42 86 L160 30 L278 86"
              stroke="#FECACA"
              strokeWidth="2.5"
              strokeOpacity="0.85"
              strokeLinecap="round"
            />

            {/* -------------------------------------------------------------
                LID TOP RIBBON CROSS (Emerald Satin with Gold Trim)
               ------------------------------------------------------------- */}
            {/* Diagonal Ribbon Band 1 (Top-Left to Bottom-Right) */}
            <path
              d="M90 64 L112 54 L230 110 L208 120 Z"
              fill="url(#ribbonTopCrossA)"
            />
            <path d="M90 64 L208 120" stroke="url(#goldTrimGrad)" strokeWidth="1.2" />
            <path d="M112 54 L230 110" stroke="url(#goldTrimGrad)" strokeWidth="1.2" />

            {/* Diagonal Ribbon Band 2 (Top-Right to Bottom-Left) */}
            <path
              d="M230 64 L208 54 L90 110 L112 120 Z"
              fill="url(#ribbonTopCrossB)"
            />
            <path d="M230 64 L112 120" stroke="url(#goldTrimGrad)" strokeWidth="1.2" />
            <path d="M208 54 L90 110" stroke="url(#goldTrimGrad)" strokeWidth="1.2" />

            {/* Center Satin Gleam Intersection */}
            <circle cx="160" cy="85" r="14" fill="#FACC15" opacity="0.8" />

            {/* -------------------------------------------------------------
                CASCADING SATIN RIBBON TAILS (Left & Right)
               ------------------------------------------------------------- */}
            {/* Left Ribbon Tail */}
            <path
              d="M160 85 C138 102 116 125 106 150 C114 146 124 149 130 146 C136 128 148 107 160 85 Z"
              fill="url(#ribbonBodyLeft)"
            />
            <path
              d="M106 150 C114 146 124 149 130 146"
              stroke="url(#goldTrimGrad)"
              strokeWidth="1.5"
            />

            {/* Right Ribbon Tail */}
            <path
              d="M160 85 C182 102 204 125 214 150 C206 146 196 149 190 146 C184 128 172 107 160 85 Z"
              fill="url(#ribbonBodyRight)"
            />
            <path
              d="M214 150 C206 146 196 149 190 146"
              stroke="url(#goldTrimGrad)"
              strokeWidth="1.5"
            />

            {/* -------------------------------------------------------------
                OPULENT MULTI-TIERED 3D BOW
               ------------------------------------------------------------- */}
            {/* 1. Back Upper Shadow Loops */}
            <path
              d="M160 82 C142 36 98 34 106 62 C113 84 142 82 160 84 Z"
              fill="url(#bowLoopBack)"
              opacity="0.95"
            />
            <path
              d="M160 82 C178 36 222 34 214 62 C207 84 178 82 160 84 Z"
              fill="url(#bowLoopBack)"
              opacity="0.95"
            />

            {/* 2. Front Volumetric Left Loop */}
            <path
              d="M160 85 C128 44 74 58 92 92 C106 116 144 94 160 87 Z"
              fill="url(#bowLoopFront)"
            />
            {/* Left Loop Gold Edge Trim */}
            <path
              d="M160 85 C128 44 74 58 92 92"
              stroke="url(#goldTrimGrad)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Left Loop Hollow Depth */}
            <ellipse
              cx="120"
              cy="78"
              rx="13"
              ry="7"
              transform="rotate(-28 120 78)"
              fill="#713F12"
            />
            {/* Left Loop Silky Luster Arc */}
            <path
              d="M96 84 C92 70 120 54 144 65"
              stroke="#FEF9C3"
              strokeWidth="3"
              strokeLinecap="round"
              strokeOpacity="0.9"
            />

            {/* 3. Front Volumetric Right Loop */}
            <path
              d="M160 85 C192 44 246 58 228 92 C214 116 176 94 160 87 Z"
              fill="url(#bowLoopFront)"
            />
            {/* Right Loop Gold Edge Trim */}
            <path
              d="M160 85 C192 44 246 58 228 92"
              stroke="url(#goldTrimGrad)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Right Loop Hollow Depth */}
            <ellipse
              cx="200"
              cy="78"
              rx="13"
              ry="7"
              transform="rotate(28 200 78)"
              fill="#713F12"
            />
            {/* Right Loop Silky Luster Arc */}
            <path
              d="M224 84 C228 70 200 54 176 65"
              stroke="#FEF9C3"
              strokeWidth="3"
              strokeLinecap="round"
              strokeOpacity="0.9"
            />

            {/* 4. Central Golden Gem Brooch / Knot */}
            <g id="central-brooch">
              {/* Outer Golden Flare Ring */}
              <circle
                cx="160"
                cy="85"
                r="18"
                fill="url(#goldTrimGrad)"
                filter="drop-shadow(0 4px 8px rgba(0,0,0,0.4))"
              />

              {/* Inner Emerald Jewel */}
              <circle
                cx="160"
                cy="85"
                r="13"
                fill="url(#ribbonTopCrossA)"
              />

              {/* Radiant Diamond Highlight / Star */}
              <path
                d="M160 74 L163 82 L171 85 L163 88 L160 96 L157 88 L149 85 L157 82 Z"
                fill="#FFFFFF"
                opacity="0.95"
              />
              <circle cx="160" cy="85" r="3" fill="#FFFFFF" />
            </g>
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
};
