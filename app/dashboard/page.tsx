"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface Activity {
  _id: string;
  text: string;
  type: string;
  createdByName: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; chapterId: string; chapterName: string } | null>(null);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState("0%");
  const [todaySession, setTodaySession] = useState<{ shelter: string; present: number } | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    loadData(u.chapterId);
  }, [router]);

  function getToken() {
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : "";
  }

  async function loadData(chapterId: string) {
    try {
      const [volRes, attRes, actRes] = await Promise.all([
        fetch(`/api/volunteers?chapterId=${chapterId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`/api/attendance?chapterId=${chapterId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`/api/activities?chapterId=${chapterId}&limit=10`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      const vols = await volRes.json();
      const atts = await attRes.json();
      const acts = await actRes.json();
      const volArr = Array.isArray(vols) ? vols : [];
      const attArr = Array.isArray(atts) ? atts : [];
      setTotalVolunteers(volArr.length);
      setTotalClasses(attArr.length);
      let totalPossible = 0;
      let totalPresent = 0;
      attArr.forEach((s: { present: string[] }) => { totalPossible += volArr.length; totalPresent += s.present.length; });
      setAttendanceRate(totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) + "%" : "0%");
      const today = new Date().toISOString().split("T")[0];
      const ts = attArr.find((s: { date: string }) => s.date === today);
      if (ts) setTodaySession({ shelter: ts.shelter, present: ts.present.length });
      setActivities(Array.isArray(acts) ? acts : []);
    } catch {}
  }

  const typeIcons: Record<string, string> = {
    volunteer_added: "\u{1F465}",
    volunteer_updated: "\u270F\uFE0F",
    volunteer_deleted: "\u{1F5D1}",
    attendance_submitted: "\u2705",
    story_created: "\u{1F4D6}",
    story_approved: "\u{1F44D}",
    chapter_update: "\u{1F4DD}",
    milestone: "\u{1F3C6}",
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (!user) return null;

  const hour = new Date().getHours();
  let greet = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  if (user.name) greet += `, ${user.name.split(" ")[0]}`;
  const todayDate = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <header>
          <div className="welcome">
            <h1>{greet}</h1>
            <p>{todayDate}</p>
            <p className="chapter-name">{user.chapterName} Chapter</p>
          </div>
          <div className="chapter-card">
            <h2>Your Chapter</h2>
            <div className="chapter-details">
              <p><strong>CHO:</strong> {user.name}</p>
              <p><strong>Chapter:</strong> {user.chapterName}</p>
              <p><strong>Status:</strong> <span className="active-status">&#128994; Active</span></p>
            </div>
          </div>
        </header>

        <section className="content-body">
          <div className="stats">
            <div className="card volunteers">
              <h3>Total Volunteers</h3>
              <h1>{totalVolunteers}</h1>
              <p>Active members in your chapter</p>
            </div>
            <div className="card classes">
              <h3>Classes Conducted</h3>
              <h1>{totalClasses}</h1>
              <p>Total sessions conducted</p>
            </div>
            <div className="card attendance">
              <h3>Attendance</h3>
              <h1>{attendanceRate}</h1>
              <p>Average attendance</p>
            </div>
          </div>

          <div className="dashboard-row">
            <div className="panel">
              <h2>Quick Actions</h2>
              <div className="actions">
                <button onClick={() => router.push("/volunteers")}>Add Volunteer</button>
                <button onClick={() => router.push("/attendance")}>Take Attendance</button>
                <button onClick={() => router.push("/madconnect")}>MAD Connect</button>
                <a href="https://sessionops.makeadiff.in" target="_blank" className="action-link">Session Ops</a>
                <a href="https://volunteering.makeadiff.in/cm-admin/auth/login" target="_blank" className="action-link">Better Together</a>
              </div>
            </div>
            <div className="panel">
              <h2>Today&apos;s Attendance</h2>
              <h3 className={todaySession ? "" : "pending"}>{todaySession ? "\u2705 Completed" : "\u23F3 Pending"}</h3>
              <p>{todaySession ? `${todaySession.shelter} \u2022 ${todaySession.present} volunteers present` : "Today&apos;s attendance has not been submitted yet."}</p>
            </div>
          </div>

          <div className="panel">
            <h2>Recent Activity</h2>
            {activities.length === 0 ? (
              <p style={{ color: "var(--text-muted)", padding: "8px 0" }}>No recent activity yet. Add a volunteer or submit attendance to get started.</p>
            ) : (
              <ul className="activity">
                {activities.map((a) => (
                  <li key={a._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                    <span style={{ fontSize: "18px" }}>{typeIcons[a.type] || "\u{1F4DD}"}</span>
                    <span style={{ flex: 1, fontSize: "14px" }}>{a.text}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{timeAgo(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
