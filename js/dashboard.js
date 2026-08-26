// MIGRATED: This file previously used Firebase Firestore for data fetching.
// All data now comes from Next.js API routes: /api/volunteers, /api/attendance
// The active implementation is in app/dashboard/page.tsx (React component)
import { getUserChapterId, getUserChapterName, getUserName, requireAuth } from "./utils/authUtils.js";

if (!requireAuth()) throw new Error("Not authenticated");

const greeting = document.getElementById("greeting");
const todayDate = document.getElementById("todayDate");
const totalVolunteers = document.getElementById("totalVolunteers");
const totalClasses = document.getElementById("totalClasses");
const attendanceRate = document.getElementById("attendanceRate");
const attendanceStatus = document.getElementById("attendanceStatus");
const attendanceMessage = document.getElementById("attendanceMessage");
const activityList = document.getElementById("activityList");

const chapterId = getUserChapterId();
const chapterName = getUserChapterName();
const userName = getUserName();

// Dynamic chapter info
document.getElementById("dynamicUserName").textContent = userName;
document.getElementById("dynamicChapterName").textContent = chapterName;
document.getElementById("dynamicChapterLabel").textContent = chapterName + " Chapter";

const hour = new Date().getHours();
let greet = "";

if (hour < 12) {
  greet = "Good Morning";
} else if (hour < 17) {
  greet = "Good Afternoon";
} else {
  greet = "Good Evening";
}

if (userName) greet += ", " + userName.split(" ")[0];
greeting.textContent = greet;

todayDate.textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

let volunteers = [];
let attendanceSessions = [];

async function loadDashboardData() {
  try {
    volunteers = await getVolunteersByChapter(chapterId);
    attendanceSessions = await getAttendanceSessionsByChapter(chapterId);
    updateDashboard();
    renderActivities();
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

function updateDashboard() {
  totalVolunteers.textContent = volunteers.length;
  totalClasses.textContent = attendanceSessions.length;

  let totalPossibleAttendance = 0;
  let totalPresentAttendance = 0;

  attendanceSessions.forEach((session) => {
    const shelterVolunteers = volunteers.filter(
      (v) => v.shelter === session.shelter,
    );
    totalPossibleAttendance += shelterVolunteers.length;
    totalPresentAttendance += session.present.length;
  });

  const percentage =
    totalPossibleAttendance > 0
      ? Math.round((totalPresentAttendance / totalPossibleAttendance) * 100)
      : 0;

  attendanceRate.textContent = percentage + "%";

  const today = new Date().toISOString().split("T")[0];
  const todaySession = attendanceSessions.find((s) => s.date === today);

  if (todaySession) {
    attendanceStatus.textContent = "Completed";
    attendanceStatus.classList.remove("pending");
    attendanceMessage.textContent =
      todaySession.shelter +
      " \u2022 " +
      todaySession.present.length +
      " volunteers present";
  } else {
    attendanceStatus.textContent = "Pending";
    attendanceStatus.classList.add("pending");
    attendanceMessage.textContent =
      "Today's attendance has not been submitted yet.";
  }
}

function renderActivities() {
  const activities = JSON.parse(localStorage.getItem("activities")) || [];
  const chapterActivities = activities.filter((a) => a.chapterId === chapterId);

  activityList.innerHTML = "";

  if (chapterActivities.length === 0) {
    activityList.innerHTML = "<li>No recent activity.</li>";
    return;
  }

  chapterActivities.slice(0, 5).forEach((activity) => {
    activityList.innerHTML += "<li>" + activity.text + "</li>";
  });
}

loadDashboardData();
