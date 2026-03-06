const KEY = "web_2026_edit_mode";

function isEditMode() {
  return localStorage.getItem(KEY) === "on";
}

function setEditMode(on) {
  localStorage.setItem(KEY, on ? "on" : "off");
  document.body.classList.toggle("edit-on", on);
  document.dispatchEvent(new CustomEvent("edit-mode-changed", { detail: { on } }));
}

function syncButton(btn, on) {
  btn.textContent = on ? "编辑模式: 开" : "编辑模式: 关";
  btn.classList.toggle("on", on);
}

const btn = document.getElementById("editModeBtn");
if (btn) {
  const initial = isEditMode();
  document.body.classList.toggle("edit-on", initial);
  syncButton(btn, initial);

  btn.addEventListener("click", () => {
    const next = !isEditMode();
    setEditMode(next);
    syncButton(btn, next);
  });
}

window.web2026EditMode = {
  isEditMode,
  setEditMode
};
