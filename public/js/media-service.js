import {
  addMediaItem as addLocalMediaItem,
  deleteMediaItem as deleteLocalMediaItem,
  getMediaByDate as getLocalMediaByDate,
  seedDefaultsIfEmpty as seedLocalDefaultsIfEmpty,
  updateMediaItem as updateLocalMediaItem
} from "./storage.js";
import { SUPABASE_CONFIG, isCloudConfigured } from "./config.js";

function encodePath(path) {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function parseCloudError(status, text) {
  let message = text;
  try {
    const parsed = JSON.parse(text);
    if (parsed?.message) {
      message = parsed.message;
    }
  } catch {
    // Keep original text when response is not JSON.
  }

  const isRlsBlocked =
    status === 403 && /row-level security|violates row-level security policy/i.test(text);

  if (isRlsBlocked) {
    return [
      "Supabase 拒绝写入（RLS 策略未通过）。",
      `请在 Supabase SQL Editor 执行项目内的 supabase/schema.sql 与 supabase/storage_policies.sql，`,
      `并确认配置一致：bucket="${SUPABASE_CONFIG.bucket}"，table="${SUPABASE_CONFIG.table}"。`,
      `原始错误：${message}`
    ].join("");
  }

  return `Cloud API failed (${status}): ${message}`;
}

function toCloudHeaders(extra = {}) {
  return {
    apikey: SUPABASE_CONFIG.anonKey,
    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
    ...extra
  };
}

function normalizeCloudItem(row) {
  return {
    id: row.id,
    date: row.date_key,
    type: row.media_type,
    url: row.media_url,
    caption: row.caption || "",
    width: row.width_percent || 100,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    storagePath: row.storage_path || ""
  };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function cloudFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_CONFIG.url}${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseCloudError(res.status, text));
  }
  return res;
}

export function usingCloudStorage() {
  return isCloudConfigured();
}

export async function seedDefaultsIfEmpty() {
  if (usingCloudStorage()) return;
  await seedLocalDefaultsIfEmpty();
}

export async function getMediaByDate(date) {
  if (!usingCloudStorage()) {
    return getLocalMediaByDate(date);
  }

  const query = `/rest/v1/${SUPABASE_CONFIG.table}?date_key=eq.${date}&select=*&order=created_at.asc`;
  const res = await cloudFetch(query, {
    headers: toCloudHeaders({ Accept: "application/json" })
  });

  const rows = await res.json();
  return rows.map(normalizeCloudItem);
}

export async function addMediaItem({ date, file, caption }) {
  if (!usingCloudStorage()) {
    const dataUrl = await fileToDataUrl(file);
    const type = file.type.startsWith("video/") ? "video" : "image";
    await addLocalMediaItem({
      date,
      type,
      url: dataUrl,
      caption,
      width: 100,
      createdAt: Date.now()
    });
    return;
  }

  const type = file.type.startsWith("video/") ? "video" : "image";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${date}/${Date.now()}_${safeName}`;

  await cloudFetch(`/storage/v1/object/${SUPABASE_CONFIG.bucket}/${encodePath(storagePath)}`, {
    method: "POST",
    headers: toCloudHeaders({
      "x-upsert": "false",
      "content-type": file.type || "application/octet-stream"
    }),
    body: file
  });

  const mediaUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/public/${SUPABASE_CONFIG.bucket}/${encodePath(storagePath)}`;

  const row = {
    date_key: date,
    media_type: type,
    media_url: mediaUrl,
    caption: caption || "",
    width_percent: 100,
    storage_path: storagePath
  };

  try {
    await cloudFetch(`/rest/v1/${SUPABASE_CONFIG.table}`, {
      method: "POST",
      headers: toCloudHeaders({
        "content-type": "application/json",
        Prefer: "return=representation"
      }),
      body: JSON.stringify(row)
    });
  } catch (error) {
    try {
      await cloudFetch(`/storage/v1/object/${SUPABASE_CONFIG.bucket}/${encodePath(storagePath)}`, {
        method: "DELETE",
        headers: toCloudHeaders()
      });
    } catch {
      // Ignore rollback failure and preserve original insert error.
    }
    throw error;
  }
}

export async function updateMediaItem(item) {
  if (!usingCloudStorage()) {
    return updateLocalMediaItem(item);
  }

  const payload = {
    width_percent: Number(item.width || 100),
    caption: item.caption || ""
  };

  await cloudFetch(`/rest/v1/${SUPABASE_CONFIG.table}?id=eq.${item.id}`, {
    method: "PATCH",
    headers: toCloudHeaders({ "content-type": "application/json" }),
    body: JSON.stringify(payload)
  });
}

export async function deleteMediaItem(item) {
  if (!usingCloudStorage()) {
    return deleteLocalMediaItem(item.id);
  }

  await cloudFetch(`/rest/v1/${SUPABASE_CONFIG.table}?id=eq.${item.id}`, {
    method: "DELETE",
    headers: toCloudHeaders()
  });

  if (item.storagePath) {
    await cloudFetch(`/storage/v1/object/${SUPABASE_CONFIG.bucket}/${encodePath(item.storagePath)}`, {
      method: "DELETE",
      headers: toCloudHeaders()
    });
  }
}
