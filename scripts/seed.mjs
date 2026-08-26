import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx > 0) {
    process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const users = [
  { email: "saksham@makeadiff.in", name: "Saksham Sharma", role: "cho", chapterId: "delhi-arya" },
  { email: "priya@makeadiff.in", name: "Priya Sharma", role: "cho", chapterId: "bal-ashram" },
  { email: "arjun@makeadiff.in", name: "Arjun Patel", role: "cho", chapterId: "udaan-home" },
  { email: "neha@makeadiff.in", name: "Neha Gupta", role: "cho", chapterId: "hope-shelter" },
  { email: "rohan@makeadiff.in", name: "Rohan Menon", role: "cho", chapterId: "shiksha-kendra" },
  { email: "admin@makeadiff.in", name: "MAD Admin", role: "admin", chapterId: null },
  { email: "core@makeadiff.in", name: "Core Member", role: "core", chapterId: null },
];

const chapters = [
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

const volunteers = [
  { name: "Aarav Mehta", phone: "9876543210", shelter: "Delhi Arya", chapterId: "delhi-arya", status: "Active" },
  { name: "Diya Sharma", phone: "9123456789", shelter: "Delhi Arya", chapterId: "delhi-arya", status: "Active" },
  { name: "Riya Kapoor", phone: "9876001122", shelter: "Delhi Arya", chapterId: "delhi-arya", status: "Active" },
  { name: "Rohan Patel", phone: "9988776655", shelter: "Bal Ashram", chapterId: "bal-ashram", status: "Active" },
  { name: "Sneha Iyer", phone: "9011223344", shelter: "Bal Ashram", chapterId: "bal-ashram", status: "Inactive" },
  { name: "Kabir Nair", phone: "9871234567", shelter: "Udaan Home", chapterId: "udaan-home", status: "Active" },
  { name: "Ananya Das", phone: "9102030405", shelter: "Udaan Home", chapterId: "udaan-home", status: "Active" },
  { name: "Vikram Joshi", phone: "9223344556", shelter: "Shiksha Kendra", chapterId: "shiksha-kendra", status: "Active" },
  { name: "Meera Reddy", phone: "9334455667", shelter: "Shiksha Kendra", chapterId: "shiksha-kendra", status: "Inactive" },
  { name: "Tara Singh", phone: "9445566778", shelter: "Hope Shelter", chapterId: "hope-shelter", status: "Active" },
  { name: "Dev Malhotra", phone: "9556677889", shelter: "Hope Shelter", chapterId: "hope-shelter", status: "Active" },
];

const attendance = [
  { date: "2026-07-10", shelter: "Delhi Arya", chapterId: "delhi-arya", present: ["Aarav Mehta", "Diya Sharma", "Riya Kapoor"] },
  { date: "2026-07-17", shelter: "Delhi Arya", chapterId: "delhi-arya", present: ["Aarav Mehta", "Riya Kapoor"] },
  { date: "2026-07-24", shelter: "Delhi Arya", chapterId: "delhi-arya", present: ["Aarav Mehta", "Diya Sharma", "Riya Kapoor"] },
  { date: "2026-07-12", shelter: "Bal Ashram", chapterId: "bal-ashram", present: ["Rohan Patel", "Sneha Iyer"] },
  { date: "2026-07-19", shelter: "Bal Ashram", chapterId: "bal-ashram", present: ["Rohan Patel"] },
  { date: "2026-07-14", shelter: "Udaan Home", chapterId: "udaan-home", present: ["Kabir Nair", "Ananya Das"] },
  { date: "2026-07-21", shelter: "Udaan Home", chapterId: "udaan-home", present: ["Kabir Nair"] },
  { date: "2026-07-15", shelter: "Shiksha Kendra", chapterId: "shiksha-kendra", present: ["Vikram Joshi"] },
  { date: "2026-07-22", shelter: "Shiksha Kendra", chapterId: "shiksha-kendra", present: ["Vikram Joshi", "Meera Reddy"] },
  { date: "2026-07-11", shelter: "Hope Shelter", chapterId: "hope-shelter", present: ["Tara Singh", "Dev Malhotra"] },
  { date: "2026-07-18", shelter: "Hope Shelter", chapterId: "hope-shelter", present: ["Tara Singh"] },
];

const stories = [
  { title: "How Delhi Arya Improved Volunteer Retention", content: "When we started, volunteers would attend one or two sessions and then disappear. We realized the problem wasn't motivation — it was connection. We started every session with a 5-minute 'story circle' where volunteers shared why they showed up. That simple ritual changed everything. Our retention went from 40% to 85% in three months.", chapterId: "delhi-arya", authorId: "u1", authorName: "Saksham Sharma", status: "published", tags: ["volunteer retention", "best practices"], createdAt: "2026-07-20" },
  { title: "First Day Jitters — A Volunteer's Story", content: "I remember walking into Bal Ashram for the first time, completely terrified. A 7-year-old named Kavi took my hand and said 'Don't worry, I'll show you around.' That was the moment I knew I belonged here.", chapterId: "bal-ashram", authorId: "u2", authorName: "Priya Sharma", status: "published", tags: ["personal story", "volunteer experience"], createdAt: "2026-07-25" },
  { title: "From 48% to 72% — Our Attendance Journey", content: "Shiksha Kendra was struggling with attendance. We tried everything — reminders, incentives, flexible scheduling. What finally worked was making the children the motivators. We had kids write thank-you notes for each volunteer. Nobody wanted to miss a session after that.", chapterId: "shiksha-kendra", authorId: "u5", authorName: "Rohan Menon", status: "published", tags: ["attendance", "improvement"], createdAt: "2026-08-01" },
  { title: "Udaan Home's Weekend Workshop Experiment", content: "We noticed volunteers were burning out with the same weekly routine. So we introduced monthly 'Workshop Saturdays' — themed sessions with activities, games, and special guest speakers. Engagement skyrocketed.", chapterId: "udaan-home", authorId: "u3", authorName: "Arjun Patel", status: "draft", tags: ["engagement", "innovation"], createdAt: "2026-08-05" },
];

const gallery = [
  { title: "Sunday Class at Delhi Arya", description: "A session focused on creative writing and storytelling with the children.", chapterId: "delhi-arya", uploadedBy: "u1", uploadedByName: "Saksham Sharma", date: "2026-07-20", category: "class", color: "#e61e4d", status: "approved" },
  { title: "Bal Ashram — Volunteer Appreciation Day", description: "We celebrated our volunteers with handmade cards from the children.", chapterId: "bal-ashram", uploadedBy: "u2", uploadedByName: "Priya Sharma", date: "2026-07-28", category: "event", color: "#3b82f6", status: "approved" },
  { title: "Shiksha Kendra Art Session", description: "Children creating artwork inspired by their favorite stories.", chapterId: "shiksha-kendra", uploadedBy: "u5", uploadedByName: "Rohan Menon", date: "2026-08-02", category: "class", color: "#10b981", status: "approved" },
  { title: "Hope Shelter — Community Health Camp", description: "Joint session with local healthcare workers for health awareness.", chapterId: "hope-shelter", uploadedBy: "u4", uploadedByName: "Neha Gupta", date: "2026-08-05", category: "event", color: "#f59e0b", status: "approved" },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const User = mongoose.model("User", new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      role: { type: String, enum: ["cho", "admin", "core"], default: "cho" },
      chapterId: { type: String, default: null },
      password: { type: String, required: true },
    }));

    const Chapter = mongoose.model("Chapter", new mongoose.Schema({
      chapterId: { type: String, required: true, unique: true },
      chapterName: { type: String, required: true },
      city: { type: String, required: true },
      choId: { type: String, default: null },
      choName: { type: String, default: "Vacant" },
      choEmail: { type: String, default: "" },
      shelter: { type: String, required: true },
      status: { type: String, enum: ["active", "inactive"], default: "active" },
      createdAt: { type: String, required: true },
    }));

    const Volunteer = mongoose.model("Volunteer", new mongoose.Schema({
      name: { type: String, required: true },
      phone: { type: String, required: true },
      shelter: { type: String, required: true },
      chapterId: { type: String, required: true },
      status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
      attendedSessions: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 0 },
      attendancePercentage: { type: Number, default: 0 },
      certificateEligible: { type: Boolean, default: false },
    }));

    const Attendance = mongoose.model("Attendance", new mongoose.Schema({
      date: { type: String, required: true },
      shelter: { type: String, required: true },
      chapterId: { type: String, required: true },
      present: [{ type: String }],
    }));

    const Story = mongoose.model("Story", new mongoose.Schema({
      title: { type: String, required: true },
      content: { type: String, required: true },
      chapterId: { type: String, required: true },
      authorId: { type: String, required: true },
      authorName: { type: String, required: true },
      status: { type: String, enum: ["draft", "pending_review", "published"], default: "draft" },
      tags: [{ type: String }],
      createdAt: { type: String, required: true },
    }));

    const Gallery = mongoose.model("Gallery", new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      chapterId: { type: String, required: true },
      uploadedBy: { type: String, required: true },
      uploadedByName: { type: String, required: true },
      date: { type: String, required: true },
      category: { type: String, enum: ["class", "event", "milestone", "community"], default: "class" },
      color: { type: String, default: "#e61e4d" },
      status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    }));

    const Activity = mongoose.model("Activity", new mongoose.Schema({
      text: { type: String, required: true },
      type: { type: String, enum: ["volunteer_added", "volunteer_updated", "volunteer_deleted", "attendance_submitted", "story_created", "story_approved", "chapter_update", "milestone"], default: "chapter_update" },
      chapterId: { type: String, required: true },
      createdBy: { type: String, required: true },
      createdByName: { type: String, required: true },
      createdAt: { type: String, required: true },
    }));

    const activities = [
      { text: 'Volunteer "Aarav Mehta" added', type: "volunteer_added", chapterId: "delhi-arya", createdBy: "seed", createdByName: "Saksham Sharma", createdAt: "2026-07-01T10:00:00.000Z" },
      { text: 'Volunteer "Diya Sharma" added', type: "volunteer_added", chapterId: "delhi-arya", createdBy: "seed", createdByName: "Saksham Sharma", createdAt: "2026-07-03T11:00:00.000Z" },
      { text: 'Volunteer "Riya Kapoor" added', type: "volunteer_added", chapterId: "delhi-arya", createdBy: "seed", createdByName: "Saksham Sharma", createdAt: "2026-07-05T09:30:00.000Z" },
      { text: "Attendance submitted for Delhi Arya — 3 volunteers present", type: "attendance_submitted", chapterId: "delhi-arya", createdBy: "seed", createdByName: "Saksham Sharma", createdAt: "2026-07-10T18:00:00.000Z" },
      { text: "Attendance submitted for Delhi Arya — 2 volunteers present", type: "attendance_submitted", chapterId: "delhi-arya", createdBy: "seed", createdByName: "Saksham Sharma", createdAt: "2026-07-17T18:00:00.000Z" },
      { text: "Attendance submitted for Delhi Arya — 3 volunteers present", type: "attendance_submitted", chapterId: "delhi-arya", createdBy: "seed", createdByName: "Saksham Sharma", createdAt: "2026-07-24T18:00:00.000Z" },
      { text: 'Volunteer "Priya Singh" added', type: "volunteer_added", chapterId: "bal-ashram", createdBy: "seed", createdByName: "Priya Sharma", createdAt: "2026-07-02T10:00:00.000Z" },
      { text: 'Volunteer "Kabir Joshi" added', type: "volunteer_added", chapterId: "udaan-home", createdBy: "seed", createdByName: "Arjun Patel", createdAt: "2026-07-04T10:00:00.000Z" },
    ];

    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Chapter.deleteMany({}),
      Volunteer.deleteMany({}),
      Attendance.deleteMany({}),
      Story.deleteMany({}),
      Gallery.deleteMany({}),
      Activity.deleteMany({}),
    ]);

    console.log("Seeding users...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    const usersWithPassword = users.map((u) => ({ ...u, password: hashedPassword }));
    await User.insertMany(usersWithPassword);

    console.log("Seeding chapters...");
    await Chapter.insertMany(chapters);

    console.log("Seeding volunteers...");
    await Volunteer.insertMany(volunteers);

    console.log("Seeding attendance...");
    await Attendance.insertMany(attendance);

    console.log("Seeding stories...");
    await Story.insertMany(stories);

    console.log("Seeding gallery...");
    await Gallery.insertMany(gallery);

    console.log("Seeding activities...");
    await Activity.insertMany(activities);

    console.log("Seed complete!");

    console.log("Recalculating volunteer attendance stats...");
    const allVolunteers = await Volunteer.find();
    const allSessions = await Attendance.find();
    for (const vol of allVolunteers) {
      const chapterSessions = allSessions.filter((s) => s.chapterId === vol.chapterId);
      const totalSessions = chapterSessions.length;
      const attended = chapterSessions.filter((s) => s.present.includes(vol.name)).length;
      const pct = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;
      await Volunteer.findByIdAndUpdate(vol._id, {
        attendedSessions: attended,
        totalSessions,
        attendancePercentage: pct,
        certificateEligible: pct >= 60,
      });
    }
    console.log("Volunteer stats recalculated.");

    console.log("Login with any email above and password: password123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
