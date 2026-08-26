// MIGRATED: This file previously used Firebase Firestore for data fetching.
// All data now comes from Next.js API routes: /api/gallery
// The active implementation is in app/gallery/page.tsx (React component)
import { pseudoGallery, pseudoChapters } from "./pseudoData.js";
import {
  getUserChapterId,
  getUserRole,
  getUserName,
  getUserId,
  requireAuth,
} from "./utils/authUtils.js";

if (!requireAuth()) throw new Error("Not authenticated");

const currentChapterId = getUserChapterId();
const currentUserRole = getUserRole();
const currentUserName = getUserName();
const currentUserId = getUserId();
const isAdmin = currentUserRole === "admin";

const galleryRef = collection(db, "gallery");
const STORAGE_KEY = "localGallery";

const categoryIcons = {
  class: "&#128218;",
  event: "&#127881;",
  milestone: "&#127942;",
  community: "&#129309;",
};

function getLocalOverrides() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLocalOverrides(overrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

function getAllLocalGallery() {
  const base = pseudoGallery.map((g) => ({ ...g }));
  const overrides = getLocalOverrides();
  const map = new Map(base.map((g) => [g.id, g]));
  overrides.forEach((o) => {
    if (o._deleted) {
      map.delete(o.id);
    } else {
      map.set(o.id, o);
    }
  });
  return [...map.values()];
}

function getChapterNameById(chapterId) {
  const ch = pseudoChapters.find((c) => c.chapterId === chapterId);
  return ch ? ch.chapterName : "Unknown";
}

let allGallery = [];
let activeCategory = "all";
let selectedColor = "#e61e4d";

async function loadGallery() {
  if (USE_PSEUDO_DATA) {
    allGallery = getAllLocalGallery();
  } else {
    try {
      await ensureAuth();
      const snapshot = await getDocs(galleryRef);
      allGallery = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error("Error loading gallery:", err);
    }
  }
  renderGallery();
}

function getVisibleGallery() {
  let items = [...allGallery];

  if (!isAdmin) {
    items = items.filter((g) => g.chapterId === currentChapterId);
  }

  if (activeCategory !== "all") {
    items = items.filter((g) => g.category === activeCategory);
  }

  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  return items;
}

function renderGallery() {
  const grid = document.getElementById("galleryGrid");
  const stats = document.getElementById("galleryStats");
  const items = getVisibleGallery();

  stats.textContent = `${items.length} item${items.length !== 1 ? "s" : ""}`;

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>&#127912; No gallery items found.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items
    .map(
      (item) => `
    <div class="gallery-card" onclick="openLightbox('${item.id}')">
      <div class="gallery-card-image" style="background:${item.color || "#e61e4d"};">
        <span class="category-icon">${categoryIcons[item.category] || "&#128248;"}</span>
        <span class="gallery-card-status status-${item.status}">${item.status}</span>
      </div>
      <div class="gallery-card-body">
        <div class="gallery-card-title">${item.title}</div>
        <div class="gallery-card-desc">${item.description}</div>
        <div class="gallery-card-meta">
          <span class="gallery-card-category">${item.category}</span>
          <span class="gallery-card-info">${item.date}</span>
        </div>
        ${
          isAdmin && item.status === "pending"
            ? `
          <div class="gallery-card-admin">
            <button class="admin-btn" onclick="event.stopPropagation(); moderateGallery('${item.id}', 'approved')">&#10003; Approve</button>
            <button class="admin-btn reject-btn" onclick="event.stopPropagation(); moderateGallery('${item.id}', 'rejected')">&#10007; Reject</button>
          </div>
          `
            : ""
        }
      </div>
    </div>
  `,
    )
    .join("");
}

window.openLightbox = function (id) {
  const item = allGallery.find((g) => g.id === id);
  if (!item) return;

  document.getElementById("lightboxImage").innerHTML = `
    <span>${categoryIcons[item.category] || "&#128248;"}</span>
  `;
  document.getElementById("lightboxImage").style.background = item.color || "#e61e4d";

  document.getElementById("lightboxInfo").innerHTML = `
    <h2>${item.title}</h2>
    <p>${item.description}</p>
    <div class="lightbox-meta">
      <span>&#128100; ${item.uploadedByName}</span>
      <span>&#127968; ${getChapterNameById(item.chapterId)}</span>
      <span>&#128197; ${item.date}</span>
      <span class="gallery-card-category">${item.category}</span>
      <span class="gallery-card-status status-${item.status}" style="font-size:11px;">${item.status}</span>
    </div>
  `;

  const adminDiv = document.getElementById("lightboxAdmin");
  if (isAdmin && item.status === "pending") {
    adminDiv.innerHTML = `
      <button class="admin-btn" onclick="moderateGallery('${item.id}', 'approved'); document.getElementById('lightboxModal').style.display='none';">&#10003; Approve</button>
      <button class="admin-btn reject-btn" onclick="moderateGallery('${item.id}', 'rejected'); document.getElementById('lightboxModal').style.display='none';">&#10007; Reject</button>
    `;
  } else {
    adminDiv.innerHTML = "";
  }

  document.getElementById("lightboxModal").style.display = "flex";
};

window.moderateGallery = async function (id, status) {
  try {
    if (USE_PSEUDO_DATA) {
      const overrides = getLocalOverrides();
      const idx = overrides.findIndex((o) => o.id === id);
      if (idx !== -1) {
        overrides[idx] = { ...overrides[idx], status };
      } else {
        overrides.push({ id, status });
      }
      saveLocalOverrides(overrides);
    } else {
      await ensureAuth();
      await updateDoc(doc(db, "gallery", id), { status });
    }
    showToast(`Image ${status}!`);
    await loadGallery();
  } catch (err) {
    console.error("Error moderating gallery item:", err);
    showToast("Failed to moderate item.");
  }
};

document.getElementById("uploadBtn").addEventListener("click", () => {
  document.getElementById("uploadModalTitle").textContent = "Upload to Gallery";
  document.getElementById("galleryTitle").value = "";
  document.getElementById("galleryDesc").value = "";
  document.getElementById("galleryCategory").selectedIndex = 0;
  selectedColor = "#e61e4d";
  document.querySelectorAll(".color-swatch").forEach((s) => {
    s.classList.toggle("active", s.dataset.color === selectedColor);
  });
  document.getElementById("uploadModal").style.display = "flex";
});

document.querySelectorAll(".color-swatch").forEach((swatch) => {
  swatch.addEventListener("click", () => {
    document.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("active"));
    swatch.classList.add("active");
    selectedColor = swatch.dataset.color;
  });
});

document.getElementById("closeUploadModal").addEventListener("click", () => {
  document.getElementById("uploadModal").style.display = "none";
});

document.getElementById("cancelUploadBtn").addEventListener("click", () => {
  document.getElementById("uploadModal").style.display = "none";
});

document.getElementById("closeLightbox").addEventListener("click", () => {
  document.getElementById("lightboxModal").style.display = "none";
});

document.getElementById("uploadModal").addEventListener("click", (e) => {
  if (e.target.id === "uploadModal") {
    document.getElementById("uploadModal").style.display = "none";
  }
});

document.getElementById("lightboxModal").addEventListener("click", (e) => {
  if (e.target.id === "lightboxModal") {
    document.getElementById("lightboxModal").style.display = "none";
  }
});

document.getElementById("saveUploadBtn").addEventListener("click", async () => {
  const title = document.getElementById("galleryTitle").value.trim();
  const description = document.getElementById("galleryDesc").value.trim();
  const category = document.getElementById("galleryCategory").value;

  if (!title || !description) {
    showToast("Please fill in title and description.");
    return;
  }

  const itemData = {
    title,
    description,
    category,
    color: selectedColor,
    chapterId: currentChapterId,
    uploadedBy: currentUserId,
    uploadedByName: currentUserName,
    date: new Date().toISOString().split("T")[0],
    status: isAdmin ? "approved" : "pending",
  };

  try {
    if (USE_PSEUDO_DATA) {
      const id = "local_g_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
      const overrides = getLocalOverrides();
      overrides.push({ ...itemData, id });
      saveLocalOverrides(overrides);
    } else {
      await ensureAuth();
      await addDoc(galleryRef, itemData);
    }
    showToast("Photo uploaded!");
    document.getElementById("uploadModal").style.display = "none";
    await loadGallery();
  } catch (err) {
    console.error("Error uploading gallery item:", err);
    showToast("Failed to upload photo.");
  }
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    activeCategory = chip.dataset.category;
    renderGallery();
  });
});

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

loadGallery();
