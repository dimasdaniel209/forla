import React, { useState, useRef } from 'react';
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
  Flame,
  FileKey,
  Download,
  Upload,
  ShieldCheck,
  AlertCircle,
  Rocket,
  Terminal,
  Database,
  ArrowRight,
} from 'lucide-react';
import { BirthdayConfig, MemoryItem, GiftVoucher } from '../types';
import { saveBirthdayConfig, resetBirthdayConfig, encodeConfigToUrl } from '../utils/storage';
import { encryptConfig, decryptConfig, downloadEncryptedConfigFile } from '../utils/crypto';
import { saveCloudBirthdayConfig } from '../utils/firebase';
import { AppEnvironment } from '../utils/environment';
import {
  toLocalDatetimeInputValue,
  fromLocalDatetimeInputValue,
  formatIndonesianDateTime,
} from '../utils/dateTime';

interface Props {
  config: BirthdayConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedConfig: BirthdayConfig) => void;
  environment: AppEnvironment;
  onOpenDeployModal?: () => void;
}

export const ConfigDrawer: React.FC<Props> = ({
  config,
  isOpen,
  onClose,
  onSave,
  environment,
  onOpenDeployModal,
}) => {
  const [formData, setFormData] = useState<BirthdayConfig>({ ...config });
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'memories' | 'vouchers' | 'deploy' | 'encryption'>('general');
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [encryptStatusMsg, setEncryptStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleGeneralChange = (
    field: keyof BirthdayConfig,
    val: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSaveAll = async () => {
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
      imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
      caption: 'Tuliskan deskripsi kenangan manismu di sini...',
      tag: 'Kenangan Baru',
    };
    setFormData((prev) => ({ ...prev, memories: [...prev.memories, newMem] }));
  };

  const handleUpdateMemory = (id: string, field: keyof MemoryItem, val: string) => {
    setFormData((prev) => ({
      ...prev,
      memories: prev.memories.map((m) => (m.id === id ? { ...m, [field]: val } : m)),
    }));
  };

  const handleDeleteMemory = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      memories: prev.memories.filter((m) => m.id !== id),
    }));
  };

  // Voucher Operations
  const handleAddVoucher = () => {
    const newV: GiftVoucher = {
      id: `v-${Date.now()}`,
      title: 'Voucher Spesial Baru',
      description: 'Deskripsi hadiah yang bisa diklaim...',
      iconName: 'Gift',
      code: `SPECIAL-${Math.floor(1000 + Math.random() * 9000)}`,
      isClaimed: false,
    };
    setFormData((prev) => ({ ...prev, vouchers: [...prev.vouchers, newV] }));
  };

  const handleUpdateVoucher = (id: string, field: keyof GiftVoucher, val: string) => {
    setFormData((prev) => ({
      ...prev,
      vouchers: prev.vouchers.map((v) => (v.id === id ? { ...v, [field]: val } : v)),
    }));
  };

  const handleDeleteVoucher = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      vouchers: prev.vouchers.filter((v) => v.id !== id),
    }));
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
      const decrypted = await decryptConfig(text);
      setFormData(decrypted);
      onSave(decrypted);
      saveBirthdayConfig(decrypted, environment);
      await saveCloudBirthdayConfig(decrypted, environment);
      setEncryptStatusMsg({
        type: 'success',
        text: `Berhasil memuat data terenkripsi untuk ${decrypted.recipientName}! Data langsung disinkronkan ke Cloud Firestore.`,
      });
    } catch (err: any) {
      setEncryptStatusMsg({
        type: 'error',
        text: 'Gagal membaca file: format file tidak cocok atau rusak.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-xl bg-[#031d14]/95 text-white border-l border-emerald-500/30 shadow-2xl flex flex-col h-full overflow-hidden backdrop-blur-2xl">
        {/* Drawer Header */}
        <div className="p-5 border-b border-emerald-500/20 flex items-center justify-between bg-emerald-950/40">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-emerald-200">
                ⚙️ Pengaturan & Edit Kejutan
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  environment === 'development'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {environment === 'development' ? 'DEV (/dev2409)' : 'PROD'}
              </span>
            </div>
            <p className="text-emerald-300/70 text-xs">
              Menyimpan ke database Firestore:{' '}
              <span className="font-mono text-emerald-300">
                {environment === 'development' ? 'settings/birthday_config_dev' : 'settings/birthday_config_production'}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtab Navigation */}
        <div className="flex border-b border-emerald-500/20 bg-emerald-950/70 p-2 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('general')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'general' ? 'bg-emerald-500 text-black shadow-md' : 'text-emerald-200/70 hover:bg-emerald-900/40'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Umum & Akses
          </button>
          <button
            onClick={() => setActiveSubTab('memories')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'memories' ? 'bg-emerald-500 text-black shadow-md' : 'text-emerald-200/70 hover:bg-emerald-900/40'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Foto ({formData.memories.length})
          </button>
          <button
            onClick={() => setActiveSubTab('vouchers')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'vouchers' ? 'bg-emerald-500 text-black shadow-md' : 'text-emerald-200/70 hover:bg-emerald-900/40'
            }`}
          >
            <Gift className="w-3.5 h-3.5" /> Voucher
          </button>
          <button
            onClick={() => setActiveSubTab('deploy')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'deploy'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-300 text-black shadow-md font-extrabold'
                : 'text-emerald-200/70 hover:bg-emerald-900/40'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-900" /> Deploy ke Prod
          </button>
          <button
            onClick={() => setActiveSubTab('encryption')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'encryption' ? 'bg-amber-400 text-black shadow-md' : 'text-emerald-200/70 hover:bg-emerald-900/40'
            }`}
          >
            <FileKey className="w-3.5 h-3.5 text-amber-900" /> File .enc
          </button>
        </div>

        {/* Form Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* TAB: General Settings */}
          {activeSubTab === 'general' && (
            <div className="space-y-4">
              {/* Recipient, Sender Names & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">
                    Nama Penerima
                  </label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => handleGeneralChange('recipientName', e.target.value)}
                    className="w-full bg-emerald-950/80 border border-emerald-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
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
                    className="w-full bg-emerald-950/80 border border-emerald-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
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
                      setFormData((prev) => ({ ...prev, age: parseInt(e.target.value) || 24 }))
                    }
                    className="w-full bg-emerald-950/80 border border-emerald-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Target Birthday Date & Time */}
              <div className="bg-emerald-950/50 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                <label className="block text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Tanggal & Waktu Ulang Tahun (Hitung Mundur)
                </label>
                <input
                  type="datetime-local"
                  value={toLocalDatetimeInputValue(formData.birthDate)}
                  onChange={(e) => {
                    const iso = fromLocalDatetimeInputValue(e.target.value);
                    handleGeneralChange('birthDate', iso);
                  }}
                  className="w-full bg-black/40 border border-emerald-500/40 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-400"
                />
                <p className="text-[11px] text-emerald-300/60 font-mono">
                  Format aktif: {formatIndonesianDateTime(formData.birthDate)}
                </p>
              </div>

              {/* Passcode & Hint */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-950/50 p-3.5 rounded-2xl border border-emerald-500/30">
                  <label className="block text-xs font-bold text-emerald-200 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Kode Kotak Kado (4 Digit)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.passcode}
                    onChange={(e) => handleGeneralChange('passcode', e.target.value)}
                    className="w-full bg-black/40 border border-emerald-500/40 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-emerald-300 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="bg-emerald-950/50 p-3.5 rounded-2xl border border-emerald-500/30">
                  <label className="block text-xs font-bold text-emerald-200 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                    PIN Admin Menu Ini
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.adminPin || '2512'}
                    onChange={(e) => handleGeneralChange('adminPin', e.target.value)}
                    placeholder="2512"
                    className="w-full bg-black/40 border border-emerald-500/40 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Pesan Utama Ulang Tahun
                  </label>
                  <textarea
                    rows={4}
                    value={formData.specialMessage}
                    onChange={(e) => handleGeneralChange('specialMessage', e.target.value)}
                    className="w-full bg-emerald-950/80 border border-emerald-500/30 rounded-xl p-3 text-xs sm:text-sm text-white leading-relaxed focus:outline-none focus:border-emerald-400"
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
                    className="w-full bg-emerald-950/80 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">
                    Doa & Harapan di Surat Hadiah
                  </label>
                  <textarea
                    rows={3}
                    value={formData.wishText || ''}
                    onChange={(e) => handleGeneralChange('wishText', e.target.value)}
                    className="w-full bg-emerald-950/80 border border-emerald-500/30 rounded-xl p-3 text-xs sm:text-sm text-white leading-relaxed focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Memories */}
          {activeSubTab === 'memories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                <span className="text-xs text-emerald-300 font-bold">
                  Daftar Foto & Kenangan Indah ({formData.memories.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddMemory}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Foto
                </button>
              </div>

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
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <span className="text-[11px] font-mono text-emerald-300 font-bold">
                      #{index + 1}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-emerald-200 mb-1">Judul Momen</label>
                        <input
                          type="text"
                          value={mem.title}
                          onChange={(e) => handleUpdateMemory(mem.id, 'title', e.target.value)}
                          className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-emerald-200 mb-1">Tanggal</label>
                        <input
                          type="text"
                          value={mem.date}
                          onChange={(e) => handleUpdateMemory(mem.id, 'date', e.target.value)}
                          className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-emerald-200 mb-1">
                        URL Foto (Direct Image Link / Unsplash)
                      </label>
                      <input
                        type="text"
                        value={mem.imageUrl}
                        onChange={(e) => handleUpdateMemory(mem.id, 'imageUrl', e.target.value)}
                        className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-emerald-200 mb-1">Cerita / Caption</label>
                      <textarea
                        rows={2}
                        value={mem.caption}
                        onChange={(e) => handleUpdateMemory(mem.id, 'caption', e.target.value)}
                        className="w-full bg-black/40 border border-emerald-500/30 rounded-xl p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Vouchers */}
          {activeSubTab === 'vouchers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                <span className="text-xs text-emerald-300 font-bold">
                  Kupon / Voucher Hadiah ({formData.vouchers.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddVoucher}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Voucher
                </button>
              </div>

              <div className="space-y-3">
                {formData.vouchers.map((v, index) => (
                  <div
                    key={v.id}
                    className="bg-emerald-950/60 p-3.5 rounded-2xl border border-emerald-500/30 space-y-2.5 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleDeleteVoucher(v.id)}
                      className="absolute top-3 right-3 text-rose-400/70 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <span className="text-[11px] font-mono text-emerald-300 font-bold">
                      Voucher #{index + 1}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-emerald-200 mb-1">Judul Hadiah</label>
                        <input
                          type="text"
                          value={v.title}
                          onChange={(e) => handleUpdateVoucher(v.id, 'title', e.target.value)}
                          className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-emerald-200 mb-1">Kode Voucher</label>
                        <input
                          type="text"
                          value={v.code}
                          onChange={(e) => handleUpdateVoucher(v.id, 'code', e.target.value)}
                          className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs font-mono text-amber-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-emerald-200 mb-1">Deskripsi</label>
                      <input
                        type="text"
                        value={v.description}
                        onChange={(e) => handleUpdateVoucher(v.id, 'description', e.target.value)}
                        className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Deploy to Production */}
          {activeSubTab === 'deploy' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-emerald-300" />
                  <h4 className="font-extrabold text-sm text-white">
                    Deploy Development ke Production
                  </h4>
                </div>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Fitur ini memungkinkan Anda bereksperimen di path <b>/dev2409</b> tanpa mengganggu tampilan yang sedang dilihat oleh pengunjung utama. Ketika semua data di Development sudah siap, Anda cukup menekan tombol di bawah untuk menyalin seluruh data ke database Production.
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
                  onClick={() => {
                    if (onOpenDeployModal) {
                      onOpenDeployModal();
                    }
                  }}
                  className="w-full bg-gradient-to-r from-emerald-400 to-teal-300 hover:brightness-110 text-black font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <Rocket className="w-4 h-4 text-black" />
                  Buka Dialog Eksekusi Deploy ke Production
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
            </div>
          )}

          {/* TAB: Encryption & Local File (.enc) */}
          {activeSubTab === 'encryption' && (
            <div className="space-y-4">
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
                    <Download className="w-4 h-4 text-emerald-400" /> 1. Unduh File Terenkripsi (.enc)
                  </h4>
                  <p className="text-xs text-emerald-300/70 mt-1">
                    Download file <span className="font-mono text-amber-300 font-bold">birthday-config.enc</span> yang berisi seluruh konfigurasi saat ini.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportEncryptedFile}
                  disabled={isExporting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? 'Mengenkripsi & Mengunduh...' : 'Unduh File birthday-config.enc'}
                </button>
              </div>

              {/* Action 2: Import / Load .enc */}
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-emerald-400" /> 2. Unggah & Baca File Terenkripsi
                  </h4>
                  <p className="text-xs text-emerald-300/70 mt-1">
                    Pilih file <span className="font-mono text-emerald-300">.enc</span> yang pernah kamu unduh untuk memuat dan mendekripsi semua datanya ke aplikasi ini.
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
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
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
