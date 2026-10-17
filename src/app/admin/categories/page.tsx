import { getCategoriesWithCounts } from "@/app/actions/category-actions";
import { CategoryManagerClient } from "./CategoryManagerClient";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return <CategoryManagerClient initialCategories={categories} />;
}
