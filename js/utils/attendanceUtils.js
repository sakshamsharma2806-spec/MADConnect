// MIGRATED: This file previously used Firebase Firestore for attendance data.
// All data now comes from Next.js API routes: /api/attendance
// The active implementation is in app/attendance/page.tsx (React component)

const cachedSessionsByChapter = {};

async function loadSessionsForChapter(chapterId) {
  try {
    cachedSessionsByChapter[chapterId] = await getAttendanceSessionsByChapter(chapterId);
  } catch (err) {
    console.error("Error loading attendance sessions:", err);
    cachedSessionsByChapter[chapterId] = [];
  }
  return cachedSessionsByChapter[chapterId];
}

async function calculateAttendance(volunteerName, chapterId) {
  if (!cachedSessionsByChapter[chapterId]) await loadSessionsForChapter(chapterId);
  const sessions = cachedSessionsByChapter[chapterId] || [];
  let total = sessions.length;
  let present = 0;

  sessions.forEach((session) => {
    const attendees = session.present || session.attendees || [];
    if (attendees.includes(volunteerName)) {
      present++;
    }
  });

  const percentage = total === 0 ? 0 : Math.round((present / total) * 100);
  const eligible = percentage >= 60;

  return { present, total, percentage, eligible };
}

function clearAttendanceCache(chapterId) {
  if (chapterId) {
    delete cachedSessionsByChapter[chapterId];
  } else {
    Object.keys(cachedSessionsByChapter).forEach((k) => delete cachedSessionsByChapter[k]);
  }
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const options = { day: "numeric", month: "long", year: "numeric" };
  return new Date(dateString).toLocaleDateString("en-IN", options);
}

export { calculateAttendance, formatDate, clearAttendanceCache, loadSessionsForChapter };
