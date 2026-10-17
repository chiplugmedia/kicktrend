"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Shield,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Mail,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AlertModal, AlertType } from "@/components/admin/AlertModal";
import { UserEditModal, EditableUserData } from "@/components/admin/UserEditModal";
import { UserCreateModal } from "@/components/admin/UserCreateModal";
import { UserDetailsModal } from "@/components/admin/UserDetailsModal";

export interface UserSummaryItem {
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
  _count: {
    posts: number;
    comments: number;
    likes: number;
  };
}

interface StatsData {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  staff: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UserManagerClientProps {
  initialUsers: UserSummaryItem[];
  initialStats: StatsData;
  initialPagination: PaginationData;
}

export function UserManagerClient({
  initialUsers,
  initialStats,
  initialPagination,
}: UserManagerClientProps) {
  const router = useRouter();

  // Data states
  const [users, setUsers] = React.useState<UserSummaryItem[]>(initialUsers);
  const [stats, setStats] = React.useState<StatsData>(initialStats);
  const [pagination, setPagination] = React.useState<PaginationData>(initialPagination);
  const [isLoading, setIsLoading] = React.useState(false);

  // Filters & Search
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Modals state
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const [editingUser, setEditingUser] = React.useState<EditableUserData | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // Alert & Confirmation Modal
  const [alertConfig, setAlertConfig] = React.useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
    showPermanentOption?: boolean;
    isPermanent?: boolean;
    onPermanentChange?: (val: boolean) => void;
    onConfirm?: () => Promise<void>;
  }>({
    isOpen: false,
    type: "delete",
    title: "",
    description: "",
  });

  // Fetch users with filters and pagination
  const fetchUsers = React.useCallback(
    async (page = 1, searchQuery = search, role = roleFilter, status = statusFilter) => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          search: searchQuery,
          role,
          status,
        });

        const res = await fetch(`/api/admin/users?${queryParams.toString()}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setUsers(data.users);
          setPagination(data.pagination);
          if (data.stats) setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [search, roleFilter, statusFilter]
  );

  // Debounced search trigger
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, search, roleFilter, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter, fetchUsers]);

  // Status Badge Component
  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Suspended
      </span>
    );
  };

  // Role Badge Component
  const renderRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-black text-white dark:bg-white dark:text-black">
          <Shield className="w-3 h-3" />
          Admin
        </span>
      );
    }
    if (r === "manager") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900">
          Manager
        </span>
      );
    }
    if (r === "author") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
          <Shield className="w-3 h-3 text-violet-500" />
          Author
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
        User
      </span>
    );
  };

  // Handle Edit Action
  const handleEditClick = (u: UserSummaryItem) => {
    setEditingUser({
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      phone: u.phone,
    });
    setIsEditOpen(true);
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

    // Refresh user list
    fetchUsers(pagination.page);

    // Show Success Modal
    setAlertConfig({
      isOpen: true,
      type: "success",
      title: "User Updated Successfully",
      description: `Account credentials and role for user ID #${userId} were updated.`,
      confirmText: "Done",
    });
  };

  // Handle Create User
  const handleCreateUser = async (data: {
    username: string;
    email: string;
    password: string;
    role: string;
    status: string;
    name?: string;
    phone?: string;
  }) => {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to create user.");
    }

    fetchUsers(1);

    setAlertConfig({
      isOpen: true,
      type: "success",
      title: "Account Provisioned",
      description: `New user @${data.username} has been registered and assigned role "${data.role}".`,
      confirmText: "Great",
    });
  };

  // Handle Delete User with Custom Modal
  const handleDeleteClick = (u: UserSummaryItem) => {
    let permanent = false;

    setAlertConfig({
      isOpen: true,
      type: "delete",
      title: `Delete Account: @${u.username}`,
      description: `Are you sure you want to delete @${u.username} (${u.email})? By default, this performs a safe soft-delete which sets their status to suspended.`,
      confirmText: "Yes, Delete User",
      cancelText: "Keep User",
      isDestructive: true,
      showPermanentOption: true,
      isPermanent: permanent,
      onPermanentChange: (val) => {
        permanent = val;
        setAlertConfig((prev) => ({
          ...prev,
          isPermanent: val,
          description: val
            ? `⚠️ WARNING: Permanent purge selected. This will permanently delete @${u.username} and cascade delete all their comments and likes from the database.`
            : `Are you sure you want to delete @${u.username} (${u.email})? By default, this performs a safe soft-delete which sets their status to suspended.`,
        }));
      },
      onConfirm: async () => {
        setAlertConfig((prev) => ({ ...prev, isLoading: true }));
        try {
          const res = await fetch(`/api/admin/users/${u.id}?permanent=${permanent}`, {
            method: "DELETE",
          });
          const result = await res.json();

          if (!res.ok) {
            throw new Error(result.error || "Failed to delete user.");
          }

          fetchUsers(pagination.page);

          setAlertConfig({
            isOpen: true,
            type: "success",
            title: "User Removed",
            description: result.message || "User account was deleted successfully.",
            confirmText: "Dismiss",
          });
        } catch (err: any) {
          setAlertConfig({
            isOpen: true,
            type: "caution",
            title: "Operation Blocked",
            description: err.message || "An unexpected error occurred while deleting user.",
            confirmText: "Acknowledge",
          });
        }
      },
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black font-semibold">
            ADMINISTRATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            User Management & Directory
          </h1>
          <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 mt-1">
            Manage registered accounts, assign administrative roles, monitor status, and review user dossiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchUsers(pagination.page)}
            disabled={isLoading}
            className="p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-white transition-colors disabled:opacity-50"
            title="Refresh user list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Top Summary Widgets / Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Users */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Total Users
            </span>
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-zinc-900 dark:text-zinc-100">
              {stats.total}
            </span>
            <span className="text-[11px] font-mono text-zinc-400">Registered</span>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Active Accounts
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {stats.active}
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              {stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% active` : "0%"}
            </span>
          </div>
        </div>

        {/* Pending Verification */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Pending
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
              {stats.pending}
            </span>
            <span className="text-[11px] font-mono text-zinc-400">Awaiting status</span>
          </div>
        </div>

        {/* Suspended Accounts */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Suspended
            </span>
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-red-600 dark:text-red-400">
              {stats.suspended}
            </span>
            <span className="text-[11px] font-mono text-zinc-400">Restricted</span>
          </div>
        </div>
      </div>

      {/* Table Container Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 shadow-xs">
        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username, full name, or email..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans text-xs focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow placeholder:text-zinc-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role & Status Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent font-mono text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Role: All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="author">Author</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-mono text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Status: All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-100/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Activity</th>
                <th className="px-4 py-3.5">Registered</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-zinc-400">
                    <div className="flex items-center justify-center gap-2 font-mono">
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                      <span>Loading user records...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-zinc-400">
                    <div className="space-y-2">
                      <p className="font-mono text-sm">No users found matching current filters.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setRoleFilter("all");
                          setStatusFilter("all");
                        }}
                        className="text-xs font-mono underline underline-offset-4 text-zinc-600 dark:text-zinc-300"
                      >
                        Reset all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group"
                  >
                    {/* User Identity Column */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-mono font-bold shrink-0 shadow-xs">
                          {u.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.avatar}
                              alt={u.username}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            (u.name?.charAt(0) || u.username.charAt(0)).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold font-mono text-zinc-900 dark:text-zinc-100 truncate">
                            {u.name || u.username}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-400 truncate">
                            @{u.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email Column */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-zinc-600 dark:text-zinc-300 font-sans">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{u.email}</span>
                      </div>
                    </td>

                    {/* Role Column */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {renderRoleBadge(u.role)}
                    </td>

                    {/* Status Column */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {renderStatusBadge(u.status)}
                    </td>

                    {/* Content Count Activity */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                      <span>{u._count.posts} posts</span> &middot;{" "}
                      <span>{u._count.comments} cmts</span>
                    </td>

                    {/* Registration Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                      {formatDate(u.createdAt)}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserId(u.id);
                            setIsDetailsOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                          title="View user profile dossier"
                          aria-label={`View details for ${u.username}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Role/Status */}
                        <button
                          type="button"
                          onClick={() => handleEditClick(u)}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                          title="Edit role, status, or profile"
                          aria-label={`Edit ${u.username}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete User */}
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(u)}
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 transition-colors"
                          title="Delete or suspend user"
                          aria-label={`Delete ${u.username}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {users.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {pagination.total}
            </span>{" "}
            users
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-2 text-zinc-400 font-mono">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isDetailsOpen}
        userId={selectedUserId}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedUserId(null);
        }}
        onEdit={(detailed) => {
          handleEditClick({
            ...detailed,
            _count: {
              posts: detailed.stats?.postsCount ?? 0,
              comments: detailed.stats?.commentsCount ?? 0,
              likes: detailed.stats?.likesCount ?? 0,
            },
          });
        }}
      />

      {/* User Edit Modal */}
      <UserEditModal
        isOpen={isEditOpen}
        user={editingUser}
        onClose={() => {
          setIsEditOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* User Create Modal */}
      <UserCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateUser}
      />

      {/* Reusable Alert / Confirmation Modal */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        description={alertConfig.description}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        isDestructive={alertConfig.isDestructive}
        isLoading={alertConfig.isLoading}
        showPermanentOption={alertConfig.showPermanentOption}
        isPermanent={alertConfig.isPermanent}
        onPermanentChange={alertConfig.onPermanentChange}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
