import React, { useState } from 'react';
import { Rocket, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { deployDevToProduction } from '../utils/firebase';
import { BirthdayConfig } from '../types';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: BirthdayConfig;
  onDeploySuccess?: (deployedConfig: BirthdayConfig) => void;
}

export const DeployModal: React.FC<DeployModalProps> = ({
  isOpen,
  onClose,
  config,
  onDeploySuccess,
}) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleExecuteDeploy = async () => {
    setIsDeploying(true);
    setResult(null);

    const res = await deployDevToProduction(config);
    setIsDeploying(false);
    setResult(res);

    if (res.success && res.config && onDeploySuccess) {
      onDeploySuccess(res.config);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#031d14] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl text-white relative space-y-5">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isDeploying}
          className="absolute top-4 right-4 text-emerald-300/60 hover:text-white p-2 rounded-full hover:bg-emerald-950 transition-colors"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              Deploy ke Production
            </h3>
            <p className="text-xs text-emerald-300/70">
              Timpa database Production dengan data Development
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between font-mono pb-2 border-b border-emerald-500/20">
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <span>●</span> DEV (Sumber)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-bold flex items-center gap-1.5">
              <span>●</span> PROD (Tujuan Live)
            </span>
          </div>

          {config && (
            <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-400/30 flex items-center justify-between text-[11px]">
              <span className="text-emerald-200">Data yang siap dikirim:</span>
              <span className="font-bold text-amber-300">
                {config.memories?.length || 0} Foto Kenangan &amp; Momen
              </span>
            </div>
          )}

          <p className="text-emerald-200/80 leading-relaxed">
            Aksi ini akan menyalin seluruh {config?.memories?.length || ''} foto kenangan, musik, pesan cinta, dan kode akses langsung ke database <b>Production</b> yang dibuka oleh pacar/tamu.
          </p>
        </div>

        {/* Warning Callout */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-200/90">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Pastikan data di Development sudah selesai diedit dan diuji coba sebelum menimpa data Production.
          </span>
        </div>

        {/* Result Message */}
        {result && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 border ${
              result.success
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                : 'bg-red-500/20 border-red-400/50 text-red-200'
            }`}
          >
            {result.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="font-medium">{result.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeploying}
            className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 transition-all cursor-pointer"
          >
            {result?.success ? 'Tutup' : 'Batal'}
          </button>

          {!result?.success ? (
            <button
              type="button"
              onClick={handleExecuteDeploy}
              disabled={isDeploying}
              className="flex-1 py-3 px-4 rounded-2xl text-xs font-extrabold text-black bg-gradient-to-r from-emerald-400 to-teal-300 hover:brightness-110 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Rocket className={`w-4 h-4 ${isDeploying ? 'animate-bounce' : ''}`} />
              {isDeploying ? 'Mendeploy...' : 'Eksekusi Deploy'}
            </button>
          ) : (
            <a
              href="/"
              className="flex-1 py-3 px-4 rounded-2xl text-xs font-extrabold text-black bg-emerald-400 hover:bg-emerald-300 shadow-lg text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Lihat Halaman Prod
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
