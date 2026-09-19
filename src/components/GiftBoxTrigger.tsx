import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Lock, Unlock, Sparkles } from 'lucide-react';
import { ThemeConfig } from '../types';
import { audioEngine } from '../utils/audio';
import { GiftBox3D } from './GiftBox3D';
import { ReactNativeWheelPicker } from './ReactNativeWheelPicker';

interface Props {
  theme: ThemeConfig;
  correctPasscode: string;
  passcodeHint: string;
  onOpenGiftBox: () => void;
}

export const GiftBoxTrigger: React.FC<Props> = ({
  correctPasscode,
  passcodeHint,
  onOpenGiftBox,
}) => {
  // Normalize passcode to array of digits/chars (default 4 digits if empty)
  const targetCode = correctPasscode && correctPasscode.trim() ? correctPasscode.trim() : '1234';
  const codeLength = targetCode.length;

  // Initialize dialed digits
  const [dials, setDials] = useState<string[]>(() => {
    return Array.from({ length: codeLength }, (_, i) => {
      const char = targetCode[i];
      return !isNaN(Number(char)) ? '0' : 'A';
    });
  });

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Wheel option set (0-9 for numeric or alphanumeric)
  const wheelOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const handleDialChange = (index: number, val: string) => {
    setDials((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    setErrorMsg('');
  };

  // Check if current combination matches target passcode
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
      particleCount: 80,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#10b981', '#fbbf24', '#ffffff'],
    });

    // Delay opening modal slightly to enjoy the 3D box opening animation
    setTimeout(() => {
      onOpenGiftBox();
    }, 1100);
  };

  const handleManualUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatch) {
      handleTriggerUnlock();
    } else {
      audioEngine.playPopSound();
      setIsShaking(true);
      setErrorMsg('Kombinasi kunci belum tepat!');
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative select-none py-2">
      {/* 1. 3D RED GIFT BOX WITH YELLOW SATIN RIBBON & BOW */}
      <GiftBox3D
        isUnlocked={isUnlocked}
        onClick={() => {
          if (isMatch || isUnlocked) {
            onOpenGiftBox();
          }
        }}
      />

      {/* 2. REACT NATIVE WHEEL SCROLL PICKER (SIMPLE & CLEAN WITH GLASS EFFECT) */}
      <div
        className={`w-full max-w-xs mt-1 flex flex-col items-center transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        <ReactNativeWheelPicker
          values={dials}
          options={wheelOptions}
          onChange={handleDialChange}
          disabled={isUnlocked}
        />

        {/* Clean Action Button */}
        <form onSubmit={handleManualUnlock} className="w-full max-w-[260px] mt-3">
          <button
            type="submit"
            disabled={isUnlocked}
            className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
              isMatch || isUnlocked
                ? 'bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300 text-emerald-950 border border-emerald-200/60 shadow-emerald-500/25'
                : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-xl border border-white/25 shadow-sm'
            }`}
          >
            {isUnlocked ? (
              <>
                <Sparkles className="w-4 h-4 text-emerald-950 animate-spin" /> Membuka Kado...
              </>
            ) : isMatch ? (
              <>
                <Unlock className="w-4 h-4 text-emerald-950 stroke-[2.5]" /> Buka Hadiah ✨
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-white/80" /> Buka Kunci
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <p className="text-white text-xs font-semibold text-center mt-2.5 bg-rose-500/85 backdrop-blur-md py-1.5 px-3 rounded-xl border border-white/30 shadow-md">
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};
