"use client";

import * as React from "react";
import { X, UserPlus, Shield, Activity, Mail, Lock, User, Phone, Loader2, Eye, EyeOff } from "lucide-react";

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    username: string;
    email: string;
    password: string;
    role: string;
    status: string;
    name?: string;
    phone?: string;
  }) => Promise<void>;
}

export function UserCreateModal({
  isOpen,
  onClose,
  onCreate,
}: UserCreateModalProps) {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [role, setRole] = React.useState("user");
  const [status, setStatus] = React.useState("active");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setUsername("");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setRole("user");
      setStatus("active");
      setName("");
      setPhone("");
      setErrorMsg(null);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Username, email, and password are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onCreate({
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        role,
        status,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create user.");
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
        aria-label="Close add user modal backdrop"
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
        aria-labelledby="create-user-title"
        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-mono font-bold shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="create-user-title"
                className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-tight"
              >
                Provision New User
              </h3>
              <p className="text-xs font-mono text-zinc-500">
                Register a new member with immediate role & access assignment.
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
            {/* Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="create-username"
                className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <User className="w-3.5 h-3.5 text-zinc-500" />
                <span>Username *</span>
              </label>
              <input
                id="create-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="e.g. john_doe"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="create-email"
                className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>Email Address *</span>
              </label>
              <input
                id="create-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans text-xs focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="create-password"
                className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Initial Password *</span>
              </label>
              <div className="relative">
                <input
                  id="create-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="create-name"
                className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <User className="w-3.5 h-3.5 text-zinc-500" />
                <span>Full Name</span>
              </label>
              <input
                id="create-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans text-xs focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Role */}
            <div className="space-y-1.5">
              <label
                htmlFor="create-role"
                className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <Shield className="w-3.5 h-3.5 text-zinc-500" />
                <span>Role</span>
              </label>
              <select
                id="create-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
              >
                <option value="user">User (Reader)</option>
                <option value="author">Author (Submits Posts for Approval)</option>
                <option value="manager">Manager (Moderator)</option>
                <option value="admin">Admin (Full Control)</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label
                htmlFor="create-status"
                className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <Activity className="w-3.5 h-3.5 text-zinc-500" />
                <span>Status</span>
              </label>
              <select
                id="create-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label
                htmlFor="create-phone"
                className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                <span>Phone</span>
              </label>
              <input
                id="create-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0192"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
              />
            </div>
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
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? "Provisioning..." : "Create Account"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
