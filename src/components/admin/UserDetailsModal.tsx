"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  ExternalLink,
  Shield,
  Activity,
  Calendar,
  Clock,
  Mail,
  Phone,
  FileText,
  MessageSquare,
  Heart,
  UserCheck,
  Edit,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DetailedUser {
  id: number;
  username: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  phone: string | null;
  avatar: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastLoginAt: string | Date | null;
  deletedAt: string | Date | null;
  stats?: {
    postsCount: number;
    commentsCount: number;
    likesCount: number;
  };
  recentPosts?: {
    id: number;
    title: string;
    slug: string;
    category: string;
    published: boolean;
    views: number;
    createdAt: string | Date;
  }[];
  recentComments?: {
    id: number;
    content: string;
    createdAt: string | Date;
    post: {
      title: string;
      slug: string;
    };
  }[];
}

interface UserDetailsModalProps {
  isOpen: boolean;
  userId: number | null;
  onClose: () => void;
  onEdit?: (user: DetailedUser) => void;
}

export function UserDetailsModal({
  isOpen,
  userId,
  onClose,
  onEdit,
}: UserDetailsModalProps) {
  const [user, setUser] = React.useState<DetailedUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && userId) {
      setIsLoading(true);
      setError(null);
      fetch(`/api/admin/users/${userId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load user profile");
          return res.json();
        })
        .then((data) => {
          if (data.user) setUser(data.user);
          else throw new Error("No user returned");
        })
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    } else {
      setUser(null);
    }
  }, [isOpen, userId]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          ACTIVE
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          PENDING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        SUSPENDED
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-black text-white dark:bg-white dark:text-black shadow-xs">
          <Shield className="w-3 h-3" />
          ADMIN
        </span>
      );
    }
    if (r === "manager") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900">
          MANAGER
        </span>
      );
    }
    if (r === "author") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
          <Shield className="w-3 h-3 text-violet-500" />
          AUTHOR
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
        USER
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close user details backdrop"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose();
        }}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-title"
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-start justify-between gap-4 shrink-0">
          {isLoading || !user ? (
            <div className="flex items-center gap-3 py-2">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
              <span className="text-xs font-mono text-zinc-500">Loading user profile...</span>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center text-lg font-mono font-black shadow-md shrink-0">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  (user.name?.charAt(0) || user.username.charAt(0)).toUpperCase()
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    id="user-details-title"
                    className="text-lg font-mono font-black text-zinc-900 dark:text-zinc-100 tracking-tight"
                  >
                    {user.name || user.username}
                  </h3>
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  @{user.username} &middot; ID #{user.id}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-0.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-mono text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {user && (
            <>
              {/* Activity Stats Counter */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-zinc-400 mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase tracking-wider">Posts</span>
                  </div>
                  <span className="text-xl font-mono font-black text-zinc-900 dark:text-zinc-100">
                    {user.stats?.postsCount ?? 0}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-zinc-400 mb-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase tracking-wider">Comments</span>
                  </div>
                  <span className="text-xl font-mono font-black text-zinc-900 dark:text-zinc-100">
                    {user.stats?.commentsCount ?? 0}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-zinc-400 mb-1">
                    <Heart className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase tracking-wider">Likes</span>
                  </div>
                  <span className="text-xl font-mono font-black text-zinc-900 dark:text-zinc-100">
                    {user.stats?.likesCount ?? 0}
                  </span>
                </div>
              </div>

              {/* Personal Details & Timestamps Grid */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 bg-white dark:bg-zinc-950">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Account Metadata
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Phone: {user.phone || "Not provided"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Joined: {formatDate(user.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Last Updated: {formatDate(user.updatedAt)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Last Login: {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never logged in"}</span>
                  </div>
                </div>
              </div>

              {/* Permissions & Security Privileges */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2 bg-white dark:bg-zinc-950">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Access & Permissions
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                    ✓ Read Published Content
                  </span>
                  <span className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                    ✓ Post Comments & Likes
                  </span>
                  {user.role.toLowerCase() !== "user" && (
                    <span className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                      ✓ Moderate Comments & Categories
                    </span>
                  )}
                  {user.role.toLowerCase() === "admin" && (
                    <span className="px-2.5 py-1 rounded bg-black text-white dark:bg-white dark:text-black text-[11px] font-mono font-bold">
                      ★ Full Administrative Privileges
                    </span>
                  )}
                </div>
              </div>

              {/* Associated Activity Log */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Recent Authored Content
                </h4>

                {(!user.recentPosts || user.recentPosts.length === 0) &&
                (!user.recentComments || user.recentComments.length === 0) ? (
                  <p className="text-xs font-mono text-zinc-400 italic p-3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-center">
                    No recent posts or comments authored by this user.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {user.recentPosts && user.recentPosts.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono font-semibold text-zinc-500">
                          Articles ({user.recentPosts.length})
                        </span>
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                          {user.recentPosts.map((p) => (
                            <div
                              key={p.id}
                              className="p-2.5 flex items-center justify-between gap-3 text-xs bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                            >
                              <div className="truncate">
                                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                                  {p.title}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400 ml-2">
                                  {p.category} &middot; {formatDate(p.createdAt)}
                                </span>
                              </div>
                              <Link
                                href={`/posts/${p.slug}`}
                                target="_blank"
                                className="p-1 rounded text-zinc-400 hover:text-black dark:hover:text-white"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {user.recentComments && user.recentComments.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono font-semibold text-zinc-500">
                          Comments ({user.recentComments.length})
                        </span>
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                          {user.recentComments.map((c) => (
                            <div
                              key={c.id}
                              className="p-2.5 space-y-1 text-xs bg-white dark:bg-zinc-950"
                            >
                              <p className="text-zinc-700 dark:text-zinc-300 font-sans line-clamp-1">
                                &ldquo;{c.content}&rdquo;
                              </p>
                              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                                <span>On: {c.post?.title}</span>
                                <span>{formatDate(c.createdAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-3 shrink-0">
          {user && (
            <Link
              href={`/admin/users/${user.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white underline underline-offset-4"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Dedicated Dossier Page</span>
            </Link>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {user && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-mono text-xs font-semibold hover:border-black dark:hover:border-white transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit User</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
