const previewGrid = document.querySelector("#previewCollectionGrid");
const previewForm = document.querySelector("#previewDollForm");
const editingIndexInput = document.querySelector("#editingIndexInput");
const photoInput = document.querySelector("#dollPhotoInput");
const photoPathInput = document.querySelector("#dollPhotoPathInput");
const nameInput = document.querySelector("#dollNameInput");
const tagInput = document.querySelector("#dollTagInput");
const colorInput = document.querySelector("#dollColorInput");
const detailInput = document.querySelector("#dollDetailInput");
const captionInput = document.querySelector("#dollCaptionInput");
const generateButton = document.querySelector("#generateCaptionButton");
const saveButton = document.querySelector("#saveDollButton");
const cancelEditButton = document.querySelector("#cancelEditButton");
const drawerCover = document.querySelector(".drawer-editor-cover");

const STORAGE_KEY = "nadiaDollPreviewItems";
let previewDolls = [];
let selectedPhoto = "";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizePhotoPath(value) {
  const trimmed = String(value || "").trim().replaceAll("\\", "/");
  if (!trimmed) return "";
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  const fileName = trimmed.split("/").filter(Boolean).pop();
  if (!fileName) return "";
  return `./assets/uploads/${fileName}`;
}

function makeCaption({ name, tag, color, detail }) {
  const dollName = name || "This little doll";
  const softColor = color || "soft colors";
  const cuteDetail = detail || "tiny sweet details";
  const personality = tag || "gentle little sweetheart";
  return `${dollName} feels like a ${personality}, dressed in ${softColor} with ${cuteDetail}. She looks ready to sit quietly in Nadia's collection and make the whole shelf feel a little cuter.`;
}

function savePreviewDolls() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(previewDolls));
}

function renderPreviewPhoto(photo, name) {
  if (photo) {
    return `<img src="${window.DollDiaryContent.assetPath(photo)}" alt="${escapeHtml(name || "Doll photo")}" />`;
  }
  return "<span>Photo later</span>";
}

function renderPreviewDolls() {
  if (!previewGrid) return;

  if (previewDolls.length === 0) {
    previewGrid.innerHTML = `
      <div class="empty-cabinet">
        <strong>No dolls yet</strong>
        <span>Open the drawer below to add the first tiny treasure.</span>
      </div>
    `;
    return;
  }

  previewGrid.innerHTML = previewDolls
    .map((doll, index) => {
      const name = doll.name || "Unnamed doll";
      const tag = doll.tag || "soft sweetheart";
      const caption = doll.caption || "";
      const photo = doll.photo || "";
      return `
        <article class="doll-keepsake-card">
          <button class="doll-cover" type="button" aria-expanded="false" data-index="${index}">
            <span class="doll-cover-bow" aria-hidden="true">🎀</span>
            <span class="doll-cover-title">${escapeHtml(name)}</span>
            <span class="doll-cover-tag">${escapeHtml(tag)}</span>
          </button>
          <div class="doll-keepsake-inside" hidden>
            <div class="doll-photo">${renderPreviewPhoto(photo, name)}</div>
            <div>
              <span class="doll-personality">${escapeHtml(tag)}</span>
              <h3>${escapeHtml(name)}</h3>
              <p>${escapeHtml(caption)}</p>
            </div>
          </div>
          <div class="doll-card-actions">
            <div class="doll-manage">
              <button class="ghost doll-manage-toggle" type="button" aria-label="Edit or delete this doll" aria-expanded="false" title="Edit or delete">🗝️</button>
              <div class="doll-manage-menu">
                <button class="ghost edit-doll-button" type="button" data-index="${index}">Edit card</button>
                <button class="danger delete-doll-button" type="button" data-index="${index}">Delete card</button>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  window.DollDiaryContent.enableImageFallbacks(previewGrid);
}

function openDrawer() {
  drawerCover?.setAttribute("aria-expanded", "true");
  if (previewForm) previewForm.hidden = false;
}

function resetForm() {
  previewForm?.reset();
  editingIndexInput.value = "";
  selectedPhoto = "";
  saveButton.textContent = "Add Doll";
  cancelEditButton.hidden = true;
  previewForm?.classList.remove("is-editing");
}

function startEdit(index) {
  const doll = previewDolls[index];
  if (!doll) return;
  openDrawer();
  editingIndexInput.value = String(index);
  photoPathInput.value = doll.photo || "";
  nameInput.value = doll.name || "";
  tagInput.value = doll.tag || "";
  colorInput.value = doll.color || "";
  detailInput.value = doll.detail || "";
  captionInput.value = doll.caption || "";
  selectedPhoto = "";
  saveButton.textContent = "Save Changes";
  cancelEditButton.hidden = false;
  previewForm?.classList.add("is-editing");
  previewForm?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function deleteDoll(index) {
  const doll = previewDolls[index];
  if (!doll) return;
  const ok = confirm(`Delete ${doll.name || "this doll"}?`);
  if (!ok) return;
  previewDolls.splice(index, 1);
  savePreviewDolls();
  renderPreviewDolls();
  resetForm();
}

async function loadInitialDolls() {
  try {
    previewDolls = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(previewDolls)) previewDolls = [];
  } catch {
    previewDolls = [];
  }
  renderPreviewDolls();
}

photoInput?.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  selectedPhoto = file ? URL.createObjectURL(file) : "";
  if (file && photoPathInput) {
    photoPathInput.value = `assets/uploads/${file.name}`;
  }
});

generateButton?.addEventListener("click", () => {
  captionInput.value = makeCaption({
    name: nameInput.value.trim(),
    tag: tagInput.value.trim(),
    color: colorInput.value.trim(),
    detail: detailInput.value.trim(),
  });
});

previewForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const editingIndex = editingIndexInput.value === "" ? -1 : Number(editingIndexInput.value);
  const name = nameInput.value.trim() || "New little doll";
  const tag = tagInput.value.trim() || "soft sweetheart";
  const color = colorInput.value.trim();
  const detail = detailInput.value.trim();
  const caption = captionInput.value.trim() || makeCaption({ name, tag, color, detail });
  const existingPhoto = editingIndex >= 0 ? previewDolls[editingIndex]?.photo : "";
  const photo = selectedPhoto || normalizePhotoPath(photoPathInput.value) || existingPhoto || "";

  const nextDoll = { name, tag, color, detail, photo, caption };

  if (editingIndex >= 0) {
    previewDolls[editingIndex] = nextDoll;
  } else {
    previewDolls.unshift(nextDoll);
  }

  savePreviewDolls();
  resetForm();
  renderPreviewDolls();
});

previewGrid?.addEventListener("click", (event) => {
  const manageToggle = event.target.closest(".doll-manage-toggle");
  if (manageToggle) {
    const manage = manageToggle.closest(".doll-manage");
    const isOpen = manage.classList.toggle("is-open");
    manageToggle.setAttribute("aria-expanded", String(isOpen));
    return;
  }

  const editButton = event.target.closest(".edit-doll-button");
  if (editButton) {
    startEdit(Number(editButton.dataset.index));
    return;
  }

  const deleteButton = event.target.closest(".delete-doll-button");
  if (deleteButton) {
    deleteDoll(Number(deleteButton.dataset.index));
    return;
  }

  const cover = event.target.closest(".doll-cover");
  if (!cover) return;
  const card = cover.closest(".doll-keepsake-card");
  const inside = card.querySelector(".doll-keepsake-inside");
  const isOpen = card.classList.toggle("is-open");
  cover.setAttribute("aria-expanded", String(isOpen));
  inside.hidden = !isOpen;
});

drawerCover?.addEventListener("click", () => {
  const isOpen = drawerCover.getAttribute("aria-expanded") === "true";
  drawerCover.setAttribute("aria-expanded", String(!isOpen));
  previewForm.hidden = isOpen;
});

cancelEditButton?.addEventListener("click", resetForm);

loadInitialDolls();
