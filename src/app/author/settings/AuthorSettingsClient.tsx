"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  KeyRound,
  Save,
  Check,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Camera,
  Phone,
  Calendar,
  Sparkles,
} from "lucide-react";
import { updateAuthorProfileAction } from "@/app/actions/author-actions";
import { formatDate } from "@/lib/utils";

interface AuthorSettingsClientProps {
  initialProfile: {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    name: string;
    phone: string;
    avatar: string;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
}

export function AuthorSettingsClient({ initialProfile }: AuthorSettingsClientProps) {
  const router = useRouter();

  // Form state
  const [name, setName] = React.useState(initialProfile.name || "");
  const [phone, setPhone] = React.useState(initialProfile.phone || "");
  const [avatar, setAvatar] = React.useState(initialProfile.avatar || "");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Feedback state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setAvatar(data.url);
        setSuccessMsg("Avatar uploaded! Save profile changes to apply.");
      } else {
        setErrorMsg(data.error || "Failed to upload avatar image.");
      }
    } catch {
      setErrorMsg("Error uploading image to server.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        setErrorMsg("Please enter your current password to set a new password.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg("New password and confirmation password do not match.");
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg("New password must be at least 6 characters.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await updateAuthorProfileAction({
        name,
        phone,
        avatar,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (res.success) {
        setSuccessMsg(res.message || "Profile updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to update profile.");
      }
    } catch {
      setErrorMsg("An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header and Back Link */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 space-y-2">
        <Link
          href="/author"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Author Dashboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
              Author Profile & Settings
            </h1>
            <p className="text-xs font-mono text-zinc-500 mt-1">
              Manage your author account details, avatar identity, and credentials.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300 border border-violet-200 dark:border-violet-800 self-start sm:self-auto">
            <Sparkles className="w-3 h-3 text-violet-500" />
            <span>AUTHOR ACCOUNT</span>
          </span>
        </div>
      </div>

      {/* Alert Notices */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Identity & Avatar */}
        <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs space-y-5">
          <h2 className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <User className="w-4 h-4 text-violet-500" />
            <span>Public Author Identity</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt={initialProfile.username}
                  className="w-20 h-20 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-700 to-purple-500 text-white font-mono text-2xl flex items-center justify-center font-bold shadow-xs">
                  {initialProfile.username.slice(0, 1).toUpperCase()}
                </div>
              )}

              <label className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-black dark:bg-white text-white dark:text-black cursor-pointer shadow-md hover:scale-105 transition-transform">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1 text-xs font-mono">
              <p className="font-bold text-zinc-900 dark:text-zinc-100">
                Author Avatar / Profile Image
              </p>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Upload a JPG, PNG, or WebP headshot to appear alongside your published dispatches.
              </p>
              {isUploading && (
                <p className="text-violet-600 dark:text-violet-400 flex items-center gap-1 text-[11px]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Uploading image...</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Vance"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-1">
              Custom Avatar Image URL
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>
        </div>

        {/* Section 2: Account Details (Read-only security info) */}
        <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <Shield className="w-4 h-4 text-zinc-400" />
            <span>Account Credentials & Status</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-zinc-400 block text-[11px]">Username</span>
              <div className="mt-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200/60 dark:border-zinc-800/60">
                @{initialProfile.username}
              </div>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Registered Email</span>
              <div className="mt-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium border border-zinc-200/60 dark:border-zinc-800/60 truncate">
                {initialProfile.email}
              </div>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Role & Access</span>
              <div className="mt-1 px-3 py-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-bold border border-violet-200/60 dark:border-violet-900/40 uppercase">
                {initialProfile.role}
              </div>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Member Since</span>
              <div className="mt-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium border border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>{formatDate(initialProfile.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Password Update */}
        <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <KeyRound className="w-4 h-4 text-violet-500" />
            <span>Change Password</span>
          </h2>
          <p className="text-xs font-mono text-zinc-500">
            Leave password fields empty unless you wish to change your sign-in password.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password to verify"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/author"
            className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
