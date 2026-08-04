"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmMoal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmer",
  onConfirm,
  onCancel,
  danger = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/** overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="relative bg-gradient-to-br  from-white/5 to-white/2 border border-[#E0FF67]/20 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl 
        shadow-black/40"
      >
        {/* Bouton fermer */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-lg 
          transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>

        {/* Icône */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
            danger ? "bg-[#FF4C4C]/10" : "bg-[#E0FF67]/10"
          }`}
        >
          <AlertTriangle
            className={`w-6 h-6 ${danger ? "text-[#FF4C4C]" : "text-[#E0FF67]"}`}
          />
        </div>

        {/* Texte */}
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-6">{message}</p>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white
             rounded-xl font-medium hover:bg-white/10 transition-all cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              danger
                ? "bg-[#FF4C4C] text-white hover:bg-[#e03c3c] hover:shadow-lg hover:shadow-[#FF4C4C]/30"
                : "bg-[#E0FF67] text-[#151425] hover:bg-[#d4ff52] hover:shadow-lg hover:shadow-[#E0FF67]/30"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
