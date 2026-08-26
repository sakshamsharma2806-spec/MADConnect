// MIGRATED: This file previously used Firebase Firestore for data fetching.
// All data now comes from Next.js API routes: /api/volunteers, /api/attendance, /api/chapters
// The active implementation is in app/admin/page.tsx (React component)
import { getAllChapters, requireAuth, getUserRole, getUserName } from "./utils/authUtils.js";
import { pseudoAlerts } from "./pseudoData.js";

if (!requireAuth()) throw new Error("Not authenticated");

const role = getUserRole();

if (role !== "admin") {
  document.querySelector(".content").innerHTML = `
    <div style="text-align:center; padding:80px 20px;">
      <h2 style="color:#ef4444; font-size:24px; margin-bottom:12px;">&#128683; Access Denied</h2>
      <p style="color:#6b7280; font-size:14px;">You need admin privileges to view this page.</p>
    </div>
  `;
  throw new Error("Admin access required");
}

let allVolunteers = [];
let allSessions = [];
let chapters = [];
let healthChart = null;

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
  renderGlobalStats();
  renderHealthOverview();
  renderPerfTable();
  renderActivityFeed();
  renderAuditLog();
}

function getChapterStats(chapter) {
  const chapterVols = allVolunteers.filter((v) => v.chapterId === chapter.chapterId);
  const volunteerCount = chapterVols.length;
  const activeCount = chapterVols.filter((v) => v.status === "Active").length;

  const chapterSessions = allSessions.filter((s) => s.chapterId === chapter.chapterId);
  const totalSessions = chapterSessions.length;
  let totalPresent = 0;
  chapterSessions.forEach((s) => { totalPresent += (s.present || []).length; });

  const attendancePct = totalSessions === 0 || volunteerCount === 0
    ? 0
    : Math.round((totalPresent / (volunteerCount * totalSessions)) * 100);

  return { volunteerCount, activeCount, totalSessions, attendancePct };
}

function getHealthStatus(stats) {
  if (stats.volunteerCount === 0) return { label: "Critical", class: "critical" };
  if (stats.attendancePct >= 70 && stats.volunteerCount >= 3) return { label: "Healthy", class: "healthy" };
  if (stats.attendancePct >= 40 || stats.volunteerCount >= 2) return { label: "Needs Attention", class: "warning" };
  return { label: "Critical", class: "critical" };
}

function renderGlobalStats() {
  const totalChapters = chapters.length;
  const activeChapters = chapters.filter((c) => c.status === "active").length;
  const totalVolunteers = allVolunteers.length;

  let totalPossible = 0;
  let totalPresent = 0;
  allSessions.forEach((s) => {
    const chVols = allVolunteers.filter((v) => v.chapterId === s.chapterId);
    totalPossible += chVols.length;
    totalPresent += (s.present || []).length;
  });
  const overallAttendance = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;

  let healthy = 0, warning = 0, critical = 0;
  chapters.forEach((ch) => {
    const stats = getChapterStats(ch);
    const health = getHealthStatus(stats);
    if (health.class === "healthy") healthy++;
    else if (health.class === "warning") warning++;
    else critical++;
  });

  document.getElementById("globalStats").innerHTML = `
    <div class="adm-stat-card">
      <h3>Total Chapters</h3>
      <div class="adm-stat-val">${totalChapters}</div>
      <p>${activeChapters} active</p>
    </div>
    <div class="adm-stat-card">
      <h3>Total Volunteers</h3>
      <div class="adm-stat-val">${totalVolunteers}</div>
      <p>across all chapters</p>
    </div>
    <div class="adm-stat-card adm-stat-green">
      <h3>Overall Attendance</h3>
      <div class="adm-stat-val">${overallAttendance}%</div>
      <p>network average</p>
    </div>
    <div class="adm-stat-card adm-stat-yellow">
      <h3>Active Chapters</h3>
      <div class="adm-stat-val">${activeChapters}</div>
      <p>of ${totalChapters} total</p>
    </div>
  `;
}

function renderHealthOverview() {
  let healthy = 0, warning = 0, critical = 0;
  chapters.forEach((ch) => {
    const stats = getChapterStats(ch);
    const health = getHealthStatus(stats);
    if (health.class === "healthy") healthy++;
    else if (health.class === "warning") warning++;
    else critical++;
  });

  document.getElementById("healthOverview").innerHTML = `
    <div class="adm-health-item adm-h-healthy">
      <h4>${healthy}</h4>
      <p>Healthy</p>
    </div>
    <div class="adm-health-item adm-h-warning">
      <h4>${warning}</h4>
      <p>Needs Attention</p>
    </div>
    <div class="adm-health-item adm-h-critical">
      <h4>${critical}</h4>
      <p>Critical</p>
    </div>
  `;

  const ctx = document.getElementById("healthChart").getContext("2d");

  if (healthChart) healthChart.destroy();

  healthChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Healthy", "Needs Attention", "Critical"],
      datasets: [{
        data: [healthy, warning, critical],
        backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { font: { family: "Poppins", size: 12, weight: "600" }, padding: 16 },
        },
      },
    },
  });
}

function renderPerfTable() {
  const rows = chapters.map((ch) => {
    const stats = getChapterStats(ch);
    const health = getHealthStatus(stats);
    return { chapter: ch, stats, health };
  });

  rows.sort((a, b) => b.stats.attendancePct - a.stats.attendancePct || b.stats.volunteerCount - a.stats.volunteerCount);

  const tbody = document.getElementById("perfBody");
  tbody.innerHTML = rows.map((r) => {
    const badgeClass = `adm-badge-${r.health.class}`;
    return `
      <tr>
        <td style="font-weight:600;">${r.chapter.chapterName}</td>
        <td>${r.chapter.city}</td>
        <td>${r.stats.volunteerCount}</td>
        <td>${r.stats.activeCount}</td>
        <td>${r.stats.totalSessions}</td>
        <td><strong>${r.stats.attendancePct}%</strong></td>
        <td><span class="adm-chapter-badge ${badgeClass}">${r.health.label}</span></td>
      </tr>
    `;
  }).join("");
}

function renderActivityFeed() {
  const activities = [];

  allSessions.forEach((s) => {
    const ch = chapters.find((c) => c.chapterId === s.chapterId);
    const chName = ch ? ch.chapterName : "Unknown";
    activities.push({
      text: `Session held at ${chName} — ${(s.present || []).length} volunteers present`,
      date: s.date,
    });
  });

  allVolunteers.forEach((v) => {
    const ch = chapters.find((c) => c.chapterId === v.chapterId);
    const chName = ch ? ch.chapterName : "Unknown";
    if (v.status === "Active") {
      activities.push({
        text: `${v.name} is active in ${chName}`,
        date: null,
      });
    }
  });

  activities.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  const feed = document.getElementById("activityFeed");
  const topActivities = activities.slice(0, 8);

  if (topActivities.length === 0) {
    feed.innerHTML = '<li style="color:var(--text-muted);">No recent activity</li>';
    return;
  }

  feed.innerHTML = topActivities.map((a) => `
    <li>
      <span class="adm-activity-dot"></span>
      <div>
        <div class="adm-activity-text">${a.text}</div>
        ${a.date ? `<div class="adm-activity-time">${formatDate(a.date)}</div>` : ''}
      </div>
    </li>
  `).join("");
}

function renderAuditLog() {
  const logEntries = [
    { text: "System initialized — admin dashboard loaded", time: "just now" },
    { text: "Data synced from pseudo data layer", time: "just now" },
    { text: "Session Ops link available", time: "recent" },
    { text: "Better Together portal linked", time: "recent" },
  ];

  try {
    const storedAlerts = JSON.parse(localStorage.getItem("alertReadState") || "{}");
    const count = Object.keys(storedAlerts).length;
    if (count > 0) {
      logEntries.push({ text: `${count} alert(s) viewed by current session`, time: "recent" });
    }
  } catch { /* ignore */ }

  const log = document.getElementById("auditLog");
  log.innerHTML = logEntries.map((e) => `
    <li>
      <span class="adm-activity-dot" style="background:#3b82f6;"></span>
      <div>
        <div class="adm-activity-text">${e.text}</div>
        <div class="adm-activity-time">${e.time}</div>
      </div>
    </li>
  `).join("");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

loadAllData();
