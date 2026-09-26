import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Calendar,
  Lock,
  MessageSquare,
  Image as ImageIcon,
  Gift,
  Share2,
  Check,
  User,
  Music,
  FileKey,
  Download,
  Upload,
  ShieldCheck,
  AlertCircle,
  Rocket,
  Terminal,
  Play,
  Square,
  Volume2,
  Heart,
  Sparkles,
} from 'lucide-react';
import { BirthdayConfig, MemoryItem } from '../types';
import {
  saveBirthdayConfig,
  resetBirthdayConfig,
  encodeConfigToUrl,
  getSafeguardMemories,
} from '../utils/storage';
import {
  encryptConfig,
  decryptConfig,
  downloadEncryptedConfigFile,
} from '../utils/crypto';
import { saveCloudBirthdayConfig } from '../utils/firebase';
import { AppEnvironment } from '../utils/environment';
import {
  toLocalDatetimeInputValue,
  fromLocalDatetimeInputValue,
  formatIndonesianDateTime,
} from '../utils/dateTime';
import { formatGoogleDriveImageUrl } from '../utils/urlHelpers';
import { audioEngine } from '../utils/audio';

interface Props {
  config: BirthdayConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedConfig: BirthdayConfig) => void;
  environment: AppEnvironment;
  onOpenDeployModal?: (config: BirthdayConfig) => void;
}

type SubTab = 'landing' | 'birthday' | 'music' | 'system';

export const ConfigDrawer: React.FC<Props> = ({
  config,
  isOpen,
  onClose,
  onSave,
  environment,
  onOpenDeployModal,
}) => {
  const [formData, setFormData] = useState<BirthdayConfig>({ ...config });
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('landing');
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [encryptStatusMsg, setEncryptStatusMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync formData when Drawer is opened or config updates from cloud/storage
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => {
        const incomingCount = config.memories?.length || 0;
        const prevCount = prev.memories?.length || 0;
        // Don't downgrade if current formData already has 15+ memories
        if (prevCount > incomingCount && incomingCount <= 4) {
          return { ...config, memories: prev.memories };
        }
        return { ...config };
      });
    }
  }, [isOpen, config]);

  // Stop audio preview when closing drawer or unmounting
  useEffect(() => {
    if (!isOpen && isPlayingAudioPreview) {
      audioEngine.stop();
      setIsPlayingAudioPreview(false);
    }
  }, [isOpen, isPlayingAudioPreview]);

  const safeguardMemories = getSafeguardMemories();

  if (!isOpen) return null;

  const handleGeneralChange = (
    field: keyof BirthdayConfig,
    val: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSaveAll = async () => {
    if (isPlayingAudioPreview) {
      audioEngine.stop();
      setIsPlayingAudioPreview(false);
    }
    saveBirthdayConfig(formData, environment);
    onSave(formData);
    setIsSavedToast(true);
    // Auto-sync to Cloud Firestore database in current environment
    await saveCloudBirthdayConfig(formData, environment);
    setTimeout(() => {
      setIsSavedToast(false);
      onClose();
    }, 1200);
  };

  const handleReset = async () => {
    if (window.confirm('Kembalikan ke pengaturan default awal?')) {
      if (isPlayingAudioPreview) {
        audioEngine.stop();
        setIsPlayingAudioPreview(false);
      }
      const def = resetBirthdayConfig(environment);
      setFormData(def);
      onSave(def);
      await saveCloudBirthdayConfig(def, environment);
    }
  };

  // Memory Operations
  const handleAddMemory = () => {
    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      title: 'Judul Kenangan Baru',
      date: 'Hari Ini',
      imageUrl:
        'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
      caption: 'Tuliskan deskripsi kenangan manismu di sini...',
      tag: 'Kenangan Baru',
    };
    setFormData((prev) => ({ ...prev, memories: [...prev.memories, newMem] }));
  };

  const handleUpdateMemory = (
    id: string,
    field: keyof MemoryItem,
    val: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      memories: prev.memories.map((m) =>
        m.id === id ? { ...m, [field]: val } : m
      ),
    }));
  };

  const handleDeleteMemory = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      memories: prev.memories.filter((m) => m.id !== id),
    }));
  };

  const handleTogglePreviewAudio = (
    track: 'musicbox' | 'acoustic' | 'party' | 'custom',
    customUrl?: string
  ) => {
    if (isPlayingAudioPreview) {
      audioEngine.stop();
      setIsPlayingAudioPreview(false);
    } else {
      audioEngine.playTrack(track, customUrl);
      setIsPlayingAudioPreview(true);
    }
  };

  const handleShareLink = () => {
    saveBirthdayConfig(formData, environment);
    onSave(formData);
    const shareableUrl = encodeConfigToUrl(formData);
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportEncryptedFile = async () => {
    try {
      setIsExporting(true);
      setEncryptStatusMsg(null);
      await downloadEncryptedConfigFile(formData, 'birthday-config.enc');
      setEncryptStatusMsg({
        type: 'success',
        text: 'File "birthday-config.enc" berhasil diunduh dan dienkripsi dengan aman (AES-256)!',
      });
    } catch (e: any) {
      setEncryptStatusMsg({
        type: 'error',
        text: e.message || 'Gagal mengunduh file terenkripsi.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setEncryptStatusMsg(null);
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (parsed.ciphertext && parsed.salt && parsed.iv) {
        const pin = prompt('Masukkan PIN Keamanan untuk membuka file ini:');
        if (!pin) return;

        const decrypted = await decryptConfig(parsed, pin);
        setFormData(decrypted);
        onSave(decrypted);
        saveBirthdayConfig(decrypted, environment);
        await saveCloudBirthdayConfig(decrypted, environment);
        setEncryptStatusMsg({
          type: 'success',
          text: 'Berhasil mendekripsi & memuat data dari file .enc!',
        });
      } else {
        throw new Error('Format file bukan format enkripsi yang valid');
      }
    } catch (err: any) {
      setEncryptStatusMsg({
        type: 'error',
        text: `Gagal membaca file: ${err.message}`,
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#01140e] border-l border-emerald-500/30 flex flex-col h-full shadow-2xl overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-500/20 flex items-center justify-between bg-[#021811]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                ⚙️ Pengaturan Kenangan &amp; Momen
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  environment === 'development'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {environment === 'development' ? 'DEV (/dev2409)' : 'PROD'}
              </span>
            </div>
            <p className="text-emerald-300/70 text-xs mt-0.5">
              Tersimpan di Cloud Database Firestore:{' '}
              <span className="font-mono text-emerald-300">
                {environment === 'development'
                  ? 'settings/birthday_config_dev'
                  : 'settings/birthday_config_production'}
              </span>
            </p>
          </div>
          <button
            onClick={() => {
              if (isPlayingAudioPreview) {
                audioEngine.stop();
                setIsPlayingAudioPreview(false);
              }
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtab Navigation: Rapi & Dikelompokkan per Sub Menu / Momen */}
        <div className="flex border-b border-emerald-500/20 bg-emerald-950/70 p-2 gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              if (isPlayingAudioPreview) {
                audioEngine.stop();
                setIsPlayingAudioPreview(false);
              }
              setActiveSubTab('landing');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'landing'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-emerald-200/70 hover:bg-emerald-900/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Gerbang (Landing)
          </button>

          <button
            onClick={() => {
              if (isPlayingAudioPreview) {
                audioEngine.stop();
                setIsPlayingAudioPreview(false);
              }
              setActiveSubTab('birthday');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'birthday'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-emerald-200/70 hover:bg-emerald-900/40'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" /> Momen Birthday ({formData.memories.length} Foto)
          </button>

          <button
            onClick={() => setActiveSubTab('music')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'music'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-emerald-200/70 hover:bg-emerald-900/40'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-amber-300" /> Musik &amp; Lagu
          </button>

          <button
            onClick={() => {
              if (isPlayingAudioPreview) {
                audioEngine.stop();
                setIsPlayingAudioPreview(false);
              }
              setActiveSubTab('system');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'system'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-300 text-black shadow-md font-extrabold'
                : 'text-emerald-200/70 hover:bg-emerald-900/40'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-900" /> Deploy &amp; Backup
          </button>
        </div>

        {/* Form Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          {/* ======================================================== */}
          {/* 1. TAB: GERBANG & LANDING PAGE                           */}
          {/* ======================================================== */}
          {activeSubTab === 'landing' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/30">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Pengaturan Halaman Depan &amp; Akses Gerbang
                </h4>
                <p className="text-[11px] text-emerald-300/70 mt-0.5">
                  Atur teks judul, kalimat sambutan romantis, dan PIN 6-digit untuk membuka gerbang.
                </p>
              </div>

              {/* Judul & Kalimat Romantis */}
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/35 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    Judul Halaman Depan
                  </label>
                  <input
                    type="text"
                    value={formData.landingTitle || 'LD & LA Memories'}
                    onChange={(e) => handleGeneralChange('landingTitle', e.target.value)}
                    placeholder="LD & LA Memories"
                    className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    Kalimat Romantis Halaman Depan (Satu Baris)
                  </label>
                  <input
                    type="text"
                    value={
                      formData.landingSubtitle ||
                      'Every new moment just shows how much we belong together'
                    }
                    onChange={(e) => handleGeneralChange('landingSubtitle', e.target.value)}
                    placeholder="Every new moment just shows how much we belong together"
                    className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* PIN Gerbang 6 Digit & PIN Admin */}
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/35 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      PIN Gerbang Depan (6 Digit)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.landingPin || '240926'}
                      onChange={(e) => handleGeneralChange('landingPin', e.target.value)}
                      placeholder="240926"
                      className="w-full bg-black/40 border border-emerald-500/40 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-emerald-300 focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[11px] text-emerald-300/60 mt-1">
                      6 angka yang harus diputar pacar Anda untuk membuka landing page.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-300" />
                      PIN Admin Menu Ini (4 - 6 Digit)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.adminPin || '2512'}
                      onChange={(e) => handleGeneralChange('adminPin', e.target.value)}
                      placeholder="2512"
                      className="w-full bg-black/40 border border-emerald-500/40 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[11px] text-amber-300/60 mt-1">
                      PIN rahasia Anda untuk membuka modal Pengaturan Admin ini.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    Petunjuk PIN 6 Digit (Hint)
                  </label>
                  <input
                    type="text"
                    value={
                      formData.landingPinHint || 'Putar 6 angka tanggal kenangan kita ✨'
                    }
                    onChange={(e) => handleGeneralChange('landingPinHint', e.target.value)}
                    placeholder="Putar 6 angka tanggal kenangan kita ✨"
                    className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. TAB: MOMEN ULANG TAHUN (SUB MENU BIRTHDAY)            */}
          {/* ======================================================== */}
          {activeSubTab === 'birthday' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/30">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" /> Momen Ulang Tahun (Sub Menu)
                </h4>
                <p className="text-[11px] text-emerald-300/70 mt-0.5">
                  Kelola data ulang tahun, cover kartu di menu kenangan, dan pesan cinta.
                </p>
              </div>

              {/* Section 1: Profil & Countdown */}
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/35 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs pb-1 border-b border-emerald-500/20">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Profil Penerima &amp; Hitung Mundur</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1">
                      Nama Penerima
                    </label>
                    <input
                      type="text"
                      value={formData.recipientName}
                      onChange={(e) => handleGeneralChange('recipientName', e.target.value)}
                      className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1">
                      Nama Pengirim
                    </label>
                    <input
                      type="text"
                      value={formData.senderName}
                      onChange={(e) => handleGeneralChange('senderName', e.target.value)}
                      className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1">
                      Ulang Tahun Ke-
                    </label>
                    <input
                      type="number"
                      value={formData.age || 24}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          age: parseInt(e.target.value) || 24,
                        }))
                      }
                      className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Tanggal &amp; Waktu Ulang Tahun (Hitung Mundur)
                  </label>
                  <input
                    type="datetime-local"
                    value={toLocalDatetimeInputValue(formData.birthDate)}
                    onChange={(e) => {
                      const iso = fromLocalDatetimeInputValue(e.target.value);
                      handleGeneralChange('birthDate', iso);
                    }}
                    className="w-full bg-black/40 border border-emerald-500/40 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                  <p className="text-[11px] text-emerald-300/60 font-mono">
                    Format aktif: {formatIndonesianDateTime(formData.birthDate)}
                  </p>
                </div>
              </div>

              {/* Section 2: Cover Kartu Momen di Menu Hub */}
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/35 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs pb-1 border-b border-emerald-500/20">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>Cover Kartu Momen di Menu Kenangan (Hub)</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1 flex items-center gap-1.5">
                    Foto Cover Modal Birthday (Google Drive / URL)
                  </label>
                  <input
                    type="text"
                    value={formData.birthdayCoverImage || ''}
                    onChange={(e) => handleGeneralChange('birthdayCoverImage', e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  <p className="text-[11px] text-emerald-300/60 mt-1">
                    Tempel link share Google Drive foto Anda untuk foto kartu sub-menu Birthday.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Caption Romantis Kartu Birthday (Tampil di Bagian Bawah)
                  </label>
                  <textarea
                    rows={2}
                    value={
                      formData.birthdayCoverCaption ||
                      'Merayakan hari istimewamu dan setiap senyuman manis yang selalu mewarnai hari-hariku ❤️'
                    }
                    onChange={(e) =>
                      handleGeneralChange('birthdayCoverCaption', e.target.value)
                    }
                    placeholder="Tuliskan caption indah untuk momen ini..."
                    className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {formData.birthdayCoverImage && (
                  <div className="mt-2 w-32 aspect-[4/3] rounded-xl overflow-hidden border border-emerald-500/40 relative bg-black/40">
                    <img
                      src={formatGoogleDriveImageUrl(formData.birthdayCoverImage)}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Section 3: Kotak Kado & Pesan Cinta */}
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/35 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs pb-1 border-b border-emerald-500/20">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>Kotak Kado &amp; Pesan Cinta</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Kode Kotak Kado (4 Digit)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.passcode}
                    onChange={(e) => handleGeneralChange('passcode', e.target.value)}
                    className="w-full max-w-[200px] bg-black/40 border border-emerald-500/40 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-emerald-300 focus:outline-none focus:border-emerald-400"
                  />
                  <p className="text-[11px] text-emerald-300/60 mt-1">
                    PIN 4 digit untuk membuka kotak kado di dalam halaman ulang tahun.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Pesan Utama Ulang Tahun
                  </label>
                  <textarea
                    rows={4}
                    value={formData.specialMessage}
                    onChange={(e) => handleGeneralChange('specialMessage', e.target.value)}
                    className="w-full bg-black/40 border border-emerald-500/30 rounded-xl p-3 text-xs sm:text-sm text-white leading-relaxed focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">
                    Sub-pesan Romantis
                  </label>
                  <input
                    type="text"
                    value={formData.subMessage}
                    onChange={(e) => handleGeneralChange('subMessage', e.target.value)}
                    className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">
                    Doa &amp; Harapan di Surat Hadiah
                  </label>
                  <textarea
                    rows={3}
                    value={formData.wishText || ''}
                    onChange={(e) => handleGeneralChange('wishText', e.target.value)}
                    className="w-full bg-black/40 border border-emerald-500/30 rounded-xl p-3 text-xs sm:text-sm text-white leading-relaxed focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Section 4: Galeri Foto Kenangan Birthday */}
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/35 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                  <div>
                    <span className="text-xs text-emerald-300 font-bold block flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      Galeri Foto Kenangan Birthday ({formData.memories.length})
                    </span>
                    <span className="text-[11px] text-emerald-300/60">
                      Foto-foto kenangan yang tampil di slide galeri ulang tahun
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMemory}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Foto
                  </button>
                </div>

                {/* Safeguard Restore Banner */}
                {safeguardMemories &&
                  safeguardMemories.length > formData.memories.length && (
                    <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl flex items-center justify-between gap-3">
                      <div className="text-xs text-amber-200">
                        <span className="font-bold block text-amber-300">
                          💡 Ditemukan cadangan {safeguardMemories.length} foto!
                        </span>
                        Foto tersimpan Anda dapat dipulihkan secara instan.
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            memories: safeguardMemories,
                          }));
                        }}
                        className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs px-3 py-1.5 rounded-lg shrink-0 cursor-pointer shadow"
                      >
                        Pulihkan Foto
                      </button>
                    </div>
                  )}

                <div className="space-y-4">
                  {formData.memories.map((mem, index) => (
                    <div
                      key={mem.id}
                      className="bg-emerald-950/60 p-3.5 rounded-2xl border border-emerald-500/30 space-y-3 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => handleDeleteMemory(mem.id)}
                        className="absolute top-3 right-3 text-rose-400/70 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                        title="Hapus foto ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-emerald-300 font-bold">
                          Foto #{index + 1}
                        </span>
                        {mem.tag && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {mem.tag}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-emerald-200 mb-1">
                            Judul Momen
                          </label>
                          <input
                            type="text"
                            value={mem.title}
                            onChange={(e) =>
                              handleUpdateMemory(mem.id, 'title', e.target.value)
                            }
                            className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-emerald-200 mb-1">
                            Tanggal Kenangan
                          </label>
                          <input
                            type="text"
                            value={mem.date}
                            onChange={(e) =>
                              handleUpdateMemory(mem.id, 'date', e.target.value)
                            }
                            className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-emerald-200 mb-1">
                          URL Gambar (Google Drive / Direct Link)
                        </label>
                        <input
                          type="text"
                          value={mem.imageUrl}
                          onChange={(e) =>
                            handleUpdateMemory(mem.id, 'imageUrl', e.target.value)
                          }
                          placeholder="https://drive.google.com/file/d/..."
                          className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      {mem.imageUrl && (
                        <div className="w-24 aspect-[4/3] rounded-lg overflow-hidden border border-emerald-500/30 bg-black/40">
                          <img
                            src={formatGoogleDriveImageUrl(mem.imageUrl)}
                            alt={mem.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] text-emerald-200 mb-1">
                          Cerita / Caption Kenangan
                        </label>
                        <textarea
                          rows={2}
                          value={mem.caption}
                          onChange={(e) =>
                            handleUpdateMemory(mem.id, 'caption', e.target.value)
                          }
                          className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. TAB: MUSIK & LAGU (PENGATURAN LAGU PENGIRING)          */}
          {/* ======================================================== */}
          {activeSubTab === 'music' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/30">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-emerald-400" /> Pengaturan Lagu &amp; Musik Latar
                </h4>
                <p className="text-[11px] text-emerald-300/70 mt-0.5">
                  Pilih trek instrumen bawaan atau masukkan tautan lagu favorit Anda (YouTube, YouTube Music, MP3, Google Drive Audio).
                </p>
              </div>

              {/* Track Selection Cards */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-emerald-200">
                  Pilih Trek Musik Latar:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Track 1: Music Box */}
                  <div
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, audioTrackId: 'musicbox' }));
                      if (isPlayingAudioPreview) {
                        audioEngine.playTrack('musicbox');
                      }
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      formData.audioTrackId === 'musicbox'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                        : 'bg-black/40 border-emerald-500/25 hover:border-emerald-500/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-300">
                        🎵 Music Box
                      </span>
                      {formData.audioTrackId === 'musicbox' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/70">
                      Melodi denting kotak musik lonceng Happy Birthday yang klasik dan manis.
                    </p>
                  </div>

                  {/* Track 2: Acoustic */}
                  <div
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, audioTrackId: 'acoustic' }));
                      if (isPlayingAudioPreview) {
                        audioEngine.playTrack('acoustic');
                      }
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      formData.audioTrackId === 'acoustic'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                        : 'bg-black/40 border-emerald-500/25 hover:border-emerald-500/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-teal-300">
                        🎸 Akustik Romantis
                      </span>
                      {formData.audioTrackId === 'acoustic' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/70">
                      Petikan instrumen gitar lembut dengan melodi romantis dan hangat.
                    </p>
                  </div>

                  {/* Track 3: Party */}
                  <div
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, audioTrackId: 'party' }));
                      if (isPlayingAudioPreview) {
                        audioEngine.playTrack('party');
                      }
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      formData.audioTrackId === 'party'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                        : 'bg-black/40 border-emerald-500/25 hover:border-emerald-500/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-amber-300">
                        🎉 Party Pop
                      </span>
                      {formData.audioTrackId === 'party' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/70">
                      Irama pesta ulang tahun yang ceria, energik, dan penuh suka cita.
                    </p>
                  </div>

                  {/* Track 4: Custom */}
                  <div
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, audioTrackId: 'custom' }));
                      if (isPlayingAudioPreview) {
                        audioEngine.playTrack('custom', formData.customAudioUrl);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      formData.audioTrackId === 'custom'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                        : 'bg-black/40 border-emerald-500/25 hover:border-emerald-500/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-rose-300">
                        🔗 Lagu Kustom (YouTube / MP3)
                      </span>
                      {formData.audioTrackId === 'custom' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/70">
                      Gunakan lagu kenangan Anda berdua dari YouTube atau link file audio MP3.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Link Lagu Kustom */}
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/35 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs pb-1 border-b border-emerald-500/20">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Tautan / URL Lagu Kustom</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    Link YouTube / MP3 Audio
                  </label>
                  <input
                    type="text"
                    value={formData.customAudioUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        customAudioUrl: val,
                        audioTrackId: val ? 'custom' : prev.audioTrackId,
                      }));
                    }}
                    placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                    className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                  <div className="mt-2 text-[11px] text-emerald-300/70 space-y-1 bg-black/30 p-2.5 rounded-xl border border-emerald-500/20">
                    <p className="font-semibold text-emerald-200">💡 Format yang didukung:</p>
                    <ul className="list-disc list-inside text-emerald-300/80 space-y-0.5">
                      <li>
                        Link YouTube biasa:{' '}
                        <code className="text-amber-300 font-mono">
                          https://www.youtube.com/watch?v=xxxx
                        </code>
                      </li>
                      <li>
                        Link YouTube share:{' '}
                        <code className="text-amber-300 font-mono">
                          https://youtu.be/xxxx
                        </code>
                      </li>
                      <li>
                        Link YouTube Music:{' '}
                        <code className="text-amber-300 font-mono">
                          https://music.youtube.com/watch?v=xxxx
                        </code>
                      </li>
                      <li>
                        Link file MP3 langsung:{' '}
                        <code className="text-amber-300 font-mono">
                          https://domain.com/lagu-kita.mp3
                        </code>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Live Audio Preview Test Button */}
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/35 flex items-center justify-between gap-3">
                <div>
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-emerald-400" /> Uji Putar Lagu Sekarang
                  </h5>
                  <p className="text-[11px] text-emerald-300/70 mt-0.5">
                    Dengarkan langsung suara lagu yang dipilih sebelum disimpan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleTogglePreviewAudio(
                      formData.audioTrackId,
                      formData.customAudioUrl
                    )
                  }
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                    isPlayingAudioPreview
                      ? 'bg-rose-500 hover:bg-rose-400 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  }`}
                >
                  {isPlayingAudioPreview ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" /> Berhenti
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Putar Lagu
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. TAB: DEPLOY & BACKUP (SYSTEM)                         */}
          {/* ======================================================== */}
          {activeSubTab === 'system' && (
            <div className="space-y-4">
              {/* Deploy Section */}
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-emerald-300" />
                  <h4 className="font-extrabold text-sm text-white">
                    Deploy Development ke Production
                  </h4>
                </div>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Fitur ini memungkinkan Anda bereksperimen di path <b>/dev2409</b>{' '}
                  tanpa mengganggu tampilan yang sedang dilihat oleh pengunjung utama.
                  Ketika semua data di Development sudah siap, Anda cukup menekan tombol di bawah
                  untuk menyalin seluruh data ke database Production.
                </p>

                <div className="bg-black/40 p-3 rounded-xl border border-emerald-500/20 font-mono text-[11px] space-y-1.5 text-emerald-300">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">Sumber (Dev):</span>
                    <span>settings/birthday_config_dev</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">Target (Prod):</span>
                    <span>settings/birthday_config_production</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (isPlayingAudioPreview) {
                      audioEngine.stop();
                      setIsPlayingAudioPreview(false);
                    }
                    saveBirthdayConfig(formData, environment);
                    onSave(formData);
                    await saveCloudBirthdayConfig(formData, environment);
                    if (onOpenDeployModal) {
                      onOpenDeployModal(formData);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-emerald-400 to-teal-300 hover:brightness-110 text-black font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <Rocket className="w-4 h-4 text-black" />
                  Buka Dialog Eksekusi Deploy ke Production ({formData.memories.length} Foto)
                </button>
              </div>

              {/* Navigation Switch Links */}
              <div className="bg-black/50 p-4 rounded-2xl border border-emerald-500/20 space-y-2.5 text-xs">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> Pindah Cepat Lingkungan:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/"
                    className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/60 text-center font-bold text-emerald-200 transition-colors"
                  >
                    Buka Halaman PROD (/)
                  </a>
                  <a
                    href="/dev2409"
                    className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 text-center font-bold text-amber-300 transition-colors"
                  >
                    Buka Halaman DEV (/dev2409)
                  </a>
                </div>
              </div>

              {/* Encryption & Local File (.enc) */}
              {encryptStatusMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    encryptStatusMsg.type === 'success'
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                  }`}
                >
                  {encryptStatusMsg.type === 'success' ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{encryptStatusMsg.text}</span>
                </div>
              )}

              {/* Action 1: Export / Download .enc */}
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" /> Unduh Cadangan File Terenkripsi (.enc)
                  </h4>
                  <p className="text-xs text-emerald-300/70 mt-1">
                    Download file{' '}
                    <span className="font-mono text-amber-300 font-bold">
                      birthday-config.enc
                    </span>{' '}
                    yang berisi seluruh konfigurasi saat ini.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportEncryptedFile}
                  disabled={isExporting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isExporting
                    ? 'Mengenkripsi & Mengunduh...'
                    : 'Unduh File birthday-config.enc'}
                </button>
              </div>

              {/* Action 2: Import / Load .enc */}
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-emerald-400" /> Unggah &amp; Baca File Terenkripsi
                  </h4>
                  <p className="text-xs text-emerald-300/70 mt-1">
                    Pilih file{' '}
                    <span className="font-mono text-emerald-300">.enc</span> yang
                    pernah kamu unduh untuk memuat dan mendekripsi semua datanya ke aplikasi ini.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".enc,application/octet-stream,text/plain"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-emerald-500/40 transition-all active:scale-98 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  Pilih File .enc dari Komputer / HP
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-emerald-500/20 bg-[#02150e] flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="text-emerald-300/70 hover:text-white text-xs flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLink}
              className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors border border-emerald-500/30 cursor-pointer"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              {copiedLink ? 'Tautan Tersalin!' : 'Bagikan Link'}
            </button>

            <button
              onClick={handleSaveAll}
              className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform cursor-pointer"
            >
              <Save className="w-4 h-4" /> Simpan ({environment === 'development' ? 'DEV' : 'PROD'})
            </button>
          </div>
        </div>

        {isSavedToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" /> Perubahan berhasil disimpan ke database!
          </div>
        )}
      </div>
    </div>
  );
};
