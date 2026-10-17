import { getSiteSettings } from "@/app/actions/setting-actions";
import { SettingsClient } from "./SettingsClient";

export default async function AdminSettingsPage() {
  const initialSettings = await getSiteSettings();

  return <SettingsClient initialSettings={initialSettings} />;
}
