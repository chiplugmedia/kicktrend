import { notFound } from "next/navigation";
import { requireAuthor } from "@/lib/auth";
import { getAuthorProfileAction } from "@/app/actions/author-actions";
import { AuthorSettingsClient } from "./AuthorSettingsClient";

export const metadata = {
  title: "Profile & Settings — Author Workspace",
  description: "Manage your author profile, display name, avatar, and password credentials.",
};

export default async function AuthorSettingsPage() {
  await requireAuthor();
  const res = await getAuthorProfileAction();

  if (!res.success || !res.profile) {
    notFound();
  }

  return <AuthorSettingsClient initialProfile={res.profile} />;
}
