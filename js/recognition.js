// MIGRATED: This file previously used Firebase Firestore for data fetching.
// All data now comes from Next.js API routes: /api/volunteers, /api/attendance, /api/chapters
// The active implementation is in app/recognition/page.tsx (React component)
import { pseudoVolunteers, pseudoAttendance, pseudoChapters } from "./pseudoData.js";
import {
  getUserChapterId,
  getUserRole,
  requireAuth,
} from "./utils/authUtils.js";

if (!requireAuth()) throw new Error("Not authenticated");

const currentChapterId = getUserChapterId();
const currentUserRole = getUserRole();
const isAdmin = currentUserRole === "admin";

const STORAGE_KEY_SPOTLIGHT = "localSpotlight";

function getSpotlight() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_SPOTLIGHT)) || null;
  } catch {
    return null;
  }
}

function saveSpotlight(data) {
  localStorage.setItem(STORAGE_KEY_SPOTLIGHT, JSON.stringify(data));
}

function getVolunteersData() {
  if (USE_PSEUDO_DATA) return [...pseudoVolunteers];
  return [];
}

function getAttendanceData() {
  if (USE_PSEUDO_DATA) return [...pseudoAttendance];
  return [];
}

function getChapterNameById(chapterId) {
  const ch = pseudoChapters.find((c) => c.chapterId === chapterId);
  return ch ? ch.chapterName : "Unknown";
}

function getDateRange(period) {
  const now = new Date();
  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: now };
  }
  if (period === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), q * 3, 1);
    return { start, end: now };
  }
  return { start: new Date("2020-01-01"), end: now };
}

function filterAttendanceByPeriod(sessions, period) {
  const { start, end } = getDateRange(period);
  return sessions.filter((s) => {
    const d = new Date(s.date);
    return d >= start && d <= end;
  });
}

function calculateVolunteerStats(volunteers, sessions) {
  const stats = volunteers.map((v) => {
    const volSessions = sessions.filter((s) => s.chapterId === v.chapterId);
    const totalSessions = volSessions.length;
    const presentSessions = volSessions.filter((s) => (s.present || []).includes(v.name)).length;
    const percentage = totalSessions === 0 ? 0 : Math.round((presentSessions / totalSessions) * 100);

    let badge = "none";
    if (percentage >= 100 && totalSessions > 0) badge = "champion";
    else if (percentage >= 80 && totalSessions > 0) badge = "dedicated";
    else if (percentage >= 60 && totalSessions > 0) badge = "reliable";

    return {
      ...v,
      totalSessions,
      presentSessions,
      percentage,
      badge,
    };
  });

  return stats.sort((a, b) => b.percentage - a.percentage);
}

function calculateChapterStats(chapters, sessions) {
  const stats = chapters.map((ch) => {
    const volSessions = sessions.filter((s) => s.chapterId === ch.chapterId);
    const chapterVolunteers = getVolunteersData().filter((v) => v.chapterId === ch.chapterId);
    const totalVolunteers = chapterVolunteers.length;
    const totalSessions = volSessions.length;
    let totalPresent = 0;
    volSessions.forEach((s) => {
      totalPresent += (s.present || []).length;
    });

    const attendancePct =
      totalSessions === 0 || totalVolunteers === 0
        ? 0
        : Math.round((totalPresent / (totalVolunteers * totalSessions)) * 100);

    return {
      ...ch,
      totalVolunteers,
      totalSessions,
      attendancePct,
    };
  });

  return stats.sort((a, b) => b.attendancePct - a.attendancePct);
}

let activePeriod = "month";

function renderAll() {
  const volunteers = getVolunteersData();
  const allSessions = getAttendanceData();
  const sessions = filterAttendanceByPeriod(allSessions, activePeriod);
  const volStats = calculateVolunteerStats(volunteers, sessions);
  const chapterStats = calculateChapterStats(pseudoChapters.filter((c) => c.status === "active"), sessions);

  renderSpotlight(volunteers);
  renderLeaderboard(chapterStats);
  renderBadges(volStats);
  renderTopPerformers(volStats);
}

function renderSpotlight() {
  const container = document.getElementById("spotlightContainer");
  const spotlight = getSpotlight();

  if (!spotlight) {
    container.innerHTML = `
      <div class="spotlight-empty">
        <p>No volunteer featured yet.</p>
        ${isAdmin ? '<button class="feature-btn" onclick="openSpotlightModal()">&#11088; Feature a Volunteer</button>' : ""}
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="spotlight-card">
      <div class="spotlight-avatar">&#128100;</div>
      <div class="spotlight-name">${spotlight.name}</div>
      <div class="spotlight-chapter">${getChapterNameById(spotlight.chapterId)}</div>
      <div class="spotlight-achievement">${spotlight.achievement}</div>
      ${isAdmin ? '<button class="feature-btn" onclick="openSpotlightModal()">&#9998; Change Spotlight</button>' : ""}
    </div>
  `;
}

function renderLeaderboard(chapterStats) {
  const container = document.getElementById("leaderboardContainer");

  if (chapterStats.length === 0) {
    container.innerHTML = '<div class="empty-state">No chapter data available.</div>';
    return;
  }

  const medals = ["&#129351;", "&#129352;", "&#129353;"];

  container.innerHTML = `
    <div class="leaderboard-list">
      ${chapterStats
        .map(
          (ch, i) => `
        <div class="leaderboard-item ${i < 3 ? "top-" + (i + 1) : ""}">
          <div class="leaderboard-rank">${i < 3 ? medals[i] : "#" + (i + 1)}</div>
          <div class="leaderboard-info">
            <div class="leaderboard-name">${ch.chapterName}</div>
            <div class="leaderboard-city">${ch.city} &middot; ${ch.totalVolunteers} volunteers &middot; ${ch.totalSessions} sessions</div>
          </div>
          <div class="leaderboard-attendance">${ch.attendancePct}%</div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function renderBadges(volStats) {
  const container = document.getElementById("badgesContainer");

  const reliable = volStats.filter((v) => v.badge === "reliable").length;
  const dedicated = volStats.filter((v) => v.badge === "dedicated").length;
  const champion = volStats.filter((v) => v.badge === "champion").length;

  container.innerHTML = `
    <div class="badge-card">
      <div class="badge-icon reliable">&#128737;</div>
      <div class="badge-title">Reliable</div>
      <div class="badge-requirement">60%+ attendance</div>
      <div class="badge-holders">${reliable} volunteer${reliable !== 1 ? "s" : ""}</div>
    </div>
    <div class="badge-card">
      <div class="badge-icon dedicated">&#128142;</div>
      <div class="badge-title">Dedicated</div>
      <div class="badge-requirement">80%+ attendance</div>
      <div class="badge-holders">${dedicated} volunteer${dedicated !== 1 ? "s" : ""}</div>
    </div>
    <div class="badge-card">
      <div class="badge-icon champion">&#127942;</div>
      <div class="badge-title">Champion</div>
      <div class="badge-requirement">100% attendance</div>
      <div class="badge-holders">${champion} volunteer${champion !== 1 ? "s" : ""}</div>
    </div>
  `;
}

function renderTopPerformers(volStats) {
  const tbody = document.getElementById("performersTable");

  if (volStats.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No data available.</td></tr>';
    return;
  }

  tbody.innerHTML = volStats
    .map(
      (v, i) => {
        let barClass = "red";
        if (v.percentage >= 80) barClass = "green";
        else if (v.percentage >= 60) barClass = "yellow";

        let badgeClass = "none";
        let badgeText = "—";
        if (v.badge === "champion") { badgeClass = "champion"; badgeText = "Champion"; }
        else if (v.badge === "dedicated") { badgeClass = "dedicated"; badgeText = "Dedicated"; }
        else if (v.badge === "reliable") { badgeClass = "reliable"; badgeText = "Reliable"; }

        return `
        <tr>
          <td class="rank-cell">${i + 1}</td>
          <td><span class="vol-name">${v.name}</span></td>
          <td><span class="vol-chapter">${getChapterNameById(v.chapterId)}</span></td>
          <td>
            <div class="attendance-bar">
              <div class="attendance-bar-track">
                <div class="attendance-bar-fill ${barClass}" style="width:${v.percentage}%;"></div>
              </div>
              <span class="attendance-pct">${v.percentage}%</span>
            </div>
          </td>
          <td><span class="badge-pill ${badgeClass}">${badgeText}</span></td>
        </tr>
      `;
      },
    )
    .join("");
}

window.openSpotlightModal = function () {
  const volunteers = getVolunteersData();
  const select = document.getElementById("spotlightSelect");
  select.innerHTML = volunteers
    .map((v) => `<option value="${v.id}">${v.name} (${getChapterNameById(v.chapterId)})</option>`)
    .join("");

  const current = getSpotlight();
  if (current) {
    select.value = current.volunteerId || "";
    document.getElementById("spotlightAchievement").value = current.achievement || "";
  } else {
    document.getElementById("spotlightAchievement").value = "";
  }

  document.getElementById("spotlightModal").style.display = "flex";
};

document.getElementById("closeSpotlightModal").addEventListener("click", () => {
  document.getElementById("spotlightModal").style.display = "none";
});

document.getElementById("cancelSpotlightBtn").addEventListener("click", () => {
  document.getElementById("spotlightModal").style.display = "none";
});

document.getElementById("spotlightModal").addEventListener("click", (e) => {
  if (e.target.id === "spotlightModal") {
    document.getElementById("spotlightModal").style.display = "none";
  }
});

document.getElementById("saveSpotlightBtn").addEventListener("click", () => {
  const volId = document.getElementById("spotlightSelect").value;
  const achievement = document.getElementById("spotlightAchievement").value.trim();

  if (!volId) {
    showToast("Please select a volunteer.");
    return;
  }

  if (!achievement) {
    showToast("Please enter an achievement.");
    return;
  }

  const volunteers = getVolunteersData();
  const vol = volunteers.find((v) => v.id === volId);
  if (!vol) return;

  saveSpotlight({
    volunteerId: vol.id,
    name: vol.name,
    chapterId: vol.chapterId,
    achievement,
  });

  document.getElementById("spotlightModal").style.display = "none";
  showToast(`${vol.name} is now the spotlight volunteer!`);
  renderAll();
});

document.querySelectorAll(".period-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".period-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activePeriod = btn.dataset.period;
    renderAll();
  });
});

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

renderAll();
