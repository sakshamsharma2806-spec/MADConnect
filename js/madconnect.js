// MIGRATED: This file previously used Firebase Firestore for data fetching.
// All data now comes from Next.js API routes: /api/volunteers, /api/attendance, /api/chapters
// The active implementation is in app/madconnect/page.tsx (React component)
import { getAllChapters, getUserChapterId, requireAuth } from "./utils/authUtils.js";

if (!requireAuth()) throw new Error("Not authenticated");

const currentUserChapterId = getUserChapterId();

let allVolunteers = [];
let allSessions = [];
let chapters = [];

async function loadAllData() {
  try {
    [allVolunteers, allSessions, chapters] = await Promise.all([
      getVolunteers(),
      getAttendanceSessions(),
      getAllChapters(),
    ]);
  } catch (err) {
    console.error("Error loading data:", err);
  }
  renderChapters(chapters);
  updateNetworkStats(chapters);
}

function getChapterStats(chapter) {
  const shelterVolunteers = allVolunteers.filter((v) => v.chapterId === chapter.chapterId);
  const volunteerCount = shelterVolunteers.length;

  const chapterSessions = allSessions.filter((s) => s.chapterId === chapter.chapterId);
  const totalSessions = chapterSessions.length;
  let totalPresent = 0;
  chapterSessions.forEach((session) => {
    const attendees = session.present || [];
    totalPresent += attendees.length;
  });

  const attendancePct = totalSessions === 0 || volunteerCount === 0
    ? 0
    : Math.round((totalPresent / (volunteerCount * totalSessions)) * 100);
  const activeCount = shelterVolunteers.filter((v) => v.status === "Active").length;
  const inactiveCount = volunteerCount - activeCount;

  return { volunteerCount, totalSessions, attendancePct, activeCount, inactiveCount };
}

function getHealthStatus(stats) {
  if (stats.volunteerCount === 0) return { label: "Critical", class: "mc-health-critical", icon: "&#9888;" };
  if (stats.attendancePct >= 70 && stats.volunteerCount >= 3) return { label: "Healthy", class: "mc-health-healthy", icon: "&#9989;" };
  if (stats.attendancePct >= 40 || stats.volunteerCount >= 2) return { label: "Needs Attention", class: "mc-health-warning", icon: "&#9888;" };
  return { label: "Critical", class: "mc-health-critical", icon: "&#9888;" };
}

function renderChapters(data) {
  const grid = document.getElementById("chapterGrid");
  grid.innerHTML = "";

  data.forEach((chapter, index) => {
    const stats = getChapterStats(chapter);
    const health = getHealthStatus(stats);
    const isMyChapter = chapter.chapterId === currentUserChapterId;

    grid.innerHTML += `
      <div class="mc-card ${isMyChapter ? "mc-card-mine" : ""}" onclick="showChapterDetail(${index})">
        ${isMyChapter ? '<div class="mc-my-badge">Your Chapter</div>' : ''}
        <div class="mc-card-top">
          <div class="mc-card-badge ${health.class}">${health.icon} ${health.label}</div>
          <div class="mc-card-city">${chapter.city}</div>
        </div>
        <h2 class="mc-card-title">${chapter.chapterName}</h2>
        <div class="mc-card-cho">
          <span class="mc-cho-icon">&#128100;</span>
          <div>
            <p class="mc-cho-name">${chapter.choName || "Vacant"}</p>
            <p class="mc-cho-role">Chapter Organizer</p>
          </div>
        </div>
        <div class="mc-card-stats">
          <div class="mc-card-stat">
            <span class="mc-card-stat-val">${stats.volunteerCount}</span>
            <span class="mc-card-stat-label">Volunteers</span>
          </div>
          <div class="mc-card-stat">
            <span class="mc-card-stat-val">${stats.attendancePct}%</span>
            <span class="mc-card-stat-label">Attendance</span>
          </div>
          <div class="mc-card-stat">
            <span class="mc-card-stat-val">${stats.activeCount}</span>
            <span class="mc-card-stat-label">Active</span>
          </div>
          <div class="mc-card-stat">
            <span class="mc-card-stat-val">${stats.totalSessions}</span>
            <span class="mc-card-stat-label">Sessions</span>
          </div>
        </div>
        <div class="mc-card-actions">
          ${chapter.choEmail ? `<a href="mailto:${chapter.choEmail}" class="mc-btn-contact" onclick="event.stopPropagation()">&#9993; Contact CHO</a>` : ''}
          <button class="mc-btn-view" onclick="event.stopPropagation(); showChapterDetail(${index})">&#8594; View</button>
        </div>
      </div>
    `;
  });
}

function updateNetworkStats(data) {
  let healthy = 0, warning = 0, critical = 0;
  data.forEach((ch) => {
    const stats = getChapterStats(ch);
    const health = getHealthStatus(stats);
    if (health.label === "Healthy") healthy++;
    else if (health.label === "Needs Attention") warning++;
    else critical++;
  });

  document.getElementById("totalChapters").textContent = data.length;
  document.getElementById("healthyChapters").textContent = healthy;
  document.getElementById("warningChapters").textContent = warning;
  document.getElementById("criticalChapters").textContent = critical;
}

window.showChapterDetail = function (index) {
  const chapter = chapters[index];
  const stats = getChapterStats(chapter);
  const health = getHealthStatus(stats);
  const isMyChapter = chapter.chapterId === currentUserChapterId;

  const chapterVolunteers = allVolunteers.filter((v) => v.chapterId === chapter.chapterId);

  let volunteerRows = "";
  if (chapterVolunteers.length === 0) {
    volunteerRows = '<p class="mc-empty">No volunteers in this chapter yet.</p>';
  } else {
    volunteerRows = `<div class="mc-detail-vol-list">`;
    chapterVolunteers.forEach((v) => {
      volunteerRows += `
        <div class="mc-detail-vol-item">
          <span class="mc-vol-name">${v.name}</span>
          <span class="mc-vol-phone">${v.phone}</span>
          <span class="status ${v.status === "Active" ? "active-status" : "inactive-status"}">${v.status}</span>
        </div>
      `;
    });
    volunteerRows += `</div>`;
  }

  document.getElementById("chapterDetail").innerHTML = `
    <div class="mc-detail-header">
      <div>
        <h2>${chapter.chapterName} ${isMyChapter ? '<span style="font-size:0.6em; color:#e61e4d;">(Your Chapter)</span>' : ''}</h2>
        <p>${chapter.city} | CHO: ${chapter.choName || "Vacant"}</p>
      </div>
      <div class="mc-card-badge ${health.class}">${health.icon} ${health.label}</div>
    </div>
    <div class="mc-detail-stats">
      <div class="mc-detail-stat">
        <span>${stats.volunteerCount}</span>
        <p>Total Volunteers</p>
      </div>
      <div class="mc-detail-stat">
        <span>${stats.activeCount}</span>
        <p>Active</p>
      </div>
      <div class="mc-detail-stat">
        <span>${stats.inactiveCount}</span>
        <p>Inactive</p>
      </div>
      <div class="mc-detail-stat">
        <span>${stats.attendancePct}%</span>
        <p>Avg Attendance</p>
      </div>
      <div class="mc-detail-stat">
        <span>${stats.totalSessions}</span>
        <p>Sessions Held</p>
      </div>
    </div>
    <div class="mc-detail-section">
      <h3>Volunteers</h3>
      ${volunteerRows}
    </div>
    ${chapter.choEmail ? `
    <div class="mc-detail-contact">
      <a href="mailto:${chapter.choEmail}" class="mc-btn-contact-lg">&#9993; Email ${chapter.choName}</a>
    </div>
    ` : ''}
  `;

  document.getElementById("chapterModal").style.display = "flex";
};

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("chapterModal").style.display = "none";
});

document.getElementById("chapterModal").addEventListener("click", (e) => {
  if (e.target.id === "chapterModal") {
    document.getElementById("chapterModal").style.display = "none";
  }
});

document.getElementById("mcSearch").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = chapters.filter(
    (ch) =>
      ch.chapterName.toLowerCase().includes(keyword) ||
      ch.city.toLowerCase().includes(keyword) ||
      (ch.choName && ch.choName.toLowerCase().includes(keyword)),
  );
  renderChapters(filtered);
  updateNetworkStats(filtered);
});

loadAllData();
