import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface LanternParticle {
  id: number;
  x: number; // percentage across screen 5% to 95%
  size: number; // width in px
  duration: number; // drift duration in s
  delay: number; // start delay in s
  swayDuration: number;
  swayDistance: number;
  opacity: number;
  blur: number;
}

export const BackgroundFloatingLanterns: React.FC = () => {
  const lanterns = useMemo<LanternParticle[]>(() => {
    return [
      { id: 1, x: 8, size: 24, duration: 18, delay: 0, swayDuration: 4.2, swayDistance: 12, opacity: 0.75, blur: 0 },
      { id: 2, x: 18, size: 14, duration: 25, delay: 4, swayDuration: 5.5, swayDistance: 8, opacity: 0.5, blur: 1 },
      { id: 3, x: 28, size: 18, duration: 21, delay: 1, swayDuration: 4.8, swayDistance: 10, opacity: 0.65, blur: 0.5 },
      { id: 4, x: 74, size: 16, duration: 23, delay: 3, swayDuration: 5.2, swayDistance: 9, opacity: 0.55, blur: 0.8 },
      { id: 5, x: 86, size: 26, duration: 17, delay: 2, swayDuration: 4.0, swayDistance: 14, opacity: 0.8, blur: 0 },
      { id: 6, x: 92, size: 12, duration: 28, delay: 6, swayDuration: 6.0, swayDistance: 6, opacity: 0.45, blur: 1.5 },
      { id: 7, x: 12, size: 10, duration: 32, delay: 8, swayDuration: 6.5, swayDistance: 5, opacity: 0.35, blur: 2 },
      { id: 8, x: 82, size: 12, duration: 30, delay: 7, swayDuration: 6.2, swayDistance: 6, opacity: 0.4, blur: 1.8 },
      { id: 9, x: 38, size: 14, duration: 24, delay: 5, swayDuration: 5.0, swayDistance: 8, opacity: 0.5, blur: 1 },
      { id: 10, x: 64, size: 20, duration: 20, delay: 2.5, swayDuration: 4.5, swayDistance: 11, opacity: 0.7, blur: 0.5 },
    ];
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {lanterns.map((l) => (
        <motion.div
          key={l.id}
          initial={{ y: '110vh', opacity: 0 }}
          animate={{
            y: '-20vh',
            opacity: [0, l.opacity, l.opacity, 0],
          }}
          transition={{
            duration: l.duration,
            repeat: Infinity,
            delay: l.delay,
            ease: 'linear',
          }}
          style={{
            left: `${l.x}%`,
            width: `${l.size}px`,
            height: `${l.size * 1.3}px`,
            filter: l.blur > 0 ? `blur(${l.blur}px)` : undefined,
          }}
          className="absolute"
        >
          <motion.div
            animate={{
              x: [-l.swayDistance, l.swayDistance, -l.swayDistance],
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: l.swayDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full h-full relative"
          >
            {/* Soft Outer Flame Glow */}
            <div className="absolute inset-0 bg-amber-400/40 rounded-full blur-md" />

            {/* Little Lantern Silhouette */}
            <div className="w-full h-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-100 rounded-t-full rounded-b-md shadow-[0_0_12px_rgba(245,158,11,0.8)] border-t border-yellow-100/60 flex items-end justify-center pb-0.5">
              <div className="w-1/3 h-1/4 bg-white rounded-full animate-ping opacity-80" />
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};
