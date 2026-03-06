export const CLOUD_PROVIDER = "supabase";

export const SUPABASE_CONFIG = {
  url: "",
  anonKey: "",
  bucket: "media-files",
  table: "media_items"
};

export function isCloudConfigured() {
  return Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && SUPABASE_CONFIG.bucket && SUPABASE_CONFIG.table);
}
