"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; chapterId: string; chapterName: string } | null>(null);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState("0%");
  const [todaySession, setTodaySession] = useState<{ shelter: string; present: number } | null>(null);

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
      const [volRes, attRes] = await Promise.all([
        fetch(`/api/volunteers?chapterId=${chapterId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`/api/attendance?chapterId=${chapterId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      const vols = await volRes.json();
      const atts = await attRes.json();
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
    } catch {}
  }

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
              <p>Total sessions this month</p>
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
              <p>{todaySession ? `${todaySession.shelter} \u2022 ${todaySession.present} volunteers present` : "Today's attendance has not been submitted yet."}</p>
            </div>
          </div>

          <div className="panel">
            <h2>Recent Activity</h2>
            <ul className="activity" id="activityList">
              <li style={{ color: "var(--text-muted)", padding: "8px 0" }}>No recent activity.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
