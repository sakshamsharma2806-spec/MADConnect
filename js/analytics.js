// MIGRATED: This file previously used Firebase Firestore for data fetching.
// All data now comes from Next.js API routes: /api/volunteers, /api/attendance
// The active implementation is in app/analytics/page.tsx (React component)
import { getUserChapterId, getUserChapterName, getUserName, requireAuth } from "./utils/authUtils.js";

if (!requireAuth()) throw new Error("Not authenticated");

const chapterId = getUserChapterId();
const chapterName = getUserChapterName();
const userName = getUserName();

const analyticsVolunteers = document.getElementById("analyticsVolunteers");
const analyticsSessions = document.getElementById("analyticsSessions");
const analyticsAttendance = document.getElementById("analyticsAttendance");

// Dynamic chapter info
document.getElementById("dynamicUserName").textContent = userName;
document.getElementById("dynamicChapterName").textContent = chapterName;
document.getElementById("dynamicChapterLabel").textContent = chapterName + " Chapter";

let volunteers = [];
let attendanceSessions = [];

async function loadAnalyticsData() {
  try {
    volunteers = await getVolunteersByChapter(chapterId);
    attendanceSessions = await getAttendanceSessionsByChapter(chapterId);
    renderCards();
    renderVolunteerStatusChart();
    renderAttendanceHistoryChart();
  } catch (error) {
    console.error("Error loading analytics data:", error);
  }
}

function getTotalVolunteers() {
  return volunteers.length;
}

function getTotalSessions() {
  return attendanceSessions.length;
}

function getOverallAttendance() {
  let possible = 0;
  let present = 0;

  attendanceSessions.forEach((session) => {
    const shelterVolunteers = volunteers.filter(
      (v) => v.shelter === session.shelter,
    );
    possible += shelterVolunteers.length;
    present += session.present.length;
  });

  if (possible === 0) return 0;
  return Math.round((present / possible) * 100);
}

function renderCards() {
  analyticsVolunteers.textContent = getTotalVolunteers();
  analyticsSessions.textContent = getTotalSessions();
  analyticsAttendance.textContent = getOverallAttendance() + "%";
}

function getVolunteerStatusBreakdown() {
  const active = volunteers.filter((v) => v.status === "Active").length;
  const inactive = volunteers.filter((v) => v.status === "Inactive").length;
  return { active, inactive };
}

function getAttendanceHistory() {
  const labels = [];
  const percentages = [];

  attendanceSessions
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((session) => {
      const volunteersInShelter = volunteers.filter(
        (v) => v.shelter === session.shelter,
      ).length;

      const percentage =
        volunteersInShelter === 0
          ? 0
          : Math.round((session.present.length / volunteersInShelter) * 100);

      labels.push(
        new Date(session.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
      );
      percentages.push(percentage);
    });

  return { labels, percentages };
}

function renderVolunteerStatusChart() {
  const data = getVolunteerStatusBreakdown();
  const ctx = document.getElementById("volunteerChart");
  if (!ctx) return;

  new Chart(ctx.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Active", "Inactive"],
      datasets: [
        {
          data: [data.active, data.inactive],
          backgroundColor: ["#10B981", "#EF4444"],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

function renderAttendanceHistoryChart() {
  const history = getAttendanceHistory();
  const ctx = document.getElementById("attendanceChart");
  if (!ctx) return;

  new Chart(ctx.getContext("2d"), {
    type: "line",
    data: {
      labels: history.labels,
      datasets: [
        {
          label: "Attendance %",
          data: history.percentages,
          borderColor: "#e61e4d",
          backgroundColor: "rgba(230, 30, 77, 0.15)",
          fill: true,
          tension: 0.35,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value) => value + "%",
          },
        },
      },
    },
  });
}

loadAnalyticsData();
