"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/app/actions/category-actions";
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
  postCount: number;
}

interface CategoryManagerClientProps {
  initialCategories: CategoryItem[];
}

export function CategoryManagerClient({
  initialCategories,
}: CategoryManagerClientProps) {
  const router = useRouter();

  // Create state
  const [newName, setNewName] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editingName, setEditingName] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Deleting state
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsCreating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await createCategoryAction(newName);
      if (res.success) {
        setNewName("");
        setSuccessMsg(`Category "${res.category?.name}" created successfully.`);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to create category");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while creating category");
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setErrorMsg(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;

    setIsUpdating(true);
    setErrorMsg(null);

    try {
      const res = await updateCategoryAction(id, editingName);
      if (res.success) {
        setEditingId(null);
        setEditingName("");
        setSuccessMsg("Category updated successfully.");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to update category");
      }
    } catch {
      setErrorMsg("Failed to update category");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    if (
      !confirm(
        `Are you sure you want to delete category "${cat.name}"? If any posts use this category, you should update them first.`
      )
    ) {
      return;
    }

    setDeletingId(cat.id);
    setErrorMsg(null);

    try {
      const res = await deleteCategoryAction(cat.id);
      if (res.success) {
        setSuccessMsg(`Category "${cat.name}" deleted.`);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to delete category");
      }
    } catch {
      setErrorMsg("Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black font-semibold">
          TAXONOMY
        </span>
        <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
          Category Management
        </h1>
        <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 mt-1">
          Create, edit, and organize editorial categories for all publication dispatches.
        </p>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add New Category Card */}
      <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <h2 className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-3">
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </h2>

        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Distributed Systems, Cybersecurity, Machine Learning"
            className="flex-1 px-3.5 py-2 text-sm rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? "Adding..." : "Create Category"}</span>
          </button>
        </form>
      </div>

      {/* Categories Listing Table */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
        <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
          <span>Configured Categories ({initialCategories.length})</span>
          <span className="text-zinc-400 font-normal">Active in MySQL</span>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {initialCategories.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 font-mono text-sm">
              No categories configured yet. Add your first category above.
            </div>
          ) : (
            initialCategories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
              >
                {editingId === cat.id ? (
                  <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleUpdate(cat.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-semibold"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 font-mono text-xs text-zinc-600 dark:text-zinc-400"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {cat.name}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        slug: /{cat.slug}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                      <FileText className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{cat.postCount} {cat.postCount === 1 ? "article" : "articles"}</span>
                    </div>
                  </div>
                )}

                {editingId !== cat.id && (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="p-2 rounded border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-zinc-600 dark:text-zinc-400 transition-colors"
                      title="Edit Category Name"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === cat.id}
                      onClick={() => handleDelete(cat)}
                      className="p-2 rounded border border-zinc-200 dark:border-zinc-800 hover:border-red-500 text-zinc-600 dark:text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
