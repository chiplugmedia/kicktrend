"use client";

import * as React from "react";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  X,
  Trash2,
  ShieldAlert,
  Loader2,
} from "lucide-react";

export type AlertType = "delete" | "caution" | "success";

interface AlertModalProps {
  isOpen: boolean;
  type: AlertType;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm?: () => void | Promise<void>;
  onClose: () => void;
  // Optional extra control for soft delete vs hard delete toggle
  showPermanentOption?: boolean;
  isPermanent?: boolean;
  onPermanentChange?: (val: boolean) => void;
}

export function AlertModal({
  isOpen,
  type,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onClose,
  showPermanentOption = false,
  isPermanent = false,
  onPermanentChange,
}: AlertModalProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // Icon & Accent styling based on type
  const renderIcon = () => {
    switch (type) {
      case "delete":
        return (
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 shadow-xs">
            <Trash2 className="w-6 h-6 animate-pulse" />
          </div>
        );
      case "caution":
        return (
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      case "success":
        return (
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with smooth blur and darken */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close modal backdrop"
        onClick={() => !isLoading && onClose()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isLoading) onClose();
        }}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden z-10 transition-all transform animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Subtle decorative top bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            type === "delete"
              ? "bg-red-500"
              : type === "caution"
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
        />

        {/* Close 'X' button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col sm:flex-row items-start gap-4">
          {renderIcon()}

          <div className="space-y-2 flex-1 pt-1">
            <h3
              id="alert-dialog-title"
              className="text-base sm:text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-tight"
            >
              {title}
            </h3>
            <p className="text-xs sm:text-sm font-sans text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {description}
            </p>

            {/* Optional permanent delete checkbox toggle */}
            {showPermanentOption && onPermanentChange && (
              <label className="flex items-center gap-2 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPermanent}
                  onChange={(e) => onPermanentChange(e.target.checked)}
                  className="rounded border-zinc-300 text-red-600 focus:ring-red-500 h-3.5 w-3.5"
                />
                <span className="text-xs font-mono text-red-600 dark:text-red-400 font-semibold">
                  Permanently purge record from database (hard delete)
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          {type !== "success" && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}

          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all shadow-xs disabled:opacity-50 ${
                isDestructive || type === "delete"
                  ? "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
                  : type === "caution"
                  ? "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500"
                  : "bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
              }`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {confirmText ||
                  (type === "delete"
                    ? "Yes, Delete User"
                    : type === "caution"
                    ? "Proceed"
                    : "Got It")}
              </span>
            </button>
          )}

          {type === "success" && !onConfirm && (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              {confirmText || "Continue"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
