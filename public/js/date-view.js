import { addMediaItem, deleteMediaItem, getMediaByDate, seedDefaultsIfEmpty, updateMediaItem, usingCloudStorage } from "./media-service.js";

const params = new URLSearchParams(window.location.search);
const date = params.get("date") || "2026-01-01";

const dateTitle = document.getElementById("dateTitle");
const mediaGrid = document.getElementById("mediaGrid");
const uploadPanel = document.getElementById("uploadPanel");
const uploadForm = document.getElementById("uploadForm");
const mediaFile = document.getElementById("mediaFile");
const mediaCaption = document.getElementById("mediaCaption");
const storageHint = document.getElementById("storageHint");

dateTitle.textContent = date;

function currentEditMode() {
  return window.web2026EditMode?.isEditMode() || false;
}

function syncEditUi() {
  const on = currentEditMode();
  uploadPanel.classList.toggle("hidden-panel", !on);
  uploadPanel.setAttribute("aria-hidden", String(!on));

  if (usingCloudStorage()) {
    storageHint.textContent = "当前为云端共享模式：所有访问者看到同一份上传内容。";
  } else {
    storageHint.textContent = "当前为本地模式：请先在 public/js/config.js 配置 Supabase 以开启多人共享。";
  }
}

function renderItems(items) {
  mediaGrid.innerHTML = "";
  const editMode = currentEditMode();

  if (!items.length) {
    mediaGrid.innerHTML = "<p class=\"muted\">该日期暂无媒体内容。</p>";
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "media-card";

    const mediaWrap = document.createElement("div");
    mediaWrap.className = "media-wrap";
    mediaWrap.style.width = `${item.width || 100}%`;

    let mediaEl;
    if (item.type === "video") {
      mediaEl = document.createElement("video");
      mediaEl.controls = true;
    } else {
      mediaEl = document.createElement("img");
      mediaEl.alt = item.caption || "上传图片";
    }
    mediaEl.src = item.url;
    mediaWrap.appendChild(mediaEl);
    card.appendChild(mediaWrap);

    const meta = document.createElement("p");
    meta.className = "muted";
    meta.textContent = item.caption || `${item.type} 文件`;
    card.appendChild(meta);

    if (editMode) {
      const controls = document.createElement("div");
      controls.className = "item-controls";

      const range = document.createElement("input");
      range.type = "range";
      range.min = "30";
      range.max = "100";
      range.step = "5";
      range.value = String(item.width || 100);

      const valueTag = document.createElement("span");
      valueTag.className = "muted";
      valueTag.textContent = `${range.value}%`;

      range.addEventListener("input", () => {
        mediaWrap.style.width = `${range.value}%`;
        valueTag.textContent = `${range.value}%`;
      });

      range.addEventListener("change", async () => {
        item.width = Number(range.value);
        await updateMediaItem(item);
      });

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "danger-btn";
      delBtn.textContent = "删除";
      delBtn.addEventListener("click", async () => {
        await deleteMediaItem(item);
        refresh();
      });

      controls.appendChild(range);
      controls.appendChild(valueTag);
      controls.appendChild(delBtn);
      card.appendChild(controls);
    }

    mediaGrid.appendChild(card);
  });
}

async function refresh() {
  await seedDefaultsIfEmpty();
  const items = await getMediaByDate(date);
  renderItems(items);
  syncEditUi();
}

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentEditMode()) return;

  const file = mediaFile.files?.[0];
  if (!file) return;

  await addMediaItem({
    date,
    file,
    caption: mediaCaption.value.trim()
  });

  uploadForm.reset();
  refresh();
});

document.addEventListener("edit-mode-changed", () => refresh());

refresh();
