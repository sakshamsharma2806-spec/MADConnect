// MIGRATED: This file previously used Firebase Firestore for data fetching.
// All data now comes from Next.js API routes: /api/volunteers
// The active implementation is in app/volunteers/page.tsx (React component)
import { calculateAttendance, clearAttendanceCache } from "./utils/attendanceUtils.js";
import { getUserChapterId, getUserChapterName, requireAuth } from "./utils/authUtils.js";

if (!requireAuth()) throw new Error("Not authenticated");

const chapterId = getUserChapterId();
const chapterName = getUserChapterName();

// Set the hidden chapter display
const chapterDisplay = document.getElementById("chapterDisplay");
if (chapterDisplay) chapterDisplay.textContent = chapterName;

let volunteers = [];
let editingIndex = -1;

const volunteerTable = document.getElementById("volunteerTable");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("volunteerModal");
const addBtn = document.getElementById("addVolunteerBtn");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveVolunteerBtn");

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

async function loadVolunteers() {
  try {
    volunteers = await getVolunteersByChapter(chapterId);
    await renderVolunteers();
  } catch (error) {
    console.error("Error loading volunteers:", error);
    showToast("Failed to load volunteers. Please try again.");
  }
}

loadVolunteers();

async function renderVolunteers(data = volunteers) {
  volunteerTable.innerHTML = "";

  if (data.length === 0) {
    volunteerTable.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:30px; color:#888;">
          No Volunteers Found
        </td>
      </tr>
    `;
    return;
  }

  for (const volunteer of data) {
    const attendance = await calculateAttendance(volunteer.name, chapterId);
    const certClass = attendance.eligible ? "cert-eligible" : "cert-not-eligible";
    const certText = attendance.total === 0 ? "N/A" : (attendance.eligible ? "Eligible" : "Not Eligible");

    volunteerTable.innerHTML += `
      <tr>
        <td>${volunteer.name}</td>
        <td>${volunteer.phone}</td>
        <td>${volunteer.shelter}</td>
        <td>
          <span class="status ${volunteer.status === "Active" ? "active-status" : "inactive-status"}">
            ${volunteer.status}
          </span>
        </td>
        <td>${attendance.present} / ${attendance.total} (${attendance.percentage}%)</td>
        <td><span class="cert-tag ${certClass}">${certText}</span></td>
        <td>
          <button class="action-btn" onclick="editVolunteer(${volunteers.indexOf(volunteer)})">&#9998;</button>
          <button class="action-btn" onclick="deleteVolunteer(${volunteers.indexOf(volunteer)})">&#128465;</button>
        </td>
      </tr>
    `;
  }
}

searchInput.addEventListener("keyup", async () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = volunteers.filter(
    (v) =>
      v.name.toLowerCase().includes(keyword) ||
      v.phone.includes(keyword) ||
      v.shelter.toLowerCase().includes(keyword),
  );
  await renderVolunteers(filtered);
});

addBtn.addEventListener("click", () => {
  editingIndex = -1;
  document.getElementById("volunteerName").value = "";
  document.getElementById("volunteerPhone").value = "";
  document.getElementById("volunteerStatus").selectedIndex = 0;
  document.getElementById("saveVolunteerBtn").innerText = "Save Volunteer";
  modal.style.display = "flex";
});

cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.onclick = function (e) {
  if (e.target === modal) {
    modal.style.display = "none";
  }
};

saveBtn.addEventListener("click", async () => {
  const name = document.getElementById("volunteerName").value.trim();
  const phone = document.getElementById("volunteerPhone").value.trim();
  const status = document.getElementById("volunteerStatus").value;

  if (name === "" || phone === "") {
    showToast("Please fill all fields.");
    return;
  }

  if (phone.length !== 10 || isNaN(phone)) {
    showToast("Phone number must contain exactly 10 digits.");
    return;
  }

  const duplicate = volunteers.find(
    (v, index) => v.phone === phone && index !== editingIndex,
  );

  if (duplicate) {
    showToast("Volunteer already exists with this phone number.");
    return;
  }

  const volunteerData = {
    name,
    phone,
    shelter: chapterName,
    chapterId: chapterId,
    status,
  };

  try {
    if (editingIndex === -1) {
      await addVolunteer(volunteerData);
      let activities = JSON.parse(localStorage.getItem("activities")) || [];
      activities.unshift({
        text: "Volunteer added: " + name,
        time: "Just now",
        chapterId: chapterId,
      });
      localStorage.setItem("activities", JSON.stringify(activities));
      showToast("Volunteer added successfully!");
    } else {
      const volunteer = volunteers[editingIndex];
      await updateVolunteer(volunteer.id, volunteerData);
      let activities = JSON.parse(localStorage.getItem("activities")) || [];
      activities.unshift({
        text: "Volunteer updated: " + name,
        time: "Just now",
        chapterId: chapterId,
      });
      localStorage.setItem("activities", JSON.stringify(activities));
      showToast("Volunteer updated successfully!");
      editingIndex = -1;
    }

    clearAttendanceCache(chapterId);
    await loadVolunteers();
    document.getElementById("volunteerName").value = "";
    document.getElementById("volunteerPhone").value = "";
    document.getElementById("volunteerStatus").selectedIndex = 0;
    document.getElementById("saveVolunteerBtn").innerText = "Save Volunteer";
    modal.style.display = "none";
  } catch (error) {
    console.error("Error saving volunteer:", error);
    showToast("Failed to save volunteer. Please try again.");
  }
});

async function deleteVolunteer(index) {
  if (!confirm("Are you sure you want to delete this volunteer?")) return;

  const volunteer = volunteers[index];

  try {
    await deleteVolunteerDB(volunteer.id);

    let activities = JSON.parse(localStorage.getItem("activities")) || [];
    activities.unshift({
      text: "Volunteer deleted: " + volunteer.name,
      time: "Just now",
      chapterId: chapterId,
    });
    localStorage.setItem("activities", JSON.stringify(activities));

    clearAttendanceCache(chapterId);
    showToast("Volunteer deleted successfully!");
    await loadVolunteers();
  } catch (error) {
    console.error("Error deleting volunteer:", error);
    showToast("Failed to delete volunteer. Please try again.");
  }
}

window.deleteVolunteer = deleteVolunteer;

function editVolunteer(index) {
  editingIndex = index;
  const volunteer = volunteers[index];

  document.getElementById("volunteerName").value = volunteer.name;
  document.getElementById("volunteerPhone").value = volunteer.phone;
  document.getElementById("volunteerStatus").value = volunteer.status;
  document.getElementById("saveVolunteerBtn").innerText = "Update Volunteer";
  modal.style.display = "flex";
}

window.editVolunteer = editVolunteer;
