"use client";

import * as React from "react";
import { X, Shield, Activity, User, Phone, Loader2, Save } from "lucide-react";

export interface EditableUserData {
  id: number;
  username: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  phone: string | null;
}

interface UserEditModalProps {
  isOpen: boolean;
  user: EditableUserData | null;
  onClose: () => void;
  onSave: (userId: number, data: { role: string; status: string; name?: string; phone?: string }) => Promise<void>;
}

export function UserEditModal({
  isOpen,
  user,
  onClose,
  onSave,
}: UserEditModalProps) {
  const [role, setRole] = React.useState("user");
  const [status, setStatus] = React.useState("active");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setRole(user.role.toLowerCase());
      setStatus(user.status.toLowerCase());
      setName(user.name || "");
      setPhone(user.phone || "");
      setErrorMsg(null);
    }
  }, [user]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSave(user.id, {
        role,
        status,
        name: name.trim(),
        phone: phone.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save user changes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close edit modal backdrop"
        onClick={() => !isSubmitting && onClose()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isSubmitting) onClose();
        }}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3
                id="edit-user-title"
                className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-tight"
              >
                Edit User & Permissions
              </h3>
              <p className="text-xs font-mono text-zinc-500">
                @{user.username} &middot; {user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-xs font-mono text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Role Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="user-role"
                className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <Shield className="w-3.5 h-3.5 text-zinc-500" />
                <span>Account Role</span>
              </label>
              <select
                id="user-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
              >
                <option value="user">User (Reader - Cannot Create/Publish Posts)</option>
                <option value="author">Author (Can Create/Submit Posts for Review)</option>
                <option value="manager">Manager (Moderator)</option>
                <option value="admin">Administrator (Full Control)</option>
              </select>
            </div>

            {/* Status Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="user-status"
                className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <Activity className="w-3.5 h-3.5 text-zinc-500" />
                <span>Account Status</span>
              </label>
              <select
                id="user-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
              >
                <option value="active">Active (Normal Access)</option>
                <option value="pending">Pending (Awaiting Verification)</option>
                <option value="suspended">Suspended (Restricted)</option>
              </select>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="user-fullname"
              className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300"
            >
              <User className="w-3.5 h-3.5 text-zinc-500" />
              <span>Full Name</span>
            </label>
            <input
              id="user-fullname"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans text-xs focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow placeholder:text-zinc-400"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label
              htmlFor="user-phone"
              className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300"
            >
              <Phone className="w-3.5 h-3.5 text-zinc-500" />
              <span>Contact Phone</span>
            </label>
            <input
              id="user-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow placeholder:text-zinc-400"
            />
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-900">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
