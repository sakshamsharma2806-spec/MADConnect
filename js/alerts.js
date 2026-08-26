// MIGRATED: This file previously used Firebase Firestore for data fetching.
// All data now comes from Next.js API routes: /api/volunteers, /api/attendance, /api/chapters
// The active implementation is in app/alerts/page.tsx (React component)
import { getAllChapters, requireAuth, getUserRole } from "./utils/authUtils.js";
import { pseudoStories } from "./pseudoData.js";

if (!requireAuth()) throw new Error("Not authenticated");

const role = getUserRole();
const READ_STORAGE_KEY = "alertReadState";

let allVolunteers = [];
let allSessions = [];
let chapters = [];
let alerts = [];
let currentFilter = "all";

async function loadAllData() {
  try {
    [allVolunteers, allSessions, chapters] = await Promise.all([
      getVolunteers(),
      getAttendanceSessions(),
      getAllChapters(),
    ]);
  } catch (err) {
    console.error("Error loading data:", err);
    return;
  }
  alerts = generateAlerts();
  loadReadState();
  renderSummary();
  renderAlerts();
  setupFilters();
  setupClearAll();
}

function getChapterStats(chapter) {
  const chapterVols = allVolunteers.filter((v) => v.chapterId === chapter.chapterId);
  const volunteerCount = chapterVols.length;

  const chapterSessions = allSessions.filter((s) => s.chapterId === chapter.chapterId);
  const totalSessions = chapterSessions.length;
  let totalPresent = 0;
  chapterSessions.forEach((s) => { totalPresent += (s.present || []).length; });

  const attendancePct = totalSessions === 0 || volunteerCount === 0
    ? 0
    : Math.round((totalPresent / (volunteerCount * totalSessions)) * 100);

  return { volunteerCount, totalSessions, attendancePct };
}

function generateAlerts() {
  const generated = [];
  const now = new Date().toISOString().slice(0, 10);

  chapters.forEach((ch) => {
    const stats = getChapterStats(ch);

    if (stats.volunteerCount > 0 && stats.attendancePct < 50 && stats.totalSessions > 0) {
      generated.push({
        id: `gen-${ch.chapterId}-low-att`,
        type: "warning",
        chapterId: ch.chapterId,
        message: `${ch.chapterName} attendance dropped to ${stats.attendancePct}% — below the 50% threshold.`,
        createdAt: now,
      });
    }

    if (stats.attendancePct >= 80 && stats.volunteerCount >= 3) {
      generated.push({
        id: `gen-${ch.chapterId}-high-perf`,
        type: "success",
        chapterId: ch.chapterId,
        message: `${ch.chapterName} achieved ${stats.attendancePct}% attendance — outstanding performance!`,
        createdAt: now,
      });
    }

    if (stats.volunteerCount === 0) {
      generated.push({
        id: `gen-${ch.chapterId}-no-vol`,
        type: "danger",
        chapterId: ch.chapterId,
        message: `${ch.chapterName} has no volunteers assigned. Immediate action required.`,
        createdAt: now,
      });
    }
  });

  const userStories = [];
  try {
    const stored = JSON.parse(localStorage.getItem("localStories"));
    if (Array.isArray(stored)) userStories.push(...stored);
  } catch { /* ignore */ }

  const allStories = [...pseudoStories, ...userStories];
  const recentStories = allStories.filter((s) => {
    const created = new Date(s.createdAt);
    const diff = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 14;
  });

  recentStories.forEach((story) => {
    if (story.status === "published" || story.status === "draft") {
      const ch = chapters.find((c) => c.chapterId === story.chapterId);
      const chName = ch ? ch.chapterName : "Unknown Chapter";
      generated.push({
        id: `gen-story-${story.id}`,
        type: "info",
        chapterId: story.chapterId,
        message: `${chName} submitted a new story: "${story.title}".`,
        createdAt: story.createdAt,
      });
    }
  });

  return generated;
}

function loadReadState() {
  const stored = JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || "{}");
  alerts.forEach((a) => {
    a.read = stored[a.id] === true;
  });
}

function saveReadState() {
  const state = {};
  alerts.forEach((a) => { state[a.id] = a.read; });
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(state));
}

function setupFilters() {
  const btns = document.querySelectorAll(".alt-filter-btn");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderAlerts();
    });
  });
}

function setupClearAll() {
  document.getElementById("clearAllBtn").addEventListener("click", () => {
    alerts = [];
    saveReadState();
    renderSummary();
    renderAlerts();
    showToast("All alerts cleared");
  });
}

function renderSummary() {
  const counts = { warning: 0, success: 0, info: 0, danger: 0 };
  alerts.forEach((a) => { counts[a.type] = (counts[a.type] || 0) + 1; });

  document.getElementById("alertSummary").innerHTML = `
    <div class="alt-summary-card alt-sum-warning">
      <h3>${counts.warning}</h3>
      <p>Warnings</p>
    </div>
    <div class="alt-summary-card alt-sum-success">
      <h3>${counts.success}</h3>
      <p>Success</p>
    </div>
    <div class="alt-summary-card alt-sum-info">
      <h3>${counts.info}</h3>
      <p>Info</p>
    </div>
    <div class="alt-summary-card alt-sum-danger">
      <h3>${counts.danger}</h3>
      <p>Danger</p>
    </div>
  `;
}

function renderAlerts() {
  const filtered = currentFilter === "all"
    ? alerts
    : alerts.filter((a) => a.type === currentFilter);

  const container = document.getElementById("alertList");

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="alt-empty">
        <div class="alt-empty-icon">&#128276;</div>
        <p>No alerts to display</p>
      </div>
    `;
    return;
  }

  const iconMap = {
    warning: "&#9888;",
    success: "&#9989;",
    info: "&#8505;&#65039;",
    danger: "&#10060;",
  };

  container.innerHTML = filtered.map((a) => `
    <div class="alt-alert-card ${a.read ? "read" : ""}" data-id="${a.id}">
      <div class="alt-alert-indicator alt-indicator-${a.type}"></div>
      <div class="alt-alert-icon alt-icon-${a.type}">${iconMap[a.type]}</div>
      <div class="alt-alert-body">
        <div class="alt-alert-message">${a.message}</div>
        <div class="alt-alert-meta">${formatDate(a.createdAt)}${a.read ? " &middot; Read" : " &middot; Unread"}</div>
      </div>
      <div class="alt-alert-actions">
        <button class="alt-btn-read" onclick="toggleRead('${a.id}')">${a.read ? "Mark Unread" : "Mark Read"}</button>
        <button class="alt-btn-dismiss" onclick="dismissAlert('${a.id}')">Dismiss</button>
      </div>
    </div>
  `).join("");
}

window.toggleRead = function (id) {
  const alert = alerts.find((a) => a.id === id);
  if (!alert) return;
  alert.read = !alert.read;
  saveReadState();
  renderSummary();
  renderAlerts();
  showToast(alert.read ? "Alert marked as read" : "Alert marked as unread");
};

window.dismissAlert = function (id) {
  alerts = alerts.filter((a) => a.id !== id);
  saveReadState();
  renderSummary();
  renderAlerts();
  showToast("Alert dismissed");
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

loadAllData();
