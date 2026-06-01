async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return await response.json();
}

function assetPath(src) {
  if (!src) return "";
  const value = String(src).trim();
  if (/^(https?:|data:|blob:|\.\/|\.\.\/)/i.test(value)) return value;
  if (value.startsWith("/assets/")) return `.${value}`;
  return value;
}

function rootPhotoFallback(src) {
  const value = String(src || "").trim();
  if (!value.includes("assets/uploads/")) return "";
  const fileName = value.split("/").filter(Boolean).pop();
  return fileName ? `./${fileName}` : "";
}

function applyImageFallback(img) {
  if (!img || img.dataset.fallbackReady === "true") return;
  img.dataset.fallbackReady = "true";
  img.addEventListener("error", () => {
    const fallback = rootPhotoFallback(img.getAttribute("src"));
    if (!fallback || img.dataset.usedRootFallback === "true") return;
    img.dataset.usedRootFallback = "true";
    img.setAttribute("src", fallback);
  });
}

function enableImageFallbacks(root = document) {
  root.querySelectorAll("img").forEach(applyImageFallback);
}

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.textContent = value ?? "";
}

function setImage(selector, src, alt) {
  const el = document.querySelector(selector);
  if (!el) return;
  if (!src) {
    el.removeAttribute("src");
    el.setAttribute("hidden", "hidden");
    return;
  }
  el.removeAttribute("hidden");
  el.setAttribute("src", assetPath(src));
  applyImageFallback(el);
  if (alt) el.setAttribute("alt", alt);
}

document.addEventListener("DOMContentLoaded", () => enableImageFallbacks());

window.DollDiaryContent = {
  assetPath,
  enableImageFallbacks,
  loadJson,
  setText,
  setImage
};
