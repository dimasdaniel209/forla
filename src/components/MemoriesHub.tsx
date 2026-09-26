import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Settings, Lock, Plus, Heart, Flame } from 'lucide-react';
import { BirthdayConfig, ThemeConfig } from '../types';
import { audioEngine } from '../utils/audio';
import { BackgroundOrbs } from './BackgroundOrbs';
import { BackgroundFloatingLanterns } from './BackgroundFloatingLanterns';
import { formatGoogleDriveImageUrl } from '../utils/urlHelpers';
import { MusicButton } from './MusicButton';

interface Props {
  config: BirthdayConfig;
  theme: ThemeConfig;
  onSelectBirthday: () => void;
  onLock: () => void;
  onOpenAdmin: () => void;
}

export const MemoriesHub: React.FC<Props> = ({
  config,
  theme,
  onSelectBirthday,
  onLock,
  onOpenAdmin,
}) => {
  const recipientName = config.recipientName || 'Aurelia Catherine';
  const age = config.age || 24;
  const caption =
    config.birthdayCoverCaption ||
    'Merayakan hari istimewamu dan setiap senyuman manis yang selalu mewarnai hari-hariku ❤️';

  // 3D Card Interactive Tilt & Glare State
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  // Cover image: either user-specified drive link, or first memory image, or default
  const rawCoverUrl =
    config.birthdayCoverImage ||
    config.memories?.[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop';
  const coverImageUrl = formatGoogleDriveImageUrl(rawCoverUrl);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Smooth tilt angles (-8 to 8 degrees)
    const rX = -((y - centerY) / centerY) * 8;
    const rY = ((x - centerX) / centerX) * 8;
    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsCardHovered(true);
    audioEngine.playDialTickSound();
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsCardHovered(false);
  };

  const handleCardClick = () => {
    if (isOpening) return;
    setIsOpening(true);
    audioEngine.playMagicalUnlockSound();

    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#fbbf24', '#f43f5e', '#ffffff'],
    });

    setTimeout(() => {
      onSelectBirthday();
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center relative overflow-x-hidden bg-black text-white selection:bg-emerald-400 selection:text-black">
      {/* Background Lighting & Floating Glow Lanterns */}
      <BackgroundOrbs theme={theme} />
      <BackgroundFloatingLanterns />

      {/* Top Navbar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-5 flex justify-between items-center z-30 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-md">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
            LD &amp; LA Memories
          </h1>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <MusicButton
            audioTrack={config.audioTrackId}
            customAudioUrl={config.customAudioUrl}
          />
          <button
            onClick={onLock}
            title="Kunci"
            className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4 text-amber-300" />
          </button>
          <button
            onClick={onOpenAdmin}
            title="Pengaturan Admin"
            className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-emerald-300" />
          </button>
        </div>
      </header>

      {/* Main Content: Natural, Elegant Editorial Cards */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 z-20 flex flex-col items-center justify-center my-auto">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-7 sm:gap-10 items-stretch max-w-2xl mx-auto">
          {/* ======================================================== */}
          {/* 1. SEAMLESS NATURAL & ELEGANT BIRTHDAY CARD              */}
          {/* ======================================================== */}
          <div
            style={{ perspective: 1200 }}
            className="w-full flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleCardClick}
              style={{
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${
                  isCardHovered ? 1.025 : 1
                }, ${isCardHovered ? 1.025 : 1}, 1)`,
                transition: isCardHovered
                  ? 'transform 0.12s ease-out'
                  : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                transformStyle: 'preserve-3d',
              }}
              className="group relative w-full cursor-pointer rounded-[32px] p-[1.5px] overflow-hidden transition-shadow duration-500 shadow-[0_0_35px_rgba(16,185,129,0.2)] hover:shadow-[0_0_65px_rgba(52,211,153,0.5)] active:scale-[0.98]"
            >
              {/* Spinning Continuous Aurora Neon Gradient Border */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-[100%] rounded-[32px] pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'conic-gradient(from 0deg, #10b981 0%, #38bdf8 25%, #fbbf24 50%, #f43f5e 75%, #10b981 100%)',
                  filter: 'blur(10px)',
                }}
              />

              {/* Card Body: Clean & Elegant Layout (Photo fully visible) */}
              <div className="relative w-full min-h-[440px] sm:min-h-[470px] rounded-[30px] bg-[#02130e] backdrop-blur-2xl overflow-hidden flex flex-col justify-between border border-emerald-500/35">
                {/* 3D Glass Specular Glare Effect */}
                {isCardHovered && (
                  <div
                    className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.12) 0%, transparent 70%)`,
                    }}
                  />
                )}

                {/* Background Photo: Full-Bleed & Crystal Clear */}
                <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
                  <motion.img
                    src={coverImageUrl}
                    alt={`${recipientName} Birthday`}
                    className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out"
                    style={{
                      transform: isCardHovered ? 'scale(1.06)' : 'scale(1.0)',
                    }}
                    loading="eager"
                  />

                  {/* Gentle edge scrims only at top & bottom so middle photo is completely visible and unobstructed */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-transparent pointer-events-none" />

                  {/* Periodic Diagonal Shimmer Beam */}
                  <motion.div
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                  />
                </div>

                {/* TOP: Label & Event Title (Di Atas) */}
                <div className="relative z-20 p-5 sm:p-6 flex flex-col items-start gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-emerald-400/40 text-emerald-300 shadow-md">
                    <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                    <span className="text-xs font-semibold tracking-wide">
                      Ulang Tahun Ke-{age}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-white group-hover:text-emerald-200 transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-tight">
                    {recipientName}&apos;s {age}th Birthday
                  </h2>
                </div>

                {/* BOTTOM: Romantic Caption (Di Bawah, tanpa tombol 'Buka Kejutan Ini') */}
                <div className="relative z-20 p-5 sm:p-6">
                  <p className="text-xs sm:text-sm text-emerald-100/95 font-serif italic leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    &ldquo;{caption}&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ======================================================== */}
          {/* 2. COMPANION CARD: + Tambah Momen                        */}
          {/* ======================================================== */}
          <div
            style={{ perspective: 1200 }}
            className="w-full flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenAdmin}
              className="w-full h-full min-h-[440px] sm:min-h-[470px] rounded-[32px] border-2 border-dashed border-white/20 hover:border-emerald-400/60 bg-gradient-to-b from-white/[0.04] to-black/60 hover:bg-emerald-950/20 flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-500 group shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/20 flex items-center justify-center text-white/40 group-hover:text-emerald-300 transition-all duration-300 shadow-inner group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                <Plus className="w-7 h-7 stroke-[2]" />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer Spacer */}
      <div className="w-full py-2" />
    </div>
  );
};
