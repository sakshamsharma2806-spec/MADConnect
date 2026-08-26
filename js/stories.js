// MIGRATED: This file previously used Firebase Firestore for data fetching.
// All data now comes from Next.js API routes: /api/stories
// The active implementation is in app/stories/page.tsx (React component)
import { pseudoStories, pseudoChapters } from "./pseudoData.js";
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

const storiesRef = collection(db, "stories");
const STORAGE_KEY = "localStories";

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

function getAllLocalStories() {
  const base = pseudoStories.map((s) => ({ ...s }));
  const overrides = getLocalOverrides();
  const map = new Map(base.map((s) => [s.id, s]));
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

let allStories = [];
let activeStatusFilter = "all";

async function loadStories() {
  if (USE_PSEUDO_DATA) {
    allStories = getAllLocalStories();
  } else {
    try {
      await ensureAuth();
      const snapshot = await getDocs(storiesRef);
      allStories = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error("Error loading stories:", err);
    }
  }
  renderStories();
}

function getVisibleStories() {
  let stories = [...allStories];

  if (!isAdmin) {
    stories = stories.filter((s) => s.chapterId === currentChapterId);
  }

  if (activeStatusFilter !== "all") {
    stories = stories.filter((s) => s.status === activeStatusFilter);
  }

  const keyword = document.getElementById("searchInput").value.toLowerCase();
  if (keyword) {
    stories = stories.filter(
      (s) =>
        s.title.toLowerCase().includes(keyword) ||
        s.tags.some((t) => t.toLowerCase().includes(keyword)),
    );
  }

  stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return stories;
}

function renderStories() {
  const grid = document.getElementById("storiesGrid");
  const stories = getVisibleStories();

  if (stories.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p>&#128221; No stories found.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = stories
    .map(
      (story, i) => `
    <div class="story-card" onclick="viewStory('${story.id}')">
      <div class="story-card-header">
        <span class="story-title">${story.title}</span>
        <span class="story-status status-${story.status}">${story.status.replace("_", " ")}</span>
      </div>
      <div class="story-preview">${story.content}</div>
      <div class="story-tags">
        ${story.tags.map((t) => `<span class="story-tag">${t}</span>`).join("")}
      </div>
      <div class="story-meta">
        <div>
          <span class="story-author">${story.authorName}</span>
          <span class="story-chapter"> &middot; ${getChapterNameById(story.chapterId)}</span>
        </div>
        <span class="story-date">${story.createdAt}</span>
      </div>
      ${
        story.authorId === currentUserId || isAdmin
          ? `
        <div class="story-actions">
          <button class="story-action-btn" onclick="event.stopPropagation(); editStory('${story.id}')">&#9998; Edit</button>
          <button class="story-action-btn danger" onclick="event.stopPropagation(); deleteStory('${story.id}')">&#128465; Delete</button>
        </div>
        `
          : ""
      }
    </div>
  `,
    )
    .join("");
}

window.viewStory = function (id) {
  const story = allStories.find((s) => s.id === id);
  if (!story) return;

  document.getElementById("viewStoryContent").innerHTML = `
    <div class="view-story-header">
      <h2>${story.title}</h2>
      <span class="story-status status-${story.status}" style="margin-bottom:12px; display:inline-block;">${story.status.replace("_", " ")}</span>
      <div class="view-story-meta">
        <span>&#128100; ${story.authorName}</span>
        <span>&#127968; ${getChapterNameById(story.chapterId)}</span>
        <span>&#128197; ${story.createdAt}</span>
      </div>
    </div>
    <div class="view-story-body">${story.content}</div>
    <div class="view-story-tags">
      ${story.tags.map((t) => `<span class="story-tag">${t}</span>`).join("")}
    </div>
  `;
  document.getElementById("viewStoryModal").style.display = "flex";
};

window.editStory = function (id) {
  const story = allStories.find((s) => s.id === id);
  if (!story) return;

  document.getElementById("storyModalTitle").textContent = "Edit Story";
  document.getElementById("storyTitle").value = story.title;
  document.getElementById("storyContent").value = story.content;
  document.getElementById("storyTags").value = story.tags.join(", ");
  document.getElementById("storyStatus").value = story.status;
  document.getElementById("saveStoryBtn").dataset.editId = id;
  document.getElementById("storyModal").style.display = "flex";
};

window.deleteStory = async function (id) {
  if (!confirm("Are you sure you want to delete this story?")) return;

  try {
    if (USE_PSEUDO_DATA) {
      const overrides = getLocalOverrides();
      overrides.push({ id, _deleted: true });
      saveLocalOverrides(overrides);
    } else {
      await ensureAuth();
      await deleteDoc(doc(db, "stories", id));
    }
    showToast("Story deleted!");
    await loadStories();
  } catch (err) {
    console.error("Error deleting story:", err);
    showToast("Failed to delete story.");
  }
};

document.getElementById("writeStoryBtn").addEventListener("click", () => {
  document.getElementById("storyModalTitle").textContent = "Write a New Story";
  document.getElementById("storyTitle").value = "";
  document.getElementById("storyContent").value = "";
  document.getElementById("storyTags").value = "";
  document.getElementById("storyStatus").value = isAdmin ? "published" : "pending_review";
  delete document.getElementById("saveStoryBtn").dataset.editId;
  document.getElementById("storyModal").style.display = "flex";
});

document.getElementById("closeStoryModal").addEventListener("click", () => {
  document.getElementById("storyModal").style.display = "none";
});

document.getElementById("cancelStoryBtn").addEventListener("click", () => {
  document.getElementById("storyModal").style.display = "none";
});

document.getElementById("closeViewModal").addEventListener("click", () => {
  document.getElementById("viewStoryModal").style.display = "none";
});

document.getElementById("storyModal").addEventListener("click", (e) => {
  if (e.target.id === "storyModal") {
    document.getElementById("storyModal").style.display = "none";
  }
});

document.getElementById("viewStoryModal").addEventListener("click", (e) => {
  if (e.target.id === "viewStoryModal") {
    document.getElementById("viewStoryModal").style.display = "none";
  }
});

document.getElementById("saveStoryBtn").addEventListener("click", async () => {
  const title = document.getElementById("storyTitle").value.trim();
  const content = document.getElementById("storyContent").value.trim();
  const tagsRaw = document.getElementById("storyTags").value.trim();
  const status = document.getElementById("storyStatus").value;

  if (!title || !content) {
    showToast("Please fill in title and content.");
    return;
  }

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const editId = document.getElementById("saveStoryBtn").dataset.editId;
  const storyData = {
    title,
    content,
    tags,
    status,
    chapterId: currentChapterId,
    authorId: currentUserId,
    authorName: currentUserName,
    createdAt: new Date().toISOString().split("T")[0],
  };

  try {
    if (editId) {
      if (USE_PSEUDO_DATA) {
        const overrides = getLocalOverrides();
        const idx = overrides.findIndex((o) => o.id === editId);
        if (idx !== -1) {
          overrides[idx] = { ...overrides[idx], ...storyData };
        } else {
          overrides.push({ ...storyData, id: editId });
        }
        saveLocalOverrides(overrides);
      } else {
        await ensureAuth();
        await updateDoc(doc(db, "stories", editId), storyData);
      }
      showToast("Story updated!");
    } else {
      if (USE_PSEUDO_DATA) {
        const id = "local_s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
        const overrides = getLocalOverrides();
        overrides.push({ ...storyData, id });
        saveLocalOverrides(overrides);
      } else {
        await ensureAuth();
        await addDoc(storiesRef, storyData);
      }
      showToast("Story created!");
    }

    document.getElementById("storyModal").style.display = "none";
    await loadStories();
  } catch (err) {
    console.error("Error saving story:", err);
    showToast("Failed to save story.");
  }
});

document.querySelectorAll(".toggle-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeStatusFilter = btn.dataset.status;
    renderStories();
  });
});

document.getElementById("searchInput").addEventListener("input", () => {
  renderStories();
});

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

loadStories();
