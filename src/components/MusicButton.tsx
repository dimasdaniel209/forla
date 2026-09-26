import React, { useState, useEffect } from 'react';
import { Play, Pause, Music, Volume2, VolumeX } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface MusicButtonProps {
  audioTrack?: 'musicbox' | 'acoustic' | 'party' | 'custom' | string;
  customAudioUrl?: string;
  onAudioTrackChange?: (track: 'musicbox' | 'acoustic' | 'party' | 'custom') => void;
  className?: string;
}

export const MusicButton: React.FC<MusicButtonProps> = ({
  audioTrack = 'musicbox',
  customAudioUrl,
  onAudioTrackChange,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(audioEngine.getIsPlaying());
  const [showPicker, setShowPicker] = useState(false);
  const [volume, setVolume] = useState(audioEngine.getVolume());

  useEffect(() => {
    return audioEngine.subscribe((playing) => {
      setIsPlaying(playing);
    });
  }, []);

  const safeTrack: 'musicbox' | 'acoustic' | 'party' | 'custom' =
    audioTrack === 'acoustic' ||
    audioTrack === 'party' ||
    audioTrack === 'custom'
      ? audioTrack
      : 'musicbox';

  const handleToggle = () => {
    audioEngine.togglePlay(safeTrack, customAudioUrl);
  };

  const handleSelectTrack = (track: 'musicbox' | 'acoustic' | 'party' | 'custom') => {
    if (onAudioTrackChange) {
      onAudioTrackChange(track);
    }
    setShowPicker(false);
    audioEngine.playTrack(track, customAudioUrl);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowPicker(!showPicker);
        }}
        title={isPlaying ? 'Jeda Musik (Klik kanan untuk ganti lagu)' : 'Putar Musik (Klik kanan untuk ganti lagu)'}
        aria-label={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
        className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-md ${
          isPlaying
            ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.35)]'
            : 'bg-white/10 hover:bg-white/15 border-white/20 text-white/80 hover:text-white'
        }`}
      >
        {isPlaying ? (
          <div className="flex items-center justify-center gap-1">
            <Pause className="w-3.5 h-3.5 text-emerald-300" />
            <div className="flex items-end gap-0.5 h-2.5">
              <span
                className="w-0.5 h-full bg-emerald-300 animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-0.5 h-2/3 bg-emerald-300 animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-0.5 h-full bg-emerald-300 animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        ) : (
          <Play className="w-4 h-4 text-emerald-300 fill-emerald-300 ml-0.5" />
        )}
      </button>

      {/* Track Selector Popup */}
      {showPicker && (
        <div className="absolute top-11 right-0 w-56 bg-[#031d14]/95 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl p-3 shadow-2xl text-white z-50 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-500/20">
            <span className="text-xs font-semibold text-emerald-200 flex items-center gap-1">
              <Music className="w-3.5 h-3.5" /> Pilih Lagu
            </span>
            <button
              onClick={() => setShowPicker(false)}
              className="text-emerald-300/60 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => handleSelectTrack('musicbox')}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                audioTrack === 'musicbox'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'hover:bg-emerald-950/60 text-emerald-200'
              }`}
            >
              <span>Music Box</span>
              {audioTrack === 'musicbox' && '✓'}
            </button>
            <button
              onClick={() => handleSelectTrack('acoustic')}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                audioTrack === 'acoustic'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'hover:bg-emerald-950/60 text-emerald-200'
              }`}
            >
              <span>Acoustic</span>
              {audioTrack === 'acoustic' && '✓'}
            </button>
            <button
              onClick={() => handleSelectTrack('party')}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                audioTrack === 'party'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'hover:bg-emerald-950/60 text-emerald-200'
              }`}
            >
              <span>Party</span>
              {audioTrack === 'party' && '✓'}
            </button>
            {(customAudioUrl || audioTrack === 'custom') && (
              <button
                onClick={() => handleSelectTrack('custom')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  audioTrack === 'custom'
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'hover:bg-emerald-950/60 text-emerald-200'
                }`}
              >
                <span>Custom Song</span>
                {audioTrack === 'custom' && '✓'}
              </button>
            )}
          </div>

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
  );
};
