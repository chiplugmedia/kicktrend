"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
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
  Trash2,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AlertModal, AlertType } from "@/components/admin/AlertModal";
import { UserEditModal, EditableUserData } from "@/components/admin/UserEditModal";

interface DetailedUserProps {
  initialUser: {
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
    stats: {
      postsCount: number;
      commentsCount: number;
      likesCount: number;
    };
    recentPosts: {
      id: number;
      title: string;
      slug: string;
      category: string;
      published: boolean;
      views: number;
      createdAt: string | Date;
    }[];
    recentComments: {
      id: number;
      content: string;
      createdAt: string | Date;
      post: {
        title: string;
        slug: string;
      };
    }[];
  };
}

export function UserDetailPageClient({ initialUser }: DetailedUserProps) {
  const router = useRouter();
  const [user, setUser] = React.useState(initialUser);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  // Alert Modal State
  const [alertConfig, setAlertConfig] = React.useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    description: string;
    confirmText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
    onConfirm?: () => Promise<void>;
  }>({
    isOpen: false,
    type: "delete",
    title: "",
    description: "",
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ACTIVE
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          PENDING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        SUSPENDED
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r === "admin") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-black text-white dark:bg-white dark:text-black shadow-xs">
          <Shield className="w-3.5 h-3.5" />
          ADMINISTRATOR
        </span>
      );
    }
    if (r === "manager") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900">
          MANAGER
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
        USER
      </span>
    );
  };

  const handleSaveEdit = async (
    userId: number,
    data: { role: string; status: string; name?: string; phone?: string }
  ) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to update user.");
    }

    setUser((prev) => ({
      ...prev,
      role: data.role,
      status: data.status,
      name: data.name || null,
      phone: data.phone || null,
    }));

    // Show Success Modal
    setAlertConfig({
      isOpen: true,
      type: "success",
      title: "Profile Updated",
      description: `User @${user.username} was successfully updated.`,
      confirmText: "Close",
    });
  };

  const handleDeleteClick = () => {
    setAlertConfig({
      isOpen: true,
      type: "delete",
      title: `Delete User @${user.username}`,
      description: `Are you sure you want to delete this user? Their account status will be set to suspended and they will be barred from signing in.`,
      confirmText: "Yes, Delete User",
      isDestructive: true,
      onConfirm: async () => {
        setAlertConfig((prev) => ({ ...prev, isLoading: true }));
        try {
          const res = await fetch(`/api/admin/users/${user.id}`, {
            method: "DELETE",
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || "Failed to delete user.");

          setAlertConfig({
            isOpen: true,
            type: "success",
            title: "User Deleted",
            description: result.message || "User was deleted successfully.",
            confirmText: "Back to Users",
            onConfirm: async () => {
              router.push("/admin/users");
              router.refresh();
            },
          });
        } catch (err: any) {
          setAlertConfig({
            isOpen: true,
            type: "caution",
            title: "Deletion Failed",
            description: err.message,
            confirmText: "Understood",
          });
        }
      },
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Back Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Return to User Management"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                User Dossier
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300 font-semibold">
                @{user.username}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
              {user.name || user.username}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs font-semibold hover:border-black dark:hover:border-white transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Role/Status</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteClick}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-mono text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete User</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 bg-white dark:bg-zinc-950 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xl font-mono font-black shadow-md shrink-0">
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
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-mono font-black text-zinc-900 dark:text-zinc-100">
                  {user.name || user.username}
                </h2>
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
              </div>
              <p className="text-xs font-mono text-zinc-500">
                Handle: @{user.username} &middot; Internal ID: #{user.id}
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>{user.email}</span>
                {user.phone && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-700">&middot;</span>
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{user.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Counter Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span>Authored Articles</span>
              </span>
              <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                {user.stats.postsCount}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-zinc-400" />
                <span>Posted Comments</span>
              </span>
              <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                {user.stats.commentsCount}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-zinc-400" />
                <span>Likes Given</span>
              </span>
              <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                {user.stats.likesCount}
              </span>
            </div>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 text-xs font-mono text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span>Member Since: {formatDate(user.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span>Last Profile Update: {formatDate(user.updatedAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-zinc-400" />
            <span>
              Last Session Activity:{" "}
              {user.lastLoginAt ? formatDate(user.lastLoginAt) : "No record on file"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-zinc-400" />
            <span>Security Status: {user.deletedAt ? "Flagged for Deletion" : "Active Credentials"}</span>
          </div>
        </div>
      </div>

      {/* Authored Content & Activity Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Authored Posts */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-zinc-50/70 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
            <span>Authored Articles ({user.recentPosts.length})</span>
            <span className="text-zinc-400 font-normal">Recent 5</span>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {user.recentPosts.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 font-mono text-xs italic">
                No articles published by this user.
              </div>
            ) : (
              user.recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                      {post.category}
                    </span>
                    <h4 className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 truncate mt-1">
                      {post.title}
                    </h4>
                    <span className="text-xs font-mono text-zinc-400">
                      {formatDate(post.createdAt)} &middot; {post.views || 0} views
                    </span>
                  </div>

                  <Link
                    href={`/posts/${post.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-zinc-600 dark:text-zinc-400"
                    title="View post"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Authored Comments */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-zinc-50/70 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
            <span>Recent Comments ({user.recentComments.length})</span>
            <span className="text-zinc-400 font-normal">Recent 5</span>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {user.recentComments.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 font-mono text-xs italic">
                No comments submitted by this user.
              </div>
            ) : (
              user.recentComments.map((comment) => (
                <div key={comment.id} className="p-4 space-y-1">
                  <p className="text-xs font-sans text-zinc-800 dark:text-zinc-200 line-clamp-2">
                    &ldquo;{comment.content}&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                    <span className="truncate max-w-[200px]">
                      Article: {comment.post?.title}
                    </span>
                    <span>{formatDate(comment.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <UserEditModal
        isOpen={isEditOpen}
        user={user}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveEdit}
      />

      {/* Reusable Alert / Confirmation Modal */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        description={alertConfig.description}
        confirmText={alertConfig.confirmText}
        isDestructive={alertConfig.isDestructive}
        isLoading={alertConfig.isLoading}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
