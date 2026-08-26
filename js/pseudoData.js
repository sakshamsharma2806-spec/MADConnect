// =============================================
// PSEUDO DATA — flip USE_PSEUDO_DATA to false
// in firebaseConfig.js to remove all fake data
// =============================================

const pseudoUsers = [
  { id: "u1", email: "saksham@makeadiff.in", name: "Saksham Sharma", role: "cho", chapterId: "delhi-arya" },
  { id: "u2", email: "priya@makeadiff.in", name: "Priya Sharma", role: "cho", chapterId: "bal-ashram" },
  { id: "u3", email: "arjun@makeadiff.in", name: "Arjun Patel", role: "cho", chapterId: "udaan-home" },
  { id: "u4", email: "neha@makeadiff.in", name: "Neha Gupta", role: "cho", chapterId: "hope-shelter" },
  { id: "u5", email: "rohan@makeadiff.in", name: "Rohan Menon", role: "cho", chapterId: "shiksha-kendra" },
  { id: "u6", email: "admin@makeadiff.in", name: "MAD Admin", role: "admin", chapterId: null },
  { id: "u7", email: "core@makeadiff.in", name: "Core Member", role: "core", chapterId: null },
];

const pseudoChapters = [
  { chapterId: "delhi-arya", chapterName: "Delhi Arya", city: "Delhi", choId: "u1", choName: "Saksham Sharma", choEmail: "saksham@makeadiff.in", shelter: "Delhi Arya", status: "active", createdAt: "2025-06-01" },
  { chapterId: "bal-ashram", chapterName: "Bal Ashram", city: "Jaipur", choId: "u2", choName: "Priya Sharma", choEmail: "priya@makeadiff.in", shelter: "Bal Ashram", status: "active", createdAt: "2025-07-15" },
  { chapterId: "udaan-home", chapterName: "Udaan Home", city: "Mumbai", choId: "u3", choName: "Arjun Patel", choEmail: "arjun@makeadiff.in", shelter: "Udaan Home", status: "active", createdAt: "2025-08-01" },
  { chapterId: "hope-shelter", chapterName: "Hope Shelter", city: "Delhi", choId: "u4", choName: "Neha Gupta", choEmail: "neha@makeadiff.in", shelter: "Hope Shelter", status: "active", createdAt: "2025-09-10" },
  { chapterId: "shiksha-kendra", chapterName: "Shiksha Kendra", city: "Bangalore", choId: "u5", choName: "Rohan Menon", choEmail: "rohan@makeadiff.in", shelter: "Shiksha Kendra", status: "active", createdAt: "2025-10-05" },
  { chapterId: "pragati-niketan", chapterName: "Pragati Niketan", city: "Kolkata", choId: null, choName: "Vacant", choEmail: "", shelter: "Pragati Niketan", status: "inactive", createdAt: "2025-11-01" },
  { chapterId: "sahyog-foundation", chapterName: "Sahyog Foundation", city: "Chennai", choId: null, choName: "Vacant", choEmail: "", shelter: "Sahyog Foundation", status: "inactive", createdAt: "2025-12-01" },
  { chapterId: "new-hope-centre", chapterName: "New Hope Centre", city: "Hyderabad", choId: null, choName: "Vacant", choEmail: "", shelter: "New Hope Centre", status: "inactive", createdAt: "2026-01-15" },
  { chapterId: "umeed-ghar", chapterName: "Umeed Ghar", city: "Pune", choId: null, choName: "Vacant", choEmail: "", shelter: "Umeed Ghar", status: "inactive", createdAt: "2026-02-01" },
  { chapterId: "prerna-sadan", chapterName: "Prerna Sadan", city: "Lucknow", choId: null, choName: "Vacant", choEmail: "", shelter: "Prerna Sadan", status: "inactive", createdAt: "2026-03-10" },
  { chapterId: "asha-niketan", chapterName: "Asha Niketan", city: "Ahmedabad", choId: null, choName: "Vacant", choEmail: "", shelter: "Asha Niketan", status: "inactive", createdAt: "2026-04-01" },
  { chapterId: "sankalp-home", chapterName: "Sankalp Home", city: "Chandigarh", choId: null, choName: "Vacant", choEmail: "", shelter: "Sankalp Home", status: "inactive", createdAt: "2026-05-15" },
  { chapterId: "vatsalya-gram", chapterName: "Vatsalya Gram", city: "Bhopal", choId: null, choName: "Vacant", choEmail: "", shelter: "Vatsalya Gram", status: "inactive", createdAt: "2026-06-01" },
];

const pseudoVolunteers = [
  { id: "p1", name: "Aarav Mehta", phone: "9876543210", shelter: "Delhi Arya", chapterId: "delhi-arya", status: "Active" },
  { id: "p2", name: "Diya Sharma", phone: "9123456789", shelter: "Delhi Arya", chapterId: "delhi-arya", status: "Active" },
  { id: "p9", name: "Riya Kapoor", phone: "9876001122", shelter: "Delhi Arya", chapterId: "delhi-arya", status: "Active" },
  { id: "p3", name: "Rohan Patel", phone: "9988776655", shelter: "Bal Ashram", chapterId: "bal-ashram", status: "Active" },
  { id: "p4", name: "Sneha Iyer", phone: "9011223344", shelter: "Bal Ashram", chapterId: "bal-ashram", status: "Inactive" },
  { id: "p5", name: "Kabir Nair", phone: "9871234567", shelter: "Udaan Home", chapterId: "udaan-home", status: "Active" },
  { id: "p6", name: "Ananya Das", phone: "9102030405", shelter: "Udaan Home", chapterId: "udaan-home", status: "Active" },
  { id: "p7", name: "Vikram Joshi", phone: "9223344556", shelter: "Shiksha Kendra", chapterId: "shiksha-kendra", status: "Active" },
  { id: "p8", name: "Meera Reddy", phone: "9334455667", shelter: "Shiksha Kendra", chapterId: "shiksha-kendra", status: "Inactive" },
  { id: "p10", name: "Tara Singh", phone: "9445566778", shelter: "Hope Shelter", chapterId: "hope-shelter", status: "Active" },
  { id: "p11", name: "Dev Malhotra", phone: "9556677889", shelter: "Hope Shelter", chapterId: "hope-shelter", status: "Active" },
];

const pseudoAttendance = [
  { id: "a1", date: "2026-07-10", shelter: "Delhi Arya", chapterId: "delhi-arya", present: ["Aarav Mehta", "Diya Sharma", "Riya Kapoor"] },
  { id: "a2", date: "2026-07-17", shelter: "Delhi Arya", chapterId: "delhi-arya", present: ["Aarav Mehta", "Riya Kapoor"] },
  { id: "a9", date: "2026-07-24", shelter: "Delhi Arya", chapterId: "delhi-arya", present: ["Aarav Mehta", "Diya Sharma", "Riya Kapoor"] },
  { id: "a3", date: "2026-07-12", shelter: "Bal Ashram", chapterId: "bal-ashram", present: ["Rohan Patel", "Sneha Iyer"] },
  { id: "a4", date: "2026-07-19", shelter: "Bal Ashram", chapterId: "bal-ashram", present: ["Rohan Patel"] },
  { id: "a5", date: "2026-07-14", shelter: "Udaan Home", chapterId: "udaan-home", present: ["Kabir Nair", "Ananya Das"] },
  { id: "a6", date: "2026-07-21", shelter: "Udaan Home", chapterId: "udaan-home", present: ["Kabir Nair"] },
  { id: "a7", date: "2026-07-15", shelter: "Shiksha Kendra", chapterId: "shiksha-kendra", present: ["Vikram Joshi"] },
  { id: "a8", date: "2026-07-22", shelter: "Shiksha Kendra", chapterId: "shiksha-kendra", present: ["Vikram Joshi", "Meera Reddy"] },
  { id: "a10", date: "2026-07-11", shelter: "Hope Shelter", chapterId: "hope-shelter", present: ["Tara Singh", "Dev Malhotra"] },
  { id: "a11", date: "2026-07-18", shelter: "Hope Shelter", chapterId: "hope-shelter", present: ["Tara Singh"] },
];

const pseudoStories = [
  { id: "s1", title: "How Delhi Arya Improved Volunteer Retention", content: "When we started, volunteers would attend one or two sessions and then disappear. We realized the problem wasn't motivation — it was connection. We started every session with a 5-minute 'story circle' where volunteers shared why they showed up. That simple ritual changed everything. Our retention went from 40% to 85% in three months.", chapterId: "delhi-arya", authorId: "u1", authorName: "Saksham Sharma", status: "published", tags: ["volunteer retention", "best practices"], createdAt: "2026-07-20" },
  { id: "s2", title: "First Day Jitters — A Volunteer's Story", content: "I remember walking into Bal Ashram for the first time, completely terrified. A 7-year-old named Kavi took my hand and said 'Don't worry, I'll show you around.' That was the moment I knew I belonged here.", chapterId: "bal-ashram", authorId: "u2", authorName: "Priya Sharma", status: "published", tags: ["personal story", "volunteer experience"], createdAt: "2026-07-25" },
  { id: "s3", title: "From 48% to 72% — Our Attendance Journey", content: "Shiksha Kendra was struggling with attendance. We tried everything — reminders, incentives, flexible scheduling. What finally worked was making the children the motivators. We had kids write thank-you notes for each volunteer. Nobody wanted to miss a session after that.", chapterId: "shiksha-kendra", authorId: "u5", authorName: "Rohan Menon", status: "published", tags: ["attendance", "improvement"], createdAt: "2026-08-01" },
  { id: "s4", title: "Udaan Home's Weekend Workshop Experiment", content: "We noticed volunteers were burning out with the same weekly routine. So we introduced monthly 'Workshop Saturdays' — themed sessions with activities, games, and special guest speakers. Engagement skyrocketed.", chapterId: "udaan-home", authorId: "u3", authorName: "Arjun Patel", status: "draft", tags: ["engagement", "innovation"], createdAt: "2026-08-05" },
];

const pseudoGallery = [
  { id: "g1", title: "Sunday Class at Delhi Arya", description: "A session focused on creative writing and storytelling with the children.", chapterId: "delhi-arya", uploadedBy: "u1", uploadedByName: "Saksham Sharma", date: "2026-07-20", category: "class", status: "approved" },
  { id: "g2", title: "Bal Ashram — Volunteer Appreciation Day", description: "We celebrated our volunteers with handmade cards from the children.", chapterId: "bal-ashram", uploadedBy: "u2", uploadedByName: "Priya Sharma", date: "2026-07-28", category: "event", status: "approved" },
  { id: "g3", title: "Shiksha Kendra Art Session", description: "Children creating artwork inspired by their favorite stories.", chapterId: "shiksha-kendra", uploadedBy: "u5", uploadedByName: "Rohan Menon", date: "2026-08-02", category: "class", status: "approved" },
  { id: "g4", title: "Hope Shelter — Community Health Camp", description: "Joint session with local healthcare workers for health awareness.", chapterId: "hope-shelter", uploadedBy: "u4", uploadedByName: "Neha Gupta", date: "2026-08-05", category: "event", status: "approved" },
];

const pseudoAlerts = [
  { id: "al1", type: "warning", chapterId: "shiksha-kendra", message: "Shiksha Kendra attendance dropped below 50% this month.", createdAt: "2026-08-10", read: false },
  { id: "al2", type: "success", chapterId: "delhi-arya", message: "Delhi Arya achieved 87% average attendance — highest this quarter!", createdAt: "2026-08-08", read: false },
  { id: "al3", type: "info", chapterId: "udaan-home", message: "Udaan Home submitted their first chapter story.", createdAt: "2026-08-05", read: true },
];

export { pseudoUsers, pseudoChapters, pseudoVolunteers, pseudoAttendance, pseudoStories, pseudoGallery, pseudoAlerts };
