// MIGRATED: This file previously used Firebase Firestore for data fetching.
// All data now comes from Next.js API routes: /api/volunteers, /api/attendance
// The active implementation is in app/attendance/page.tsx (React component)
import { formatDate, clearAttendanceCache } from "./utils/attendanceUtils.js";
import { getUserChapterId, getUserChapterName, requireAuth } from "./utils/authUtils.js";

if (!requireAuth()) throw new Error("Not authenticated");

const chapterId = getUserChapterId();
const chapterName = getUserChapterName();

const attendanceList = document.getElementById("attendanceList");
const presentCount = document.getElementById("presentCount");
const absentCount = document.getElementById("absentCount");
const attendanceDate = document.getElementById("attendanceDate");
const saveAttendanceBtn = document.getElementById("saveAttendanceBtn");
const historyContainer = document.getElementById("historyContainer");
const detailsModal = document.getElementById("detailsModal");
const detailsContent = document.getElementById("detailsContent");
const closeDetailsBtn = document.getElementById("closeDetailsBtn");

// Show chapter name
const chapterDisplay = document.getElementById("chapterDisplay");
if (chapterDisplay) chapterDisplay.textContent = chapterName;

let volunteers = [];
let attendanceSessions = [];

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

async function loadData() {
  try {
    volunteers = await getVolunteersByChapter(chapterId);
    attendanceSessions = await getAttendanceSessionsByChapter(chapterId);
    renderAttendance();
    renderAttendanceHistory();
  } catch (error) {
    console.error("Error loading data:", error);
    showToast("Failed to load data. Please try again.");
  }
}

loadData();

function renderAttendance() {
  attendanceList.innerHTML = "";

  if (volunteers.length === 0) {
    attendanceList.innerHTML =
      '<div class="empty-state"><p>No volunteers found for this chapter.</p></div>';
    updateSummary();
    return;
  }

  volunteers.forEach((volunteer) => {
    const row = document.createElement("div");
    row.className = "attendance-item";
    row.innerHTML = `
      <span class="volunteer-name">${volunteer.name}</span>
      <input type="checkbox" class="attendanceCheck" data-name="${volunteer.name}">
    `;
    const checkbox = row.querySelector(".attendanceCheck");
    checkbox.addEventListener("change", updateSummary);
    attendanceList.appendChild(row);
  });

  updateSummary();
}

function updateSummary() {
  const checks = document.querySelectorAll(".attendanceCheck");
  let present = 0;
  checks.forEach((box) => {
    if (box.checked) present++;
  });
  presentCount.innerText = present;
  absentCount.innerText = checks.length - present;
}

saveAttendanceBtn.addEventListener("click", async () => {
  const date = attendanceDate.value;

  if (!date) {
    showToast("Please select a date.");
    return;
  }

  const alreadyExists = attendanceSessions.find(
    (session) => session.date === date,
  );

  if (alreadyExists) {
    showToast("Attendance for this chapter has already been recorded on this date.");
    return;
  }

  const present = [];
  document.querySelectorAll(".attendanceCheck").forEach((box) => {
    if (box.checked) {
      present.push(box.dataset.name);
    }
  });

  const sessionData = {
    date,
    shelter: chapterName,
    chapterId: chapterId,
    present,
  };

  try {
    await addAttendanceSession(sessionData);

    let activities = JSON.parse(localStorage.getItem("activities")) || [];
    activities.unshift({
      text: "Attendance submitted for " + chapterName + " (" + present.length + " present)",
      time: "Just now",
      chapterId: chapterId,
    });
    localStorage.setItem("activities", JSON.stringify(activities));

    clearAttendanceCache(chapterId);
    await loadData();
    showToast("Attendance saved successfully!");
  } catch (error) {
    console.error("Error saving attendance:", error);
    showToast("Failed to save attendance. Please try again.");
  }
});

function renderAttendanceHistory() {
  historyContainer.innerHTML = "";

  if (attendanceSessions.length === 0) {
    historyContainer.innerHTML =
      '<div class="empty-state"><p>No attendance sessions yet.</p></div>';
    return;
  }

  attendanceSessions
    .slice()
    .reverse()
    .forEach((session) => {
      const card = document.createElement("div");
      card.className = "history-card";
      card.innerHTML = `
        <div class="history-left">
          <h3>${formatDate(session.date)}</h3>
          <p>${session.shelter}</p>
          <p>Present: ${session.present.length}</p>
        </div>
        <button class="view-btn" onclick="viewAttendance('${session.id}')">
          View Details
        </button>
      `;
      historyContainer.appendChild(card);
    });
}

function viewAttendance(sessionId) {
  const session = attendanceSessions.find(
    (s) => String(s.id) === String(sessionId),
  );
  if (!session) return;

  const shelterVolunteers = volunteers.filter(
    (v) => v.shelter === session.shelter,
  );

  let html = `
    <p><strong>Date:</strong> ${formatDate(session.date)}</p>
    <p><strong>Chapter:</strong> ${session.shelter}</p>
    <br>
    <h3>Present Volunteers</h3>
  `;

  shelterVolunteers.forEach((volunteer) => {
    if (session.present.includes(volunteer.name)) {
      html += `<div class="details-row">${volunteer.name}</div>`;
    }
  });

  html += `<br><h3>Absent Volunteers</h3>`;

  shelterVolunteers.forEach((volunteer) => {
    if (!session.present.includes(volunteer.name)) {
      html += `<div class="details-row">${volunteer.name}</div>`;
    }
  });

  detailsContent.innerHTML = html;
  detailsModal.style.display = "flex";
}

window.viewAttendance = viewAttendance;

closeDetailsBtn.addEventListener("click", () => {
  detailsModal.style.display = "none";
});
