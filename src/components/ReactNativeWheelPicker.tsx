import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioEngine } from '../utils/audio';

interface WheelPickerColumnProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  disabled?: boolean;
}

/**
 * A sleek, clean React Native-style Wheel Scroll Picker Column.
 * Features:
 * - 3-level cylindrical 3D roller perspective (above, center, below)
 * - Smooth vertical touch drag, mouse wheel scrolling, and direct tap selection
 * - Minimalist selection window with glass effect
 * - Smooth spring rolling animation when stepping/scrolling
 * - Tick sound on value change
 */
export const WheelPickerColumn: React.FC<WheelPickerColumnProps> = ({
  value,
  options,
  onChange,
  disabled = false,
}) => {
  const currentIndex = options.indexOf(value) !== -1 ? options.indexOf(value) : 0;
  const total = options.length;

  const prevIndex = (currentIndex - 1 + total) % total;
  const nextIndex = (currentIndex + 1) % total;

  // 1 = scrolling up (increasing number), -1 = scrolling down (decreasing number)
  const [direction, setDirection] = useState<number>(1);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const isDragging = useRef<boolean>(false);
  const touchStartY = useRef<number | null>(null);
  const dragAccumulator = useRef<number>(0);
  const wheelAccumulator = useRef<number>(0);
  const lastWheelTime = useRef<number>(0);

  const handleStep = (dir: 'up' | 'down') => {
    if (disabled) return;
    setDirection(dir === 'up' ? 1 : -1);
    audioEngine.playDialTickSound();
    const newIdx =
      dir === 'up'
        ? (currentIndex + 1) % total
        : (currentIndex - 1 + total) % total;
    onChange(options[newIdx]);
  };

  // Smooth wheel listener with dampening and cooldown
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (disabled) return;
    const now = Date.now();
    wheelAccumulator.current += e.deltaY;

    if (Math.abs(wheelAccumulator.current) >= 24 && now - lastWheelTime.current > 75) {
      if (wheelAccumulator.current > 0) {
        handleStep('up');
      } else {
        handleStep('down');
      }
      wheelAccumulator.current = 0;
      lastWheelTime.current = now;
    }
  };

  // Touch handlers with drag elasticity
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    touchStartY.current = e.touches[0].clientY;
    dragAccumulator.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = touchStartY.current - currentY;
    dragAccumulator.current += diff;
    touchStartY.current = currentY;

    // Apply micro dynamic offset for visual responsiveness
    setDragOffset(Math.max(-12, Math.min(12, dragAccumulator.current * 0.35)));

    // Threshold of 24px per digit turn
    if (Math.abs(dragAccumulator.current) >= 24) {
      if (dragAccumulator.current > 0) {
        handleStep('up');
      } else {
        handleStep('down');
      }
      dragAccumulator.current = 0;
      setDragOffset(0);
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
    dragAccumulator.current = 0;
    setDragOffset(0);
  };

  // Mouse drag support for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    isDragging.current = true;
    touchStartY.current = e.clientY;
    dragAccumulator.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !isDragging.current || touchStartY.current === null) return;
    const currentY = e.clientY;
    const diff = touchStartY.current - currentY;
    dragAccumulator.current += diff;
    touchStartY.current = currentY;

    setDragOffset(Math.max(-12, Math.min(12, dragAccumulator.current * 0.35)));

    if (Math.abs(dragAccumulator.current) >= 24) {
      if (dragAccumulator.current > 0) {
        handleStep('up');
      } else {
        handleStep('down');
      }
      dragAccumulator.current = 0;
      setDragOffset(0);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    touchStartY.current = null;
    dragAccumulator.current = 0;
    setDragOffset(0);
  };

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative flex-1 max-w-[56px] h-[126px] flex flex-col items-center justify-center select-none cursor-ns-resize group"
      style={{ perspective: '320px' }}
    >
      {/* React Native Wheel Picker Center Active Selection Band */}
      <div className="absolute inset-x-0 top-[42px] h-[42px] bg-white/[0.12] rounded-lg border-y border-white/30 pointer-events-none" />

      {/* Roller Container with live drag offset */}
      <div
        className="w-full h-full flex flex-col items-center justify-center pointer-events-auto transition-transform duration-75"
        style={{
          transform: `translateY(${-dragOffset}px)`,
        }}
      >
        {/* Item Above (Previous Value) */}
        <div
          onClick={() => handleStep('down')}
          className="w-full h-[42px] relative flex items-center justify-center overflow-hidden cursor-pointer"
        >
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={prevIndex}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  y: dir > 0 ? 18 : -18,
                  opacity: 0.1,
                  rotateX: 32,
                  scale: 0.78,
                }),
                center: {
                  y: 2,
                  opacity: 0.4,
                  rotateX: 32,
                  scale: 0.85,
                },
                exit: (dir: number) => ({
                  y: dir > 0 ? -18 : 18,
                  opacity: 0.1,
                  rotateX: 32,
                  scale: 0.78,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                y: { type: 'spring', stiffness: 500, damping: 30, mass: 0.6 },
                opacity: { duration: 0.15 },
                scale: { duration: 0.15 },
              }}
              style={{
                transformOrigin: 'bottom center',
              }}
              className="w-full h-full flex items-center justify-center text-white/40 font-mono text-base font-semibold transition-colors duration-150 hover:text-white/70 absolute inset-0"
            >
              {options[prevIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Center Selected Value (Active) */}
        <div className="w-full h-[42px] relative flex items-center justify-center overflow-hidden pointer-events-none">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  y: dir > 0 ? 32 : -32,
                  rotateX: dir > 0 ? -42 : 42,
                  opacity: 0.25,
                  scale: 0.85,
                }),
                center: {
                  y: 0,
                  rotateX: 0,
                  opacity: 1,
                  scale: 1.08,
                },
                exit: (dir: number) => ({
                  y: dir > 0 ? -32 : 32,
                  rotateX: dir > 0 ? 42 : -42,
                  opacity: 0.25,
                  scale: 0.85,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                y: { type: 'spring', stiffness: 520, damping: 30, mass: 0.7 },
                rotateX: { type: 'spring', stiffness: 520, damping: 30, mass: 0.7 },
                opacity: { duration: 0.16 },
                scale: { duration: 0.16 },
              }}
              className="w-full h-full flex items-center justify-center text-white font-mono text-2xl font-black tracking-widest absolute inset-0"
            >
              {options[currentIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Item Below (Next Value) */}
        <div
          onClick={() => handleStep('up')}
          className="w-full h-[42px] relative flex items-center justify-center overflow-hidden cursor-pointer"
        >
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={nextIndex}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  y: dir > 0 ? 18 : -18,
                  opacity: 0.1,
                  rotateX: -32,
                  scale: 0.78,
                }),
                center: {
                  y: -2,
                  opacity: 0.35,
                  rotateX: -32,
                  scale: 0.85,
                },
                exit: (dir: number) => ({
                  y: dir > 0 ? -18 : 18,
                  opacity: 0.1,
                  rotateX: -32,
                  scale: 0.78,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                y: { type: 'spring', stiffness: 500, damping: 30, mass: 0.6 },
                opacity: { duration: 0.15 },
                scale: { duration: 0.15 },
              }}
              style={{
                transformOrigin: 'top center',
              }}
              className="w-full h-full flex items-center justify-center text-white/35 font-mono text-base font-semibold transition-colors duration-150 hover:text-white/60 absolute inset-0"
            >
              {options[nextIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

interface ReactNativeWheelPickerProps {
  values: string[];
  options?: string[];
  onChange: (index: number, val: string) => void;
  disabled?: boolean;
}

/**
 * Clean, minimalist React Native Wheel Picker group.
 * Presents a cluster of wheels with a shared sleek glass housing.
 */
export const ReactNativeWheelPicker: React.FC<ReactNativeWheelPickerProps> = ({
  values,
  options = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  onChange,
  disabled = false,
}) => {
  return (
    <div className="w-full flex items-center justify-center py-1">
      <div className="bg-white/10 backdrop-blur-2xl px-3 py-1.5 rounded-2xl border border-white/25 flex items-center justify-center gap-1.5 w-full max-w-[260px]">
        {values.map((val, idx) => (
          <React.Fragment key={idx}>
            <WheelPickerColumn
              value={val}
              options={options}
              onChange={(newVal) => onChange(idx, newVal)}
              disabled={disabled}
            />
            {idx < values.length - 1 && (
              <div className="h-6 w-[1px] bg-white/15 self-center" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
