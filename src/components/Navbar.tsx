import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Settings, Sparkles, Music, Terminal, Rocket, Home } from 'lucide-react';
import { ThemeConfig, ThemeId } from '../types';
import { audioEngine } from '../utils/audio';
import { AppEnvironment, getEnvironmentUrl } from '../utils/environment';

interface Props {
  currentTheme: ThemeConfig;
  onThemeChange?: (themeId: ThemeId) => void;
  onOpenConfig: () => void;
  audioTrack: 'musicbox' | 'acoustic' | 'party' | 'custom';
  customAudioUrl?: string;
  onAudioTrackChange: (track: 'musicbox' | 'acoustic' | 'party' | 'custom') => void;
  isExpired?: boolean;
  environment: AppEnvironment;
  onOpenDeployModal?: () => void;
  onBackToHub?: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentTheme,
  onOpenConfig,
  audioTrack,
  customAudioUrl,
  onAudioTrackChange,
  isExpired = false,
  environment,
  onOpenDeployModal,
  onBackToHub,
}) => {
  const [isPlaying, setIsPlaying] = useState(audioEngine.getIsPlaying());
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [volume, setVolume] = useState(audioEngine.getVolume());

  useEffect(() => {
    return audioEngine.subscribe((playing) => {
      setIsPlaying(playing);
    });
  }, []);

  const handleToggleMusic = () => {
    audioEngine.togglePlay(audioTrack, customAudioUrl);
  };

  const handleTrackSelect = (track: 'musicbox' | 'acoustic' | 'party' | 'custom') => {
    onAudioTrackChange(track);
    setShowMusicPicker(false);
    audioEngine.playTrack(track, customAudioUrl);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
  };

  return (
    <header className="w-full p-4 sm:p-6 flex justify-between items-center z-30 relative">
      {/* Left side: Back to Hub button & Environment badge */}
      <div className="flex items-center gap-2">
        {onBackToHub && (
          <button
            onClick={onBackToHub}
            title="Kembali ke Menu Utama"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 hover:text-white border border-emerald-500/35 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow-emerald-500/20"
          >
            <Home className="w-4 h-4" />
          </button>
        )}

        {environment === 'development' ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm backdrop-blur-md">
              <Terminal className="w-3 h-3 text-amber-300" />
              <span>DEV (/dev2409)</span>
            </span>

            {/* Quick deploy button directly visible in Navbar when in Dev */}
            {onOpenDeployModal && (
              <button
                onClick={onOpenDeployModal}
                title="Deploy perubahan Development ke Production"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Rocket className="w-3 h-3 text-black" />
                <span>Deploy to Prod</span>
              </button>
            )}
          </div>
        ) : (
          !onBackToHub && <div />
        )}
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2">
        {/* Audio Controls */}
        <div className="relative">
          <button
            onClick={handleToggleMusic}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowMusicPicker(!showMusicPicker);
            }}
            title={isPlaying ? 'Jeda Musik (Klik kanan untuk ganti lagu)' : 'Putar Musik (Klik kanan untuk ganti lagu)'}
            aria-label={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
            className={`w-9 h-9 rounded-full border flex items-center justify-center ${currentTheme.buttonBg} ${currentTheme.cardBorder} text-white shadow-md transition-all active:scale-95`}
          >
              {isPlaying ? (
                <div className="flex items-center justify-center gap-1">
                  <Pause className="w-3.5 h-3.5 text-emerald-200" />
                  {/* Equalizer bars animation */}
                  <div className="flex items-end gap-0.5 h-2.5">
                    <span className="w-0.5 h-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-0.5 h-2/3 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-0.5 h-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : (
                <Play className="w-4 h-4 text-emerald-200 fill-emerald-200 ml-0.5" />
              )}
            </button>

            {/* Music Track Selector Dropdown */}
            {showMusicPicker && (
              <div className="absolute top-12 right-0 w-56 bg-[#031d14]/95 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl p-3 shadow-2xl text-white z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-500/20">
                  <span className="text-xs font-semibold text-emerald-200 flex items-center gap-1">
                    <Music className="w-3.5 h-3.5" /> Track
                  </span>
                  <button
                    onClick={() => setShowMusicPicker(false)}
                    className="text-emerald-300/60 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => handleTrackSelect('musicbox')}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                      audioTrack === 'musicbox' ? 'bg-emerald-500 text-black font-bold' : 'hover:bg-emerald-950/60 text-emerald-200'
                    }`}
                  >
                    <span>Music Box</span>
                    {audioTrack === 'musicbox' && '✓'}
                  </button>
                  <button
                    onClick={() => handleTrackSelect('acoustic')}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                      audioTrack === 'acoustic' ? 'bg-emerald-500 text-black font-bold' : 'hover:bg-emerald-950/60 text-emerald-200'
                    }`}
                  >
                    <span>Acoustic</span>
                    {audioTrack === 'acoustic' && '✓'}
                  </button>
                  <button
                    onClick={() => handleTrackSelect('party')}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                      audioTrack === 'party' ? 'bg-emerald-500 text-black font-bold' : 'hover:bg-emerald-950/60 text-emerald-200'
                    }`}
                  >
                    <span>Party</span>
                    {audioTrack === 'party' && '✓'}
                  </button>
                  {(customAudioUrl || audioTrack === 'custom') && (
                    <button
                      onClick={() => handleTrackSelect('custom')}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                        audioTrack === 'custom' ? 'bg-emerald-500 text-black font-bold' : 'hover:bg-emerald-950/60 text-emerald-200'
                      }`}
                    >
                      <span>Custom Song</span>
                      {audioTrack === 'custom' && '✓'}
                    </button>
                  )}
                </div>

                {/* Volume Slider */}
                <div className="mt-3 pt-2 border-t border-emerald-500/20 flex items-center gap-2">
                  <VolumeX className="w-3 h-3 text-emerald-300/60" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-emerald-400 h-1 bg-emerald-950 rounded-lg cursor-pointer"
                  />
                  <Volume2 className="w-3 h-3 text-emerald-200" />
                </div>
              </div>
            )}
          </div>

        {/* Edit Configuration Button */}
        <button
          onClick={onOpenConfig}
          title="Pengaturan"
          className={`flex items-center justify-center ${currentTheme.buttonBg} p-2 rounded-full border ${currentTheme.cardBorder} text-white shadow-md transition-all active:scale-95`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
