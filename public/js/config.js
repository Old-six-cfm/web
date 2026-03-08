export const CLOUD_PROVIDER = "supabase";

export const SUPABASE_CONFIG = {
  url: "https://idinzyhsrmnznsmgxezi.supabase.co",
  anonKey: "sb_publishable_w9aMe5RIPQECAcuH-9KHPA_eQSONkUN",
  bucket: "media-files",
  table: "media_items"
};

export function isCloudConfigured() {
  return Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && SUPABASE_CONFIG.bucket && SUPABASE_CONFIG.table);
}
