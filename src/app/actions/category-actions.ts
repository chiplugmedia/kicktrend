"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return categories;
  } catch {
    return [];
  }
}

export async function getCategoriesWithCounts() {
  try {
    const [categories, groupedCounts] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.post.groupBy({
        by: ["category"],
        where: { published: true, status: "approved" },
        _count: { _all: true },
      }),
    ]);

    const counts: Record<string, number> = {};
    for (const g of groupedCounts) {
      counts[g.category] = g._count._all;
    }

    return categories.map((c) => ({
      ...c,
      postCount: counts[c.name] || 0,
    }));
  } catch {
    return [];
  }
}

export async function createCategoryAction(name: string) {
  try {
    await requireAdmin();
    const cleanName = name.trim();
    if (!cleanName) {
      return { success: false, error: "Category name is required" };
    }

    const slug = slugify(cleanName);
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: cleanName }, { slug }],
      },
    });

    if (existing) {
      return { success: false, error: "A category with this name already exists" };
    }

    const category = await prisma.category.create({
      data: {
        name: cleanName,
        slug,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/new");

    return { success: true, category };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create category" };
  }
}

export async function updateCategoryAction(id: number, name: string) {
  try {
    await requireAdmin();
    const cleanName = name.trim();
    if (!cleanName) {
      return { success: false, error: "Category name cannot be empty" };
    }

    const slug = slugify(cleanName);
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: cleanName,
        slug,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update category" };
  }
}

export async function deleteCategoryAction(id: number) {
  try {
    await requireAdmin();
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete category" };
  }
}
