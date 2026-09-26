import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Settings, ArrowRight, Sparkles } from 'lucide-react';
import { BirthdayConfig, ThemeConfig } from '../types';
import { audioEngine } from '../utils/audio';
import { ReactNativeWheelPicker } from './ReactNativeWheelPicker';
import { MusicButton } from './MusicButton';

interface Props {
  config: BirthdayConfig;
  theme: ThemeConfig;
  onUnlock: () => void;
  onOpenAdmin: () => void;
}

export const LandingPage: React.FC<Props> = ({
  config,
  onUnlock,
  onOpenAdmin,
}) => {
  const targetCode = (config.landingPin && config.landingPin.trim()) || '240926';
  const codeLength = 6;

  // Initialize 6 dialed digits
  const [dials, setDials] = useState<string[]>(() => {
    return Array.from({ length: codeLength }, (_, i) => {
      const char = targetCode[i];
      return !isNaN(Number(char)) ? '0' : 'A';
    });
  });

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDialChange = (index: number, val: string) => {
    setDials((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    setErrorMsg('');
  };

  const currentCombination = dials.join('');
  const isMatch = currentCombination.toLowerCase() === targetCode.toLowerCase();

  // Auto trigger unlock if match is reached
  useEffect(() => {
    if (isMatch && !isUnlocked) {
      handleTriggerUnlock();
    }
  }, [dials, isMatch]);

  const handleTriggerUnlock = () => {
    setIsUnlocked(true);
    setErrorMsg('');
    audioEngine.playMagicalUnlockSound();

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#10b981', '#34d399', '#fbbf24', '#f43f5e', '#ffffff'],
    });

    setTimeout(() => {
      onUnlock();
    }, 1000);
  };

  const handleManualUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatch) {
      handleTriggerUnlock();
    } else {
      audioEngine.playPopSound();
      setIsShaking(true);
      setErrorMsg('PIN belum sesuai');
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const title = config.landingTitle || 'LD & LA Memories';
  const subtitle =
    config.landingSubtitle ||
    'Every new moment just shows how much we belong together';

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center relative overflow-hidden bg-black text-white px-4 py-6 sm:py-8 selection:bg-emerald-400 selection:text-black">
      {/* Background Romantic Ambient Lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[650px] h-[340px] sm:h-[450px] bg-emerald-500/15 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-[260px] sm:w-[480px] h-[260px] sm:h-[350px] bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-2/3 right-1/4 w-[240px] sm:w-[400px] h-[240px] sm:h-[300px] bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Top Header: Music Button & Discreet Settings Button */}
      <header className="w-full max-w-4xl flex justify-end items-center gap-2 z-20">
        <MusicButton
          audioTrack={config.audioTrackId}
          customAudioUrl={config.customAudioUrl}
        />
        <button
          onClick={onOpenAdmin}
          title="Pengaturan Admin"
          className="p-2.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </header>

      {/* Center Hero: Title, Subtitle, and 6-Digit Vault Box */}
      <main className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center z-10 my-auto py-2">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-100 to-amber-200 mb-3"
          style={{ textShadow: '0 0 40px rgba(16, 185, 129, 0.3)' }}
        >
          {title}
        </motion.h1>

        {/* Subtitle (Single Line) */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-xs sm:text-sm md:text-base text-emerald-100/90 font-serif italic whitespace-nowrap overflow-x-auto no-scrollbar max-w-full mx-auto mb-8 px-2 text-center"
        >
          &ldquo;{subtitle}&rdquo;
        </motion.p>

        {/* 6-Digit Vault Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className={`w-full max-w-md bg-gradient-to-b from-[#06241a]/90 via-[#031d14]/90 to-black/90 border ${
            isUnlocked
              ? 'border-emerald-400 shadow-[0_0_50px_rgba(52,211,153,0.5)]'
              : 'border-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.2)]'
          } rounded-3xl p-5 sm:p-7 backdrop-blur-2xl transition-all duration-500 ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {/* 6-Digit Wheel Picker */}
          <div className="w-full my-1">
            <ReactNativeWheelPicker
              values={dials}
              onChange={handleDialChange}
              disabled={isUnlocked}
            />
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-amber-300 font-medium mt-3"
              >
                {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Action Trigger Button */}
          <form onSubmit={handleManualUnlock} className="mt-5 w-full">
            <button
              type="submit"
              disabled={isUnlocked}
              className={`w-full py-3 sm:py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                isUnlocked
                  ? 'bg-emerald-400 text-black shadow-emerald-400/50'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black shadow-emerald-500/25 hover:shadow-emerald-500/40'
              }`}
            >
              {isUnlocked ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Opening...</span>
                </>
              ) : (
                <>
                  <span>Open</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>

      {/* Bottom Spacer */}
      <div className="w-full py-2" />
    </div>
  );
};
