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
  if (alt) el.setAttribute("alt", alt);
}

window.DollDiaryContent = {
  assetPath,
  loadJson,
  setText,
  setImage
};
