const previewGrid = document.querySelector("#previewCollectionGrid");
const previewForm = document.querySelector("#previewDollForm");
const photoInput = document.querySelector("#dollPhotoInput");
const nameInput = document.querySelector("#dollNameInput");
const tagInput = document.querySelector("#dollTagInput");
const colorInput = document.querySelector("#dollColorInput");
const detailInput = document.querySelector("#dollDetailInput");
const captionInput = document.querySelector("#dollCaptionInput");
const generateButton = document.querySelector("#generateCaptionButton");
const drawerCover = document.querySelector(".drawer-editor-cover");

let previewDolls = [];
let selectedPhoto = "";

function makeCaption({ name, tag, color, detail }) {
  const dollName = name || "This little doll";
  const softColor = color || "soft colors";
  const cuteDetail = detail || "tiny sweet details";
  const personality = tag || "gentle little sweetheart";
  return `${dollName} feels like a ${personality}, dressed in ${softColor} with ${cuteDetail}. She looks ready to sit quietly in Nadia's collection and make the whole shelf feel a little cuter.`;
}

function renderPreviewPhoto(photo, name) {
  if (photo) return `<img src="${photo}" alt="${name || "Doll photo"}" />`;
  return "<span>Photo later</span>";
}

function renderPreviewDolls() {
  if (!previewGrid) return;

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
            <span class="doll-cover-title">${name}</span>
            <span class="doll-cover-tag">${tag}</span>
          </button>
          <div class="doll-keepsake-inside" hidden>
            <div class="doll-photo">${renderPreviewPhoto(photo, name)}</div>
            <div>
              <span class="doll-personality">${tag}</span>
              <h3>${name}</h3>
              <p>${caption}</p>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadInitialDolls() {
  try {
    const data = await window.DollDiaryContent.loadJson("./content/dolls.json");
    previewDolls = (Array.isArray(data.dolls) ? data.dolls : []).map((doll) => ({
      name: doll.name || "Unnamed doll",
      tag: doll.tag || "first little friend",
      photo: doll.photo || "",
      caption: doll.caption || "",
    }));
  } catch {
    previewDolls = [];
  }

  previewDolls = [
    ...previewDolls,
    {
      name: "Blue Hat Plushies",
      tag: "soft travel buddies",
      photo: "",
      caption:
        "These two little plushies feel like tiny companions from a sweet shopping day. Their pale blue hats and sleepy faces make them look ready for a cozy shelf together.",
    },
    {
      name: "Pink Dolphin Charm",
      tag: "pocket treasure",
      photo: "",
      caption:
        "A tiny pink dolphin charm with a bow, stars, and a heart-shaped frame. It feels like the kind of small lucky piece Nadia would keep because it is cute, bright, and a little magical.",
    },
  ];

  renderPreviewDolls();
}

photoInput?.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  selectedPhoto = file ? URL.createObjectURL(file) : "";
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
  const name = nameInput.value.trim() || "New little doll";
  const tag = tagInput.value.trim() || "soft sweetheart";
  const caption =
    captionInput.value.trim() ||
    makeCaption({
      name,
      tag,
      color: colorInput.value.trim(),
      detail: detailInput.value.trim(),
    });

  previewDolls.unshift({
    name,
    tag,
    photo: selectedPhoto,
    caption,
  });

  previewForm.reset();
  selectedPhoto = "";
  renderPreviewDolls();
});

previewGrid?.addEventListener("click", (event) => {
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

loadInitialDolls();
